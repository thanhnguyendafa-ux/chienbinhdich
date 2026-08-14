const freeze = value => Object.freeze(value);
const choice = (id, text) => freeze({ id, text });
const feedback = ({ correctLabel, reason, theory, example, workedExample, answerAnalysis }) => freeze({
  correctLabel,
  reason,
  theory,
  example,
  ...(workedExample ? { workedExample: freeze(workedExample) } : {}),
  ...(answerAnalysis ? { answerAnalysis: freeze(answerAnalysis.map(entry => freeze(entry))) } : {})
});
const theorySupport = access => freeze({ access });
const mcq = ({ id, prompt, choices, correctChoiceId, teachingFeedback, theoryAccess = 'anytime' }) => freeze({
  id,
  type: 'mcq',
  prompt,
  choices: freeze(choices),
  correctChoiceId,
  theorySupport: theorySupport(theoryAccess),
  teachingFeedback
});
const tf = ({ id, statement, answer, teachingFeedback, theoryAccess = 'anytime' }) => freeze({
  id,
  type: 'true_false',
  statement,
  answer,
  theorySupport: theorySupport(theoryAccess),
  teachingFeedback
});
const group = (id, label, helper) => freeze({ id, label, helper });
const token = (id, text, correctGroupId) => freeze({ id, text, correctGroupId });
const classification = ({ id, prompt, tokens, teachingFeedback }) => freeze({
  id,
  type: 'classification',
  prompt,
  groups: freeze([
    group('schwa', '/ə/ · SCHWA / ÂM NHẸ', 'Weak or unstressed syllable / Âm tiết nhẹ hoặc không mang trọng âm'),
    group('long-er', '/ɜː/ · LONG SOUND / ÂM DÀI', 'Look for useful clues: ir · ur · ear · wor / Tìm dấu hiệu: ir · ur · ear · wor')
  ]),
  tokens: freeze(tokens),
  classificationKind: 'generic',
  classificationHint: 'Think: weak/unstressed → /ə/. In this lesson, useful spelling clues ir, ur, ear, wor often point to /ɜː/. / Nghĩ: âm tiết nhẹ/không nhấn → /ə/. Trong bài này, các dấu hiệu ir, ur, ear, wor thường gợi /ɜː/.',
  theorySupport: theorySupport('after_submit'),
  teachingFeedback
});

const generalTheory = 'Look for two kinds of clues. / Hãy tìm hai loại dấu hiệu. (1) A weak or unstressed syllable often reduces to /ə/. / Âm tiết nhẹ hoặc không mang trọng âm thường có thể giảm thành /ə/. (2) In the words of this lesson, spelling clues ir, ur, ear and wor often point to /ɜː/. / Trong các từ của bài này, ir, ur, ear và wor thường gợi âm /ɜː/. These are useful clues, not 100% rules. / Đây là dấu hiệu hữu ích, không phải quy luật tuyệt đối.';

