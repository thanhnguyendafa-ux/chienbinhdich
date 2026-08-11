import {
  G7_REVIEW_U13_SOURCE_SCOPE,
  g7ReviewU13ExerciseSeeds,
  g7ReviewU13Phrases,
  g7ReviewU13Traps
} from './g7-review-u1-3-source.js';

const SOURCE_BY_ID = new Map(g7ReviewU13ExerciseSeeds.map(item => [item.id, item]));
const TRAP_ID_BY_NAME = new Map(g7ReviewU13Traps.map(item => [item.trapType, item.id]));
const PHRASE_ID_BY_TEXT = new Map(g7ReviewU13Phrases.map(item => [String(item.phrase).toLowerCase(), item.id]));

const TYPING_UI = Object.freeze({
  grammar_cloze: Object.freeze({
    promptLabel: 'GRAMMAR CLOZE', contextLabel: 'Câu', instruction: 'Đọc meaning trước rồi gõ phần còn thiếu.',
    inputLabel: 'Đáp án', placeholder: 'Type the missing grammar...'
  }),
  error_correction: Object.freeze({
    promptLabel: 'ERROR CORRECTION', contextLabel: 'Câu có lỗi', instruction: 'Tìm cơ chế sai rồi gõ lại toàn bộ câu đúng.',
    inputLabel: 'Câu đã sửa', placeholder: 'Type the corrected sentence...'
  }),
  transformation: Object.freeze({
    promptLabel: 'TRANSFORMATION', contextLabel: 'Yêu cầu', instruction: 'Giữ meaning core, đổi architecture theo yêu cầu rồi gõ toàn bộ câu.',
    inputLabel: 'Câu sau biến đổi', placeholder: 'Type the transformed sentence...'
  }),
  typing_translation: Object.freeze({
    promptLabel: 'TYPING · VIỆT → ANH', contextLabel: 'Tiếng Việt', instruction: 'Dựng meaning core → marker → chunk → câu tiếng Anh.',
    inputLabel: 'Câu tiếng Anh', placeholder: 'Type English here...'
  }),
  structure_analysis: Object.freeze({
    promptLabel: 'STRUCTURE ANALYSIS', contextLabel: 'Câu / yêu cầu', instruction: 'QUÉT CẤU TRÚC: xác định Subject | whole Predicate hoặc số independent clauses rồi gõ đáp án.',
    inputLabel: 'Phân tích', placeholder: 'Type the structure analysis...'
  }),
  sentence_building: Object.freeze({
    promptLabel: 'SENTENCE BUILDING', contextLabel: 'Chunks', instruction: 'Dựng câu hoàn chỉnh, giữ whole predicate và marker đúng.',
    inputLabel: 'Câu hoàn chỉnh', placeholder: 'Build the sentence...'
  })
});

const freezeArray = values => Object.freeze([...(values ?? [])]);

function unitNumbers(seed) {
  if (seed.unit === 'MIX') return Object.freeze([1, 2, 3]);
  return Object.freeze([Number(String(seed.unit).replace('U', ''))]);
}

function mindsetForSeed(seed) {
  if (seed.unit === 'U1') return 'HÀNH ĐỘNG XYZ · habit';
  if (seed.unit === 'U2') return 'QUÉT CẤU TRÚC · Subject | whole Predicate';
  if (seed.unit === 'U3') return 'HÀNH ĐỘNG XYZ · finished past';
  return 'MINDSET FIRST · tự chọn system U1/U2/U3';
}

