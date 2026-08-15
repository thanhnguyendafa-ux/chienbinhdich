const freeze = value => Object.freeze(value);
const theorySupport = access => freeze({ access });
const teaching = ({ correctLabel, reason, theory, example }) => freeze({ correctLabel, reason, theory, example });
const choice = (id, text, feedback) => freeze({ id, text, feedback });

const wordTypingUi = freeze({
  promptLabel: 'Thầy hỏi · TỪ ĐƠN',
  contextLabel: 'Tiếng Việt + từ loại',
  instruction: 'Con gõ chính xác 1 từ tiếng Anh theo đúng dạng Thầy yêu cầu.',
  inputLabel: 'Từ tiếng Anh của con',
  placeholder: 'Type 1 English word...'
});

const chunkTypingUi = freeze({
  promptLabel: 'Thầy hỏi · CỤM TỪ',
  contextLabel: 'Tiếng Việt + số từ',
  instruction: 'Con gõ đúng cả cụm theo đúng số từ Thầy đã cho.',
  inputLabel: 'Cụm tiếng Anh của con',
  placeholder: 'Type the English chunk...'
});

const typing = ({ id, stage, vi, en, reason, theory, example }) => freeze({
  id,
  type: 'typing',
  stage,
  vi,
  en,
  typingUi: stage === 'word' ? wordTypingUi : chunkTypingUi,
  theorySupport: theorySupport('anytime'),
  teachingFeedback: teaching({ correctLabel: en, reason, theory, example })
});

const WORD_BOX = freeze([
  freeze({ id: 'big', text: 'big' }),
  freeze({ id: 'grades', text: 'grades' }),
  freeze({ id: 'elementary', text: 'elementary' }),
  freeze({ id: 'scared', text: 'scared' }),
  freeze({ id: 'school', text: 'school' }),
  freeze({ id: 'teachers', text: 'teachers' }),
  freeze({ id: 'second', text: 'second' }),
  freeze({ id: 'still', text: 'still' })
]);

const READING_TEXT = `Middle school often includes sixth, seventh, eighth and ninth (1) ______. It’s called middle school because it’s in the middle of your (2) ______ years. Elementary school is behind you. High school (3) ______ awaits you.

For a kid, going to middle school is often a (4) ______ change: First, it usually means moving to a new building, which takes some time to adjust to. (5) ______, it may mean taking a different bus, with different students. Third, the friends you made in (6) ______ school may end up going to different middle schools. And other things that probably will be different are the (7) ______ and the work. All of that can make you feel a bit (8) ______ on the first day of school.`;

const readingStimulus = gapNumber => freeze({
  title: `Con đang làm chỗ (${gapNumber}) · 7 chỗ còn lại vẫn để trống`,
  promptLabel: 'Đọc toàn bài → tự dịch → xét chỗ trống → chọn từ',
  text: READING_TEXT
});

const mcq = ({ id, gapNumber, correct, reason, theory, example, feedback }) => freeze({
  id,
  type: 'mcq',
  prompt: `Chọn từ đúng cho chỗ (${gapNumber}). Word box vẫn giữ đủ 8 từ; con không dùng phương pháp loại trừ đáp án đã làm trước.`,
  stimulus: readingStimulus(gapNumber),
  choices: freeze(WORD_BOX.map(entry => choice(entry.id, entry.text, feedback[entry.id]))),
  correctChoiceId: correct,
  theorySupport: theorySupport('after_submit'),
  teachingFeedback: teaching({ correctLabel: correct, reason, theory, example })
});

