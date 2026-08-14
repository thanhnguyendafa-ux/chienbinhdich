const BASIC_FUNCTION_WORDS = new Set([
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'our', 'their', 'mine', 'yours', 'ours', 'theirs',
  'a', 'an', 'the', 'this', 'that', 'these', 'those',
  'to', 'of', 'in', 'on', 'at', 'for', 'from', 'with', 'as',
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'
]);

const COMMON_ALIASES = Object.freeze({
  has: 'have',
  classes: 'class', students: 'student', classrooms: 'classroom', desks: 'desk',
  trees: 'tree', flowers: 'flower', rooms: 'room', subjects: 'subject', words: 'word',
  experiments: 'experiment', texts: 'text', games: 'game', friends: 'friend', teachers: 'teacher',
  "teacher's": 'teacher', lessons: 'lesson', books: 'book', countries: 'country', models: 'model', photos: 'photo',
  hobbies: 'hobby', stamps: 'stamp', coins: 'coin', programmes: 'programme', films: 'film',
  plants: 'plant', years: 'year', classmates: 'classmate', grandparents: 'grandparent',
  seeds: 'seed', pots: 'pot', shuttlecocks: 'shuttlecock', sports: 'sport', minutes: 'minute',
  months: 'month', things: 'thing', stories: 'story', cars: 'car', groups: 'group', clubs: 'club',
  dollhouses: 'dollhouse', weekends: 'weekend', times: 'time',
  likes: 'like', loves: 'love', enjoys: 'enjoy', collects: 'collect', keeps: 'keep', thinks: 'think',
  helps: 'help', makes: 'make', gives: 'give', lives: 'live', plays: 'play', reads: 'read',
  studies: 'study', learns: 'learn', waters: 'water', grows: 'grow', finishes: 'finish',
  started: 'start', began: 'begin', became: 'become',
  reading: 'read', gardening: 'garden', collecting: 'collect', making: 'make', taking: 'take',
  painting: 'paint', playing: 'play', watching: 'watch', cycling: 'cycle', studying: 'study',
  fishing: 'fish', relaxing: 'relax',
  "don't": 'not', "doesn't": 'not'
});

const PROPER_NAME_TOKENS = new Set([
  'nguyen', 'du', 'giang', 'son', 'le', 'loi', 'da', 'nang'
]);

export function canonicalWritingToken(rawToken, aliases = {}) {
  const raw = String(rawToken ?? '').toLocaleLowerCase('en').replace(/[’]/g, "'").trim();
  if (!raw) return '';
  return aliases[raw] ?? COMMON_ALIASES[raw] ?? raw;
}

export function lexicalWritingTokens(text, config = {}) {
  const aliases = config.aliases ?? {};
  const ignore = new Set([...(config.ignore ?? []), ...BASIC_FUNCTION_WORDS, ...PROPER_NAME_TOKENS]);
  const out = [];
  for (const raw of rawWritingWords(text)) {
    if (/^\d+$/.test(raw)) continue;
    const token = canonicalWritingToken(raw, aliases);
    if (!token || ignore.has(token)) continue;
    out.push(token);
  }
  return out;
}

export function surfaceWritingTokens(text, config = {}) {
  const aliases = config.aliases ?? {};
  const ignore = new Set([...(config.ignore ?? []), ...BASIC_FUNCTION_WORDS, ...PROPER_NAME_TOKENS]);
  const out = [];
  for (const raw of rawWritingWords(text)) {
    if (/^\d+$/.test(raw)) continue;
    const canonical = canonicalWritingToken(raw, aliases);
    if (!canonical || ignore.has(canonical)) continue;
    out.push(learnerSurfaceToken(raw, canonical, config));
  }
  return out;
}

export function expandWritingWords(explicitWords, phrases, sentences, scaffold) {
  const targetTexts = [
    ...(phrases ?? []).map(entry => entry?.[1] ?? ''),
    ...(sentences ?? []).map(entry => entry?.[1] ?? '')
  ];
  const words = [];
  const seenAnswers = new Set();

  for (const [vi, en] of explicitWords ?? []) {
    const variants = surfaceVariantsForSeed(en, targetTexts, scaffold);
    for (const variant of variants) addWord(words, seenAnswers, vi, variant);
  }

  const covered = new Set(
    words.flatMap(([, en]) => surfaceWritingTokens(en, scaffold).map(surfaceKey))
  );

  for (const token of unique(targetTexts.flatMap(text => surfaceWritingTokens(text, scaffold)))) {
    const key = surfaceKey(token);
    if (covered.has(key)) continue;
    const canonical = canonicalWritingToken(token, scaffold.aliases ?? {});
    const lexical = scaffold.lexicon?.[canonical];
    if (!lexical) continue;
    addWord(words, seenAnswers, lexical.vi, token);
    surfaceWritingTokens(token, scaffold).forEach(value => covered.add(surfaceKey(value)));
  }

  return words;
}

