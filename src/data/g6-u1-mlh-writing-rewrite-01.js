const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'after_submit' });

const wordTypingUi = freeze({
  promptLabel: 'Thầy hỏi · TỪ ĐƠN',
  contextLabel: 'Tiếng Việt + từ loại + ngữ cảnh',
  instruction: 'Con gõ chính xác từ tiếng Anh. Lý thuyết chỉ mở sau khi con submit.',
  inputLabel: 'Từ tiếng Anh của con',
  placeholder: 'Type the English word...'
});

const chunkTypingUi = freeze({
  promptLabel: 'Thầy hỏi · CỤM TỪ',
  contextLabel: 'Tiếng Việt + số từ',
  instruction: 'Con gõ đúng cả cụm theo đúng số từ Thầy cho. Không có từ loại ở bước này.',
  inputLabel: 'Cụm tiếng Anh của con',
  placeholder: 'Type the English chunk...'
});

const rewriteTypingUi = freeze({
  promptLabel: 'FINAL REWRITE · TỰ VIẾT CẢ CÂU',
  contextLabel: 'Câu gốc + câu bắt đầu viết lại',
  instruction: 'Con tự gõ toàn bộ câu mới sao cho giữ nguyên nghĩa. Không phải sắp xếp từ.',
  inputLabel: 'Câu viết lại hoàn chỉnh của con',
  placeholder: 'Type the complete rewritten sentence...'
});

const teaching = (correctLabel, reason, theory, example) => freeze({ correctLabel, reason, theory, example });
const contextPrompt = ({ sourceSentence, rewriteStarter, currentTask }) =>
  `CÂU GỐC: ${sourceSentence} | CÂU VIẾT LẠI: ${rewriteStarter} | NHIỆM VỤ: ${currentTask}`;

function typingItem(spec, index, stage) {
  const item = {
    id: `g6u1-mlh-rw-q${String(index + 1).padStart(2, '0')}`,
    type: 'typing',
    stage,
    vi: spec.vi,
    en: spec.en,
    typingUi: stage === 'word' ? wordTypingUi : stage === 'phrase' ? chunkTypingUi : rewriteTypingUi,
    theorySupport,
    teachingFeedback: teaching(spec.en, spec.reason, spec.theory, spec.example)
  };
  if (spec.sourceSentence) {
    item.sourceSentence = spec.sourceSentence;
    item.rewriteStarter = spec.rewriteStarter;
    item.currentTask = spec.currentTask;
    item.transformationId = spec.transformationId;
  }
  return freeze(item);
}

function mcqItem(spec, index) {
  const choices = spec.choices.map(([id, text, feedback]) => freeze({ id, text, feedback }));
  return freeze({
    id: `g6u1-mlh-rw-q${String(index + 1).padStart(2, '0')}`,
    type: 'mcq',
    stage: 'sentence',
    sourceSentence: spec.sourceSentence,
    rewriteStarter: spec.rewriteStarter,
    currentTask: spec.currentTask,
    transformationId: spec.transformationId,
    prompt: contextPrompt(spec),
    choices: freeze(choices),
    correctChoiceId: spec.correctChoiceId,
    theorySupport,
    teachingFeedback: teaching(
      choices.find(choice => choice.id === spec.correctChoiceId)?.text ?? spec.correctChoiceId,
      spec.reason,
      spec.theory,
      spec.example
    )
  });
}

