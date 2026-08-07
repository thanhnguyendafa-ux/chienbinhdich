const THEORY = 'Dịch theo từng cụm nghĩa: chủ ngữ → ý chính/hành động → đối tượng → thời gian hoặc mức độ. Không chọn một câu chỉ vì ngữ pháp đúng hay có nhiều từ giống câu tiếng Việt.';

function itemId(number) {
  return `g7-u1-translation-q${String(number).padStart(2, '0')}`;
}

function choices(entries) {
  return entries.map(([id, text]) => ({ id, text }));
}

function mcq(number, vi, correctEnglish, choiceEntries, reason, example) {
  return {
    id: itemId(number),
    type: 'mcq',
    skill: 'translation-discrimination',
    vi,
    prompt: `Cho câu: “${vi}” Chọn bản dịch tiếng Anh chính xác nhất.`,
    choices: choices(choiceEntries),
    correctChoiceId: 'target-translation',
    teachingFeedback: {
      correctLabel: correctEnglish,
      reason,
      theory: THEORY,
      example
    }
  };
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

const items = [
  mcq(1,
    'Bạn có thích sưu tầm gấu bông không?',
    'Do you enjoy collecting teddy bears?',
    [
      ['target-translation', 'Do you enjoy collecting teddy bears?'],
      ['wrong-object', 'Do you enjoy collecting stamps?'],
      ['wrong-subject', 'Does your sister enjoy collecting teddy bears?'],
      ['wrong-activity', 'Do you enjoy making teddy bears?']
    ],
    'Phải giữ đủ ba cụm: you = bạn, collecting = sưu tầm, teddy bears = gấu bông. Ba câu nhiễu lần lượt đổi đồ vật, chủ ngữ hoặc hoạt động.',
    'collect teddy bears = sưu tầm gấu bông; make teddy bears = làm gấu bông.'
  ),
  mcq(2,
    'Có, tôi làm việc đó mỗi ngày.',
    'Yes, I do it every day.',
    [
      ['target-translation', 'Yes, I do it every day.'],
      ['wrong-time-evening', 'Yes, I do it every evening.'],
      ['wrong-subject-brother', 'Yes, my brother does it every day.'],
      ['wrong-frequency-week', 'Yes, I do it every week.']
    ],
    '“Tôi” phải là I và “mỗi ngày” phải là every day. Đừng đổi thành every evening, every week hoặc đổi người thực hiện.',
    'every day = mỗi ngày; every evening = mỗi buổi tối; every week = mỗi tuần.'
  ),
  mcq(3,
    'Có, tôi rất thích.',
    'Yes, very much.',
    [
      ['target-translation', 'Yes, very much.'],
      ['wrong-frequency', 'Yes, every day.'],
      ['wrong-time', 'Yes, in my free time.'],
      ['wrong-companion', 'Yes, with my brother.']
    ],
    '“Rất” diễn tả mức độ, nên very much phù hợp. Every day là tần suất; in my free time là thời gian; with my brother là người cùng làm.',
    'very much = rất nhiều/rất thích; every day = mỗi ngày.'
  ),
  mcq(4,
    'Bạn thích làm gì vào thời gian rảnh?',
    'What do you like doing in your free time?',
    [
      ['target-translation', 'What do you like doing in your free time?'],
      ['wrong-subject-brother', 'What does your brother like doing in his free time?'],
      ['wrong-time-after-school', 'What do you like doing after school?'],
      ['wrong-time-weekend', 'What do you like doing at the weekend?']
    ],
    'Phải giữ đúng chủ ngữ you và cụm thời gian in your free time. Các câu nhiễu đều tự nhiên nhưng đổi người hoặc đổi thời điểm.',
    'in your free time = vào thời gian rảnh; after school = sau giờ học.'
  ),
  mcq(5,
    'Tôi thường ăn trưa lúc 12 giờ.',
    'I usually have lunch at 12.',
    [
      ['target-translation', 'I usually have lunch at 12.'],
      ['wrong-frequency', 'I always have lunch at 12.'],
      ['wrong-meal', 'I usually have breakfast at 12.'],
      ['wrong-time', 'I usually have lunch at 1.']
    ],
    '“Thường” = usually, “ăn trưa” = have lunch, “lúc 12 giờ” = at 12. Mỗi câu nhiễu chỉ đổi một cụm nên phải đọc hết câu.',
    'usually ≠ always; lunch ≠ breakfast; 12 ≠ 1.'
  ),
  mcq(6,
    'Tôi thích làm nhà búp bê.',
    'I like building dollhouses.',
    [
      ['target-translation', 'I like building dollhouses.'],
      ['wrong-object-models', 'I like making models.'],
      ['wrong-subject-sister', 'My sister likes building dollhouses.'],
      ['wrong-activity-collect', 'I like collecting dollhouses.']
    ],
    'Phải giữ I = tôi và building dollhouses = làm nhà búp bê. Making models và collecting dollhouses là hai hoạt động khác.',
    'build dollhouses = làm nhà búp bê; make models = làm mô hình; collect = sưu tầm.'
  ),
  mcq(7,
    'Bạn có thích làm mô hình không?',
    'Do you like making models?',
    [
      ['target-translation', 'Do you like making models?'],
      ['wrong-subject-brother', 'Does your brother like making models?'],
      ['wrong-activity-collect', 'Do you like collecting models?'],
      ['wrong-object-flowers', 'Do you like making paper flowers?']
    ],
    'Câu Việt hỏi “bạn” và hoạt động “làm mô hình”. Không được đổi chủ ngữ, đổi making thành collecting hoặc đổi models thành paper flowers.',
    'make models = làm mô hình; collect models = sưu tầm mô hình.'
  ),
  mcq(8,
    'Không, tôi không thích. Nhưng anh/em trai tôi rất thích việc đó.',
    'No, I don’t. But my brother loves it.',
    [
      ['target-translation', 'No, I don’t. But my brother loves it.'],
      ['wrong-relative-sister', 'No, I don’t. But my sister loves it.'],
      ['wrong-who-likes', 'No, my brother doesn’t. But I love it.'],
      ['wrong-action', 'No, I don’t. But my brother makes it every day.']
    ],
    'Hai vế phải đúng quan hệ: tôi không thích, nhưng anh/em trai tôi rất thích. Các câu nhiễu đổi brother thành sister, đảo người thích hoặc đổi loves thành makes.',
    'my brother = anh/em trai tôi; loves it = rất thích việc đó.'
  ),
  mcq(9,
    'Không, tôi làm hoa giấy mỗi ngày.',
    'No, I make paper flowers every day.',
    [
      ['target-translation', 'No, I make paper flowers every day.'],
      ['wrong-time-evening', 'No, I make paper flowers every evening.'],
      ['wrong-object-models', 'No, I make paper models every day.'],
      ['wrong-subject-sister', 'No, my sister makes paper flowers every day.']
    ],
    'Phải giữ I = tôi, paper flowers = hoa giấy và every day = mỗi ngày. Chỉ một cụm bị đổi cũng làm bản dịch sai.',
    'paper flowers = hoa giấy; paper models = mô hình giấy.'
  ),
  mcq(10,
    'Anh/em trai của bạn thích làm gì?',
    'What does your brother like doing?',
    [
      ['target-translation', 'What does your brother like doing?'],
      ['wrong-relative-sister', 'What does your sister like doing?'],
      ['wrong-question-daily', 'What does your brother do every day?'],
      ['wrong-subject-you', 'What do you like doing with your brother?']
    ],
    'Câu hỏi nhắm vào sở thích của your brother. Các câu nhiễu hỏi về chị/em gái, thói quen mỗi ngày hoặc sở thích của chính bạn.',
    'What does your brother like doing? = Anh/em trai của bạn thích làm gì?'
  ),
  mcq(11,
    'Anh/em ấy rất thích tập yoga.',
    'He enjoys doing yoga a lot.',
    [
      ['target-translation', 'He enjoys doing yoga a lot.'],
      ['wrong-activity-judo', 'He enjoys doing judo a lot.'],
      ['wrong-degree-time', 'He enjoys doing yoga every morning.'],
      ['wrong-pronoun-she', 'She enjoys doing yoga a lot.']
    ],
    'Từ ngữ cần khóa là He, doing yoga và a lot. Judo đổi hoạt động, every morning đổi mức độ thành thời gian, She đổi người.',
    'a lot = rất nhiều/rất thích; every morning = mỗi sáng.'
  ),
  mcq(12,
    'Anh/em ấy đi học lúc 7 giờ sáng.',
    'He goes to school at 7 a.m.',
    [
      ['target-translation', 'He goes to school at 7 a.m.'],
      ['wrong-place-home', 'He goes home at 7 a.m.'],
      ['wrong-am-pm', 'He goes to school at 7 p.m.'],
      ['wrong-time-eight', 'He goes to school at 8 a.m.']
    ],
    '“Đi học” = goes to school và “7 giờ sáng” = 7 a.m. Hãy đối chiếu cả địa điểm lẫn mốc giờ.',
    'go to school = đi học; go home = về nhà; a.m. = buổi sáng; p.m. = buổi chiều/tối.'
  ),
  mcq(13,
    'Chị/em gái của bạn có nấu ăn cùng bạn không?',
    'Does your sister cook with you?',
    [
      ['target-translation', 'Does your sister cook with you?'],
      ['wrong-preposition-for', 'Does your sister cook for you?'],
      ['wrong-relative-brother', 'Does your brother cook with you?'],
      ['wrong-action-eat', 'Does your sister eat with you?']
    ],
    'Đây là bẫy cụm nghĩa: cook with you = nấu cùng bạn, còn cook for you = nấu cho bạn. Brother và eat cũng làm đổi nghĩa.',
    'with you = cùng bạn; for you = cho bạn.'
  ),
  mcq(14,
    'Có, chị/em ấy thích hát.',
    'Yes, she loves singing.',
    [
      ['target-translation', 'Yes, she loves singing.'],
      ['wrong-activity-cooking', 'Yes, she loves cooking.'],
      ['wrong-pronoun-he', 'Yes, he loves singing.'],
      ['wrong-frequency', 'Yes, she sings every evening.']
    ],
    'Câu đích nói về she và sở thích singing. Câu nhiễu đổi hoạt động, đổi đại từ hoặc đổi “thích hát” thành một thói quen “hát mỗi tối”.',
    'loves singing = thích hát; sings every evening = hát mỗi buổi tối.'
  ),
  mcq(15,
    'Có, chị/em ấy và tôi nấu ăn cùng nhau vào buổi tối.',
    'Yes, she and I cook together in the evening.',
    [
      ['target-translation', 'Yes, she and I cook together in the evening.'],
      ['wrong-action-eat', 'Yes, she and I eat together in the evening.'],
      ['wrong-time-morning', 'Yes, she and I cook together in the morning.'],
      ['wrong-relationship-for', 'Yes, she cooks for me in the evening.']
    ],
    'Phải giữ đủ she and I, cook together và in the evening. Câu cuối đặc biệt dễ nhầm: cook for me là nấu cho tôi, không phải nấu cùng nhau.',
    'cook together = nấu cùng nhau; cook for me = nấu cho tôi; evening ≠ morning.'
  )
];

export const g7U1Translation01Content = deepFreeze({ items });
