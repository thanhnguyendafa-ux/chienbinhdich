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
  const rawTokens = String(text ?? '').match(/[A-Za-z]+(?:['’][A-Za-z]+)?|\d+/g) ?? [];
  const out = [];
  for (const raw of rawTokens) {
    if (/^\d+$/.test(raw)) continue;
    const token = canonicalWritingToken(raw, aliases);
    if (!token || ignore.has(token)) continue;
    out.push(token);
  }
  return out;
}

export function expandWritingWords(explicitWords, phrases, sentences, scaffold) {
  const words = (explicitWords ?? []).map(entry => [...entry]);
  const seen = new Set(words.flatMap(([, en]) => lexicalWritingTokens(en, scaffold)));
  const targetTexts = [
    ...(phrases ?? []).map(entry => entry?.[1] ?? ''),
    ...(sentences ?? []).map(entry => entry?.[1] ?? '')
  ];

  for (const token of unique(lexicalWritingTokens(targetTexts.join(' '), scaffold))) {
    if (seen.has(token)) continue;
    const lexical = scaffold.lexicon?.[token];
    if (!lexical) continue;
    const answer = lexical.en ?? token;
    words.push([lexical.vi, answer]);
    lexicalWritingTokens(answer, scaffold).forEach(value => seen.add(value));
    seen.add(token);
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
  const covered = new Set((words ?? []).flatMap(([, en]) => lexicalWritingTokens(en, scaffold)));
  const targets = [
    ...(phrases ?? []).map(entry => entry?.[1] ?? ''),
    ...(sentences ?? []).map(entry => entry?.[1] ?? '')
  ];
  return unique(
    lexicalWritingTokens(targets.join(' '), scaffold)
      .filter(token => scaffold.lexicon?.[token] && !covered.has(token))
  );
}

export function dependencyIdsForText(text, wordEntries, wordIds, scaffold) {
  const targetTokens = new Set(lexicalWritingTokens(text, scaffold));
  return wordEntries.flatMap((entry, index) => {
    const entryTokens = lexicalWritingTokens(entry?.[1] ?? '', scaffold);
    return entryTokens.some(token => targetTokens.has(token)) ? [wordIds[index]] : [];
  });
}

function unique(values) {
  return [...new Set(values)];
}