function microSkillIdsForSeed(seed) {
  const skill = seed.skill;
  if (seed.unit === 'U1') {
    if (skill === 'Verb form / subject–verb agreement' || skill === 'Controlled production') return ['G7-U13-MS01', 'G7-U13-MS02'];
    if (skill === 'Negative transformation') return ['G7-U13-MS03'];
    if (skill === 'Question formation') return ['G7-U13-MS04'];
    if (skill === 'Error correction') return ['G7-U13-MS03', 'G7-U13-MS04'];
    if (skill === 'Word order / sentence building') return ['G7-U13-MS01', 'G7-U13-MS05'];
    if (skill === 'Vietnamese → English') return ['G7-U13-MS01', 'G7-U13-MS05'];
  }
  if (seed.unit === 'U2') {
    if (skill === 'Identify Subject | Predicate') return ['G7-U13-MS08'];
    if (skill === 'Sentence pattern recognition') return ['G7-U13-MS09'];
    if (skill === 'Clause counting') return ['G7-U13-MS10', 'G7-U13-MS11'];
    if (skill === 'Sentence building') return ['G7-U13-MS09', 'G7-U13-MS13'];
    if (skill === 'Combine ideas with shared subject/predicate') return ['G7-U13-MS11', 'G7-U13-MS12'];
    if (skill === 'Error correction / clause skeleton') return ['G7-U13-MS08', 'G7-U13-MS13'];
  }
  if (seed.unit === 'U3') {
    if (skill === 'Past verb form' || skill === 'Controlled production') return ['G7-U13-MS14', 'G7-U13-MS15', 'G7-U13-MS18'];
    if (skill === 'Negative transformation') return ['G7-U13-MS16', 'G7-U13-MS19'];
    if (skill === 'Question formation') return ['G7-U13-MS17', 'G7-U13-MS19'];
    if (skill === 'Error correction') return ['G7-U13-MS16', 'G7-U13-MS17', 'G7-U13-MS19'];
    if (skill === 'Word order / sentence building' || skill === 'Vietnamese → English') return ['G7-U13-MS14', 'G7-U13-MS18'];
  }
  if (seed.unit === 'MIX') {
    if (skill === 'Clause scan in mixed review') return ['G7-U13-MS10', 'G7-U13-MS11', 'G7-U13-MS21'];
    return ['G7-U13-MS21'];
  }
  return ['G7-U13-MS21'];
}

function grammarFamiliesForSeed(seed) {
  if (seed.unit === 'U1') return ['Present Simple'];
  if (seed.unit === 'U2') return ['Simple Sentences'];
  if (seed.unit === 'U3') return ['Past Simple'];
  return ['Review 1 — U1–U3'];
}

function phraseIdsForSeed(seed) {
  const raw = String(seed.vocabOrChunk ?? '').toLowerCase().trim();
  if (!raw) return [];
  const direct = PHRASE_ID_BY_TEXT.get(raw);
  if (direct) return [direct];
  const matches = g7ReviewU13Phrases
    .filter(item => raw.includes(String(item.phrase).toLowerCase()) || String(item.phrase).toLowerCase().includes(raw))
    .map(item => item.id);
  return [...new Set(matches)];
}

function theoryForSeed(seed) {
  const core = String(seed.brainDiagnosis ?? '').trim();
  if (seed.unit === 'U1') {
    return `MINDSET FIRST → HÀNH ĐỘNG XYZ → đọc habit/frequency meaning → cut Subject | whole Predicate → ${core} → scan double marking: DOES/DOESN'T đã giữ discipline thì lexical core về V0.`;
  }
  if (seed.unit === 'U2') {
    return `MINDSET FIRST → QUÉT CẤU TRÚC → cut Subject | whole Predicate → đếm independent clause, KHÔNG đếm lexical verbs → ${core} → giữ whole predicate, không cắt bên trong predicate.`;
  }
  if (seed.unit === 'U3') {
    return `MINDSET FIRST → HÀNH ĐỘNG XYZ đã đóng → đọc past marker → ${core} → scan double past: DID/DIDN'T đã giữ PAST discipline thì lexical core về V0.`;
  }
  return `MINDSET FIRST → ẩn Unit/tense label → đọc meaning/context → chọn nhánh HABIT / ONE-CLAUSE STRUCTURE / FINISHED PAST → ${core} → scan host/marker/cut trước khi chốt đáp án.`;
}

