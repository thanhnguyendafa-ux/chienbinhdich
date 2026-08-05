const CLASSIFICATION_CHOICES = Object.freeze([
  Object.freeze({ id: 'aura', text: 'Aura TO BE' }),
  Object.freeze({ id: 'gan', text: 'Gán TO BE' }),
  Object.freeze({ id: 'action', text: 'Hành động VERB' })
]);

function choices() {
  return CLASSIFICATION_CHOICES.map(choice => ({ ...choice }));
}

function feedback(correctLabel, reason, theory, example) {
  return Object.freeze({ correctLabel, reason, theory, example });
}

export const mrtG6GanAuraAction01Content = Object.freeze({
  items: [
    {
      id: 'mrt-g6-classify-q01',
      type: 'mcq',
      sourceUnit: 'Unit 1 · My New School',
      prompt: 'Cho câu: “Nam là một học sinh.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'gan',
      teachingFeedback: feedback(
        'Gán TO BE',
        '“một học sinh” trả lời câu hỏi Nam LÀ AI / LÀ GÌ. Đây là một danh từ.',
        'LÀ AI / LÀ CÁI GÌ? → GÁN TO BE → S + am/is/are + noun.',
        'Nam is a student.'
      )
    },
    {
      id: 'mrt-g6-classify-q02',
      type: 'true_false',
      sourceUnit: 'Unit 1 · My New School',
      statement: 'Cho câu: “Trường mới của tôi lớn.” Nhận định: Đây là câu Aura TO BE.',
      answer: true,
      teachingFeedback: feedback(
        'Aura TO BE',
        '“lớn” trả lời câu hỏi trường NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.',
        'NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.',
        'My new school is big.'
      )
    },
    {
      id: 'mrt-g6-classify-q03',
      type: 'mcq',
      sourceUnit: 'Unit 1 · My New School',
      prompt: 'Cho câu: “Lan học tiếng Anh ở trường.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'action',
      teachingFeedback: feedback(
        'Hành động VERB',
        '“học tiếng Anh” trả lời câu hỏi Lan LÀM GÌ. “học” là một hành động.',
        'LÀM GÌ? → HÀNH ĐỘNG VERB → S + verb.',
        'Lan studies English at school.'
      )
    },
    {
      id: 'mrt-g6-classify-q04',
      type: 'true_false',
      sourceUnit: 'Unit 1 · My New School',
      statement: 'Cho câu: “Mai là bạn cùng lớp của tôi.” Nhận định: Đây là câu Hành động VERB.',
      answer: false,
      teachingFeedback: feedback(
        'Gán TO BE',
        '“bạn cùng lớp của tôi” trả lời câu hỏi Mai LÀ AI. “classmate” là danh từ chỉ người.',
        'LÀ AI / LÀ CÁI GÌ? → GÁN TO BE → S + am/is/are + noun.',
        'Mai is my classmate.'
      )
    },
    {
      id: 'mrt-g6-classify-q05',
      type: 'mcq',
      sourceUnit: 'Unit 1 · My New School',
      prompt: 'Cho câu: “Phòng học của chúng tôi lớn.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'aura',
      teachingFeedback: feedback(
        'Aura TO BE',
        '“lớn” trả lời câu hỏi phòng học NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.',
        'NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.',
        'Our classroom is big.'
      )
    },
    {
      id: 'mrt-g6-classify-q06',
      type: 'true_false',
      sourceUnit: 'Unit 1 · My New School',
      statement: 'Cho câu: “Nam làm bài tập về nhà sau giờ học.” Nhận định: Đây là câu Hành động VERB.',
      answer: true,
      teachingFeedback: feedback(
        'Hành động VERB',
        '“làm bài tập về nhà” trả lời câu hỏi Nam LÀM GÌ. Đây là một hoạt động.',
        'LÀM GÌ? → HÀNH ĐỘNG VERB → dùng động từ chính, không chen TO BE trước động từ.',
        'Nam does his homework after school.'
      )
    },
    {
      id: 'mrt-g6-classify-q07',
      type: 'mcq',
      sourceUnit: 'Unit 1 · My New School',
      prompt: 'Cho câu: “Học sinh đọc sách trong thư viện.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'action',
      teachingFeedback: feedback(
        'Hành động VERB',
        '“đọc sách” trả lời câu hỏi học sinh LÀM GÌ. “đọc” là động từ hành động.',
        'LÀM GÌ? → HÀNH ĐỘNG VERB → S + verb.',
        'Students read books in the library.'
      )
    },
    {
      id: 'mrt-g6-classify-q08',
      type: 'true_false',
      sourceUnit: 'Unit 2 · My House',
      statement: 'Cho câu: “Nhà của Lan là một ngôi nhà phố.” Nhận định: Đây là câu Aura TO BE.',
      answer: false,
      teachingFeedback: feedback(
        'Gán TO BE',
        '“một ngôi nhà phố” cho biết nhà của Lan LÀ LOẠI NHÀ GÌ. Đây là một nhóm danh từ.',
        'LÀ CÁI GÌ / LOẠI GÌ? → GÁN TO BE → S + am/is/are + noun.',
        "Lan's house is a town house."
      )
    },
    {
      id: 'mrt-g6-classify-q09',
      type: 'mcq',
      sourceUnit: 'Unit 2 · My House',
      prompt: 'Cho câu: “Căn phòng này lạ.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'aura',
      teachingFeedback: feedback(
        'Aura TO BE',
        '“lạ” trả lời câu hỏi căn phòng NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.',
        'NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.',
        'This room is strange.'
      )
    },
    {
      id: 'mrt-g6-classify-q10',
      type: 'true_false',
      sourceUnit: 'Unit 2 · My House',
      statement: 'Cho câu: “Mẹ tôi nấu ăn trong bếp.” Nhận định: Đây là câu Aura TO BE.',
      answer: false,
      teachingFeedback: feedback(
        'Hành động VERB',
        '“nấu ăn trong bếp” trả lời câu hỏi mẹ tôi LÀM GÌ. “nấu ăn” là hành động.',
        'LÀM GÌ? → HÀNH ĐỘNG VERB → S + verb.',
        'My mother cooks in the kitchen.'
      )
    },
    {
      id: 'mrt-g6-classify-q11',
      type: 'mcq',
      sourceUnit: 'Unit 2 · My House',
      prompt: 'Cho câu: “Đây là phòng ngủ của tôi.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'gan',
      teachingFeedback: feedback(
        'Gán TO BE',
        '“phòng ngủ của tôi” trả lời câu hỏi đây LÀ CÁI GÌ. “bedroom” là danh từ.',
        'LÀ CÁI GÌ? → GÁN TO BE → S + am/is/are + noun.',
        'This is my bedroom.'
      )
    },
    {
      id: 'mrt-g6-classify-q12',
      type: 'true_false',
      sourceUnit: 'Unit 2 · My House',
      statement: 'Cho câu: “Phòng của tôi sáng.” Nhận định: Đây là câu Aura TO BE.',
      answer: true,
      teachingFeedback: feedback(
        'Aura TO BE',
        '“sáng” trả lời câu hỏi phòng của tôi NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.',
        'NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.',
        'My room is bright.'
      )
    },
    {
      id: 'mrt-g6-classify-q13',
      type: 'mcq',
      sourceUnit: 'Unit 2 · My House',
      prompt: 'Cho câu: “Chúng tôi chuyển đến một căn hộ mới.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'action',
      teachingFeedback: feedback(
        'Hành động VERB',
        '“chuyển đến” trả lời câu hỏi chúng tôi LÀM GÌ. Đây là một hành động.',
        'LÀM GÌ? → HÀNH ĐỘNG VERB → S + verb.',
        'We move to a new flat.'
      )
    },
    {
      id: 'mrt-g6-classify-q14',
      type: 'true_false',
      sourceUnit: 'Unit 2 · My House',
      statement: 'Cho câu: “Đó là căn hộ của tôi.” Nhận định: Đây là câu Gán TO BE.',
      answer: true,
      teachingFeedback: feedback(
        'Gán TO BE',
        '“căn hộ của tôi” trả lời câu hỏi đó LÀ CÁI GÌ. “flat” là danh từ.',
        'LÀ CÁI GÌ? → GÁN TO BE → S + am/is/are + noun.',
        'That is my flat.'
      )
    },
    {
      id: 'mrt-g6-classify-q15',
      type: 'mcq',
      sourceUnit: 'Unit 3 · My Friends',
      prompt: 'Cho câu: “Lan thân thiện.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'aura',
      teachingFeedback: feedback(
        'Aura TO BE',
        '“thân thiện” trả lời câu hỏi Lan NHƯ THẾ NÀO. “friendly” là tính từ mô tả tính cách.',
        'NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.',
        'Lan is friendly.'
      )
    },
    {
      id: 'mrt-g6-classify-q16',
      type: 'true_false',
      sourceUnit: 'Unit 3 · My Friends',
      statement: 'Cho câu: “Nam là bạn thân của tôi.” Nhận định: Đây là câu Aura TO BE.',
      answer: false,
      teachingFeedback: feedback(
        'Gán TO BE',
        '“bạn thân của tôi” trả lời câu hỏi Nam LÀ AI. “friend” là danh từ, khác với “friendly” là tính từ.',
        'LÀ AI? → GÁN TO BE. friend = noun; friendly = adjective.',
        'Nam is my best friend.'
      )
    },
    {
      id: 'mrt-g6-classify-q17',
      type: 'mcq',
      sourceUnit: 'Unit 3 · My Friends',
      prompt: 'Cho câu: “Phong năng động.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'aura',
      teachingFeedback: feedback(
        'Aura TO BE',
        '“năng động” trả lời câu hỏi Phong NHƯ THẾ NÀO. “active” là tính từ mô tả tính cách.',
        'NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.',
        'Phong is active.'
      )
    },
    {
      id: 'mrt-g6-classify-q18',
      type: 'true_false',
      sourceUnit: 'Unit 3 · My Friends',
      statement: 'Cho câu: “Nam chơi thể thao với bạn bè.” Nhận định: Đây là câu Hành động VERB.',
      answer: true,
      teachingFeedback: feedback(
        'Hành động VERB',
        '“chơi thể thao” trả lời câu hỏi Nam LÀM GÌ. Đây là hành động.',
        'LÀM GÌ? → HÀNH ĐỘNG VERB. Không chen TO BE trước động từ chính.',
        'Nam plays sports with his friends.'
      )
    },
    {
      id: 'mrt-g6-classify-q19',
      type: 'mcq',
      sourceUnit: 'Unit 3 · My Friends',
      prompt: 'Cho câu: “Mi là bạn thân của Lan.” Câu này thuộc loại nào?',
      choices: choices(),
      correctChoiceId: 'gan',
      teachingFeedback: feedback(
        'Gán TO BE',
        '“bạn thân của Lan” trả lời câu hỏi Mi LÀ AI. Đây là một nhóm danh từ.',
        'LÀ AI? → GÁN TO BE → S + am/is/are + noun.',
        "Mi is Lan's best friend."
      )
    },
    {
      id: 'mrt-g6-classify-q20',
      type: 'true_false',
      sourceUnit: 'Unit 3 · My Friends',
      statement: 'Cho câu: “Nam thông minh.” Nhận định: Đây là câu Gán TO BE.',
      answer: false,
      teachingFeedback: feedback(
        'Aura TO BE',
        '“thông minh” trả lời câu hỏi Nam NHƯ THẾ NÀO. “clever” là tính từ mô tả tính cách.',
        'NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.',
        'Nam is clever.'
      )
    }
  ]
});