export const global7Unit1Pronunciation01Content = freeze({
  items: freeze([
    mcq({
      id: 'g7u1-pr-q01',
      prompt: 'Remember: /ə/ is often found in an unstressed syllable. / Ghi nhớ: /ə/ thường xuất hiện trong âm tiết không mang trọng âm. In “around”, which part is weak? / Trong “around”, phần nào được đọc nhẹ?',
      choices: [choice('a', 'a- / phần a-'), choice('b', '-round / phần -round')],
      correctChoiceId: 'a',
      teachingFeedback: feedback({
        correctLabel: 'a- / phần a-',
        reason: 'In around, the second syllable carries the main stress, so the first syllable is weak. / Trong around, âm tiết thứ hai mang trọng âm chính nên âm tiết đầu đọc nhẹ.',
        theory: 'A weak or unstressed vowel often reduces to schwa /ə/. / Một nguyên âm ở âm tiết nhẹ hoặc không nhấn thường có thể giảm thành schwa /ə/.',
        example: 'around /əˈraʊnd/ · upon /əˈpɒn/.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q02',
      prompt: 'A weak first syllable may be pronounced /ə/. / Âm tiết đầu không được nhấn có thể được đọc /ə/. Which word begins with a weak syllable? / Từ nào bắt đầu bằng một âm tiết nhẹ?',
      choices: [choice('a', 'around'), choice('b', 'girl'), choice('c', 'shirt')],
      correctChoiceId: 'a',
      teachingFeedback: feedback({
        correctLabel: 'around',
        reason: 'The first syllable a- in around is unstressed and is pronounced /ə/. / Âm tiết a- trong around không mang trọng âm và được đọc /ə/.',
        theory: 'At the beginning of a word, an unstressed vowel can reduce to /ə/. / Ở đầu từ, nguyên âm không nhấn có thể giảm thành /ə/.',
        example: 'around · upon · collect · monopoly · occasion.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q03',
      prompt: 'Final syllables can also be weak. / Âm tiết cuối cũng có thể là âm tiết nhẹ. In “mother”, is “-er” strong or weak? / Trong “mother”, phần “-er” được đọc mạnh hay nhẹ?',
      choices: [choice('a', 'Strong / Mạnh'), choice('b', 'Weak / Nhẹ')],
      correctChoiceId: 'b',
      teachingFeedback: feedback({
        correctLabel: 'Weak / Nhẹ',
        reason: 'The first syllable is stressed; the final -er is unstressed. / Âm tiết đầu được nhấn; -er cuối từ không được nhấn.',
        theory: 'An unstressed final syllable often contains schwa /ə/ in British English. / Trong tiếng Anh-Anh, âm tiết cuối không nhấn thường có thể chứa schwa /ə/.',
        example: 'mother /ˈmʌðə/ · answer /ˈɑːnsə/ · singer /ˈsɪŋə/ · doctor /ˈdɒktə/.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q04',
      prompt: 'In the words of this lesson, “ir” often gives /ɜː/. / Trong các từ của bài này, “ir” thường cho âm /ɜː/. Which spelling clue can you see in “girl”? / Em nhìn thấy dấu hiệu chữ nào trong “girl”?',
      choices: [choice('a', 'ir'), choice('b', 'ur'), choice('c', 'ear')],
      correctChoiceId: 'a',
      teachingFeedback: feedback({
        correctLabel: 'ir',
        reason: 'girl contains the spelling clue ir. / girl có cụm chữ ir.',
        theory: 'In this lesson, ir is a useful clue for /ɜː/. / Trong bài này, ir là dấu hiệu hữu ích để nhận ra /ɜː/.',
        example: 'girl · birth · shirt · dirty.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q05',
      prompt: '“ur” can give /ɜː/. / “ur” có thể cho âm /ɜː/. What sound does “ur” have in “hurt”? / “ur” trong “hurt” có âm nào?',
      choices: [choice('a', '/ə/'), choice('b', '/ɜː/')],
      correctChoiceId: 'b',
      teachingFeedback: feedback({
        correctLabel: '/ɜː/',
        reason: 'The ur in hurt is pronounced /ɜː/. / Cụm ur trong hurt được đọc /ɜː/.',
        theory: 'In this word set, ur is another useful spelling clue for /ɜː/. / Trong nhóm từ này, ur là một dấu hiệu hữu ích khác cho /ɜː/.',
        example: 'hurt · sunburn.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q06',
      prompt: 'In heard, early and learn, “ear” is pronounced /ɜː/. / Trong heard, early và learn, “ear” được đọc /ɜː/. Which sound should you remember for “ear” in these words? / Với các từ này, khi thấy “ear” em cần nhớ âm nào?',
      choices: [choice('a', '/ə/'), choice('b', '/ɜː/')],
      correctChoiceId: 'b',
      teachingFeedback: feedback({
        correctLabel: '/ɜː/',
        reason: 'heard, early and learn use /ɜː/ for the target ear spelling. / heard, early và learn dùng /ɜː/ ở cụm ear đang xét.',
        theory: 'Learn this as a word-family clue for this lesson, not as a rule for every word containing ear. / Hãy học đây là dấu hiệu theo nhóm từ của bài, không phải quy luật cho mọi từ có ear.',
        example: 'heard /hɜːd/ · early /ˈɜːli/ · learn /lɜːn/.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q07',
      prompt: 'world, work and word share the same spelling clue. / world, work và word có cùng một dấu hiệu chữ. Which clue do they share? / Chúng có chung dấu hiệu nào?',
      choices: [choice('a', 'wor'), choice('b', 'war'), choice('c', 'wer')],
      correctChoiceId: 'a',
      teachingFeedback: feedback({
        correctLabel: 'wor',
        reason: 'All three words contain wor and use /ɜː/ after /w/ in the target pronunciation. / Cả ba từ đều có wor và dùng /ɜː/ trong cách phát âm đang học.',
        theory: 'In this lesson, wor is a useful clue for /wɜː/. / Trong bài này, wor là dấu hiệu hữu ích cho /wɜː/.',
        example: 'world · work · word.'
      })
    }),
    tf({
      id: 'g7u1-pr-q08',
      statement: 'Every final “-er” is pronounced /ə/. / Mọi “-er” ở cuối từ đều được đọc /ə/.',
      answer: false,
      teachingFeedback: feedback({
        correctLabel: 'FALSE / SAI',
        reason: 'Many weak final -er syllables use /ə/, but not every spelling er follows that pattern. / Nhiều -er cuối không nhấn dùng /ə/, nhưng không phải mọi chữ er đều theo mẫu đó.',
        theory: 'Do not choose a sound from spelling alone. Check stress and the whole pronunciation pattern. / Không chọn âm chỉ dựa vào mặt chữ. Hãy kiểm tra trọng âm và mẫu phát âm của cả từ.',
        example: 'mother /ˈmʌðə/ but expert /ˈekspɜːt/.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q09',
      prompt: 'mother → final “-er” is weak → ? / mother → “-er” cuối từ là âm tiết nhẹ → ? Which sound should you choose? / Em nên chọn âm nào?',
      choices: [choice('a', '/ə/'), choice('b', '/ɜː/')],
      correctChoiceId: 'a',
      teachingFeedback: feedback({
        correctLabel: '/ə/',
        reason: 'The final syllable is unstressed, so it reduces to schwa. / Âm tiết cuối không nhấn nên giảm thành schwa.',
        theory: 'WORD → check stress → weak syllable → think /ə/. / TỪ → kiểm tra trọng âm → âm tiết nhẹ → nghĩ đến /ə/.',
        example: 'mother /ˈmʌðə/.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q10',
      prompt: 'shirt → find the clue → “ir” → ? / shirt → tìm dấu hiệu → “ir” → ? Which sound is correct? / Âm nào đúng?',
      choices: [choice('a', '/ə/'), choice('b', '/ɜː/')],
      correctChoiceId: 'b',
      teachingFeedback: feedback({
        correctLabel: '/ɜː/',
        reason: 'shirt contains the clue ir, which maps to /ɜː/ in this word. / shirt có dấu hiệu ir, được đọc /ɜː/ trong từ này.',
        theory: 'WORD → find a useful spelling clue → recall the pattern → choose the sound. / TỪ → tìm dấu hiệu chữ hữu ích → nhớ mẫu → chọn âm.',
        example: 'shirt · girl · birth · dirty.'
      })
    }),
    mcq({
      id: 'g7u1-pr-q11',
      prompt: 'occasion → the first syllable is weak → ? / occasion → âm tiết đầu được đọc nhẹ → ? Which sound is correct? / Âm nào đúng?',
      choices: [choice('a', '/ə/'), choice('b', '/ɜː/')],
      correctChoiceId: 'a',
      teachingFeedback: feedback({
        correctLabel: '/ə/',
        reason: 'The initial o- is unstressed and is pronounced with schwa in the target British pronunciation. / Phần o- đầu từ không nhấn và được đọc schwa trong cách phát âm Anh-Anh đang học.',
        theory: 'A weak vowel can reduce to /ə/ at the beginning, middle or end of a word. / Nguyên âm nhẹ có thể giảm thành /ə/ ở đầu, giữa hoặc cuối từ.',
        example: 'occasion /əˈkeɪʒən/.'
      })
    }),
    classification({
      id: 'g7u1-pr-q12',
      prompt: 'Put the words into the correct sound group. / Xếp các từ vào đúng nhóm âm.',
      tokens: [token('girl', 'girl', 'long-er'), token('answer', 'answer', 'schwa'), token('birth', 'birth', 'long-er'), token('mother', 'mother', 'schwa'), token('around', 'around', 'schwa')],
      teachingFeedback: feedback({
        correctLabel: '/ə/ vs /ɜː/',
        reason: 'Use weak-syllable clues for /ə/ and the ir clue for /ɜː/. / Dùng dấu hiệu âm tiết nhẹ cho /ə/ và dấu hiệu ir cho /ɜː/.',
        theory: generalTheory,
        example: 'around → weak a- → /ə/; girl → ir → /ɜː/.',
        answerAnalysis: [
          { word: 'girl', sound: '/ɜː/', explanation: 'ir is the useful spelling clue. / ir là dấu hiệu chữ hữu ích.' },
          { word: 'answer', sound: '/ə/', explanation: 'Final -er is unstressed. / -er cuối từ không mang trọng âm.' },
          { word: 'birth', sound: '/ɜː/', explanation: 'ir points to /ɜː/ in this word. / ir gợi /ɜː/ trong từ này.' },
          { word: 'mother', sound: '/ə/', explanation: 'Final -er is a weak syllable. / -er cuối từ là âm tiết nhẹ.' },
          { word: 'around', sound: '/ə/', explanation: 'Initial a- is unstressed. / a- đầu từ không mang trọng âm.' }
        ]
      })
    }),
    classification({
      id: 'g7u1-pr-q13',
      prompt: 'Classify the words by sound. / Phân loại các từ theo âm.',
      tokens: [token('world', 'world', 'long-er'), token('neighbour', 'neighbour', 'schwa'), token('work', 'work', 'long-er'), token('upon', 'upon', 'schwa'), token('heard', 'heard', 'long-er')],
      teachingFeedback: feedback({
        correctLabel: '/ə/ vs /ɜː/',
        reason: 'wor and ear are useful /ɜː/ clues here; weak unstressed syllables support /ə/. / wor và ear là dấu hiệu hữu ích cho /ɜː/ ở đây; âm tiết nhẹ không nhấn gợi /ə/.',
        theory: generalTheory,
        example: 'work → wor → /ɜː/; upon → weak u- → /ə/.',
        answerAnalysis: [
          { word: 'world', sound: '/ɜː/', explanation: 'wor gives /wɜː/ in world. / wor cho /wɜː/ trong world.' },
          { word: 'neighbour', sound: '/ə/', explanation: 'The final syllable is unstressed and contains schwa. / Âm tiết cuối không nhấn và chứa schwa.' },
          { word: 'work', sound: '/ɜː/', explanation: 'wor is the target clue. / wor là dấu hiệu mục tiêu.' },
          { word: 'upon', sound: '/ə/', explanation: 'Initial u- is unstressed. / u- đầu từ không nhấn.' },
          { word: 'heard', sound: '/ɜː/', explanation: 'ear is pronounced /ɜː/ in heard. / ear được đọc /ɜː/ trong heard.' }
        ]
      })
    }),
    classification({
      id: 'g7u1-pr-q14',
      prompt: 'Classify the words. / Phân loại các từ.',
      tokens: [token('parent', 'parent', 'schwa'), token('early', 'early', 'long-er'), token('singer', 'singer', 'schwa'), token('learn', 'learn', 'long-er')],
      teachingFeedback: feedback({
        correctLabel: '/ə/ vs /ɜː/',
        reason: 'Use the weak second/final syllable for /ə/ and ear for /ɜː/. / Dùng âm tiết thứ hai/cuối nhẹ cho /ə/ và ear cho /ɜː/.',
        theory: generalTheory,
        example: 'singer → weak -er → /ə/; learn → ear → /ɜː/.',
        answerAnalysis: [
          { word: 'parent', sound: '/ə/', explanation: 'The second syllable is unstressed. / Âm tiết thứ hai không mang trọng âm.' },
          { word: 'early', sound: '/ɜː/', explanation: 'ear is pronounced /ɜː/ here. / ear được đọc /ɜː/ ở đây.' },
          { word: 'singer', sound: '/ə/', explanation: 'Final -er is unstressed. / -er cuối từ không nhấn.' },
          { word: 'learn', sound: '/ɜː/', explanation: 'ear is pronounced /ɜː/ in learn. / ear được đọc /ɜː/ trong learn.' }
        ]
      })
    }),
    classification({
      id: 'g7u1-pr-q15',
      prompt: 'Put each word in /ə/ or /ɜː/. / Xếp mỗi từ vào /ə/ hoặc /ɜː/.',
      tokens: [token('nature', 'nature', 'schwa'), token('expert', 'expert', 'long-er'), token('collect', 'collect', 'schwa'), token('sunburn', 'sunburn', 'long-er')],
      teachingFeedback: feedback({
        correctLabel: '/ə/ vs /ɜː/',
        reason: 'This round checks whether you use stress plus the whole word, not a blind “er = /ə/” rule. / Vòng này kiểm tra xem em có dùng trọng âm và cả từ, thay vì mẹo máy móc “er = /ə/”.',
        theory: generalTheory,
        example: 'mother /ˈmʌðə/ but expert /ˈekspɜːt/.',
        workedExample: { label: 'TRAP / BẪY', text: 'Wrong / Sai: er → always /ə/. Better / Tốt hơn: check stress and the whole pronunciation pattern. / kiểm tra trọng âm và mẫu phát âm của cả từ.' },
        answerAnalysis: [
          { word: 'nature', sound: '/ə/', explanation: 'The final syllable ends in schwa in British pronunciation. / Âm tiết cuối kết thúc bằng schwa trong cách phát âm Anh-Anh.' },
          { word: 'expert', sound: '/ɜː/', explanation: 'Do not auto-choose /ə/ from er; expert has stressed /ɜː/ in the second syllable. / Không tự chọn /ə/ chỉ vì thấy er; expert có /ɜː/ được nhấn ở âm tiết thứ hai.' },
          { word: 'collect', sound: '/ə/', explanation: 'Initial co- is unstressed and reduces to /kə-/. / co- đầu từ không nhấn và giảm thành /kə-/.' },
          { word: 'sunburn', sound: '/ɜː/', explanation: 'burn contains ur → /ɜː/. / burn có ur → /ɜː/.' }
        ]
      })
    }),
    classification({
      id: 'g7u1-pr-q16',
      prompt: 'Put each word in the correct group. / Xếp mỗi từ vào đúng nhóm.',
      tokens: [token('shirt', 'shirt', 'long-er'), token('monopoly', 'monopoly', 'schwa'), token('hurt', 'hurt', 'long-er'), token('carrot', 'carrot', 'schwa')],
      teachingFeedback: feedback({
        correctLabel: '/ə/ vs /ɜː/',
        reason: 'ir and ur point to /ɜː/ here; weak unstressed vowels point to /ə/. / ir và ur gợi /ɜː/ ở đây; nguyên âm nhẹ không nhấn gợi /ə/.',
        theory: generalTheory,
        example: 'shirt → ir → /ɜː/; carrot → weak final syllable → /ə/.',
        answerAnalysis: [
          { word: 'shirt', sound: '/ɜː/', explanation: 'ir is the target clue. / ir là dấu hiệu mục tiêu.' },
          { word: 'monopoly', sound: '/ə/', explanation: 'The initial syllable is unstressed and contains schwa. / Âm tiết đầu không nhấn và chứa schwa.' },
          { word: 'hurt', sound: '/ɜː/', explanation: 'ur is pronounced /ɜː/. / ur được đọc /ɜː/.' },
          { word: 'carrot', sound: '/ə/', explanation: 'The final unstressed syllable contains schwa. / Âm tiết cuối không nhấn chứa schwa.' }
        ]
      })
    }),
    classification({
      id: 'g7u1-pr-q17',
      prompt: 'Final challenge: classify the words. / Thử thách cuối: phân loại các từ.',
      tokens: [token('doctor', 'doctor', 'schwa'), token('word', 'word', 'long-er'), token('dirty', 'dirty', 'long-er'), token('occasion', 'occasion', 'schwa')],
      teachingFeedback: feedback({
        correctLabel: '/ə/ vs /ɜː/',
        reason: 'Apply the full procedure independently: check weak syllables, then useful spelling clues. / Tự áp dụng đầy đủ quy trình: kiểm tra âm tiết nhẹ, rồi tìm dấu hiệu chữ hữu ích.',
        theory: generalTheory,
        example: 'doctor → weak final syllable → /ə/; word → wor → /ɜː/.',
        answerAnalysis: [
          { word: 'doctor', sound: '/ə/', explanation: 'Final -or is unstressed and contains schwa in British pronunciation. / -or cuối từ không nhấn và chứa schwa trong cách phát âm Anh-Anh.' },
          { word: 'word', sound: '/ɜː/', explanation: 'wor gives /wɜː/. / wor cho /wɜː/.' },
          { word: 'dirty', sound: '/ɜː/', explanation: 'ir is pronounced /ɜː/. / ir được đọc /ɜː/.' },
          { word: 'occasion', sound: '/ə/', explanation: 'The initial o- is unstressed and reduces to schwa. / o- đầu từ không nhấn và giảm thành schwa.' }
        ]
      })
    })
  ])
});