export function unknownWritingTokens(phrases, sentences, scaffold) {
  const texts = [
    ...(phrases ?? []).map(entry => entry?.[1] ?? ''),
    ...(sentences ?? []).map(entry => entry?.[1] ?? '')
  ];
  return unique(
    lexicalWritingTokens(texts.join(' '), scaffold)
      .filter(token => !scaffold.lexicon?.[token])
  );
}

export function coldWritingTokens(words, phrases, sentences, scaffold) {
  const covered = new Set(
    (words ?? []).flatMap(([, en]) => surfaceWritingTokens(en, scaffold).map(surfaceKey))
  );
  const targets = [
    ...(phrases ?? []).map(entry => entry?.[1] ?? ''),
    ...(sentences ?? []).map(entry => entry?.[1] ?? '')
  ];
  return unique(
    targets.flatMap(text => surfaceWritingTokens(text, scaffold))
      .filter(token => scaffold.lexicon?.[canonicalWritingToken(token, scaffold.aliases ?? {})])
      .filter(token => !covered.has(surfaceKey(token)))
  );
}

export function dependencyIdsForText(text, wordEntries, wordIds, scaffold) {
  void scaffold;
  const normalizedTarget = normalizedWords(text);
  return wordEntries.flatMap((entry, index) => {
    const answer = entry?.[1] ?? '';
    return containsWordSequence(normalizedTarget, normalizedWords(answer)) ? [wordIds[index]] : [];
  });
}

function surfaceVariantsForSeed(answer, targetTexts, scaffold) {
  const seedWords = normalizedWords(answer);
  if (!seedWords.length) return [];
  const aliases = scaffold.aliases ?? {};
  const seedCanonical = seedWords.map(word => canonicalWritingToken(word, aliases));
  const variants = [];

  for (const text of targetTexts) {
    const targetWords = normalizedWords(text);
    const targetCanonical = targetWords.map(word => canonicalWritingToken(word, aliases));
    for (let start = 0; start <= targetCanonical.length - seedCanonical.length; start += 1) {
      const matches = seedCanonical.every((word, offset) => targetCanonical[start + offset] === word);
      if (!matches) continue;
      const matchedSurface = targetWords.slice(start, start + seedCanonical.length)
        .map(word => learnerSurfaceToken(word, canonicalWritingToken(word, aliases), scaffold))
        .join(' ');
      variants.push(matchedSurface);
    }
  }

  return uniqueByKey(variants, surfaceKey);
}

function learnerSurfaceToken(rawToken, canonical, scaffold) {
  const surface = String(rawToken ?? '').replace(/[’]/g, "'").toLocaleLowerCase('en');
  const lexical = scaffold.lexicon?.[canonical];
  if (surface === canonical && lexical?.en) return lexical.en;
  return surface;
}

function addWord(words, seenAnswers, vi, en) {
  const key = normalizedWords(en).join(' ');
  if (!key || seenAnswers.has(key)) return;
  words.push([vi, en]);
  seenAnswers.add(key);
}

function rawWritingWords(value) {
  return (String(value ?? '').replace(/[’]/g, "'").match(/[A-Za-z]+(?:'[A-Za-z]+)?|\d+/g) ?? []);
}

function normalizedWords(value) {
  return rawWritingWords(value).map(word => word.toLocaleLowerCase('en'));
}

function containsWordSequence(target, phrase) {
  if (!phrase.length || phrase.length > target.length) return false;
  for (let start = 0; start <= target.length - phrase.length; start += 1) {
    if (phrase.every((word, offset) => target[start + offset] === word)) return true;
  }
  return false;
}

function surfaceKey(value) {
  return String(value ?? '').toLocaleLowerCase('en').replace(/[’]/g, "'").trim();
}

function unique(values) {
  return [...new Set(values)];
}

function uniqueByKey(values, keyFn) {
  const seen = new Set();
  return values.filter(value => {
    const key = keyFn(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