export const global6Unit1MlhReadingGap01Content = freeze({
  items: freeze([
    typing({
      id: 'g6u1-mlh-rg-q01', stage: 'word',
      vi: 'Thầy: bao gồm — động từ ngôi thứ ba số ít (V-s). Con gõ đúng dạng tiếng Anh.',
      en: 'includes',
      reason: 'Thầy: Đúng rồi con. includes là dạng V-s của include khi chủ ngữ số ít như Middle school.',
      theory: 'Thầy nhắc con: chủ ngữ số ít ở hiện tại đơn thường kéo động từ thêm -s/-es. Middle school + includes.',
      example: 'Middle school often includes several grades.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q02', stage: 'word',
      vi: 'Thầy: các khối/lớp — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.',
      en: 'grades',
      reason: 'Thầy: Đúng rồi con. Trong bài này grades mang nghĩa các khối/lớp, không phải điểm số.',
      theory: 'Thầy nhắc con: sixth, seventh, eighth, ninth là nhiều khối nên con cần plural noun và giữ đúng -s.',
      example: 'sixth and seventh grades = khối 6 và khối 7.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q03', stage: 'word',
      vi: 'Thầy: trường học — danh từ (noun). Con gõ từ tiếng Anh.',
      en: 'school',
      reason: 'Thầy: Đúng rồi con. school là noun; lát nữa con sẽ ghép nó thành school years.',
      theory: 'Thầy muốn con nhớ từ đơn trước rồi mới nhớ cụm. Một từ có thể đổi sắc thái nghĩa khi đi trong chunk.',
      example: 'school years = những năm đi học.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q04', stage: 'word',
      vi: 'Thầy: vẫn / vẫn còn — trạng từ (adverb). Con gõ từ tiếng Anh.',
      en: 'still',
      reason: 'Thầy: Đúng rồi con. still thường đứng trước động từ thường để diễn tả “vẫn”.',
      theory: 'Thầy nhắc con: still + lexical verb là một khung rất hữu ích. Trong bài này con sẽ gặp still awaits.',
      example: 'High school still awaits you.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q05', stage: 'word',
      vi: 'Thầy: đang chờ / đón chờ — động từ ngôi thứ ba số ít (V-s). Con gõ đúng dạng tiếng Anh.',
      en: 'awaits',
      reason: 'Thầy: Đúng rồi con. awaits = đang chờ/đón chờ; chủ ngữ High school là số ít.',
      theory: 'Thầy nhắc con: await là động từ; High school + awaits. Con chú ý đúng surface form -s.',
      example: 'High school awaits you.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q06', stage: 'word',
      vi: 'Thầy: lớn / lớn lao — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'big',
      reason: 'Thầy: Đúng rồi con. big là adjective và có thể đứng trước change.',
      theory: 'Thầy nhắc con: a + adjective + noun. Khi noun là change, adjective sẽ miêu tả mức độ của sự thay đổi.',
      example: 'a big change = một thay đổi lớn.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q07', stage: 'word',
      vi: 'Thầy: sự thay đổi — danh từ (noun). Con gõ từ tiếng Anh.',
      en: 'change',
      reason: 'Thầy: Đúng rồi con. change ở đây là noun và sẽ đi trong cụm a big change.',
      theory: 'Thầy muốn con nhận ra khung a + adjective + noun để lát nữa tự xác định loại từ ở chỗ trống.',
      example: 'a big change.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q08', stage: 'word',
      vi: 'Thầy: thích nghi — động từ (verb). Con gõ từ tiếng Anh.',
      en: 'adjust',
      reason: 'Thầy: Đúng rồi con. adjust là verb; cụm quan trọng trong bài là adjust to.',
      theory: 'Thầy nhắc con: một số động từ đi với giới từ cố định. Với adjust, con cần nhớ chunk adjust to.',
      example: 'adjust to a new school = thích nghi với trường mới.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q09', stage: 'word',
      vi: 'Thầy: thứ hai — trạng từ chỉ trình tự (sequence adverb). Con gõ từ tiếng Anh.',
      en: 'second',
      reason: 'Thầy: Đúng rồi con. Trong đoạn văn, Second, dùng để nối bước thứ hai sau First và trước Third.',
      theory: 'Thầy nhắc con: khi đọc đoạn liệt kê, đừng chỉ nhìn nghĩa từ; hãy nhìn hệ thống First → Second → Third.',
      example: 'First, ... Second, ... Third, ...'
    }),
    typing({
      id: 'g6u1-mlh-rg-q10', stage: 'word',
      vi: 'Thầy: thuộc tiểu học — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'elementary',
      reason: 'Thầy: Đúng rồi con. elementary đứng trước school để tạo cụm elementary school.',
      theory: 'Thầy nhắc con: adjective thường đứng trước noun. elementary + school = trường tiểu học.',
      example: 'elementary school = trường tiểu học.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q11', stage: 'word',
      vi: 'Thầy: khác / khác nhau — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'different',
      reason: 'Thầy: Đúng rồi con. different là adjective và có thể đứng trước bus, students hoặc schools.',
      theory: 'Thầy nhắc con: different + noun. Học một từ nhưng con nên nhìn các noun mà nó có thể bổ nghĩa trong passage.',
      example: 'different students · different schools.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q12', stage: 'word',
      vi: 'Thầy: các giáo viên — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.',
      en: 'teachers',
      reason: 'Thầy: Đúng rồi con. teachers là plural noun; con giữ đúng -s.',
      theory: 'Thầy nhắc con: khi câu nói nhiều người dạy học, con cần dạng plural teachers.',
      example: 'different teachers = những giáo viên khác.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q13', stage: 'word',
      vi: 'Thầy: bài vở / công việc học tập — danh từ không đếm được (uncountable noun). Con gõ từ tiếng Anh.',
      en: 'work',
      reason: 'Thầy: Đúng rồi con. Trong passage, the work nói về phần bài vở/công việc học tập.',
      theory: 'Thầy nhắc con: work trong nghĩa công việc/bài vở thường không thêm -s. Con đọc nghĩa theo ngữ cảnh trường học.',
      example: 'the teachers and the work.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q14', stage: 'word',
      vi: 'Thầy: sợ / lo lắng — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'scared',
      reason: 'Thầy: Đúng rồi con. scared là adjective chỉ cảm xúc của người.',
      theory: 'Thầy nhắc con: feel + adjective. Khi có a bit, adjective vẫn đứng sau: feel a bit scared.',
      example: 'feel a bit scared = cảm thấy hơi lo/sợ.'
    }),

    typing({
      id: 'g6u1-mlh-rg-q15', stage: 'phrase',
      vi: 'Thầy: trường trung học cơ sở — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'middle school',
      reason: 'Thầy: Đúng rồi con. middle school là cụm chính xuất hiện nhiều lần trong bài đọc.',
      theory: 'Ở cụm từ, Thầy không cho từ loại. Con dùng nghĩa + số từ để tự recall nguyên chunk.',
      example: 'going to middle school.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q16', stage: 'phrase',
      vi: 'Thầy: những năm đi học — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'school years',
      reason: 'Thầy: Đúng rồi con. school years là mảnh câu giúp con giải trực tiếp một gap sau này.',
      theory: 'Thầy muốn con nhớ nguyên cụm thay vì chỉ nhớ school riêng lẻ.',
      example: 'in the middle of your school years.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q17', stage: 'phrase',
      vi: 'Thầy: trường tiểu học — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'elementary school',
      reason: 'Thầy: Đúng rồi con. elementary school là trường tiểu học.',
      theory: 'Thầy muốn con giữ chunk elementary school để khi gặp “___ school” con tự dựng được nghĩa.',
      example: 'friends from elementary school.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q18', stage: 'phrase',
      vi: 'Thầy: trường trung học phổ thông — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'high school',
      reason: 'Thầy: Đúng rồi con. high school là cấp học ở phía trước middle school trong đoạn văn.',
      theory: 'Đọc passage theo timeline cấp học sẽ giúp con hiểu quan hệ elementary → middle → high school.',
      example: 'High school still awaits you.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q19', stage: 'phrase',
      vi: 'Thầy: vẫn đang chờ con — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'still awaits you',
      reason: 'Thầy: Đúng rồi con. Con vừa ghép still + awaits + you thành đúng mảnh câu.',
      theory: 'Thầy muốn con thấy vị trí của still: nó đứng trước động từ thường awaits.',
      example: 'High school still awaits you.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q20', stage: 'phrase',
      vi: 'Thầy: một thay đổi lớn — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'a big change',
      reason: 'Thầy: Đúng rồi con. a big change là chunk quan trọng cho gap adjective.',
      theory: 'Con nhớ khung a + adjective + noun: a big change.',
      example: 'Going to middle school is a big change.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q21', stage: 'phrase',
      vi: 'Thầy: một tòa nhà mới — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'a new building',
      reason: 'Thầy: Đúng rồi con. a new building là một thay đổi được nêu trong đoạn.',
      theory: 'Con đang xây các mảnh nghĩa của passage trước khi đọc toàn đoạn, không phải học đáp án rời.',
      example: 'moving to a new building.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q22', stage: 'phrase',
      vi: 'Thầy: mất một chút thời gian — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'takes some time',
      reason: 'Thầy: Đúng rồi con. takes some time = mất một chút thời gian.',
      theory: 'Khi đọc câu dài, con hãy cắt thành chunk nhỏ đã biết để giảm tải dịch.',
      example: 'which takes some time to adjust to.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q23', stage: 'phrase',
      vi: 'Thầy: thích nghi với — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'adjust to',
      reason: 'Thầy: Đúng rồi con. adjust to là collocation con cần nhớ nguyên cụm.',
      theory: 'Thầy không cho từ loại ở chunk; con recall nghĩa + số từ + collocation.',
      example: 'adjust to a new building.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q24', stage: 'phrase',
      vi: 'Thầy: một chiếc xe buýt khác — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'a different bus',
      reason: 'Thầy: Đúng rồi con. a different bus là một trong những thay đổi khi lên middle school.',
      theory: 'Con nhớ different đứng trước noun: different bus.',
      example: 'taking a different bus.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q25', stage: 'phrase',
      vi: 'Thầy: những học sinh khác — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'different students',
      reason: 'Thầy: Đúng rồi con. different students = những học sinh khác.',
      theory: 'Một adjective có thể tái sử dụng với nhiều noun; điều quan trọng là con nhận ra chunk khi đọc.',
      example: 'with different students.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q26', stage: 'phrase',
      vi: 'Thầy: những trường THCS khác — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'different middle schools',
      reason: 'Thầy: Đúng rồi con. Con đã ghép đúng different middle schools.',
      theory: 'Con dùng chunk này để hiểu vì sao bạn cũ có thể bị tách ra khi lên middle school.',
      example: 'going to different middle schools.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q27', stage: 'phrase',
      vi: 'Thầy: cảm thấy hơi... — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'feel a bit',
      reason: 'Thầy: Đúng rồi con. feel a bit mở ra một vị trí thường cần adjective miêu tả cảm xúc/trạng thái.',
      theory: 'Con nhớ feel + adjective; a bit chỉ làm mức độ nhẹ hơn.',
      example: 'feel a bit scared.'
    }),
    typing({
      id: 'g6u1-mlh-rg-q28', stage: 'phrase',
      vi: 'Thầy: ngày đầu tiên — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'first day',
      reason: 'Thầy: Đúng rồi con. first day là mảnh cuối giúp con hiểu câu kết của passage.',
      theory: 'Con đã có đủ nhiều mảnh nghĩa. Từ câu tiếp theo, Thầy bỏ tiếng Việt để con tự đọc và tự dịch.',
      example: 'on the first day of school.'
    }),

    mcq({
      id: 'g6u1-mlh-rg-q29', gapNumber: 1, correct: 'grades',
      reason: 'Thầy: Chính xác. sixth, seventh, eighth and ninth đều là các khối/lớp, nên cần plural noun grades.',
      theory: 'Thầy nhắc con: khi nhiều số thứ tự sixth, seventh, eighth, ninth cùng gọi tên các khối học, danh từ phía sau phải là plural noun.',
      example: 'sixth, seventh, eighth and ninth grades = các khối 6, 7, 8 và 9.',
      feedback: {
        big: 'Thầy: big là adjective. Sau sixth, seventh, eighth and ninth, con đang cần một danh từ gọi tên các khối/lớp, không phải từ miêu tả kích thước.',
        grades: 'Thầy: Đúng hướng. Các số thứ tự đang gọi tên nhiều khối/lớp nên dạng số nhiều phù hợp.',
        elementary: 'Thầy: elementary là adjective và thường cần noun phía sau như elementary school. Chỗ này cần danh từ số nhiều sau một danh sách các khối.',
        scared: 'Thầy: scared là adjective chỉ cảm xúc. sixth/seventh/eighth/ninth không đang miêu tả cảm xúc.',
        school: 'Thầy: school là singular noun, nhưng “sixth, seventh, eighth and ninth” đang liệt kê nhiều khối. Con nhớ lại từ số nhiều đã typing.',
        teachers: 'Thầy: teachers đúng là plural noun, nhưng sixth/seventh/eighth/ninth ở đây là tên các khối học, không phải đang đếm giáo viên.',
        second: 'Thầy: second là từ chỉ trình tự. Chỗ này nằm sau một chuỗi sixth/seventh/eighth/ninth và cần tên của các khối.',
        still: 'Thầy: still là adverb. Chỗ trống này cần một plural noun để hoàn thành cụm về các khối học.'
      }
    }),
    mcq({
      id: 'g6u1-mlh-rg-q30', gapNumber: 2, correct: 'school',
      reason: 'Thầy: Chính xác. school years = những năm đi học; middle school nằm ở giữa quãng thời gian đi học của con.',
      theory: 'Thầy nhắc con: đừng dịch school riêng lẻ. Hãy recall nguyên chunk school years đã typing.',
      example: 'in the middle of your school years = ở giữa những năm đi học của con.',
      feedback: {
        big: 'Thầy: big là adjective nhưng “big years” không diễn đạt ý những năm đi học. Con nhớ lại chunk 2 từ kết thúc bằng years.',
        grades: 'Thầy: grades là plural noun. “grades years” không tạo thành chunk đúng. Con đã typing một cụm 2 từ có years ở phía sau.',
        elementary: 'Thầy: elementary có thể bổ nghĩa cho noun, nhưng câu đang nói toàn bộ quãng thời gian đi học, không chỉ những năm tiểu học.',
        scared: 'Thầy: scared diễn tả cảm xúc của người; “scared years” không phù hợp nghĩa đoạn này.',
        school: 'Thầy: Đúng hướng. Con đã gặp nguyên chunk school years ở phần Typing.',
        teachers: 'Thầy: teachers là người; “teachers years” không phải cụm đúng để nói quãng thời gian đi học.',
        second: 'Thầy: second có thể chỉ thứ tự nhưng “second years” không phù hợp với ý middle school nằm giữa quãng đời đi học.',
        still: 'Thầy: still là adverb và không thể bổ nghĩa cho years theo nghĩa câu này.'
      }
    }),
    mcq({
      id: 'g6u1-mlh-rg-q31', gapNumber: 3, correct: 'still',
      reason: 'Thầy: Chính xác. awaits đã là động từ; still đứng trước awaits để tạo nghĩa “trường cấp ba vẫn đang chờ con phía trước”.',
      theory: 'Thầy nhắc con: still thường đứng trước động từ thường: still + awaits.',
      example: 'High school still awaits you.',
      feedback: {
        big: 'Thầy: big là adjective. Câu đã có chủ ngữ High school và động từ awaits; chỗ này cần một từ bổ sung ý cho hành động, không phải adjective miêu tả noun.',
        grades: 'Thầy: grades là plural noun. Đặt nó trước awaits sẽ làm cấu trúc và nghĩa câu bị lệch.',
        elementary: 'Thầy: elementary là adjective, nhưng phía trước đã là High school và phía sau là verb awaits. Con xét vị trí của một adverb.',
        scared: 'Thầy: scared là adjective chỉ cảm xúc; High school không “scared awaits” con.',
        school: 'Thầy: school là noun, trong khi câu đã có chủ ngữ High school. Con cần từ mang nghĩa “vẫn”.',
        teachers: 'Thầy: teachers là plural noun và không thể chen giữa chủ ngữ High school với động từ awaits theo nghĩa này.',
        second: 'Thầy: Second thường dùng như dấu nối trình tự và thường đi với dấu phẩy. Ở đây câu đang nói High school ___ awaits you, không phải mở bước thứ hai.',
        still: 'Thầy: Đúng hướng. still đứng trước động từ thường awaits và giữ nghĩa “vẫn”.'
      }
    }),
    mcq({
      id: 'g6u1-mlh-rg-q32', gapNumber: 4, correct: 'big',
      reason: 'Thầy: Chính xác. a + adjective + noun → a big change = một thay đổi lớn.',
      theory: 'Thầy nhắc con hai lớp kiểm tra: trước hết a + ___ + change cần adjective; sau đó trong các adjective, con chọn nghĩa phù hợp với một sự thay đổi lớn khi lên middle school.',
      example: 'going to middle school is often a big change.',
      feedback: {
        big: 'Thầy: Đúng hướng. big là adjective và a big change là chunk con vừa typing.',
        grades: 'Thầy: grades là plural noun. Khung a + ___ + change đang cần một từ miêu tả noun change.',
        elementary: 'Thầy: elementary là adjective nên con xét đúng từ loại, nhưng “an elementary change” không diễn tả ý đoạn văn: chuyển lên middle school là một thay đổi đáng kể.',
        scared: 'Thầy: scared cũng là adjective nên con xét đúng từ loại. Nhưng người có thể feel scared; một sự thay đổi không phải “a scared change”. Con xét lại nghĩa.',
        school: 'Thầy: school là noun. “a school change” có thể xuất hiện ở ngữ cảnh khác, nhưng passage đang miêu tả mức độ của change và con đã học chunk a ___ change.',
        teachers: 'Thầy: teachers là plural noun, không thể nằm trong khung a + ___ + singular noun change.',
        second: 'Thầy: second có thể đứng trước noun để chỉ “một thay đổi thứ hai”, nhưng đoạn này đang giới thiệu một thay đổi lớn rồi mới liệt kê First/Second/Third các khía cạnh của nó.',
        still: 'Thầy: still thường là adverb trong bài này; chỗ trước noun change đang cần adjective miêu tả sự thay đổi.'
      }
    }),
    mcq({
      id: 'g6u1-mlh-rg-q33', gapNumber: 5, correct: 'second',
      reason: 'Thầy: Chính xác. Con đọc cấu trúc cả đoạn: First → Second → Third. Đây là clue discourse mạnh hơn việc đoán nghĩa từng từ.',
      theory: 'Thầy nhắc con: với đoạn liệt kê, hãy scan các marker. First mở ý 1, Second mở ý 2, Third mở ý 3.',
      example: 'First, ... Second, ... Third, ...',
      feedback: {
        big: 'Thầy: big là adjective, không phải từ nối mở bước thứ hai của một danh sách.',
        grades: 'Thầy: grades là noun. Con hãy nhìn xa hơn một câu: phía trước có First và phía sau có Third.',
        elementary: 'Thầy: elementary là adjective. Chỗ đầu câu này cần một discourse marker khớp chuỗi First → ___ → Third.',
        scared: 'Thầy: scared là adjective chỉ cảm xúc, không dùng để đánh dấu bước thứ hai.',
        school: 'Thầy: school là noun; nó không nối được cấu trúc liệt kê First / ___ / Third.',
        teachers: 'Thầy: teachers là plural noun. Đây không phải chỗ gọi tên người mà là chỗ nối trình tự các ý.',
        second: 'Thầy: Đúng hướng. First → Second → Third là hệ thống trình tự rõ ràng.',
        still: 'Thầy: still là adverb nhưng không phải marker thứ tự. Con nhìn lại hai từ First và Third quanh chỗ trống.'
      }
    }),
    mcq({
      id: 'g6u1-mlh-rg-q34', gapNumber: 6, correct: 'elementary',
      reason: 'Thầy: Chính xác. elementary school = trường tiểu học; những người bạn từ tiểu học có thể sang các trường THCS khác nhau.',
      theory: 'Thầy nhắc con: khi thấy ___ school, hãy recall các school chunks đã typing và dùng timeline elementary → middle → high để chọn đúng cấp học.',
      example: 'the friends you made in elementary school.',
      feedback: {
        big: 'Thầy: big có thể đứng trước school về mặt từ loại, nhưng đoạn đang nói những người bạn con đã có ở cấp học trước middle school. Con nghĩ theo timeline cấp học.',
        grades: 'Thầy: grades là plural noun; “grades school” không phải tên một cấp học.',
        elementary: 'Thầy: Đúng hướng. elementary school là cấp học nằm trước middle school trong timeline của passage.',
        scared: 'Thầy: scared là adjective chỉ cảm xúc; “scared school” không tạo nghĩa phù hợp ở đây.',
        school: 'Thầy: nếu chọn school sẽ thành “school school”. Con recall cụm 2 từ chỉ trường tiểu học.',
        teachers: 'Thầy: teachers là plural noun và không đứng trước school để tạo tên cấp học.',
        second: 'Thầy: second school có thể hiểu là trường thứ hai ở ngữ cảnh khác, nhưng đoạn này đang đối chiếu cấp học trước middle school.',
        still: 'Thầy: still là adverb trong bài và không tạo được tên cấp học với school.'
      }
    }),
    mcq({
      id: 'g6u1-mlh-rg-q35', gapNumber: 7, correct: 'teachers',
      reason: 'Thầy: Chính xác. Khi sang middle school, những thứ có thể khác gồm các giáo viên và bài vở: the teachers and the work.',
      theory: 'Thầy nhắc con: con cần vừa xét cấu trúc “the ___ and the work” vừa xét nghĩa của những yếu tố thay đổi trong môi trường học mới.',
      example: 'the teachers and the work = các giáo viên và bài vở.',
      feedback: {
        big: 'Thầy: big là adjective và không thể đứng một mình sau the để song song với the work theo nghĩa câu này.',
        grades: 'Thầy: grades là plural noun nên từ loại có vẻ hợp. Nhưng trong passage, grades đang chỉ các khối/lớp; con hãy nghĩ đến yếu tố con gặp trong lớp học mới cùng với phần bài vở.',
        elementary: 'Thầy: elementary là adjective và còn thiếu noun phía sau; “the elementary and the work” không hoàn chỉnh.',
        scared: 'Thầy: scared là adjective chỉ cảm xúc; câu này đang liệt kê những things sẽ khác ở trường mới.',
        school: 'Thầy: “the school and the work” có thể thành một cụm về mặt ngữ pháp, nhưng passage vừa nói cụ thể việc chuyển trường; chỗ này đang hướng tới một nhóm người trong lớp học mới.',
        teachers: 'Thầy: Đúng hướng. Đây là plural noun chỉ một nhóm người sẽ thay đổi khi con sang môi trường học mới.',
        second: 'Thầy: second là từ chỉ trình tự; “the second and the work” không phải hai yếu tố song song của môi trường học.',
        still: 'Thầy: still là adverb và không thể làm noun sau the trong cấu trúc này.'
      }
    }),
    mcq({
      id: 'g6u1-mlh-rg-q36', gapNumber: 8, correct: 'scared',
      reason: 'Thầy: Chính xác. feel + adjective và a bit + adjective → feel a bit scared = cảm thấy hơi lo/sợ.',
      theory: 'Thầy nhắc con: feel là linking verb nên sau nó thường là adjective miêu tả trạng thái. a bit chỉ mức độ nhẹ hơn.',
      example: 'All of that can make you feel a bit scared on the first day of school.',
      feedback: {
        big: 'Thầy: big là adjective nên con xét đúng từ loại, nhưng “feel a bit big” không diễn tả cảm xúc do những thay đổi ngày đầu đi học gây ra.',
        grades: 'Thầy: grades là plural noun. Sau feel a bit, con đang cần một adjective miêu tả trạng thái/cảm xúc.',
        elementary: 'Thầy: elementary là adjective nên từ loại có thể lọt qua bước đầu, nhưng nó mang nghĩa thuộc tiểu học chứ không phải một cảm xúc.',
        scared: 'Thầy: Đúng hướng. scared là adjective chỉ cảm xúc và khớp chunk feel a bit scared.',
        school: 'Thầy: school là noun; sau feel a bit ở đây cần adjective miêu tả cảm xúc của con.',
        teachers: 'Thầy: teachers là plural noun và không thể đứng sau feel a bit để miêu tả trạng thái của người.',
        second: 'Thầy: second là từ chỉ thứ tự, không phải trạng thái/cảm xúc sau feel a bit.',
        still: 'Thầy: still có thể có những cách dùng khác, nhưng trong bài này con đã học nó với nghĩa “vẫn”; nghĩa đó không phù hợp cảm xúc do ngày đầu đi học gây ra.'
      }
    })
  ])
});
