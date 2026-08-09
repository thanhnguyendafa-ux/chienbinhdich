const distractor = (token, code, hint) => Object.freeze({ token, code, hint });
const rule = (code, hint, all, none = []) => Object.freeze({
  code,
  hint,
  all: Object.freeze(all),
  none: Object.freeze(none)
});
const feedback = (correctLabel, reason, theory, example) => Object.freeze({
  correctLabel,
  reason,
  theory,
  example
});
const item = ({
  id,
  prompt,
  tokens,
  correctOrder,
  acceptedOrders = [correctOrder],
  distractors,
  rules = [],
  teachingFeedback
}) => Object.freeze({
  id,
  type: 'sentence_order',
  prompt,
  tokens: Object.freeze(tokens),
  correctOrder: Object.freeze(correctOrder),
  acceptedOrders: Object.freeze(acceptedOrders.map(order => Object.freeze(order))),
  orderDiagnostics: Object.freeze({
    distractors: Object.freeze(distractors),
    rules: Object.freeze(rules)
  }),
  teachingFeedback
});

export const global5Unit1Writing01Content = Object.freeze({
  items: Object.freeze([
    item({
      id: 'g5u1-writing-q01',
      prompt: 'Hỏi người khác giới thiệu về bản thân.',
      tokens: ['Can you', 'tell me', 'about yourself?', 'Can I', 'telling'],
      correctOrder: ['Can you', 'tell me', 'about yourself?'],
      distractors: [
        distractor('Can I', 'wrong_subject', 'Câu này hỏi người đối diện, nên chủ thể của câu hỏi phải là “you”.'),
        distractor('telling', 'wrong_verb_form', 'Sau “Can you” dùng động từ nguyên mẫu “tell”, không dùng “telling”.')
      ],
      teachingFeedback: feedback(
        'Can you tell me about yourself?',
        'Câu hỏi dùng “Can you + động từ nguyên mẫu”. Vì vậy ta dùng “Can you tell me ...?”.',
        'Can you + V + ...? dùng để hỏi hoặc đề nghị người đối diện làm một việc.',
        'Can you help me?'
      )
    }),
    item({
      id: 'g5u1-writing-q02',
      prompt: 'Nói rằng em sống ở vùng nông thôn.',
      tokens: ['I', 'live', 'in', 'the countryside.', 'lives', 'on'],
      correctOrder: ['I', 'live', 'in', 'the countryside.'],
      distractors: [
        distractor('lives', 'subject_verb_agreement', 'Với chủ ngữ “I”, dùng “live”, không thêm -s.'),
        distractor('on', 'wrong_preposition', 'Khi nói sống ở một nơi, mẫu câu của Unit 1 là “live in + place”.')
      ],
      teachingFeedback: feedback(
        'I live in the countryside.',
        'Thứ tự đúng là chủ ngữ “I” + động từ “live” + “in” + nơi chốn.',
        'I live in + place.',
        'I live in the city.'
      )
    }),
    item({
      id: 'g5u1-writing-q03',
      prompt: 'Hỏi về màu sắc yêu thích.',
      tokens: ["What's", 'What', 'is', 'your', 'favourite colour?', 'are', 'you'],
      correctOrder: ["What's", 'your', 'favourite colour?'],
      acceptedOrders: [
        ["What's", 'your', 'favourite colour?'],
        ['What', 'is', 'your', 'favourite colour?']
      ],
      distractors: [
        distractor('are', 'wrong_auxiliary', 'Cấu trúc này dùng “What is ...?”, không dùng “What are ...?”.'),
        distractor('you', 'wrong_possessive', 'Trước “favourite colour” cần “your” để nói “màu sắc yêu thích của bạn”.')
      ],
      rules: [
        rule('double_auxiliary', '“What\'s” đã bằng “What is”, nên không dùng thêm “is” sau “What\'s”.', ["What's", 'is']),
        rule('missing_auxiliary', 'Nếu con chọn “What”, câu hỏi này cần “is” ngay sau “What”.', ['What'], ['is', 'are', "What's"])
      ],
      teachingFeedback: feedback(
        "What's your favourite colour?",
        '“What\'s” là dạng viết tắt của “What is”. Vì vậy “What\'s your favourite colour?” và “What is your favourite colour?” đều đúng.',
        'What\'s = What is. Mẫu hỏi: What\'s/What is + your + favourite + noun?',
        "What's your favourite sport?"
      )
    }),
    item({
      id: 'g5u1-writing-q04',
      prompt: 'Nói rằng em thích chơi bóng bàn.',
      tokens: ['I', 'love', 'playing', 'table tennis.', 'loves', 'is'],
      correctOrder: ['I', 'love', 'playing', 'table tennis.'],
      distractors: [
        distractor('loves', 'subject_verb_agreement', 'Với chủ ngữ “I”, dùng “love”, không dùng “loves”.'),
        distractor('is', 'wrong_auxiliary', 'Câu này dùng động từ “love”, nên không thêm “is” trước hoạt động.')
      ],
      teachingFeedback: feedback(
        'I love playing table tennis.',
        'Sau “love”, hoạt động được dùng ở dạng V-ing: “playing table tennis”.',
        'I like/love + V-ing + ...',
        'I like playing basketball.'
      )
    }),
    item({
      id: 'g5u1-writing-q05',
      prompt: 'Nói rằng em học lớp 5A.',
      tokens: ["I'm", 'I', 'am', 'in', 'Class 5A.', 'is', 'are'],
      correctOrder: ["I'm", 'in', 'Class 5A.'],
      acceptedOrders: [
        ["I'm", 'in', 'Class 5A.'],
        ['I', 'am', 'in', 'Class 5A.']
      ],
      distractors: [
        distractor('is', 'wrong_auxiliary', 'Với chủ ngữ “I”, động từ to be phải là “am”, không phải “is”.'),
        distractor('are', 'wrong_auxiliary', 'Với chủ ngữ “I”, động từ to be phải là “am”, không phải “are”.')
      ],
      rules: [
        rule('double_auxiliary', '“I\'m” đã bằng “I am”, nên không dùng thêm “am” sau “I\'m”.', ["I'm", 'am']),
        rule('missing_auxiliary', 'Nếu con chọn “I”, câu này cần “am” để tạo “I am ...”.', ['I'], ['am', 'is', 'are', "I'm"])
      ],
      teachingFeedback: feedback(
        "I'm in Class 5A.",
        '“I\'m” là dạng viết tắt của “I am”. Cả “I\'m in Class 5A.” và “I am in Class 5A.” đều đúng.',
        'I\'m = I am. Mẫu: I am/I\'m in + class.',
        "I'm in Class 5B."
      )
    }),
    item({
      id: 'g5u1-writing-q06',
      prompt: 'Nói rằng em sống ở thành phố.',
      tokens: ['I', 'live', 'in', 'the city.', 'lives', 'on'],
      correctOrder: ['I', 'live', 'in', 'the city.'],
      distractors: [
        distractor('lives', 'subject_verb_agreement', 'Với “I”, dùng “live”, không thêm -s.'),
        distractor('on', 'wrong_preposition', 'Khi nói sống ở một nơi, dùng “live in + place”.')
      ],
      teachingFeedback: feedback(
        'I live in the city.',
        'Câu dùng “I + live + in + place”.',
        'I live in + place.',
        'I live in a small village.'
      )
    }),
    item({
      id: 'g5u1-writing-q07',
      prompt: 'Hỏi về môn thể thao yêu thích.',
      tokens: ["What's", 'What', 'is', 'your', 'favourite sport?', 'are', 'you'],
      correctOrder: ["What's", 'your', 'favourite sport?'],
      acceptedOrders: [
        ["What's", 'your', 'favourite sport?'],
        ['What', 'is', 'your', 'favourite sport?']
      ],
      distractors: [
        distractor('are', 'wrong_auxiliary', 'Câu hỏi favourite này dùng “What is ...?”, không dùng “What are ...?”.'),
        distractor('you', 'wrong_possessive', 'Trước “favourite sport” cần “your”, không dùng “you”.')
      ],
      rules: [
        rule('double_auxiliary', '“What\'s” đã có “is”, nên không thêm “is” lần nữa.', ["What's", 'is']),
        rule('missing_auxiliary', 'Nếu dùng “What”, con cần thêm “is” ngay sau đó.', ['What'], ['is', 'are', "What's"])
      ],
      teachingFeedback: feedback(
        "What's your favourite sport?",
        'Có thể dùng “What\'s” hoặc viết đầy đủ “What is”.',
        'What\'s/What is + your + favourite + noun?',
        "What's your favourite food?"
      )
    }),
    item({
      id: 'g5u1-writing-q08',
      prompt: 'Nói rằng môn thể thao yêu thích của em là bóng đá.',
      tokens: ['My', 'favourite sport', 'is', 'football.', 'are', 'likes'],
      correctOrder: ['My', 'favourite sport', 'is', 'football.'],
      distractors: [
        distractor('are', 'wrong_auxiliary', '“My favourite sport” là số ít, nên dùng “is”, không dùng “are”.'),
        distractor('likes', 'wrong_word_choice', 'Mẫu câu đang nói “môn yêu thích là ...”, nên cần “is”, không dùng “likes”.')
      ],
      teachingFeedback: feedback(
        'My favourite sport is football.',
        'Cụm chủ ngữ là “My favourite sport”, sau đó dùng “is” và tên môn thể thao.',
        'My favourite + noun + is + ...',
        'My favourite colour is green.'
      )
    }),
    item({
      id: 'g5u1-writing-q09',
      prompt: 'Hỏi về món ăn yêu thích.',
      tokens: ["What's", 'What', 'is', 'your', 'favourite food?', 'are', 'you'],
      correctOrder: ["What's", 'your', 'favourite food?'],
      acceptedOrders: [
        ["What's", 'your', 'favourite food?'],
        ['What', 'is', 'your', 'favourite food?']
      ],
      distractors: [
        distractor('are', 'wrong_auxiliary', 'Câu hỏi này dùng “What is ...?”, không dùng “What are ...?”.'),
        distractor('you', 'wrong_possessive', 'Trước “favourite food” cần “your”.')
      ],
      rules: [
        rule('double_auxiliary', '“What\'s” = “What is”, vì vậy không dùng thêm “is”.', ["What's", 'is']),
        rule('missing_auxiliary', 'Nếu dùng “What”, con cần “is” ngay sau “What”.', ['What'], ['is', 'are', "What's"])
      ],
      teachingFeedback: feedback(
        "What's your favourite food?",
        '“What\'s” và “What is” là hai cách viết đúng của cùng cấu trúc.',
        'What\'s/What is + your + favourite + noun?',
        'What is your favourite animal?'
      )
    }),
    item({
      id: 'g5u1-writing-q10',
      prompt: 'Nói rằng món ăn yêu thích của em là một chiếc bánh sandwich.',
      tokens: ['My', 'favourite food', 'is', 'a sandwich.', 'are', 'likes'],
      correctOrder: ['My', 'favourite food', 'is', 'a sandwich.'],
      distractors: [
        distractor('are', 'wrong_auxiliary', '“My favourite food” được dùng như chủ ngữ số ít, nên dùng “is”.'),
        distractor('likes', 'wrong_word_choice', 'Mẫu câu cần “is” để nối “favourite food” với món ăn.')
      ],
      teachingFeedback: feedback(
        'My favourite food is a sandwich.',
        'Câu theo mẫu “My favourite food is + food”.',
        'My favourite + noun + is + ...',
        'My favourite sport is football.'
      )
    }),
    item({
      id: 'g5u1-writing-q11',
      prompt: 'Hỏi về con vật yêu thích.',
      tokens: ["What's", 'What', 'is', 'your', 'favourite animal?', 'are', 'you'],
      correctOrder: ["What's", 'your', 'favourite animal?'],
      acceptedOrders: [
        ["What's", 'your', 'favourite animal?'],
        ['What', 'is', 'your', 'favourite animal?']
      ],
      distractors: [
        distractor('are', 'wrong_auxiliary', 'Câu này dùng “What is ...?”, không dùng “What are ...?”.'),
        distractor('you', 'wrong_possessive', 'Cần “your favourite animal”, không dùng “you favourite animal”.')
      ],
      rules: [
        rule('double_auxiliary', '“What\'s” đã chứa “is”, nên không thêm “is”.', ["What's", 'is']),
        rule('missing_auxiliary', 'Nếu chọn “What”, con cần “is” để tạo “What is ...?”.', ['What'], ['is', 'are', "What's"])
      ],
      teachingFeedback: feedback(
        "What's your favourite animal?",
        'Có thể dùng dạng viết tắt “What\'s” hoặc dạng đầy đủ “What is”.',
        'What\'s/What is + your + favourite + noun?',
        "What's your favourite colour?"
      )
    }),
    item({
      id: 'g5u1-writing-q12',
      prompt: 'Nói rằng con vật yêu thích của em là cá heo.',
      tokens: ['My', 'favourite animal', 'is', 'a dolphin.', 'are', 'likes'],
      correctOrder: ['My', 'favourite animal', 'is', 'a dolphin.'],
      distractors: [
        distractor('are', 'wrong_auxiliary', '“My favourite animal” là số ít, nên dùng “is”.'),
        distractor('likes', 'wrong_word_choice', 'Câu này theo mẫu “My favourite animal is ...”, không dùng “likes”.')
      ],
      teachingFeedback: feedback(
        'My favourite animal is a dolphin.',
        'Câu dùng “My favourite animal” + “is” + tên con vật.',
        'My favourite + noun + is + ...',
        'My favourite food is a sandwich.'
      )
    }),
    item({
      id: 'g5u1-writing-q13',
      prompt: 'Nói rằng em thích chơi bóng rổ.',
      tokens: ['I', 'like', 'playing basketball.', 'likes', 'is'],
      correctOrder: ['I', 'like', 'playing basketball.'],
      distractors: [
        distractor('likes', 'subject_verb_agreement', 'Với chủ ngữ “I”, dùng “like”, không dùng “likes”.'),
        distractor('is', 'wrong_auxiliary', 'Câu có động từ “like”, nên không thêm “is”.')
      ],
      teachingFeedback: feedback(
        'I like playing basketball.',
        'Sau “like”, hoạt động được dùng ở dạng V-ing.',
        'I like + V-ing + ...',
        'I like playing table tennis.'
      )
    }),
    item({
      id: 'g5u1-writing-q14',
      prompt: 'Nói rằng màu sắc yêu thích của em là màu xanh lá.',
      tokens: ['My', 'favourite colour', 'is', 'green.', 'are', 'likes'],
      correctOrder: ['My', 'favourite colour', 'is', 'green.'],
      distractors: [
        distractor('are', 'wrong_auxiliary', '“My favourite colour” là số ít, nên dùng “is”.'),
        distractor('likes', 'wrong_word_choice', 'Mẫu câu cần “is” để nối “favourite colour” với màu sắc.')
      ],
      teachingFeedback: feedback(
        'My favourite colour is green.',
        'Câu theo mẫu “My favourite colour is + colour”.',
        'My favourite + noun + is + ...',
        'My favourite animal is a dolphin.'
      )
    })
  ])
});