function feedback(answer, reason, theory, example = '') {
  return Object.freeze({
    correctLabel: String(answer),
    reason: String(reason ?? ''),
    theory: String(theory ?? '').startsWith('MINDSET FIRST') ? String(theory) : `MINDSET FIRST → ${String(theory ?? '')}`,
    example: String(example || answer)
  });
}

function sourceMeta(seed, kind) {
  const trapId = TRAP_ID_BY_NAME.get(seed.trapType);
  if (!trapId) throw new Error(`Unknown G7 trap type: ${seed.trapType}`);
  return {
    units: unitNumbers(seed),
    grammarFamilies: freezeArray(grammarFamiliesForSeed(seed)),
    microSkillIds: freezeArray(microSkillIdsForSeed(seed)),
    trapIds: freezeArray([trapId]),
    phraseIds: freezeArray(phraseIdsForSeed(seed)),
    sourceExerciseIds: freezeArray([seed.id]),
    sourceSkill: seed.skill,
    exerciseKind: kind,
    mindset: mindsetForSeed(seed),
    difficulty: seed.difficulty,
    authoredExtension: false,
    sourceScope: G7_REVIEW_U13_SOURCE_SCOPE
  };
}

function parseSentenceBuildingChunks(seed) {
  const text = String(seed.prompt ?? '');
  const payload = text.includes(':') ? text.slice(text.indexOf(':') + 1) : text;
  return payload.split('/').map(value => value.trim()).filter(Boolean);
}

function chunkPosition(answer, chunk) {
  const haystack = String(answer).toLowerCase();
  const needle = String(chunk).toLowerCase().replace(/[.?!]+$/g, '').trim();
  return haystack.indexOf(needle);
}

function baseVerb(seed) {
  const raw = String(seed.vocabOrChunk ?? '').trim().toLowerCase();
  const first = raw.split(/\s+/)[0];
  if (first && /^[a-z]+$/.test(first)) return first;
  return 'do';
}

function orderDistractors(seed, accepted) {
  const pool = new Set(accepted.map(String));
  const result = [];
  const add = (token, code, hint) => {
    if (!token || pool.has(token) || result.some(item => item.token === token)) return;
    result.push(Object.freeze({ token, code, hint }));
  };

  if (seed.unit === 'U1') {
    const base = baseVerb(seed);
    add(base, 'missing_3sg_or_wrong_form', 'Habit affirmative ngôi 3 thường cần V-s/es; đọc Subject trước.');
    add('does', 'unnecessary_auxiliary', 'Affirmative lexical habit không tự thêm DOES.');
    add(`${base}ing`, 'wrong_aspect', 'Hobby routine target này không chuyển sang V-ing chỉ vì thấy action.');
  } else if (seed.unit === 'U2') {
    add('and she', 'redundant_subject', 'Nếu cùng Subject, không inflate thành mệnh đề mới bằng cách lặp Subject.');
    add('is', 'extra_host', 'QUÉT whole predicate: không thêm BE nếu skeleton không cần.');
    add('because', 'extra_clause_link', 'Không thêm clause marker ngoài target simple-sentence skeleton.');
  } else if (seed.unit === 'U3') {
    const base = baseVerb(seed);
    add(base, 'missing_past_marker', 'Affirmative finished past cần V2/V-ed.');
    add('did', 'double_past_system', 'Affirmative không thêm DID trước V2/V-ed.');
    add(`${base}s`, 'present_marker', 'Past marker trong context loại Present Simple 3SG.');
  } else {
    add('does', 'wrong_system_auxiliary', 'Chọn auxiliary sau khi đọc meaning; DOES chỉ thuộc habit question/negative system.');
    add('did', 'wrong_system_auxiliary', 'DID chỉ dùng khi question/negative past cần host.');
    add('and she', 'clause_inflation', 'Không tự thêm Subject mới nếu target đang giữ một whole predicate.');
  }
  return result.slice(0, 3);
}

