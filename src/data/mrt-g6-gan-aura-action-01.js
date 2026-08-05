const LABELS = Object.freeze({
  gan: 'Gán TO BE',
  aura: 'Aura TO BE',
  action: 'Hành động VERB'
});

const THEORY = Object.freeze({
  gan: 'LÀ AI / LÀ CÁI GÌ? → GÁN TO BE → S + am/is/are + noun.',
  aura: 'NHƯ THẾ NÀO? → AURA TO BE → S + am/is/are + adjective.',
  action: 'LÀM GÌ? → HÀNH ĐỘNG VERB → S + verb. Không chen TO BE trước động từ chính.'
});

const UNITS = Object.freeze({
  u1: 'Unit 1 · My New School',
  u2: 'Unit 2 · My House',
  u3: 'Unit 3 · My Friends'
});

const CLASSIFICATION_CHOICES = Object.freeze([
  Object.freeze({ id: 'aura', text: LABELS.aura }),
  Object.freeze({ id: 'gan', text: LABELS.gan }),
  Object.freeze({ id: 'action', text: LABELS.action })
]);

function choices() {
  return CLASSIFICATION_CHOICES.map(choice => ({ ...choice }));
}

function teaching(classId, reason, example, theory = THEORY[classId]) {
  return Object.freeze({ correctLabel: LABELS[classId], reason, theory, example });
}

function itemId(number) {
  return `mrt-g6-classify-q${String(number).padStart(2, '0')}`;
}

function mcq(number, unitKey, sentence, classId, reason, example, theory) {
  return {
    id: itemId(number),
    type: 'mcq',
    sourceUnit: UNITS[unitKey],
    prompt: `Cho câu: “${sentence}” Câu này thuộc loại nào?`,
    choices: choices(),
    correctChoiceId: classId,
    teachingFeedback: teaching(classId, reason, example, theory)
  };
}

function trueFalse(number, unitKey, sentence, claimClassId, answer, correctClassId, reason, example, theory) {
  return {
    id: itemId(number),
    type: 'true_false',
    sourceUnit: UNITS[unitKey],
    statement: `Cho câu: “${sentence}” Nhận định: Đây là câu ${LABELS[claimClassId]}.`,
    answer,
    teachingFeedback: teaching(correctClassId, reason, example, theory)
  };
}

const items = [
  mcq(1, 'u1', 'Nam là một học sinh.', 'gan', '“một học sinh” trả lời câu hỏi Nam LÀ AI / LÀ GÌ. Đây là một danh từ.', 'Nam is a student.'),
  trueFalse(2, 'u1', 'Trường mới của tôi lớn.', 'aura', true, 'aura', '“lớn” trả lời câu hỏi trường NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.', 'My new school is big.'),
  mcq(3, 'u1', 'Lan học tiếng Anh ở trường.', 'action', '“học tiếng Anh” trả lời câu hỏi Lan LÀM GÌ. “học” là một hành động.', 'Lan studies English at school.'),
  trueFalse(4, 'u1', 'Mai là bạn cùng lớp của tôi.', 'action', false, 'gan', '“bạn cùng lớp của tôi” trả lời câu hỏi Mai LÀ AI. “classmate” là danh từ chỉ người.', 'Mai is my classmate.'),
  mcq(5, 'u1', 'Phòng học của chúng tôi lớn.', 'aura', '“lớn” trả lời câu hỏi phòng học NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.', 'Our classroom is big.'),
  trueFalse(6, 'u1', 'Nam làm bài tập về nhà sau giờ học.', 'action', true, 'action', '“làm bài tập về nhà” trả lời câu hỏi Nam LÀM GÌ. Đây là một hoạt động.', 'Nam does his homework after school.'),
  mcq(7, 'u1', 'Học sinh đọc sách trong thư viện.', 'action', '“đọc sách” trả lời câu hỏi học sinh LÀM GÌ. “đọc” là động từ hành động.', 'Students read books in the library.'),
  trueFalse(8, 'u2', 'Nhà của Lan là một ngôi nhà phố.', 'aura', false, 'gan', '“một ngôi nhà phố” cho biết nhà của Lan LÀ LOẠI NHÀ GÌ. Đây là một nhóm danh từ.', "Lan's house is a town house."),
  mcq(9, 'u2', 'Căn phòng này lạ.', 'aura', '“lạ” trả lời câu hỏi căn phòng NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.', 'This room is strange.'),
  trueFalse(10, 'u2', 'Mẹ tôi nấu ăn trong bếp.', 'aura', false, 'action', '“nấu ăn trong bếp” trả lời câu hỏi mẹ tôi LÀM GÌ. “nấu ăn” là hành động.', 'My mother cooks in the kitchen.'),
  mcq(11, 'u2', 'Đây là phòng ngủ của tôi.', 'gan', '“phòng ngủ của tôi” trả lời câu hỏi đây LÀ CÁI GÌ. “bedroom” là danh từ.', 'This is my bedroom.'),
  trueFalse(12, 'u2', 'Phòng của tôi sáng.', 'aura', true, 'aura', '“sáng” trả lời câu hỏi phòng của tôi NHƯ THẾ NÀO. Đây là tính từ mô tả đặc điểm.', 'My room is bright.'),
  mcq(13, 'u2', 'Chúng tôi chuyển đến một căn hộ mới.', 'action', '“chuyển đến” trả lời câu hỏi chúng tôi LÀM GÌ. Đây là một hành động.', 'We move to a new flat.'),
  trueFalse(14, 'u2', 'Đó là căn hộ của tôi.', 'gan', true, 'gan', '“căn hộ của tôi” trả lời câu hỏi đó LÀ CÁI GÌ. “flat” là danh từ.', 'That is my flat.'),
  mcq(15, 'u3', 'Lan thân thiện.', 'aura', '“thân thiện” trả lời câu hỏi Lan NHƯ THẾ NÀO. “friendly” là tính từ mô tả tính cách.', 'Lan is friendly.'),
  trueFalse(16, 'u3', 'Nam là bạn thân của tôi.', 'aura', false, 'gan', '“bạn thân của tôi” trả lời câu hỏi Nam LÀ AI. “friend” là danh từ, khác với “friendly” là tính từ.', 'Nam is my best friend.', 'LÀ AI? → GÁN TO BE. friend = noun; friendly = adjective.'),
  mcq(17, 'u3', 'Phong năng động.', 'aura', '“năng động” trả lời câu hỏi Phong NHƯ THẾ NÀO. “active” là tính từ mô tả tính cách.', 'Phong is active.'),
  trueFalse(18, 'u3', 'Nam chơi thể thao với bạn bè.', 'action', true, 'action', '“chơi thể thao” trả lời câu hỏi Nam LÀM GÌ. Đây là hành động.', 'Nam plays sports with his friends.'),
  mcq(19, 'u3', 'Mi là bạn thân của Lan.', 'gan', '“bạn thân của Lan” trả lời câu hỏi Mi LÀ AI. Đây là một nhóm danh từ.', "Mi is Lan's best friend."),
  trueFalse(20, 'u3', 'Nam thông minh.', 'gan', false, 'aura', '“thông minh” trả lời câu hỏi Nam NHƯ THẾ NÀO. “clever” là tính từ mô tả tính cách.', 'Nam is clever.')
];

export const mrtG6GanAuraAction01Content = Object.freeze({ items: Object.freeze(items) });
