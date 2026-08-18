const source = ({ id, order, targetSentence, targetVi, family, mindset, core, sourceType = 'direct-transcript', sourceTrace = '', sourceNote = '', expectedTimeMinutes, difficulty, feedbackReason }) => Object.freeze({
  id, order, targetSentence, targetVi, family, mindset, core, sourceType, sourceTrace, sourceNote, expectedTimeMinutes, difficulty, feedbackReason
});

export const g7U2WritingSource = Object.freeze([
  source({
    id: 'g7u2-wr-t01', order: 1,
    targetSentence: "Healthy habits help us keep fit and avoid disease.",
    targetVi: "Những thói quen lành mạnh giúp chúng ta giữ khỏe và tránh bệnh tật.",
    family: "Healthy habits & benefits", mindset: "HÀNH ĐỘNG XYZ", core: "HELP + BENEFIT",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~6:02 / ~8:00",
    sourceNote: "",
    expectedTimeMinutes: 13, difficulty: "medium",
    feedbackReason: "`healthy habits` là chủ thể số nhiều; `help us keep fit and avoid disease` diễn tả tác động/lợi ích. Scaffold giữ đúng surface của target: `help us keep fit`, không dùng sai chunk `keep us fit`."
  }),
  source({
    id: 'g7u2-wr-t02', order: 2,
    targetSentence: "Outdoor activities are good for our health.",
    targetVi: "Các hoạt động ngoài trời tốt cho sức khỏe của chúng ta.",
    family: "Healthy habits & benefits", mindset: "GÁN", core: "BE + GOOD FOR",
    sourceType: "direct-transcript", sourceTrace: "Getting Started · ~1:00",
    sourceNote: "",
    expectedTimeMinutes: 10, difficulty: "easy",
    feedbackReason: "Meaning core là GÁN lợi ích cho subject số nhiều `outdoor activities`, vì vậy dùng `are`; `good for our health` là benefit chunk."
  }),
  source({
    id: 'g7u2-wr-t03', order: 3,
    targetSentence: "My family often goes cycling in the countryside.",
    targetVi: "Gia đình tôi thường đi đạp xe ở vùng nông thôn.",
    family: "Healthy habits & benefits", mindset: "HÀNH ĐỘNG XYZ", core: "ROUTINE + FREQUENCY + PLACE",
    sourceType: "direct-transcript", sourceTrace: "Getting Started · ~1:04",
    sourceNote: "",
    expectedTimeMinutes: 12, difficulty: "medium",
    feedbackReason: "`often` đánh dấu thói quen; transcript dùng `my family ... goes`, nên scaffold không tách bare `go` rồi bắt học sinh tự đoán `goes`."
  }),
  source({
    id: 'g7u2-wr-t04', order: 4,
    targetSentence: "Being active helps keep you fit.",
    targetVi: "Việc năng động giúp giữ cho bạn khỏe.",
    family: "Healthy habits & benefits", mindset: "HÀNH ĐỘNG XYZ", core: "BEING ACTIVE + HELPS + RESULT",
    sourceType: "direct-transcript", sourceTrace: "A Closer Look 1 · pronunciation sentence 4 · ~4:22",
    sourceNote: "",
    expectedTimeMinutes: 11, difficulty: "medium",
    feedbackReason: "`Being active` là toàn bộ subject meaning; học sinh không cần học nhãn gerund trước, nhưng phải nhận ra cả cụm đang làm chủ thể của hành động `helps`."
  }),
  source({
    id: 'g7u2-wr-t05', order: 5,
    targetSentence: "You can use eye drops.",
    targetVi: "Bạn có thể dùng thuốc nhỏ mắt.",
    family: "Health advice", mindset: "HÀNH ĐỘNG XYZ", core: "CAN + HEALTH ACTION",
    sourceType: "direct-transcript", sourceTrace: "Communication · Everyday English · ~5:19",
    sourceNote: "",
    expectedTimeMinutes: 9, difficulty: "easy",
    feedbackReason: "`can` ở đây cho một cách xử lý khả dụng đối với vấn đề sức khỏe; target ngắn nên chỉ cần scaffold đủ để không lộ cả câu trước FINAL."
  }),
  source({
    id: 'g7u2-wr-t06', order: 6,
    targetSentence: "You should not read in dim light.",
    targetVi: "Bạn không nên đọc trong ánh sáng mờ.",
    family: "Health advice", mindset: "HÀNH ĐỘNG XYZ", core: "SHOULD NOT + ACTION",
    sourceType: "normalized-transcript", sourceTrace: "Communication · Everyday English · ~5:26",
    sourceNote: "Transcript surface: `You shouldn't read in dim light.` Writing target dùng full form `should not` để typing rõ từng từ; meaning không đổi.",
    expectedTimeMinutes: 11, difficulty: "medium",
    feedbackReason: "Đây là advice negative. Full form `should not` giúp học sinh nhìn rõ modal + NOT + base verb `read` trước khi sau này gặp contraction."
  }),
  source({
    id: 'g7u2-wr-t07', order: 7,
    targetSentence: "Eat more fruits and vegetables.",
    targetVi: "Hãy ăn nhiều trái cây và rau củ hơn.",
    family: "Food & drink", mindset: "HÀNH ĐỘNG XYZ", core: "IMPERATIVE + MORE",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~6:12 / ~8:09",
    sourceNote: "",
    expectedTimeMinutes: 10, difficulty: "easy",
    feedbackReason: "Đây là health advice dạng imperative; không cần subject `you`. `more fruits and vegetables` được học như một chunk trước FINAL."
  }),
  source({
    id: 'g7u2-wr-t08', order: 8,
    targetSentence: "Fruits and vegetables provide a lot of vitamins.",
    targetVi: "Trái cây và rau củ cung cấp nhiều vitamin.",
    family: "Food & drink", mindset: "HÀNH ĐỘNG XYZ", core: "FOOD + PROVIDE + NUTRIENT",
    sourceType: "normalized-transcript", sourceTrace: "Skills 2 · Healthy habits · ~6:12–6:26 / ~8:09–8:22",
    sourceNote: "Transcript: `Eat more fruits and vegetables, especially colored ones like carrots and tomatoes. They provide a lot of vitamins.` Writing target thay pronoun `They` bằng antecedent `Fruits and vegetables` để câu đứng độc lập và có referent rõ.",
    expectedTimeMinutes: 12, difficulty: "medium",
    feedbackReason: "Normalization loại bỏ pronoun mơ hồ trong bài đứng độc lập; `a lot of vitamins` được cue trọn cụm để học sinh không phải tự đoán determiner/số nhiều."
  }),
  source({
    id: 'g7u2-wr-t09', order: 9,
    targetSentence: "Eat meat, eggs and cheese, but not too much.",
    targetVi: "Hãy ăn thịt, trứng và phô mai, nhưng không quá nhiều.",
    family: "Food & drink", mindset: "HÀNH ĐỘNG XYZ", core: "IMPERATIVE + BUT LIMIT",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~6:26–6:33 / ~8:22–8:27",
    sourceNote: "",
    expectedTimeMinutes: 13, difficulty: "medium",
    feedbackReason: "Câu không cấm thực phẩm; nó đưa advice có giới hạn bằng `but not too much`. Dấu phẩy và `but` là một phần của surface target FINAL."
  }),
  source({
    id: 'g7u2-wr-t10', order: 10,
    targetSentence: "You may put on weight.",
    targetVi: "Bạn có khả năng tăng cân.",
    family: "Food & drink", mindset: "HÀNH ĐỘNG XYZ", core: "MAY + CONSEQUENCE",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~6:33–6:37 / ~8:31–8:34",
    sourceNote: "",
    expectedTimeMinutes: 9, difficulty: "easy",
    feedbackReason: "Cue dùng `có khả năng` để khóa surface `may`, tránh trùng cue `có thể` của Lesson 05 đang map sang `can`."
  }),
  source({
    id: 'g7u2-wr-t11', order: 11,
    targetSentence: "Drink enough water, but not soft drinks.",
    targetVi: "Hãy uống đủ nước; còn nước ngọt thì không.",
    family: "Food & drink", mindset: "HÀNH ĐỘNG XYZ", core: "IMPERATIVE + ELLIPTICAL CONTRAST",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~6:37–6:43 / ~8:34–8:40",
    sourceNote: "",
    expectedTimeMinutes: 11, difficulty: "medium",
    feedbackReason: "English dùng ellipsis `but not soft drinks`; cue Việt `còn nước ngọt thì không` cố ý phản ánh sự lược bỏ này, tránh làm học sinh mong đợi `do not drink` trong answer."
  }),
  source({
    id: 'g7u2-wr-t12', order: 12,
    targetSentence: "Be active and exercise every day.",
    targetVi: "Hãy năng động và tập thể dục mỗi ngày.",
    family: "Exercise & outdoor activities", mindset: "HÀNH ĐỘNG XYZ", core: "IMPERATIVE + AND",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~6:43–6:49 / ~8:40–8:46",
    sourceNote: "",
    expectedTimeMinutes: 11, difficulty: "medium",
    feedbackReason: "Hai action cores `be active` và `exercise every day` được nối bằng `and`; cue `mỗi ngày` được khóa riêng cho surface `every day`."
  }),
  source({
    id: 'g7u2-wr-t13', order: 13,
    targetSentence: "Do outdoor activities like cycling, swimming or playing sports.",
    targetVi: "Hãy thực hiện các hoạt động ngoài trời như đạp xe, bơi hoặc chơi thể thao.",
    family: "Exercise & outdoor activities", mindset: "HÀNH ĐỘNG XYZ", core: "IMPERATIVE + EXAMPLES",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~6:49–6:58 / ~8:46–8:55",
    sourceNote: "",
    expectedTimeMinutes: 15, difficulty: "medium",
    feedbackReason: "Bài này mở rộng một main idea bằng examples. Ba forms `cycling / swimming / playing sports` phải được học đúng surface trước khi ghép vào list."
  }),
  source({
    id: 'g7u2-wr-t14', order: 14,
    targetSentence: "Go to bed early and get about eight hours of sleep daily, so you will not feel tired.",
    targetVi: "Hãy đi ngủ sớm và ngủ khoảng tám tiếng hằng ngày, vì vậy bạn sẽ không cảm thấy mệt.",
    family: "Sleep & consequences", mindset: "MIXED", core: "ADVICE ACTION + SO + FUTURE STATE",
    sourceType: "normalized-transcript", sourceTrace: "Skills 2 · Healthy habits · ~7:02–7:11 / ~9:00–9:08",
    sourceNote: "Transcript surface: `Go to bed early and get about 8 hours of sleep daily so you will not feel tired.` Writing target viết `eight` bằng chữ và thêm comma trước `so` để typing/đọc cấu trúc rõ; meaning không đổi.",
    expectedTimeMinutes: 17, difficulty: "hard",
    feedbackReason: "Đây là bài sentence expansion dài nhất: advice actions → `so` → result. Cue `hằng ngày` được khóa cho `daily`, khác Lesson 12 `mỗi ngày → every day`."
  }),
  source({
    id: 'g7u2-wr-t15', order: 15,
    targetSentence: "Keep your room tidy and clean.",
    targetVi: "Hãy giữ phòng của bạn gọn gàng và sạch sẽ.",
    family: "Healthy environment", mindset: "HÀNH ĐỘNG XYZ", core: "KEEP + OBJECT + STATE",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~7:11–7:16 / ~9:08–9:13",
    sourceNote: "",
    expectedTimeMinutes: 11, difficulty: "medium",
    feedbackReason: "`keep` là action core; `your room` là object và `tidy and clean` là trạng thái cần duy trì. Không cần dạy công thức trước khi học sinh hiểu meaning."
  }),
  source({
    id: 'g7u2-wr-t16', order: 16,
    targetSentence: "Open windows to let in fresh air and sunshine on fine days.",
    targetVi: "Hãy mở cửa sổ để cho không khí trong lành và ánh nắng vào những ngày đẹp trời.",
    family: "Healthy environment", mindset: "HÀNH ĐỘNG XYZ", core: "ACTION + PURPOSE + TIME",
    sourceType: "direct-transcript", sourceTrace: "Skills 2 · Healthy habits · ~7:16–7:24 / ~9:13–9:17",
    sourceNote: "",
    expectedTimeMinutes: 15, difficulty: "hard",
    feedbackReason: "Main action là `open windows`; `to let in...` là purpose chunk; `on fine days` là time condition. Đây là lesson kết thúc vì có ba tầng meaning trong một câu."
  })
]);

export const g7U2WritingSourceById = Object.freeze(Object.fromEntries(g7U2WritingSource.map(record => [record.id, record])));