function sentenceOrderFromSeed(id, seed) {
  const chunks = parseSentenceBuildingChunks(seed);
  const sorted = [...chunks].sort((a, b) => chunkPosition(seed.answer, a) - chunkPosition(seed.answer, b));
  const punctuation = /[.?!]$/.test(String(seed.answer).trim()) ? String(seed.answer).trim().slice(-1) : '';
  const correctOrder = punctuation ? [...sorted, punctuation] : sorted;
  const distractors = orderDistractors(seed, correctOrder);
  const tokens = [...correctOrder, ...distractors.map(item => item.token)];
  return Object.freeze({
    id,
    type: 'sentence_order',
    prompt: 'SELECT + ORDER: chọn đúng chunk, loại bẫy rồi xếp thành câu hoàn chỉnh.',
    tokens: freezeArray(tokens),
    correctOrder: freezeArray(correctOrder),
    acceptedOrders: Object.freeze([freezeArray(correctOrder)]),
    orderDiagnostics: Object.freeze({ distractors: Object.freeze(distractors), rules: Object.freeze([]) }),
    teachingFeedback: feedback(seed.answer, seed.explanation, theoryForSeed(seed), seed.answer),
    ...sourceMeta(seed, 'sentence_order')
  });
}

function sourceItem(id, seedId) {
  const seed = SOURCE_BY_ID.get(seedId);
  if (!seed) throw new Error(`Unknown G7 source seed: ${seedId}`);

  if (seed.format === 'MCQ') {
    const choices = (seed.choices ?? []).map((text, index) => Object.freeze({ id: `c${index + 1}`, text: String(text) }));
    const correctIndex = (seed.choices ?? []).map(String).indexOf(String(seed.answer));
    if (correctIndex < 0) throw new Error(`Cannot resolve G7 MCQ answer: ${seed.id}`);
    return Object.freeze({
      id, type: 'mcq', prompt: seed.prompt, choices: Object.freeze(choices), correctChoiceId: `c${correctIndex + 1}`,
      teachingFeedback: feedback(seed.answer, seed.explanation, theoryForSeed(seed), seed.answer),
      ...sourceMeta(seed, 'mcq')
    });
  }

  if (seed.format === 'Sentence building') return sentenceOrderFromSeed(id, seed);

  const kind = ({
    'Fill blank': 'grammar_cloze',
    'Transformation': 'transformation',
    'Error correction': 'error_correction',
    'Translation': 'typing_translation',
    'Structure analysis': 'structure_analysis',
    'Classification': 'structure_analysis'
  })[seed.format] ?? 'sentence_building';

  return Object.freeze({
    id, type: 'typing', vi: seed.prompt, en: seed.answer,
    typingUi: TYPING_UI[kind] ?? TYPING_UI.grammar_cloze,
    teachingFeedback: feedback(seed.answer, seed.explanation, theoryForSeed(seed), seed.answer),
    ...sourceMeta(seed, kind)
  });
}

function customMeta(spec, lesson) {
  return {
    units: freezeArray(spec.units ?? lesson.units),
    grammarFamilies: freezeArray(spec.grammarFamilies ?? lesson.grammarFamilies),
    microSkillIds: freezeArray(spec.microSkillIds ?? lesson.microSkillIds),
    trapIds: freezeArray(spec.trapIds ?? lesson.trapIds),
    phraseIds: freezeArray(spec.phraseIds ?? []),
    sourceExerciseIds: freezeArray(spec.sourceExerciseIds ?? []),
    exerciseKind: spec.kind,
    mindset: spec.mindset ?? lesson.mindset,
    difficulty: spec.difficulty ?? lesson.difficulty,
    authoredExtension: true,
    sourceScope: G7_REVIEW_U13_SOURCE_SCOPE
  };
}

