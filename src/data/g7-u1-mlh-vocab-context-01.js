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

const VOCAB = freeze([
  freeze({ id: 'smart', text: 'smart' }),
  freeze({ id: 'classmates', text: 'classmates' }),
  freeze({ id: 'uniforms', text: 'uniforms' }),
  freeze({ id: 'subjects', text: 'subjects' }),
  freeze({ id: 'boarding', text: 'boarding' }),
  freeze({ id: 'international', text: 'international' }),
  freeze({ id: 'favourite', text: 'favourite' }),
  freeze({ id: 'library', text: 'library' })
]);

const mcq = ({ id, prompt, correct, reason, theory, example, feedback }) => freeze({
  id,
  type: 'mcq',
  prompt,
  choices: freeze(VOCAB.map(entry => choice(entry.id, entry.text, feedback[entry.id]))),
  correctChoiceId: correct,
  theorySupport: theorySupport('after_submit'),
  teachingFeedback: teaching({ correctLabel: correct, reason, theory, example })
});

export const global7Unit1MlhVocabContext01Content = freeze({
  items: freeze([
    typing({
      id: 'g7u1-mlh-vc-q01', stage: 'word',
      vi: 'Thầy: bảnh bao / gọn gàng — tính từ (adj.). Con gõ đúng từ tiếng Anh.',
      en: 'smart',
      reason: 'Thầy: Đúng rồi con. smart là tính từ; trong ngữ cảnh bộ đồng phục, nó diễn tả vẻ bảnh bao/gọn gàng.',
      theory: 'Thầy nhắc con: từ đơn thì con phải nhớ cả nghĩa và từ loại. look + adjective và very + adjective là hai khung rất hay gặp.',
      example: 'looks very smart = trông rất bảnh bao.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q02', stage: 'word',
      vi: 'Thầy: các bạn cùng lớp — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.',
      en: 'classmates',
      reason: 'Thầy: Đúng rồi con. classmates là dạng số nhiều; bài này không dùng classmate.',
      theory: 'Thầy nhắc con: classmate = một bạn cùng lớp; classmates = các bạn cùng lớp. Con phải giữ đúng -s khi đề yêu cầu plural noun.',
      example: 'Phong and Duy are classmates.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q03', stage: 'word',
      vi: 'Thầy: đồng phục — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.',
      en: 'uniforms',
      reason: 'Thầy: Đúng rồi con. uniforms là dạng số nhiều mà word box của bài dùng.',
      theory: 'Thầy nhắc con: uniform = một bộ đồng phục; uniforms = đồng phục/các bộ đồng phục ở dạng số nhiều.',
      example: 'school uniforms = đồng phục học sinh.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q04', stage: 'word',
      vi: 'Thầy: các môn học — danh từ số nhiều (plural noun). Con gõ đúng dạng tiếng Anh.',
      en: 'subjects',
      reason: 'Thầy: Đúng rồi con. subjects là plural noun; con nhớ dấu -s vì lát nữa maths and science là nhiều môn.',
      theory: 'Thầy nhắc con: subject = một môn học; subjects = các môn học. Dấu hiệu are thường đi với chủ ngữ/bổ ngữ số nhiều trong kiểu câu con sắp gặp.',
      example: 'favourite subjects = các môn học yêu thích.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q05', stage: 'word',
      vi: 'Thầy: nội trú — tính từ (adj.). Con gõ đúng từ tiếng Anh.',
      en: 'boarding',
      reason: 'Thầy: Đúng rồi con. boarding đứng trước school để tạo cụm boarding school.',
      theory: 'Thầy nhắc con: trong bài này boarding là từ bổ nghĩa cho school. Con nhớ nghĩa “nội trú” và hình thức chính xác của từ.',
      example: 'boarding school = trường nội trú.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q06', stage: 'word',
      vi: 'Thầy: quốc tế — tính từ (adj.). Con gõ đúng từ tiếng Anh.',
      en: 'international',
      reason: 'Thầy: Đúng rồi con. international là adjective và có thể đứng trước school/schools.',
      theory: 'Thầy nhắc con: khi một tính từ bổ nghĩa cho danh từ, tiếng Anh thường đặt tính từ trước danh từ.',
      example: 'international schools = các trường quốc tế.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q07', stage: 'word',
      vi: 'Thầy: yêu thích — tính từ (adj.). Con gõ theo đúng British English của bài.',
      en: 'favourite',
      reason: 'Thầy: Đúng rồi con. Bài này dùng British spelling favourite, không dùng dạng American spelling làm target chính.',
      theory: 'Thầy nhắc con: favourite thường đứng trước một noun để nói người/vật con thích nhất.',
      example: 'favourite teacher · favourite subjects.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q08', stage: 'word',
      vi: 'Thầy: thư viện — danh từ (noun). Con gõ đúng từ tiếng Anh.',
      en: 'library',
      reason: 'Thầy: Đúng rồi con. library là noun chỉ một place/nơi chốn.',
      theory: 'Thầy nhắc con: khi câu nói “in the ___” rồi mô tả đọc và mượn sách, con cần nghĩ đến một địa điểm phù hợp.',
      example: 'in the library = trong thư viện.'
    }),

    typing({
      id: 'g7u1-mlh-vc-q09', stage: 'phrase',
      vi: 'Thầy: trông rất bảnh bao — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'looks very smart',
      reason: 'Thầy: Đúng rồi con. Con vừa ghép đúng mảnh câu looks very smart.',
      theory: 'Thầy chưa cho từ loại ở cụm. Con dùng nghĩa + số từ để tự nhớ nguyên chunk.',
      example: 'Duy looks very smart.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q10', stage: 'phrase',
      vi: 'Thầy: bộ đồng phục mới — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'new uniform',
      reason: 'Thầy: Đúng rồi con. new uniform là đúng mảnh câu con sẽ gặp lại.',
      theory: 'Thầy muốn con nhớ nguyên cụm 2 từ thay vì dịch từng từ rời khi vào câu dài.',
      example: 'his new uniform = bộ đồng phục mới của cậu ấy.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q11', stage: 'phrase',
      vi: 'Thầy: cùng một lớp — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'same class',
      reason: 'Thầy: Đúng rồi con. same class là clue rất mạnh để lát nữa con suy ra quan hệ giữa hai học sinh.',
      theory: 'Thầy muốn con nhớ cụm theo nghĩa. Khi đọc câu dài, hãy tìm những mảnh con đã từng tự dịch.',
      example: 'in the same class = ở cùng một lớp.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q12', stage: 'phrase',
      vi: 'Thầy: mặc đồng phục học sinh — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'wear school uniforms',
      reason: 'Thầy: Đúng rồi con. wear school uniforms là cụm trực tiếp giúp con giải câu về thứ trẻ em phải mặc.',
      theory: 'Thầy muốn con nối nghĩa theo chunk: wear + school uniforms.',
      example: 'children wear school uniforms.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q13', stage: 'phrase',
      vi: 'Thầy: các môn học yêu thích — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'favourite subjects',
      reason: 'Thầy: Đúng rồi con. Con đã ghép đúng favourite subjects.',
      theory: 'Thầy muốn con nhớ nguyên chunk để khi gặp maths and science, con không phải dịch lại từ đầu.',
      example: 'My favourite subjects are maths and science.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q14', stage: 'phrase',
      vi: 'Thầy: toán và khoa học — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'maths and science',
      reason: 'Thầy: Đúng rồi con. Đây là hai môn được nối bằng and.',
      theory: 'Thầy muốn con nhận ra đây là nhiều môn; lát nữa nó sẽ giúp con xác nhận dạng số nhiều subjects.',
      example: 'maths and science are subjects.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q15', stage: 'phrase',
      vi: 'Thầy: trường nội trú — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'boarding school',
      reason: 'Thầy: Đúng rồi con. boarding school là trường nội trú.',
      theory: 'Thầy muốn con giữ nguyên cụm này trong trí nhớ. Lát nữa câu sẽ mô tả nơi học sinh vừa học vừa sống.',
      example: 'a boarding school.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q16', stage: 'phrase',
      vi: 'Thầy: học và sống — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'study and live',
      reason: 'Thầy: Đúng rồi con. Hai hành động study và live được nối bằng and.',
      theory: 'Thầy muốn con dùng mảnh nghĩa này như clue để nhận ra loại trường được định nghĩa ở câu chính.',
      example: 'students study and live at school.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q17', stage: 'phrase',
      vi: 'Thầy: các trường quốc tế — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'international schools',
      reason: 'Thầy: Đúng rồi con. international schools là đúng cụm 2 từ.',
      theory: 'Thầy muốn con nhớ cả cụm; khi thấy “___ schools” con sẽ có sẵn một chunk để kiểm tra nghĩa.',
      example: 'at international schools.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q18', stage: 'phrase',
      vi: 'Thầy: bằng tiếng Anh — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'in English',
      reason: 'Thầy: Đúng rồi con. Trong ngữ cảnh bài này, in English = bằng tiếng Anh.',
      theory: 'Thầy muốn con nhận ra mảnh nghĩa này khi đọc câu về cách học các môn ở trường.',
      example: 'learn subjects in English.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q19', stage: 'phrase',
      vi: 'Thầy: giáo viên yêu thích — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'favourite teacher',
      reason: 'Thầy: Đúng rồi con. favourite teacher là giáo viên con thích nhất.',
      theory: 'Thầy muốn con nhớ nguyên chunk để lát nữa câu hỏi về Ms Harper trở nên quen thuộc.',
      example: 'your favourite teacher.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q20', stage: 'phrase',
      vi: 'Thầy: dạy chúng tôi môn lịch sử — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'teaches us history',
      reason: 'Thầy: Đúng rồi con. teaches us history là đúng cụm 3 từ.',
      theory: 'Thầy muốn con dùng phần sau của câu làm clue nghĩa cho người giáo viên được nhắc tới.',
      example: 'She teaches us history.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q21', stage: 'phrase',
      vi: 'Thầy: mượn chúng — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'borrow them',
      reason: 'Thầy: Đúng rồi con. borrow them = mượn chúng.',
      theory: 'Thầy muốn con nối hành động borrow với những thứ đã nhắc trước đó như books and papers.',
      example: 'borrow them to read.'
    }),
    typing({
      id: 'g7u1-mlh-vc-q22', stage: 'phrase',
      vi: 'Thầy: ở nhà — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'at home',
      reason: 'Thầy: Đúng rồi con. at home là cụm cố định con cần nhớ nguyên.',
      theory: 'Thầy muốn con nhớ đúng chunk at home; không tự đổi thành in home.',
      example: 'read at home = đọc ở nhà.'
    }),

    mcq({
      id: 'g7u1-mlh-vc-q23',
      prompt: 'Duy looks very ______ in his new uniform.',
      correct: 'smart',
      reason: 'Thầy: Đúng rồi con. Con dùng cả cấu trúc và nghĩa: looks very + adjective → smart. Duy trông rất bảnh bao trong bộ đồng phục mới.',
      theory: 'Thầy nhắc con sau khi con đã thử: look + adjective; very + adjective. Con cũng đã tự typing looks very smart và new uniform ở phần trước.',
      example: 'Duy looks very smart in his new uniform. = Duy trông rất bảnh bao trong bộ đồng phục mới.',
      feedback: {
        smart: 'Thầy: Đúng rồi con. smart vừa đúng từ loại vừa đúng nghĩa trong looks very smart.',
        classmates: 'Thầy: classmates là plural noun chỉ người. Chỗ này đang cần một từ miêu tả Duy sau looks very.',
        uniforms: 'Thầy: uniforms là plural noun chỉ đồ mặc. Câu đã có his new uniform phía sau; chỗ trống đang miêu tả Duy.',
        subjects: 'Thầy: subjects là plural noun chỉ môn học. Nó không thể đứng sau looks very để miêu tả Duy.',
        boarding: 'Thầy: boarding có thể đi với school, nhưng looks very boarding không tạo nghĩa phù hợp. Con dịch lại cả câu nhé.',
        international: 'Thầy: con đã xét đúng hướng adjective, nhưng nghĩa chưa hợp. Duy không “trông rất quốc tế” trong bộ đồng phục mới.',
        favourite: 'Thầy: favourite là adjective nhưng thường cần một noun phía sau như favourite teacher. Ở đây con cần từ miêu tả vẻ ngoài của Duy.',
        library: 'Thầy: library là noun chỉ nơi chốn. looks very library không đúng cấu trúc.'
      }
    }),
    mcq({
      id: 'g7u1-mlh-vc-q24',
      prompt: 'Phong and Duy are in the same class at school. They are ______.',
      correct: 'classmates',
      reason: 'Thầy: Đúng rồi con. in the same class = cùng một lớp, nên Phong và Duy là classmates.',
      theory: 'Thầy nhắc con sau khi con đã thử: hãy dịch mảnh same class trước rồi xác định câu đang gọi tên mối quan hệ giữa hai người.',
      example: 'Phong and Duy are classmates. = Phong và Duy là bạn cùng lớp.',
      feedback: {
        smart: 'Thầy: smart miêu tả đặc điểm, nhưng câu đang hỏi mối quan hệ giữa Phong và Duy. Con dùng clue same class nhé.',
        classmates: 'Thầy: Đúng rồi con. same class dẫn thẳng đến nghĩa “các bạn cùng lớp”.',
        uniforms: 'Thầy: uniforms là đồ vật, trong khi They ở đây là Phong and Duy.',
        subjects: 'Thầy: subjects là các môn học, không phải từ gọi hai người học cùng lớp.',
        boarding: 'Thầy: boarding thường đi với school; nó không phải danh từ gọi hai học sinh.',
        international: 'Thầy: international là adjective, không phải danh từ chỉ quan hệ giữa Phong và Duy.',
        favourite: 'Thầy: favourite là adjective và còn cần noun phía sau; nó không trả lời “They are ___” theo nghĩa câu này.',
        library: 'Thầy: library là nơi chốn, không phải tên quan hệ giữa hai người.'
      }
    }),
    mcq({
      id: 'g7u1-mlh-vc-q25',
      prompt: 'Most schools require children to wear school ______.',
      correct: 'uniforms',
      reason: 'Thầy: Đúng rồi con. wear = mặc; cụm con vừa typing là wear school uniforms.',
      theory: 'Thầy nhắc con sau khi con đã thử: tìm động từ wear rồi hỏi “trẻ em mặc cái gì?”. Chunk đã học sẽ giúp con tự dịch.',
      example: 'Most schools require children to wear school uniforms. = Hầu hết các trường yêu cầu trẻ em mặc đồng phục.',
      feedback: {
        smart: 'Thầy: smart là adjective. Sau wear school ___ con đang cần thứ trẻ em có thể mặc.',
        classmates: 'Thầy: classmates là người; con không thể wear “các bạn cùng lớp”.',
        uniforms: 'Thầy: Đúng rồi con. Con đã nhớ lại đúng chunk wear school uniforms.',
        subjects: 'Thầy: subjects là môn học; đây không phải thứ trẻ em mặc.',
        boarding: 'Thầy: con nhớ boarding school, nhưng ở đây school đã đứng trước chỗ trống và động từ chính là wear.',
        international: 'Thầy: international thường đứng trước schools, không đứng sau school trong cụm này; con còn phải kiểm tra nghĩa của wear.',
        favourite: 'Thầy: favourite không tạo thành thứ trẻ em mặc trong cụm wear school ___.',
        library: 'Thầy: library là nơi chốn, không phải quần áo.'
      }
    }),
    mcq({
      id: 'g7u1-mlh-vc-q26',
      prompt: 'My favourite ______ at school are maths and science.',
      correct: 'subjects',
      reason: 'Thầy: Chính xác. maths and science là nhiều môn và are cũng là dấu hiệu số nhiều, nên subjects phù hợp cả nghĩa lẫn dạng.',
      theory: 'Thầy nhắc con sau khi con đã thử: dùng hai clue cùng lúc — nghĩa maths and science và dấu hiệu plural are.',
      example: 'My favourite subjects at school are maths and science. = Các môn học yêu thích của tôi ở trường là toán và khoa học.',
      feedback: {
        smart: 'Thầy: smart là adjective; phía trước chỗ trống đã có favourite, còn maths and science đang cần một danh từ gọi tên loại của chúng.',
        classmates: 'Thầy: classmates đúng là plural noun nhưng maths and science không phải các bạn cùng lớp. Con kiểm tra nghĩa nhé.',
        uniforms: 'Thầy: uniforms cũng là plural noun nhưng maths and science không phải đồng phục. Đúng số nhiều nhưng sai nghĩa.',
        subjects: 'Thầy: Đúng rồi con. maths and science là subjects và are xác nhận dạng số nhiều.',
        boarding: 'Thầy: favourite boarding không hoàn chỉnh theo nghĩa câu này. Con nhìn maths and science để xác định chỗ trống gọi tên cái gì.',
        international: 'Thầy: international là adjective; chỗ trống cần danh từ chỉ maths and science.',
        favourite: 'Thầy: phía trước đã có favourite rồi; my favourite favourite không tạo nghĩa phù hợp.',
        library: 'Thầy: library là singular noun chỉ nơi chốn; maths and science không phải một thư viện.'
      }
    }),
    mcq({
      id: 'g7u1-mlh-vc-q27',
      prompt: 'A ______ school is a school where students study and live during the school year.',
      correct: 'boarding',
      reason: 'Thầy: Đúng rồi con. Cụm study and live mô tả boarding school — trường nội trú.',
      theory: 'Thầy nhắc con sau khi con đã thử: đọc phần định nghĩa phía sau chỗ trống. study and live là clue quyết định.',
      example: 'A boarding school is a school where students study and live during the school year. = Trường nội trú là nơi học sinh học và sống trong năm học.',
      feedback: {
        smart: 'Thầy: smart school có thể tạo một cụm khác, nhưng phần định nghĩa đang nhấn mạnh students study and live. Con bám vào nghĩa đó.',
        classmates: 'Thầy: classmates school không phải cụm đúng để gọi tên một loại trường.',
        uniforms: 'Thầy: uniforms school không đúng cấu trúc và không khớp định nghĩa phía sau.',
        subjects: 'Thầy: subjects school không phù hợp; phần sau đang định nghĩa một loại trường.',
        boarding: 'Thầy: Đúng rồi con. study and live chính là clue của boarding school.',
        international: 'Thầy: international school là một cụm có nghĩa, nhưng định nghĩa này không nói về trường quốc tế; nó nói học sinh học và sống tại trường.',
        favourite: 'Thầy: favourite school chỉ “trường yêu thích”, không phải loại trường được định nghĩa bằng study and live.',
        library: 'Thầy: library là noun chỉ nơi chốn; chỗ trống cần từ tạo thành tên một loại school.'
      }
    }),
    mcq({
      id: 'g7u1-mlh-vc-q28',
      prompt: 'At ______ schools, students learn subjects in English with English-speaking teachers.',
      correct: 'international',
      reason: 'Thầy: Đúng rồi con. international schools phù hợp với các clue in English và English-speaking teachers.',
      theory: 'Thầy nhắc con sau khi con đã thử: trước schools cần một từ bổ nghĩa; sau đó con kiểm tra nghĩa bằng cả phần còn lại của câu.',
      example: 'At international schools, students learn subjects in English. = Ở các trường quốc tế, học sinh học các môn bằng tiếng Anh.',
      feedback: {
        smart: 'Thầy: smart schools có thể là một cụm khác, nhưng không khớp mô tả học các môn in English với English-speaking teachers.',
        classmates: 'Thầy: classmates là noun chỉ người; classmates schools không đúng cấu trúc.',
        uniforms: 'Thầy: uniforms là noun số nhiều; uniforms schools không tạo cụm phù hợp.',
        subjects: 'Thầy: subjects schools không đúng cấu trúc và không diễn tả loại trường trong câu.',
        boarding: 'Thầy: boarding schools là cụm đúng về ngữ pháp, nhưng trường nội trú không nhất thiết có đặc điểm in English + English-speaking teachers. Con xét nghĩa tiếp nhé.',
        international: 'Thầy: Đúng rồi con. Con đã nối được international schools với in English.',
        favourite: 'Thầy: favourite schools chỉ “các trường yêu thích”, không phải loại trường đang được mô tả.',
        library: 'Thầy: library là noun; library schools không phù hợp với câu này.'
      }
    }),
    mcq({
      id: 'g7u1-mlh-vc-q29',
      prompt: 'What is your ______ teacher, Dane? ~ Ms. Harper. She teaches us history.',
      correct: 'favourite',
      reason: 'Thầy: Đúng rồi con. favourite teacher = giáo viên yêu thích; câu trả lời đưa ra tên Ms Harper.',
      theory: 'Thầy nhắc con sau khi con đã thử: con đã typing favourite teacher và teaches us history. Hãy dùng hai mảnh đó để dựng nghĩa của cả câu.',
      example: 'your favourite teacher = giáo viên yêu thích của con.',
      feedback: {
        smart: 'Thầy: smart teacher có thể miêu tả một giáo viên thông minh, nhưng câu trả lời bằng tên Ms Harper cho thấy câu đang hỏi giáo viên con thích nhất.',
        classmates: 'Thầy: classmates là noun số nhiều; classmates teacher không phải cụm đúng ở đây.',
        uniforms: 'Thầy: uniforms teacher không phù hợp về cấu trúc lẫn nghĩa.',
        subjects: 'Thầy: subjects teacher không phải cụm mục tiêu của câu này.',
        boarding: 'Thầy: boarding teacher không phù hợp với ngữ cảnh câu hỏi về Ms Harper.',
        international: 'Thầy: international teacher không diễn tả ý “giáo viên yêu thích”. Con dùng clue từ câu trả lời nhé.',
        favourite: 'Thầy: Đúng rồi con. favourite teacher là đúng chunk con đã tự gõ trước đó.',
        library: 'Thầy: library teacher không phù hợp với nghĩa câu này.'
      }
    }),
    mcq({
      id: 'g7u1-mlh-vc-q30',
      prompt: 'In the ______, you can read books and papers or borrow them to read at home.',
      correct: 'library',
      reason: 'Thầy: Chính xác. library là nơi con có thể đọc books and papers hoặc borrow them để đọc at home.',
      theory: 'Thầy nhắc con sau khi con đã thử: In the ___ gợi một place. Hai chunk borrow them và at home giúp con hiểu hoạt động được mô tả.',
      example: 'In the library, you can read or borrow books. = Trong thư viện, con có thể đọc hoặc mượn sách.',
      feedback: {
        smart: 'Thầy: smart là adjective; sau In the ___ câu đang cần một nơi chốn phù hợp.',
        classmates: 'Thầy: classmates là người; in the classmates không tạo nghĩa “nơi đọc và mượn sách”.',
        uniforms: 'Thầy: uniforms là đồ mặc; in the uniforms không phải địa điểm để đọc sách.',
        subjects: 'Thầy: subjects là môn học, không phải nơi chốn.',
        boarding: 'Thầy: in the boarding không tạo thành địa điểm phù hợp; boarding thường cần một noun như school.',
        international: 'Thầy: international là adjective và còn thiếu noun phía sau; nó không thể tự làm tên nơi chốn ở đây.',
        favourite: 'Thầy: favourite là adjective và không thể đứng một mình làm địa điểm sau in the.',
        library: 'Thầy: Đúng rồi con. read books + borrow them + at home đều dẫn đến library.'
      }
    })
  ])
});