const WORD_SPECS = [
  ['Thầy: yêu thích — tính từ (adj.), trong cụm nói về môn học con thích nhất. Con gõ từ tiếng Anh.', 'favourite', 'Thầy: Đúng. favourite là adjective dùng trước subject.', 'favourite + noun: favourite subject.', 'your favourite subject'],
  ['Thầy: môn học — danh từ (noun), trong câu hỏi về môn con thích nhất. Con gõ từ tiếng Anh.', 'subject', 'Thầy: Đúng. subject là danh từ chỉ môn học.', 'subject có thể đi sau favourite hoặc sau What trong câu hỏi.', 'favourite subject'],
  ['Thầy: các học sinh — danh từ số nhiều (plural noun), trong ý lớp có 35 học sinh. Con gõ đúng dạng tiếng Anh.', 'students', 'Thầy: Đúng. students có -s vì là số nhiều.', '35 + plural noun → 35 students.', '35 students'],
  ['Thầy: lớp học — danh từ (noun), trong ý “lớp của tôi có 35 học sinh”. Con gõ từ tiếng Anh.', 'class', 'Thầy: Đúng. class là danh từ chỉ lớp học.', 'my + class → my class.', 'my class'],
  ['Thầy: trường học — danh từ (noun), trong ý vị trí nhà Mai so với trường của cô ấy. Con gõ từ tiếng Anh.', 'school', 'Thầy: Đúng. school là danh từ chỉ trường học.', 'her school = trường của cô ấy.', 'near her school'],
  ['Thầy: gần — từ chỉ vị trí, trong câu “Mai sống gần trường của cô ấy”. Con gõ từ tiếng Anh.', 'near', 'Thầy: Đúng. near diễn tả khoảng cách gần.', 'near X có thể đổi nghĩa tương đương thành not far from X.', 'near her school'],
  ['Thầy: ngôi nhà — danh từ (noun), trong câu mới bắt đầu bằng “Mai’s house”. Con gõ từ tiếng Anh.', 'house', 'Thầy: Đúng. house là danh từ chỉ ngôi nhà.', "Mai's house = nhà của Mai.", "Mai's house"],
  ['Thầy: xa — từ chỉ khoảng cách, trong cấu trúc “not ___ from”. Con gõ từ tiếng Anh.', 'far', 'Thầy: Đúng. far đi với from trong cụm far from.', 'not far from = không xa, tương đương gần.', 'far from'],
  ['Thầy: chơi — động từ (verb), trong hoạt động chơi đàn piano. Con gõ từ tiếng Anh.', 'play', 'Thầy: Đúng. play là động từ trong play the piano.', 'Sau good at, hoạt động play phải chuyển thành playing.', 'play the piano'],
  ['Thầy: đàn piano — danh từ (noun), trong hoạt động “chơi đàn piano”. Con gõ từ tiếng Anh.', 'piano', 'Thầy: Đúng. piano là danh từ nhạc cụ.', 'play the piano là cụm động từ cố định trong câu nguồn.', 'play the piano'],
  ['Thầy: giỏi / tốt — tính từ (adj.), dùng để nói một người giỏi một hoạt động. Con gõ từ tiếng Anh.', 'good', 'Thầy: Đúng. good là adjective.', 'be good at + noun/V-ing.', 'good at'],
  ['Thầy: giỏi / tốt — trạng từ (adv.), dùng để bổ nghĩa cách Mary chơi piano. Con gõ từ tiếng Anh.', 'well', 'Thầy: Đúng. well là adverb bổ nghĩa cho plays.', 'V + well có thể được diễn đạt lại bằng be good at + V-ing.', 'plays the piano very well'],
  ['Thầy: vật lý — danh từ môn học (noun), trong câu hỏi về sự yêu thích một môn học. Con gõ từ tiếng Anh.', 'physics', 'Thầy: Đúng. physics là tên môn học.', 'like physics ↔ be interested in physics.', 'physics'],
  ['Thầy: hứng thú / quan tâm — tính từ (adj.), trong cấu trúc nói mình có hứng thú với một môn học. Con gõ từ tiếng Anh.', 'interested', 'Thầy: Đúng. interested là adjective.', 'be interested in + noun.', 'interested in physics'],
  ['Thầy: thư viện — danh từ (noun), trong ý trường có một phòng máy tính và một thư viện. Con gõ từ tiếng Anh.', 'library', 'Thầy: Đúng. library là danh từ chỉ thư viện.', 'a library là một cơ sở vật chất của trường.', 'a library']
].map(([vi, en, reason, theory, example]) => ({ vi, en, reason, theory, example }));

