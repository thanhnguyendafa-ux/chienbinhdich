const freeze = value => Object.freeze(value);
const theorySupport = freeze({ access: 'after_submit' });
const teaching = ({ correctLabel, reason, theory, example }) => freeze({ correctLabel, reason, theory, example });
const choice = (id, text, feedback) => freeze({ id, text, feedback });

const wordTypingUi = freeze({
  promptLabel: 'Thầy hỏi · TỪ ĐƠN',
  contextLabel: 'Tiếng Việt + từ loại',
  instruction: 'Con gõ chính xác 1 từ tiếng Anh theo đúng dạng Thầy yêu cầu. Lý thuyết chỉ mở sau khi con submit.',
  inputLabel: 'Từ tiếng Anh của con',
  placeholder: 'Type 1 English word...'
});

const chunkTypingUi = freeze({
  promptLabel: 'Thầy hỏi · CỤM TỪ',
  contextLabel: 'Tiếng Việt + số từ',
  instruction: 'Con gõ đúng cả cụm theo đúng số từ Thầy đã cho. Lý thuyết chỉ mở sau khi con submit.',
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
  theorySupport,
  teachingFeedback: teaching({ correctLabel: en, reason, theory, example })
});

const CHART_TEXT = 'IS — kind · helpful · friendly · responsible · respectful · nice to everyone. DOES — helps others · shares · works hard · tries his/her best · invites you to play at recess. SAYS — “Please” · “Thank you” · “I’m sorry” · “How are you?” · “Let me help you”. IS NOT — rude · mean · impatient · a gossiper · a bully · cheater.';

const chartStimulus = freeze({
  title: 'A GREAT CLASSMATE · Đọc đủ IS / DOES / SAYS / IS NOT',
  promptLabel: 'STATEMENT → FIND EVIDENCE → CHECK MATCH → CHOOSE T/F + REASON',
  text: CHART_TEXT
});

const evidenceMcq = ({ id, prompt, correctChoiceId, choices, reason, matchType, trapType, example }) => freeze({
  id,
  type: 'mcq',
  prompt: `${prompt} Chọn phương án duy nhất có cả TRUE/FALSE và lý do đều đúng.`,
  stimulus: chartStimulus,
  choices: freeze(choices.map(entry => choice(entry.id, entry.text, entry.feedback))),
  correctChoiceId,
  theorySupport,
  teachingFeedback: teaching({
    correctLabel: choices.find(entry => entry.id === correctChoiceId)?.text ?? correctChoiceId,
    reason,
    theory: `EVIDENCE + MATCH: ${matchType}. BẪY CẦN TRÁNH: ${trapType}.`,
    example
  })
});