function customItem(id, spec, lesson) {
  const meta = customMeta(spec, lesson);
  if (spec.kind === 'mcq') {
    const choices = spec.choices.map((text, index) => Object.freeze({ id: `c${index + 1}`, text }));
    const correctIndex = spec.choices.indexOf(spec.correct);
    if (correctIndex < 0) throw new Error(`Custom G7 MCQ ${id} has no correct choice`);
    return Object.freeze({
      id, type: 'mcq', prompt: spec.prompt, choices: Object.freeze(choices), correctChoiceId: `c${correctIndex + 1}`,
      teachingFeedback: feedback(spec.correct, spec.reason, spec.brain, spec.example), ...meta
    });
  }
  if (spec.kind === 'true_false') {
    return Object.freeze({
      id, type: 'true_false', statement: spec.statement, answer: spec.answer,
      teachingFeedback: feedback(spec.answer ? 'TRUE' : 'FALSE', spec.reason, spec.brain, spec.example), ...meta
    });
  }
  if (spec.kind === 'classification') {
    return Object.freeze({
      id, type: 'classification', prompt: spec.prompt,
      groups: Object.freeze(spec.groups.map(group => Object.freeze({ id: group.id, label: group.label, ...(group.helper ? { helper: group.helper } : {}) }))),
      tokens: Object.freeze(spec.tokens.map(token => Object.freeze({ id: token.id, text: token.text, correctGroupId: token.group }))),
      classificationKind: 'generic',
      teachingFeedback: feedback(spec.correctLabel, spec.reason, spec.brain, spec.example), ...meta
    });
  }
  if (spec.kind === 'sentence_order') {
    return Object.freeze({
      id, type: 'sentence_order', prompt: spec.prompt,
      tokens: freezeArray(spec.tokens), correctOrder: freezeArray(spec.correctOrder),
      acceptedOrders: Object.freeze([freezeArray(spec.correctOrder)]),
      orderDiagnostics: Object.freeze({
        distractors: Object.freeze((spec.distractors ?? []).map(item => Object.freeze({ ...item }))),
        rules: Object.freeze([])
      }),
      teachingFeedback: feedback(spec.correctOrder.join(' '), spec.reason, spec.brain, spec.example), ...meta
    });
  }
  return Object.freeze({
    id, type: 'typing', vi: spec.prompt, en: spec.answer,
    typingUi: TYPING_UI[spec.kind] ?? TYPING_UI.grammar_cloze,
    teachingFeedback: feedback(spec.answer, spec.reason, spec.brain, spec.example), ...meta
  });
}

function interleave(sourceItems, customItems) {
  if (!customItems.length) return sourceItems;
  const result = [];
  let sourceIndex = 0;
  let customIndex = 0;
  const step = Math.max(1, Math.floor(sourceItems.length / customItems.length));
  while (sourceIndex < sourceItems.length || customIndex < customItems.length) {
    for (let i = 0; i < step && sourceIndex < sourceItems.length; i += 1) result.push(sourceItems[sourceIndex++]);
    if (customIndex < customItems.length) result.push(customItems[customIndex++]);
  }
  return result;
}

export function buildG7ReviewU13LessonMap(lessonSpecs) {
  return Object.freeze(Object.fromEntries(Object.entries(lessonSpecs).map(([key, lesson]) => {
    const sourceItems = lesson.sourceSeedIds.map((seedId, index) => sourceItem(`g7-review-u1-3-${key}-src${String(index + 1).padStart(2, '0')}`, seedId));
    const customItems = (lesson.customItems ?? []).map((spec, index) => customItem(`g7-review-u1-3-${key}-ext${String(index + 1).padStart(2, '0')}`, spec, lesson));
    const merged = interleave(sourceItems, customItems).map((item, index) => Object.freeze({ ...item, id: `g7-review-u1-3-${key}-q${String(index + 1).padStart(2, '0')}` }));
    return [key, Object.freeze({ items: Object.freeze(merged) })];
  })));
}