const CHUNK_SPECS = [
  ['Thầy: môn học yêu thích của bạn — cụm 3 từ. Con gõ đủ 3 từ tiếng Anh.', 'your favourite subject', 'Thầy: Đúng. Đây là noun phrase của câu gốc.', 'your + favourite + subject tạo một noun phrase hoàn chỉnh.', 'What is your favourite subject?'],
  ['Thầy: thích nhất — cụm 2 từ. Con gõ đủ 2 từ tiếng Anh.', 'like best', 'Thầy: Đúng. like best giữ ý “yêu thích nhất”.', 'favourite N ↔ N + like best trong transformation này.', 'What subject do you like best?'],
  ['Thầy: lớp của tôi — cụm 2 từ. Con gõ đủ 2 từ tiếng Anh.', 'my class', 'Thầy: Đúng. Đây là subject mới của câu viết lại.', 'There are X in my class ↔ My class has X.', 'My class has 35 students.'],
  ['Thầy: gần trường của cô ấy — cụm 3 từ. Con gõ đủ 3 từ tiếng Anh.', 'near her school', 'Thầy: Đúng. Đây là cụm vị trí trong câu gốc.', 'near her school = close to her school.', 'Mai lives near her school.'],
  ['Thầy: xa khỏi / xa so với — cụm 2 từ. Con gõ đủ 2 từ tiếng Anh.', 'far from', 'Thầy: Đúng. far from là cụm chỉ khoảng cách.', 'not far from X = không xa X, giữ nghĩa gần X.', 'not far from her school'],
  ['Thầy: chơi đàn piano — cụm 3 từ. Con gõ đủ 3 từ tiếng Anh.', 'play the piano', 'Thầy: Đúng. Đây là activity chunk của câu gốc.', 'play the piano sẽ đổi thành playing the piano sau good at.', 'play the piano'],
  ['Thầy: rất giỏi / rất tốt — cụm 2 từ. Con gõ đủ 2 từ tiếng Anh.', 'very well', 'Thầy: Đúng. Đây là adverb chunk bổ nghĩa cho plays.', 'plays ... very well diễn tả khả năng thực hiện tốt.', 'plays the piano very well'],
  ['Thầy: giỏi về... — cụm 2 từ. Con gõ đủ 2 từ tiếng Anh.', 'good at', 'Thầy: Đúng. Đây là cấu trúc adjective + preposition.', 'be good at + noun/V-ing.', 'is good at'],
  ['Thầy: việc chơi đàn piano — cụm 3 từ. Con gõ đủ 3 từ tiếng Anh.', 'playing the piano', 'Thầy: Đúng. playing là V-ing sau at.', 'good at + V-ing → good at playing the piano.', 'good at playing the piano'],
  ['Thầy: hứng thú với... — cụm 2 từ. Con gõ đủ 2 từ tiếng Anh.', 'interested in', 'Thầy: Đúng. interested phải đi với in.', 'be interested in + noun.', 'interested in physics'],
  ['Thầy: phòng máy tính — cụm 2 từ. Con gõ đủ 2 từ tiếng Anh.', 'computer room', 'Thầy: Đúng. Đây là một noun chunk chỉ cơ sở vật chất.', 'a computer room là một danh từ số ít bắt đầu bằng a.', 'a computer room'],
  ['Thầy: một thư viện — cụm 2 từ. Con gõ đủ 2 từ tiếng Anh.', 'a library', 'Thầy: Đúng. Đây là singular noun phrase.', 'a library phối hợp với a computer room trong câu cuối.', 'a computer room and a library']
].map(([vi, en, reason, theory, example]) => ({ vi, en, reason, theory, example }));