export const global6Unit1MlhReadingTfEvidence01Content = freeze({
  items: freeze([
    typing({
      id: 'g6u1-mlh-tf-q01', stage: 'word',
      vi: 'Thầy: các phẩm chất — danh từ số nhiều (plural noun). Con gõ đúng từ tiếng Anh.',
      en: 'qualities',
      reason: 'Thầy: Đúng rồi con. qualities là plural noun dùng để nói nhiều phẩm chất/đặc điểm.',
      theory: 'qualities = các phẩm chất. Đây là Tier 2 word hữu ích khi đọc mô tả người, kỹ năng hoặc tiêu chí.',
      example: 'the qualities of a good classmate.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q02', stage: 'word',
      vi: 'Thầy: bạn cùng lớp — danh từ số ít (singular noun). Con gõ từ tiếng Anh.',
      en: 'classmate',
      reason: 'Thầy: Đúng rồi con. classmate = một bạn cùng lớp.',
      theory: 'classmate là noun chỉ người học cùng lớp với con.',
      example: 'a good classmate.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q03', stage: 'word',
      vi: 'Thầy: quyết định / xác định — động từ (verb). Con gõ từ tiếng Anh.',
      en: 'decide',
      reason: 'Thầy: Đúng rồi con. decide là động từ mang nghĩa quyết định/xác định.',
      theory: 'Trong hướng dẫn bài đọc, decide whether ... = xác định xem ... có đúng hay không.',
      example: 'decide whether the statements are true or false.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q04', stage: 'word',
      vi: 'Thầy: các phát biểu / nhận định — danh từ số nhiều (plural noun). Con gõ đúng từ tiếng Anh.',
      en: 'statements',
      reason: 'Thầy: Đúng rồi con. statements là plural noun vì bài có nhiều nhận định cần kiểm tra.',
      theory: 'statement = một phát biểu; statements = nhiều phát biểu. Khi làm T/F, mỗi statement phải được kiểm bằng evidence.',
      example: 'five statements.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q05', stage: 'word',
      vi: 'Thầy: hay giúp đỡ — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'helpful',
      reason: 'Thầy: Đúng rồi con. helpful là adjective miêu tả người hay giúp đỡ.',
      theory: 'helpful nằm trong phần IS của chart, tức là một phẩm chất của good classmate.',
      example: 'A good classmate is helpful.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q06', stage: 'word',
      vi: 'Thầy: có trách nhiệm — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'responsible',
      reason: 'Thầy: Đúng rồi con. responsible là adjective mang nghĩa có trách nhiệm.',
      theory: 'responsible là Tier 2 adjective thường dùng khi đánh giá phẩm chất con người.',
      example: 'A responsible student does what he or she should do.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q07', stage: 'word',
      vi: 'Thầy: biết tôn trọng / lễ phép — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'respectful',
      reason: 'Thầy: Đúng rồi con. respectful là adjective chỉ thái độ tôn trọng.',
      theory: 'respectful nằm trong phần IS, đối lập về sắc thái với các phẩm chất xấu ở IS NOT.',
      example: 'A good classmate is respectful.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q08', stage: 'word',
      vi: 'Thầy: thô lỗ — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'rude',
      reason: 'Thầy: Đúng rồi con. rude là adjective và trong chart nó nằm dưới IS NOT.',
      theory: 'Khi làm T/F, không chỉ nhìn keyword rude; phải đọc heading chứa keyword: IS NOT.',
      example: 'A good classmate is not rude.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q09', stage: 'word',
      vi: 'Thầy: thiếu kiên nhẫn — tính từ (adj.). Con gõ từ tiếng Anh.',
      en: 'impatient',
      reason: 'Thầy: Đúng rồi con. impatient = thiếu kiên nhẫn.',
      theory: 'impatient nằm dưới IS NOT. Prefix im- ở đây tạo nghĩa phủ định của patient.',
      example: 'A good classmate is not impatient.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q10', stage: 'word',
      vi: 'Thầy: kẻ bắt nạt — danh từ (noun). Con gõ từ tiếng Anh.',
      en: 'bully',
      reason: 'Thầy: Đúng rồi con. bully là noun chỉ kẻ bắt nạt.',
      theory: 'Trong chart, a bully nằm dưới IS NOT. Đây là keyword trap quan trọng của câu cuối.',
      example: 'a bully.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q11', stage: 'word',
      vi: 'Thầy: hỗ trợ — động từ (verb). Con gõ từ tiếng Anh.',
      en: 'support',
      reason: 'Thầy: Đúng rồi con. support là verb mang nghĩa hỗ trợ.',
      theory: 'Statement có thể dùng từ không xuất hiện y hệt trong chart. Khi đó con phải tìm paraphrase/evidence cùng nghĩa thay vì đòi exact keyword.',
      example: 'help and support you.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q12', stage: 'word',
      vi: 'Thầy: sức khỏe — danh từ (noun). Con gõ từ tiếng Anh.',
      en: 'health',
      reason: 'Thầy: Đúng rồi con. health là noun mang nghĩa sức khỏe.',
      theory: 'Một statement có thể dùng health trong khi chart dùng câu hỏi “How are you?”. Con phải xét meaning match.',
      example: 'ask about your health.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q13', stage: 'word',
      vi: 'Thầy: giờ ra chơi — danh từ (noun). Con gõ từ tiếng Anh.',
      en: 'recess',
      reason: 'Thầy: Đúng rồi con. recess = giờ ra chơi.',
      theory: 'Trong bài này recess và break time có thể diễn đạt cùng thời điểm nghỉ giữa giờ. Đây là synonym/paraphrase clue.',
      example: 'play at recess.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q14', stage: 'word',
      vi: 'Thầy: mời — động từ ngôi thứ ba số ít (V-s). Con gõ đúng dạng tiếng Anh.',
      en: 'invites',
      reason: 'Thầy: Đúng rồi con. invites là V-s vì chart dùng “invites you to ...”.',
      theory: 'invite someone to + verb = mời ai làm gì. Con nhớ đúng surface form trong chart: invites.',
      example: 'invites you to play.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q15', stage: 'word',
      vi: 'Thầy: không bao giờ — trạng từ (adverb). Con gõ từ tiếng Anh.',
      en: 'never',
      reason: 'Thầy: Đúng rồi con. never là adverb phủ định rất mạnh.',
      theory: 'Trong T/F, never là absolute/negation signal. Chỉ cần chart đưa một counterexample phù hợp, statement có never có thể bị bác bỏ.',
      example: 'never say thank you.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q16', stage: 'word',
      vi: 'Thầy: thỉnh thoảng — trạng từ (adverb). Con gõ từ tiếng Anh.',
      en: 'sometimes',
      reason: 'Thầy: Đúng rồi con. sometimes = thỉnh thoảng.',
      theory: 'sometimes không làm một hành vi xấu trở thành phẩm chất tốt. Con vẫn phải kiểm hành vi đó nằm dưới IS hay IS NOT.',
      example: 'bullies you sometimes.'
    }),

    typing({
      id: 'g6u1-mlh-tf-q17', stage: 'phrase',
      vi: 'Thầy: một người bạn cùng lớp tốt — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'a good classmate',
      reason: 'Thầy: Đúng rồi con. Đây là chủ thể chung của cả chart.',
      theory: 'Ở chunk, Thầy không cho POS. Con dùng nghĩa + số từ để recall nguyên cụm.',
      example: 'a good classmate.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q18', stage: 'phrase',
      vi: 'Thầy: giúp đỡ người khác — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'helps others',
      reason: 'Thầy: Đúng rồi con. helps others nằm trong phần DOES.',
      theory: 'Khi statement dùng support, con có thể tìm evidence gần nghĩa như helps others thay vì đòi từ giống hệt.',
      example: 'DOES → helps others.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q19', stage: 'phrase',
      vi: 'Thầy: học/làm việc chăm chỉ — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'works hard',
      reason: 'Thầy: Đúng rồi con. works hard nằm trong phần DOES.',
      theory: 'Không phải evidence nào cùng chủ đề cũng chứng minh statement. works hard chỉ chứng minh sự chăm chỉ, không tự động chứng minh mọi hành vi khác.',
      example: 'DOES → works hard.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q20', stage: 'phrase',
      vi: 'Thầy: cố gắng hết sức — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'tries his/her best',
      reason: 'Thầy: Đúng rồi con. tries his/her best là evidence quan trọng cho statement 1.',
      theory: 'Một statement có thể cần combined evidence: con ghép hai mảnh thông tin trong chart để kiểm ý.',
      example: 'tries his/her best + helps others.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q21', stage: 'phrase',
      vi: 'Thầy: nói “cảm ơn” — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'says thank you',
      reason: 'Thầy: Đúng rồi con. Đây là mảnh nghĩa giúp con nhận ra contradiction với never.',
      theory: 'Nếu statement nói never say thank you nhưng chart có SAYS → “Thank you”, evidence trực tiếp bác bỏ statement.',
      example: 'SAYS → “Thank you”.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q22', stage: 'phrase',
      vi: 'Thầy: “Bạn khỏe không?” / “Bạn thế nào?” — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'how are you',
      reason: 'Thầy: Đúng rồi con. “How are you?” là câu hỏi thăm tình trạng của người khác.',
      theory: 'Paraphrase match không cần lặp exact keyword. health có thể được diễn đạt bằng câu hỏi thăm “How are you?”.',
      example: 'SAYS → “How are you?”'
    }),
    typing({
      id: 'g6u1-mlh-tf-q23', stage: 'phrase',
      vi: 'Thầy: chơi vào giờ ra chơi — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'play at recess',
      reason: 'Thầy: Đúng rồi con. play at recess là mảnh chart dùng ở statement 4.',
      theory: 'recess ≈ break time trong ngữ cảnh trường học. Khác chữ chưa chắc khác nghĩa.',
      example: 'invites you to play at recess.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q24', stage: 'phrase',
      vi: 'Thầy: một thời gian dài — cụm 3 từ. Con tự gõ đủ 3 từ tiếng Anh.',
      en: 'a long time',
      reason: 'Thầy: Đúng rồi con. Đây là cụm thời gian xuất hiện trong statement 3.',
      theory: 'Khi statement có thêm context thời gian, con vẫn phải tìm phần proposition chính được chart hỗ trợ hay bác bỏ.',
      example: 'after a long time.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q25', stage: 'phrase',
      vi: 'Thầy: giờ nghỉ / giờ ra chơi — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'break time',
      reason: 'Thầy: Đúng rồi con. break time gần nghĩa với recess trong ngữ cảnh trường học.',
      theory: 'Synonym/paraphrase trap: statement và chart có thể dùng hai cách nói khác nhau cho cùng một ý.',
      example: 'break time ≈ recess.'
    }),
    typing({
      id: 'g6u1-mlh-tf-q26', stage: 'phrase',
      vi: 'Thầy: một kẻ bắt nạt — cụm 2 từ. Con tự gõ đủ 2 từ tiếng Anh.',
      en: 'a bully',
      reason: 'Thầy: Đúng rồi con. Nhưng nhớ: trong chart cụm này nằm dưới heading IS NOT.',
      theory: 'Keyword không đủ. Con phải đọc quan hệ giữa keyword và heading. IS NOT → a bully có nghĩa good classmate không phải kẻ bắt nạt.',
      example: 'IS NOT → a bully.'
    }),

    evidenceMcq({
      id: 'g6u1-mlh-tf-q27',
      prompt: '1. A good classmate always tries his/her best to help and support you.',
      correctChoiceId: 'true-evidence',
      choices: [
        {
          id: 'true-evidence',
          text: 'TRUE — Chart có “helps others” và “tries his/her best”; hai evidence cùng hỗ trợ ý của statement.',
          feedback: 'Thầy: Đúng. Con đã dùng combined evidence thay vì đòi một câu giống hệt statement.'
        },
        {
          id: 'true-trap',
          text: 'TRUE — “works hard” có nghĩa là luôn luôn giúp riêng bạn.',
          feedback: 'Thầy: Verdict TRUE có thể đúng, nhưng lý do này sai. “works hard” chỉ nói chăm chỉ; nó không có nghĩa “luôn giúp riêng bạn”.'
        },
        {
          id: 'false-trap-keyword',
          text: 'FALSE — Chart không có chính xác từ “support”, nên statement không được chứng minh.',
          feedback: 'Thầy: Đây là exact-keyword trap. Reading không yêu cầu lặp đúng một từ; “helps others” có thể support cùng ý.'
        },
        {
          id: 'false-trap-meaning',
          text: 'FALSE — “helps others” nghĩa là giúp người khác nên loại trừ việc giúp bạn.',
          feedback: 'Thầy: Sai logic. “others” không loại trừ người đang đọc; chart đang mô tả hành vi giúp đỡ nói chung.'
        }
      ],
      reason: 'Thầy: TRUE. EVIDENCE là “helps others” + “tries his/her best”. Hai mảnh thông tin cùng match với ý cố gắng giúp và hỗ trợ người khác.',
      matchType: 'COMBINED EVIDENCE — ghép “helps others” với “tries his/her best” để xác nhận ý',
      trapType: 'EXACT KEYWORD TRAP — không thấy chữ support không đồng nghĩa với FALSE',
      example: 'STATEMENT → support/help; CHART → helps others + tries his/her best.'
    }),
    evidenceMcq({
      id: 'g6u1-mlh-tf-q28',
      prompt: '2. A good classmate will never says “thank you” if you help him/her.',
      correctChoiceId: 'false-evidence',
      choices: [
        {
          id: 'true-trap-invented',
          text: 'TRUE — Một người helpful thì không cần nói “Thank you”.',
          feedback: 'Thầy: Đây là invented-information trap. Chart không hề nói người helpful thì không cần cảm ơn.'
        },
        {
          id: 'true-trap-condition',
          text: 'TRUE — Chart chỉ nói “Thank you” khi người đó không được giúp.',
          feedback: 'Thầy: Chart không hề cho điều kiện này. Con vừa thêm thông tin không có trong evidence.'
        },
        {
          id: 'false-evidence',
          text: 'FALSE — Phần SAYS ghi rõ “Thank you”, trực tiếp mâu thuẫn với từ “never”.',
          feedback: 'Thầy: Đúng. Một evidence “SAYS → Thank you” đã đủ bác bỏ claim “never say thank you”.'
        },
        {
          id: 'false-trap-irrelevant',
          text: 'FALSE — Vì chart có từ “Please”.',
          feedback: 'Thầy: Verdict FALSE đúng nhưng reason sai. “Please” không phải evidence bác bỏ “never say Thank you”.'
        }
      ],
      reason: 'Thầy: FALSE. Statement có never, nhưng chart trực tiếp ghi SAYS → “Thank you”. Đây là contradiction rõ ràng.',
      matchType: 'CONTRADICTION — “never say thank you” bị bác bỏ bởi “SAYS → Thank you”',
      trapType: 'NEGATION / ABSOLUTE-WORD TRAP — never đảo nghĩa và chỉ cần một counterexample là đủ bác bỏ',
      example: 'never say “Thank you” ↔ SAYS → “Thank you”.'
    }),
    evidenceMcq({
      id: 'g6u1-mlh-tf-q29',
      prompt: '3. A good classmate will ask you about your health if he/she sees you after a long time.',
      correctChoiceId: 'true-evidence',
      choices: [
        {
          id: 'true-evidence',
          text: 'TRUE — “How are you?” là câu hỏi thăm người kia đang thế nào, match với ý hỏi thăm health/well-being.',
          feedback: 'Thầy: Đúng. Con nhận ra paraphrase: chart không dùng chữ health nhưng dùng “How are you?”.'
        },
        {
          id: 'true-trap-wrong-quote',
          text: 'TRUE — “I’m sorry” có nghĩa là hỏi thăm sức khỏe.',
          feedback: 'Thầy: Verdict TRUE không đủ. “I’m sorry” là xin lỗi/chia sẻ, không phải evidence cho việc hỏi thăm health.'
        },
        {
          id: 'false-trap-keyword',
          text: 'FALSE — Chart không có chính xác từ “health”.',
          feedback: 'Thầy: Đây là exact-keyword trap. “How are you?” có thể diễn đạt ý hỏi thăm tình trạng/sức khỏe mà không dùng chữ health.'
        },
        {
          id: 'false-trap-meaning',
          text: 'FALSE — “How are you?” hoàn toàn không liên quan đến việc hỏi thăm người khác.',
          feedback: 'Thầy: Sai meaning. “How are you?” chính là một câu hỏi thăm tình trạng của người đối diện.'
        }
      ],
      reason: 'Thầy: TRUE theo intended reading của bài. EVIDENCE là SAYS → “How are you?”, một paraphrase của việc hỏi thăm health/well-being; cụm after a long time là context của statement và không bị chart mâu thuẫn.',
      matchType: 'PARAPHRASE — “How are you?” match ý hỏi thăm health/well-being',
      trapType: 'EXACT KEYWORD TRAP — khác wording không có nghĩa khác meaning',
      example: 'health/well-being ↔ “How are you?”'
    }),
    evidenceMcq({
      id: 'g6u1-mlh-tf-q30',
      prompt: '4. A good classmate plays with you at break time.',
      correctChoiceId: 'true-evidence',
      choices: [
        {
          id: 'true-evidence',
          text: 'TRUE — “invites you to play at recess” match ý chơi với bạn vào break time; recess ≈ break time.',
          feedback: 'Thầy: Đúng. Con đã dùng synonym/paraphrase match: recess ≈ break time.'
        },
        {
          id: 'true-trap-irrelevant',
          text: 'TRUE — “works hard” có nghĩa là chơi với bạn vào giờ nghỉ.',
          feedback: 'Thầy: Verdict TRUE nhưng reason sai. “works hard” không chứng minh hành động chơi cùng bạn.'
        },
        {
          id: 'false-trap-wording',
          text: 'FALSE — Chart viết “recess” còn statement viết “break time”, nên hai ý khác nhau.',
          feedback: 'Thầy: Đây là synonym trap. Trong ngữ cảnh trường học, recess và break time cùng chỉ thời gian nghỉ/ra chơi.'
        },
        {
          id: 'false-trap-action',
          text: 'FALSE — “invites you to play” không liên quan đến việc chơi cùng bạn.',
          feedback: 'Thầy: Sai meaning. Mời bạn chơi ở recess trực tiếp support ý tương tác/chơi cùng bạn vào giờ nghỉ.'
        }
      ],
      reason: 'Thầy: TRUE. EVIDENCE là DOES → “invites you to play at recess”. recess ≈ break time, nên statement là paraphrase phù hợp.',
      matchType: 'SYNONYM + PARAPHRASE — recess ≈ break time; invites you to play support ý plays with you',
      trapType: 'DIFFERENT-WORDING TRAP — khác từ nhưng cùng nghĩa',
      example: 'play at recess ≈ play at break time.'
    }),
    evidenceMcq({
      id: 'g6u1-mlh-tf-q31',
      prompt: '5. A good classmate bullies you sometimes.',
      correctChoiceId: 'false-evidence',
      choices: [
        {
          id: 'true-trap-keyword',
          text: 'TRUE — Chart có từ “a bully”, nên statement đúng.',
          feedback: 'Thầy: Đây là keyword-without-context trap. Con tìm thấy bully nhưng chưa đọc heading: nó nằm dưới IS NOT.'
        },
        {
          id: 'true-trap-frequency',
          text: 'TRUE — Vì “sometimes” nhẹ hơn “always”, nên bắt nạt thỉnh thoảng vẫn là good classmate.',
          feedback: 'Thầy: Sai logic. Frequency không thay đổi evidence: chart nói good classmate IS NOT a bully.'
        },
        {
          id: 'false-evidence',
          text: 'FALSE — “a bully” nằm dưới IS NOT; chart nói good classmate không phải kẻ bắt nạt.',
          feedback: 'Thầy: Đúng. Con đã đọc cả keyword lẫn heading chứa nó.'
        },
        {
          id: 'false-trap-invented',
          text: 'FALSE — Vì chart nói good classmate chỉ bắt nạt vào giờ recess.',
          feedback: 'Thầy: Verdict FALSE đúng nhưng reason này bị bịa. Chart không nói bắt nạt vào giờ recess.'
        }
      ],
      reason: 'Thầy: FALSE. EVIDENCE phải đọc cả cụm quan hệ: IS NOT → a bully. Chỉ nhìn thấy chữ bully rồi chọn TRUE là dính bẫy.',
      matchType: 'CONTRADICTION BY HEADING — IS NOT → a bully trực tiếp bác bỏ statement',
      trapType: 'KEYWORD-WITHOUT-CONTEXT TRAP — keyword đúng nhưng heading đảo nghĩa',
      example: 'IS NOT → a bully.'
    })
  ])
});