const TRANSFORM_SPECS = [
  {
    transformationId: 'favourite-like-best',
    sourceSentence: 'What is your favourite subject?',
    rewriteStarter: 'What subject ____________?',
    currentTask: 'MEANING CORE — Câu gốc thực sự đang hỏi điều gì?',
    correctChoiceId: 'b',
    choices: [
      ['a', 'Bạn học bao nhiêu môn?', 'Thầy: Không đúng. Câu không hỏi số lượng môn học.'],
      ['b', 'Bạn thích môn học nào nhất?', 'Thầy: Đúng. favourite subject = môn học con thích nhất.'],
      ['c', 'Bạn học môn gì hôm nay?', 'Thầy: Câu không có thông tin về today hay thời khóa biểu.'],
      ['d', 'Bạn có giỏi môn học đó không?', 'Thầy: “favourite” nói về sở thích, không nói về năng lực.']
    ],
    reason: 'Thầy: Meaning core là hỏi môn học con thích nhất.',
    theory: 'Viết lại câu phải giữ meaning core trước khi đổi cấu trúc.',
    example: 'favourite subject = subject you like best'
  },
  {
    transformationId: 'favourite-like-best',
    sourceSentence: 'What is your favourite subject?',
    rewriteStarter: 'What subject ____________?',
    currentTask: 'TRANSFORMATION — Cụm nào giữ nghĩa “yêu thích nhất” trong câu mới?',
    correctChoiceId: 'c',
    choices: [
      ['a', 'have many', 'Thầy: have many nói về số lượng, làm đổi nghĩa.'],
      ['b', 'be good at', 'Thầy: be good at nói về giỏi một việc, không phải thích nhất.'],
      ['c', 'like best', 'Thầy: Đúng. like best giữ đúng meaning core của favourite.'],
      ['d', 'be interested', 'Thầy: interested diễn tả hứng thú, nhưng chưa giữ chính xác ý “thích nhất” của câu này.']
    ],
    reason: 'Thầy: favourite ↔ like best trong cặp transformation này.',
    theory: 'Đổi từ adjective favourite sang main verb like thì cấu trúc câu hỏi cũng phải đổi.',
    example: 'What subject do you like best?'
  },
  {
    transformationId: 'favourite-like-best',
    sourceSentence: 'What is your favourite subject?',
    rewriteStarter: 'What subject ____________?',
    currentTask: 'SKELETON — Sau “What subject”, bộ khung nào tạo câu hỏi Present Simple đúng?',
    correctChoiceId: 'b',
    choices: [
      ['a', 'What subject + you + like best?', 'Thầy: Meaning gần đúng nhưng thiếu auxiliary do trước subject.'],
      ['b', 'What subject + do + you + like best?', 'Thầy: Đúng. WH phrase → do → subject → base verb.'],
      ['c', 'What subject + are + you + like best?', 'Thầy: are không đi trực tiếp với main verb like theo cấu trúc này.'],
      ['d', 'What subject + does + you + like best?', 'Thầy: Subject you dùng do, không dùng does.']
    ],
    reason: 'Thầy: Skeleton đúng là What subject + do + you + like best?',
    theory: 'Present Simple WH question với main verb: WH + do/does + subject + base verb.',
    example: 'What subject do you like best?'
  },
  {
    transformationId: 'there-are-has',
    sourceSentence: 'There are 35 students in my class.',
    rewriteStarter: 'My class ____________.',
    currentTask: 'MEANING CORE — Ý nào phải được giữ nguyên?',
    correctChoiceId: 'b',
    choices: [
      ['a', 'Lớp của tôi ở gần 35 học sinh.', 'Thầy: Câu gốc không nói về vị trí.'],
      ['b', 'Lớp của tôi có 35 học sinh.', 'Thầy: Đúng. Đây là cùng một nội dung nhìn từ “my class”.'],
      ['c', 'Có 35 lớp trong trường tôi.', 'Thầy: Con đã đổi students thành classes nên sai meaning core.'],
      ['d', '35 học sinh có một lớp.', 'Thầy: Quan hệ sở hữu/chứa đang bị đảo ngược.']
    ],
    reason: 'Thầy: Meaning core là lớp của tôi có 35 học sinh.',
    theory: 'There are X in Y có thể đổi góc nhìn sang Y has X.',
    example: 'There are 35 students in my class. ↔ My class has 35 students.'
  },
  {
    transformationId: 'there-are-has',
    sourceSentence: 'There are 35 students in my class.',
    rewriteStarter: 'My class ____________.',
    currentTask: 'TRANSFORMATION — Khi subject mới là “My class”, verb nào diễn tả “có”?',
    correctChoiceId: 'c',
    choices: [
      ['a', 'are', 'Thầy: are tiếp tục cấu trúc be nhưng không diễn tả “My class có...”.'],
      ['b', 'have', 'Thầy: Đúng verb gốc nhưng subject My class là số ít nên phải chia khác.'],
      ['c', 'has', 'Thầy: Đúng. My class là singular subject → has.'],
      ['d', 'is', 'Thầy: is không mang nghĩa sở hữu/chứa 35 students trong cấu trúc này.']
    ],
    reason: 'Thầy: There are X in my class ↔ My class has X.',
    theory: 'Ngôi 3 số ít trong Present Simple: have → has.',
    example: 'My class has 35 students.'
  },
  {
    transformationId: 'there-are-has',
    sourceSentence: 'There are 35 students in my class.',
    rewriteStarter: 'My class ____________.',
    currentTask: 'SKELETON — Câu viết lại nào giữ nguyên nghĩa và đúng agreement?',
    correctChoiceId: 'c',
    choices: [
      ['a', 'My class are 35 students.', 'Thầy: My class không đồng nhất với 35 students; cấu trúc này sai.'],
      ['b', 'My class have 35 students.', 'Thầy: Meaning đúng nhưng agreement sai: My class → has.'],
      ['c', 'My class has 35 students.', 'Thầy: Đúng. Subject singular + has + object.'],
      ['d', 'My class there are 35 students.', 'Thầy: Không đặt My class trước cấu trúc there are như vậy.']
    ],
    reason: 'Thầy: Câu đúng là My class has 35 students.',
    theory: 'Subject + has + object là skeleton sở hữu/chứa.',
    example: 'My class | has | 35 students.'
  },
  {
    transformationId: 'near-not-far-from',
    sourceSentence: 'Mai lives near her school.',
    rewriteStarter: "Mai's house isn't ____________.",
    currentTask: 'MEANING CORE — Câu gốc nói điều gì về vị trí nhà Mai và trường?',
    correctChoiceId: 'a',
    choices: [
      ['a', 'Nhà Mai ở gần trường của cô ấy.', 'Thầy: Đúng. lives near her school cho biết nhà Mai không xa trường.'],
      ['b', 'Mai sống trong trường.', 'Thầy: near không có nghĩa là inside/in.'],
      ['c', 'Nhà Mai ở xa trường.', 'Thầy: Câu này đảo ngược meaning core của near.'],
      ['d', 'Mai không thích trường.', 'Thầy: Câu gốc nói vị trí, không nói sở thích.']
    ],
    reason: 'Thầy: Meaning core là khoảng cách gần giữa nhà Mai và trường.',
    theory: 'near và not far from có thể diễn đạt cùng quan hệ khoảng cách.',
    example: 'near her school ↔ not far from her school'
  },
  {
    transformationId: 'near-not-far-from',
    sourceSentence: 'Mai lives near her school.',
    rewriteStarter: "Mai's house isn't ____________.",
    currentTask: 'TRANSFORMATION — Starter đã có “isn’t”. Cụm nào giữ nguyên nghĩa của “near”?',
    correctChoiceId: 'b',
    choices: [
      ['a', 'near', "Thầy: Nếu viết isn't near thì nghĩa thành “không gần”, trái câu gốc."],
      ['b', 'far from', "Thầy: Đúng. isn't far from = không xa = gần."],
      ['c', 'next', 'Thầy: next cần cấu trúc next to và cũng không phải transformation đã cho.'],
      ['d', 'inside', 'Thầy: inside nói ở bên trong, làm đổi quan hệ vị trí.']
    ],
    reason: "Thầy: near ↔ isn't far from trong starter này.",
    theory: 'Khi target đã có phủ định, phải kiểm tra cả nghĩa của cụm mới để không vô tình đảo nghĩa.',
    example: "Mai's house isn't far from her school."
  },
  {
    transformationId: 'near-not-far-from',
    sourceSentence: 'Mai lives near her school.',
    rewriteStarter: "Mai's house isn't ____________.",
    currentTask: 'SKELETON — Câu nào hoàn chỉnh, đúng cấu trúc và không đảo nghĩa?',
    correctChoiceId: 'b',
    choices: [
      ['a', "Mai's house isn't near her school.", 'Thầy: Grammar được nhưng meaning bị đảo: isn’t near = không gần.'],
      ['b', "Mai's house isn't far from her school.", 'Thầy: Đúng. isn’t far from giữ nghĩa “gần”.'],
      ['c', "Mai's house doesn't far from her school.", 'Thầy: far không phải main verb để dùng doesn’t như vậy.'],
      ['d', "Mai's house isn't far her school.", 'Thầy: far cần giới từ from trước place.']
    ],
    reason: "Thầy: Câu đúng là Mai's house isn't far from her school.",
    theory: 'be + not + far from + place.',
    example: "Mai's house | isn't | far from | her school."
  },
  {
    transformationId: 'well-good-at-ving',
    sourceSentence: 'Mary plays the piano very well.',
    rewriteStarter: 'Mary is good ____________.',
    currentTask: 'MEANING CORE — “very well” đang nói điều gì về Mary?',
    correctChoiceId: 'c',
    choices: [
      ['a', 'Mary rất thích đàn piano.', 'Thầy: well nói về cách thực hiện, không nói sở thích.'],
      ['b', 'Đàn piano của Mary rất tốt.', 'Thầy: well đang bổ nghĩa cho plays, không miêu tả chất lượng cây đàn.'],
      ['c', 'Mary chơi đàn piano rất giỏi.', 'Thầy: Đúng. very well diễn tả khả năng thực hiện tốt.'],
      ['d', 'Mary thường chơi đàn piano.', 'Thầy: Câu không có trạng từ tần suất.']
    ],
    reason: 'Thầy: Meaning core là Mary có khả năng chơi piano tốt.',
    theory: 'Adverb well mô tả cách hành động được thực hiện.',
    example: 'plays the piano very well'
  },
  {
    transformationId: 'well-good-at-ving',
    sourceSentence: 'Mary plays the piano very well.',
    rewriteStarter: 'Mary is good ____________.',
    currentTask: 'TRANSFORMATION — Cấu trúc nào diễn đạt lại “verb + very well” bằng adjective?',
    correctChoiceId: 'd',
    choices: [
      ['a', 'be interested in + noun', 'Thầy: Đây là cấu trúc sở thích/hứng thú, không phải năng lực.'],
      ['b', 'be far from + place', 'Thầy: Đây là cấu trúc vị trí.'],
      ['c', 'have + noun', 'Thầy: Đây là possession, không diễn tả làm việc gì giỏi.'],
      ['d', 'be good at + V-ing', 'Thầy: Đúng. Đây là cấu trúc tương đương về năng lực.']
    ],
    reason: 'Thầy: V + well ↔ be good at + V-ing.',
    theory: 'Sau preposition at, hoạt động dùng V-ing.',
    example: 'plays the piano very well ↔ is good at playing the piano'
  },
  {
    transformationId: 'well-good-at-ving',
    sourceSentence: 'Mary plays the piano very well.',
    rewriteStarter: 'Mary is good ____________.',
    currentTask: 'MORPHOLOGY — Sau “good at”, hoạt động “play the piano” phải ở dạng nào?',
    correctChoiceId: 'c',
    choices: [
      ['a', 'play the piano', 'Thầy: Sau preposition at, activity verb không để base form trong cấu trúc này.'],
      ['b', 'plays the piano', 'Thầy: plays là finite verb; sau at cần V-ing.'],
      ['c', 'playing the piano', 'Thầy: Đúng. at + V-ing → playing the piano.'],
      ['d', 'played the piano', 'Thầy: Past form không phù hợp sau good at để nói kỹ năng chung.']
    ],
    reason: 'Thầy: Sau good at dùng V-ing → playing the piano.',
    theory: 'Preposition + gerund/V-ing khi nói hoạt động.',
    example: 'Mary is good at playing the piano.'
  },
  {
    transformationId: 'like-interested-in',
    sourceSentence: 'Do you like physics?',
    rewriteStarter: 'Are you interested ____________?',
    currentTask: 'MEANING CORE — Câu gốc đang hỏi điều gì?',
    correctChoiceId: 'a',
    choices: [
      ['a', 'Bạn có thích / hứng thú với môn Vật lý không?', 'Thầy: Đúng. Câu hỏi kiểm tra sự yêu thích/hứng thú với physics.'],
      ['b', 'Bạn có giỏi môn Vật lý không?', 'Thầy: like không có nghĩa là be good at.'],
      ['c', 'Bạn có học Vật lý hôm nay không?', 'Thầy: Câu không hỏi thời khóa biểu.'],
      ['d', 'Bạn có bao nhiêu tiết Vật lý?', 'Thầy: Câu không hỏi số lượng.']
    ],
    reason: 'Thầy: Meaning core là sự yêu thích/hứng thú với physics.',
    theory: 'like + noun có thể được paraphrase bằng be interested in + noun.',
    example: 'like physics ↔ be interested in physics'
  },
  {
    transformationId: 'like-interested-in',
    sourceSentence: 'Do you like physics?',
    rewriteStarter: 'Are you interested ____________?',
    currentTask: 'TRANSFORMATION — Cụm nào tương đương với “like” trong target đã dùng adjective interested?',
    correctChoiceId: 'c',
    choices: [
      ['a', 'good at', 'Thầy: good at nói về năng lực.'],
      ['b', 'favourite', 'Thầy: favourite có thể nói sở thích nhưng không khớp starter Are you interested...'],
      ['c', 'interested in', 'Thầy: Đúng. be interested in + noun giữ meaning core của like + noun.'],
      ['d', 'far from', 'Thầy: far from là cấu trúc khoảng cách.']
    ],
    reason: 'Thầy: like N ↔ be interested in N.',
    theory: 'interested là adjective nên câu hỏi dùng be: Are you interested in...?',
    example: 'Are you interested in physics?'
  },
  {
    transformationId: 'like-interested-in',
    sourceSentence: 'Do you like physics?',
    rewriteStarter: 'Are you interested ____________?',
    currentTask: 'SKELETON — Phần còn lại nào hoàn thành đúng target?',
    correctChoiceId: 'b',
    choices: [
      ['a', 'physics', 'Thầy: interested cần giới từ in trước noun.'],
      ['b', 'in physics', 'Thầy: Đúng. interested in + noun.'],
      ['c', 'at physics', 'Thầy: interested không đi với at trong cấu trúc này.'],
      ['d', 'on physics', 'Thầy: interested không đi với on trong transformation này.']
    ],
    reason: 'Thầy: Target hoàn chỉnh là Are you interested in physics?',
    theory: 'be interested in + noun.',
    example: 'Are | you | interested in | physics?'
  },
  {
    transformationId: 'has-there-is',
    sourceSentence: 'The school has a computer room and a library.',
    rewriteStarter: 'There ____________.',
    currentTask: 'MEANING CORE — Câu gốc nói điều gì về trường?',
    correctChoiceId: 'd',
    choices: [
      ['a', 'Trường ở gần thư viện.', 'Thầy: Câu gốc không nói khoảng cách.'],
      ['b', 'Phòng máy tính nằm trong thư viện.', 'Thầy: Câu gốc liệt kê hai cơ sở vật chất riêng.'],
      ['c', 'Trường có nhiều học sinh.', 'Thầy: Không có thông tin về students.'],
      ['d', 'Trường có một phòng máy tính và một thư viện.', 'Thầy: Đúng. Đây là meaning core cần giữ.']
    ],
    reason: 'Thầy: Meaning core là trường có hai cơ sở vật chất được nêu.',
    theory: 'Y has X có thể đổi thành There is/are X in Y.',
    example: 'The school has X. ↔ There is/are X in the school.'
  },
  {
    transformationId: 'has-there-is',
    sourceSentence: 'The school has a computer room and a library.',
    rewriteStarter: 'There ____________.',
    currentTask: 'TRANSFORMATION + AGREEMENT — Với cụm bắt đầu bằng “a computer room”, opening nào phù hợp với đáp án của bài?',
    correctChoiceId: 'a',
    choices: [
      ['a', 'is', 'Thầy: Đúng. Bài dùng There is trước cụm bắt đầu bằng singular “a computer room”.'],
      ['b', 'are', 'Thầy: Với đáp án mục tiêu của bài, opening cần There is.'],
      ['c', 'has', 'Thầy: There has không phải cấu trúc tồn tại cần dùng ở đây.'],
      ['d', 'have', 'Thầy: There have không phải skeleton của transformation này.']
    ],
    reason: 'Thầy: Target dùng There is + a computer room and a library + in the school.',
    theory: 'Transformation đang đổi từ possession has sang existential There is/are.',
    example: 'There is a computer room and a library in the school.'
  },
  {
    transformationId: 'has-there-is',
    sourceSentence: 'The school has a computer room and a library.',
    rewriteStarter: 'There ____________.',
    currentTask: 'SKELETON — Câu nào giữ đúng hai cơ sở vật chất và nơi chốn?',
    correctChoiceId: 'c',
    choices: [
      ['a', 'There is the school a computer room and a library.', 'Thầy: Place “the school” đang đứng sai vị trí.'],
      ['b', 'There has a computer room and a library in the school.', 'Thầy: There has không phải cấu trúc tồn tại.'],
      ['c', 'There is a computer room and a library in the school.', 'Thầy: Đúng. There is + things + in the school.'],
      ['d', 'There is a computer room in a library at the school.', 'Thầy: Câu này đổi meaning thành phòng máy ở trong thư viện.']
    ],
    reason: 'Thầy: Câu đúng là There is a computer room and a library in the school.',
    theory: 'Existential skeleton: There is/are + thing(s) + place.',
    example: 'There is | a computer room and a library | in the school.'
  }
];

const FINAL_SPECS = [
  {
    transformationId: 'favourite-like-best',
    sourceSentence: 'What is your favourite subject?',
    rewriteStarter: 'What subject ____________?',
    currentTask: 'FINAL REWRITE — Con tự viết toàn bộ câu mới, giữ nguyên nghĩa.',
    en: 'What subject do you like best?',
    reason: 'Thầy: Đúng. Con đã đổi favourite → like best và thêm auxiliary do đúng vị trí.',
    theory: 'WH + do + subject + base verb; favourite N ↔ N + like best.',
    example: 'What subject do you like best?'
  },
  {
    transformationId: 'there-are-has',
    sourceSentence: 'There are 35 students in my class.',
    rewriteStarter: 'My class ____________.',
    currentTask: 'FINAL REWRITE — Con tự viết toàn bộ câu mới, giữ nguyên nghĩa.',
    en: 'My class has 35 students.',
    reason: 'Thầy: Đúng. Con đã đổi There are X in Y → Y has X và chia has cho My class.',
    theory: 'My class là singular subject → has.',
    example: 'My class has 35 students.'
  },
  {
    transformationId: 'near-not-far-from',
    sourceSentence: 'Mai lives near her school.',
    rewriteStarter: "Mai's house isn't ____________.",
    currentTask: 'FINAL REWRITE — Con tự viết toàn bộ câu mới, giữ nguyên nghĩa.',
    en: "Mai's house isn't far from her school.",
    reason: "Thầy: Đúng. isn't far from giữ đúng nghĩa near.",
    theory: 'near X ↔ not far from X.',
    example: "Mai's house isn't far from her school."
  },
  {
    transformationId: 'well-good-at-ving',
    sourceSentence: 'Mary plays the piano very well.',
    rewriteStarter: 'Mary is good ____________.',
    currentTask: 'FINAL REWRITE — Con tự viết toàn bộ câu mới, giữ nguyên nghĩa.',
    en: 'Mary is good at playing the piano.',
    reason: 'Thầy: Đúng. Con đã đổi V + well → be good at + V-ing.',
    theory: 'be good at + V-ing; sau at dùng playing, không dùng play/plays.',
    example: 'Mary is good at playing the piano.'
  },
  {
    transformationId: 'like-interested-in',
    sourceSentence: 'Do you like physics?',
    rewriteStarter: 'Are you interested ____________?',
    currentTask: 'FINAL REWRITE — Con tự viết toàn bộ câu mới, giữ nguyên nghĩa.',
    en: 'Are you interested in physics?',
    reason: 'Thầy: Đúng. Con đã đổi like physics → be interested in physics và dùng Are trước subject you.',
    theory: 'be interested in + noun.',
    example: 'Are you interested in physics?'
  },
  {
    transformationId: 'has-there-is',
    sourceSentence: 'The school has a computer room and a library.',
    rewriteStarter: 'There ____________.',
    currentTask: 'FINAL REWRITE — Con tự viết toàn bộ câu mới, giữ nguyên nghĩa.',
    en: 'There is a computer room and a library in the school.',
    reason: 'Thầy: Đúng. Con đã đổi Y has X → There is X in Y và giữ đủ hai cơ sở vật chất.',
    theory: 'There is/are + thing(s) + place.',
    example: 'There is a computer room and a library in the school.'
  }
].map(spec => ({ ...spec, vi: contextPrompt(spec) }));

const items = [];
WORD_SPECS.forEach((spec, index) => items.push(typingItem(spec, index, 'word')));
CHUNK_SPECS.forEach((spec, offset) => items.push(typingItem(spec, 15 + offset, 'phrase')));
TRANSFORM_SPECS.forEach((spec, offset) => items.push(mcqItem(spec, 27 + offset)));
FINAL_SPECS.forEach((spec, offset) => items.push(typingItem(spec, 45 + offset, 'sentence')));

export const global6Unit1MlhWritingRewrite01Content = freeze({ items: freeze(items) });
