const freeze = value => Object.freeze(value);
const LETTERS = freeze(['A','B','C','D']);
const ANSWER_POSITIONS = freeze([1,3,0,2]);
const theorySupport = freeze({ access:'after_submit' });

const pair = (en, vi) => freeze([en, vi]);
const lesson = (vocab, phrases) => freeze({ vocab:freeze(vocab), phrases:freeze(phrases) });

// Mỗi lesson chỉ nạp semantic core thật sự cần để hiểu chính bài SBT.
// Với bài kiểm recall từ (vd. U1 B3, U3 B2), preload dùng từ khóa của định nghĩa
// thay vì dạy trước chính đáp án cần tự nhớ.
const SPECS = freeze({
  u1: freeze({
    a1: lesson([
      pair('subject','môn học'), pair('computer','máy tính'), pair('classmate','bạn cùng lớp'), pair('homework','bài tập về nhà')
    ],[
      pair('favourite subject','môn học yêu thích'), pair('use a computer','sử dụng máy tính'), pair('new classmate','bạn cùng lớp mới'), pair('do homework','làm bài tập về nhà')
    ]),
    b2: lesson([
      pair('library','thư viện'), pair('break','giờ ra chơi'), pair('test','bài kiểm tra'), pair('farm','nông trại')
    ],[
      pair('study quietly','học yên lặng'), pair('do morning exercise','tập thể dục buổi sáng'), pair('have homework','có bài tập về nhà'), pair('play team games','chơi trò chơi theo đội')
    ]),
    b3: lesson([
      pair('wheel','bánh xe'), pair('blank','để trống'), pair('borrow','mượn'), pair('decoration','đồ/sự trang trí')
    ],[
      pair('long seat','ghế dài'), pair('look up new words','tra từ mới'), pair('electronic device','thiết bị điện tử'), pair('put it on a wall','treo/đặt nó lên tường')
    ]),
    b4: lesson([
      pair('canteen','căng tin'), pair('prefer','thích hơn'), pair('seaside','vùng biển'), pair('pen pal','bạn qua thư')
    ],[
      pair('write to a pen pal','viết thư cho bạn qua thư'), pair('have lunch in the canteen','ăn trưa ở căng tin'), pair('go swimming','đi bơi'), pair('go camping','đi cắm trại')
    ]),
    b5: lesson([
      pair('housework','việc nhà'), pair('international','quốc tế'), pair('subject','môn học'), pair('share','chia sẻ')
    ],[
      pair('English lessons','các tiết tiếng Anh'), pair('ball games','trò chơi với bóng'), pair('share things with each other','chia sẻ đồ với nhau'), pair('have bread and eggs for breakfast','ăn bánh mì và trứng vào bữa sáng')
    ]),
    b6: lesson([
      pair('always','luôn luôn'), pair('usually','thường'), pair('hardly ever','hầu như không bao giờ'), pair('celebrate','tổ chức/kỷ niệm')
    ],[
      pair('celebrate my birthday','tổ chức sinh nhật của tôi'), pair('get up','thức dậy'), pair('in the evening','vào buổi tối'), pair('at six forty-five','lúc 6 giờ 45')
    ]),
    c1: lesson([
      pair('introduce','giới thiệu'), pair('friend','bạn'), pair('meet','gặp'), pair('new','mới')
    ],[
      pair('This is ...','Đây là ...'), pair('Nice to meet you','Rất vui được gặp bạn'), pair('Nice to meet you, too','Mình cũng rất vui được gặp bạn'), pair('my new friend','người bạn mới của tôi')
    ]),
    c3: lesson([
      pair('location','vị trí'), pair('subject','môn học'), pair('activity','hoạt động'), pair('number','số lượng')
    ],[
      pair('the name of your school','tên trường của em'), pair('the number of classes','số lớp học'), pair('school activities','các hoạt động ở trường'), pair('things you like about your school','những điều em thích về trường')
    ]),
    d1: lesson([
      pair('cloakroom','phòng để áo khoác'), pair('raincoat','áo mưa'), pair('laboratory','phòng thí nghiệm'), pair('workshop','phòng/xưởng thực hành')
    ],[
      pair('take off','cởi ra'), pair('on duty','đang trực'), pair('water the flowers','tưới hoa'), pair('clean the blackboard','lau bảng')
    ]),
    d2: lesson([
      pair('nervous','lo lắng'), pair('classmate','bạn cùng lớp'), pair('friendly','thân thiện'), pair('geography','môn Địa lí')
    ],[
      pair('new to me','mới đối với tôi'), pair('favourite subject','môn học yêu thích'), pair('join the judo club','tham gia câu lạc bộ judo'), pair('do homework','làm bài tập về nhà')
    ]),
    d3: lesson([
      pair('author','tác giả'), pair('title','tiêu đề'), pair('catalogue','danh mục'), pair('librarian','thủ thư')
    ],[
      pair('look for','tìm kiếm'), pair('shelf mark','ký hiệu giá sách'), pair('subject catalogue','danh mục theo chủ đề'), pair('take a book out of the library','mượn/mang sách ra khỏi thư viện')
    ]),
    e1: lesson([
      pair('favourite','yêu thích'), pair('attend','theo học'), pair('teacher','giáo viên'), pair('geography','môn Địa lí')
    ],[
      pair('favourite subjects','những môn học yêu thích'), pair('kind of music','thể loại nhạc'), pair('go out with friends','đi chơi với bạn'), pair('music lessons','các buổi học nhạc')
    ]),
    e2: lesson([
      pair('introduce','giới thiệu'), pair('live','sống'), pair('coloured pencils','bút chì màu'), pair('teacher','giáo viên')
    ],[
      pair('English teacher','giáo viên tiếng Anh'), pair('There are ...','Có nhiều ...'), pair('introduce A to B','giới thiệu A với B'), pair('Shall I ...?','Để mình ... nhé?')
    ]),
    e3: lesson([
      pair('rule','quy định'), pair('prepared','sẵn sàng'), pair('pair','cặp'), pair('group','nhóm')
    ],[
      pair('arrive on time','đến đúng giờ'), pair('listen carefully','lắng nghe cẩn thận'), pair('work in pairs or groups','làm việc theo cặp hoặc nhóm'), pair('speak English','nói tiếng Anh')
    ])
  }),

  u2: freeze({
    a1: lesson([
      pair('bed','giường'), pair('cap','mũ'), pair('poster','áp phích'), pair('villa','biệt thự')
    ],[
      pair('a big bed','một chiếc giường lớn'), pair('wear a cap','đội một chiếc mũ'), pair('put up a poster','treo một tấm áp phích'), pair('live in a villa','sống trong một biệt thự')
    ]),
    a2: lesson([
      pair('cup','cái cốc'), pair('book','sách'), pair('ruler','thước'), pair('chair','ghế')
    ],[
      pair('three cups','ba cái cốc'), pair('read books','đọc sách'), pair('school rulers','những chiếc thước học sinh'), pair('wooden chairs','những chiếc ghế gỗ')
    ]),
    b3: lesson([
      pair('sofa','ghế sofa'), pair('toilet','nhà vệ sinh/bồn cầu'), pair('flat','căn hộ'), pair('cousin','anh/chị/em họ')
    ],[
      pair('types of houses','các kiểu nhà'), pair('family members','các thành viên gia đình'), pair('furniture in a room','đồ nội thất trong phòng'), pair('immediate family','gia đình gần/gia đình ruột thịt')
    ]),
    b4: lesson([
      pair('study room','phòng học'), pair('bedroom','phòng ngủ'), pair('uncle','chú/cậu/bác'), pair('behind','phía sau')
    ],[
      pair('teacher of English','giáo viên tiếng Anh'), pair('running in the park','đang chạy trong công viên'), pair('behind the computer','phía sau máy tính'), pair("my cousin's father",'bố của anh/chị/em họ tôi')
    ]),
    c1: lesson([
      pair('picture','bức tranh'), pair('wall','tường'), pair('dining room','phòng ăn'), pair('beautiful','đẹp')
    ],[
      pair('draw a picture','vẽ một bức tranh'), pair('hang it on the wall','treo nó lên tường'), pair('another picture','một bức tranh khác'), pair('make the room beautiful','làm căn phòng đẹp')
    ]),
    c2: lesson([
      pair('poster','áp phích'), pair('wardrobe','tủ quần áo'), pair('comfortable','thoải mái'), pair('living room','phòng khách')
    ],[
      pair('on the wall','trên tường'), pair('next to a wardrobe','bên cạnh tủ quần áo'), pair('watch TV in the living room','xem TV ở phòng khách'), pair('Do you like ...?','Bạn có thích ... không?')
    ]),
    c3: lesson([
      pair('parents','bố mẹ'), pair('flat','căn hộ'), pair('bathroom','phòng tắm'), pair('kitchen','nhà bếp')
    ],[
      pair('live with','sống cùng'), pair('live in a flat','sống trong căn hộ'), pair('live in a house','sống trong một ngôi nhà'), pair('There is ...','Có một ...')
    ]),
    d1: lesson([
      pair('messy','bừa bộn'), pair('clothes','quần áo'), pair('chopsticks','đũa'), pair('school bag','cặp sách')
    ],[
      pair('on the floor','trên sàn'), pair('near the window','gần cửa sổ'), pair('under the desk','dưới bàn'), pair('tidy up the room','dọn phòng')
    ]),
    d2: lesson([
      pair('comfortable','thoải mái'), pair('poster','áp phích'), pair('lamp','đèn'), pair('bookshelf','giá sách')
    ],[
      pair('buy a new poster','mua một tấm áp phích mới'), pair('on the wall','trên tường'), pair('next to my bed','bên cạnh giường của tôi'), pair('between A and B','ở giữa A và B')
    ]),
    d3b: lesson([
      pair('wardrobe','tủ quần áo'), pair('bookshelf','giá sách'), pair('cozy','ấm cúng'), pair('comfortable','thoải mái')
    ],[
      pair('in front of','ở phía trước'), pair('next to','ở bên cạnh'), pair('family picture','ảnh gia đình'), pair('favourite room','căn phòng yêu thích')
    ]),
    e1: lesson([
      pair('sink','bồn rửa'), pair('fridge','tủ lạnh'), pair('cooker','bếp'), pair('microwave','lò vi sóng')
    ],[
      pair('in front of','ở phía trước'), pair('behind the dog','phía sau con chó'), pair('on the table','trên bàn'), pair('like ... best','thích ... nhất')
    ]),
    e2: lesson([
      pair('bedroom','phòng ngủ'), pair('living room','phòng khách'), pair('beautiful','đẹp'), pair('comfortable','thoải mái')
    ],[
      pair('favourite room','căn phòng yêu thích'), pair('things in the room','những đồ vật trong phòng'), pair('There is / There are','có'), pair('because it is ...','bởi vì nó ...')
    ])
  }),

  u3: freeze({
    a2: lesson([
      pair('bun','bánh mì nhỏ'), pair('plum','quả mận'), pair('bug','con bọ'), pair('bear','con gấu')
    ],[
      pair('plain bun','bánh mì không nhân'), pair('plum bun','bánh mì có mận'), pair('picky people','những người kén chọn'), pair('peanut butter','bơ đậu phộng')
    ]),
    b1: lesson([
      pair('shoulders','vai'), pair('hands','bàn tay'), pair('feet','bàn chân'), pair('hair','tóc')
    ],[
      pair('long hair','tóc dài'), pair('strong arms','cánh tay khỏe'), pair('big eyes','mắt to'), pair('a tall person','một người cao')
    ]),
    b2: lesson([
      pair('attention','sự chú ý'), pair('accident','tai nạn'), pair('mistake','lỗi'), pair('feelings','cảm xúc')
    ],[
      pair('pay attention to','chú ý đến'), pair('make a mistake','mắc lỗi'), pair('original ideas','ý tưởng mới/nguyên bản'), pair("other people's feelings",'cảm xúc của người khác')
    ]),
    b3: lesson([
      pair('careful','cẩn thận'), pair('creative','sáng tạo'), pair('kind','tốt bụng'), pair('shy','nhút nhát')
    ],[
      pair('new ideas','những ý tưởng mới'), pair('check writing twice','kiểm tra bài viết hai lần'), pair('ready to help','sẵn sàng giúp đỡ'), pair('people they do not know','những người các em không quen')
    ]),
    b4: lesson([
      pair('knock','gõ cửa'), pair('letter','lá thư'), pair('homework','bài tập về nhà'), pair('library','thư viện')
    ],[
      pair('call back','gọi lại'), pair('take the dog out for a walk','dắt chó đi dạo'), pair('knock at the door','gõ cửa'), pair('read books in the library','đọc sách trong thư viện')
    ]),
    b5: lesson([
      pair('wear','mặc'), pair('health','sức khỏe'), pair('smile','mỉm cười'), pair('apple','quả táo')
    ],[
      pair('wear a T-shirt and shorts','mặc áo phông và quần short'), pair('play football now','chơi bóng đá ngay bây giờ'), pair('good for our health','tốt cho sức khỏe'), pair('look at me','nhìn tôi')
    ]),
    b6: lesson([
      pair('grandparents','ông bà'), pair('pool','hồ bơi'), pair('poem','bài thơ'), pair('dinner','bữa tối')
    ],[
      pair('at the moment','lúc này'), pair('listen to music','nghe nhạc'), pair('at present','hiện tại/lúc này'), pair('write a poem','viết một bài thơ')
    ]),
    c1: lesson([
      pair('friendly','thân thiện'), pair('patient','kiên nhẫn'), pair('caring','biết quan tâm'), pair('thin','gầy/mảnh')
    ],[
      pair('look like','trông như thế nào / ngoại hình'), pair('be like','là người như thế nào / tính cách'), pair('long black hair','tóc đen dài'), pair('caring and patient','biết quan tâm và kiên nhẫn')
    ]),
    c3: lesson([
      pair('describe','miêu tả'), pair('special','đặc biệt'), pair('family member','thành viên gia đình'), pair('friend','bạn')
    ],[
      pair('special to me','đặc biệt với tôi'), pair('take care of me','chăm sóc tôi'), pair('always helps me','luôn giúp tôi'), pair('one of my friends','một trong những người bạn của tôi')
    ]),
    d1: lesson([
      pair('dishes','bát đĩa'), pair('hair','tóc'), pair('kind','tốt bụng'), pair('funny','vui tính')
    ],[
      pair('wash the dishes','rửa bát'), pair('cook dinner','nấu bữa tối'), pair('make me laugh','làm tôi cười'), pair('all the time','suốt/mọi lúc')
    ]),
    d2: lesson([
      pair('reliable','đáng tin cậy'), pair('similar','giống nhau'), pair('difference','sự khác biệt'), pair('interest','sở thích/mối quan tâm')
    ],[
      pair('lie to somebody','nói dối ai'), pair('listen to somebody','lắng nghe ai'), pair('be there when you need them','ở bên khi bạn cần'), pair('respect the differences','tôn trọng sự khác biệt')
    ]),
    d3: lesson([
      pair('never','không bao giờ'), pair('sometimes','đôi khi'), pair('respect','tôn trọng'), pair('similar','tương tự/giống nhau')
    ],[
      pair('never lie to you','không bao giờ nói dối bạn'), pair('similar interests','sở thích tương tự'), pair('good or bad times','lúc vui hoặc khó khăn'), pair('share happy and sad times','cùng chia sẻ lúc vui buồn')
    ]),
    e1: lesson([
      pair('beginning','mở bài'), pair('middle','thân bài'), pair('end','kết bài'), pair('future','tương lai')
    ],[
      pair('introduce your friend','giới thiệu bạn của em'), pair('give details','đưa thông tin chi tiết'), pair('hope for the future','hy vọng cho tương lai'), pair('close the writing','kết lại bài viết')
    ]),
    e2: lesson([
      pair('appearance','ngoại hình'), pair('personality','tính cách'), pair('astronomy','thiên văn học'), pair('future','tương lai')
    ],[
      pair('best friend','bạn thân nhất'), pair('do homework together','làm bài cùng nhau'), pair('chat about astronomy','nói chuyện về thiên văn'), pair('hope for the future','hy vọng trong tương lai')
    ]),
    e3: lesson([
      pair('competition','cuộc thi'), pair('appearance','ngoại hình'), pair('personality','tính cách'), pair('future','tương lai')
    ],[
      pair('My best friend is ...','Bạn thân nhất của tôi là ...'), pair('I like him / her because ...','Tôi thích bạn ấy vì ...'), pair('We often ... together','Chúng tôi thường ... cùng nhau'), pair('I hope ... in the future','Tôi hy vọng ... trong tương lai')
    ])
  })
});

function assertPhaseEntries(unitKey, lessonKey, phase, entries) {
  if (!Array.isArray(entries) || entries.length !== 4) {
    throw new Error(`G6 ${unitKey} ${lessonKey} ${phase} preload must contain exactly 4 entries`);
  }
  const en = entries.map(entry => entry[0]);
  const vi = entries.map(entry => entry[1]);
  if (new Set(en).size !== 4 || new Set(vi).size !== 4) {
    throw new Error(`G6 ${unitKey} ${lessonKey} ${phase} preload must have unique English and Vietnamese meanings`);
  }
}

function translationItem(unitKey, lessonKey, phase, entries, index) {
  const entry = entries[index];
  const answerPosition = ANSWER_POSITIONS[(index + (phase === 'phrase' ? 2 : 0)) % ANSWER_POSITIONS.length];
  const wrongMeanings = entries.filter((_, candidateIndex) => candidateIndex !== index).map(candidate => candidate[1]);
  const texts = [];
  let wrongIndex = 0;
  for (let position = 0; position < 4; position += 1) {
    texts.push(position === answerPosition ? entry[1] : wrongMeanings[wrongIndex++]);
  }
  const choices = freeze(texts.map((text, choiceIndex) => freeze({ id:LETTERS[choiceIndex], text, preserveOrder:true })));
  const correctChoiceId = LETTERS[answerPosition];
  const label = phase === 'vocab' ? 'TỪ VỰNG' : 'CỤM TỪ';
  return freeze({
    id:`g6-${unitKey}-wb-${lessonKey}-pre-${phase}-${String(index + 1).padStart(2,'0')}`,
    type:'mcq',
    prompt:`${label} · “${entry[0]}” có nghĩa là gì?`,
    choices,
    correctChoiceId,
    learningPhase:phase,
    preloadKind:'english_to_vietnamese',
    theorySupport,
    teachingFeedback:freeze({
      correctLabel:entry[1],
      reason:`“${entry[0]}” = “${entry[1]}”. Con nạp nghĩa này trước để khi vào bài SBT, não tập trung vào cách làm thay vì mắc kẹt ở bước dịch.`,
      theory:phase === 'vocab'
        ? 'Nhìn từ tiếng Anh → gọi nghĩa tiếng Việt. Chọn nghĩa chính xác nhất trong bốn đáp án gần chủ đề.'
        : 'Đọc cả cụm như một khối nghĩa. Đừng dịch từng chữ rời rồi ghép máy móc.',
      example:`${entry[0]} → ${entry[1]}`
    })
  });
}

export function getG6WorkbookPreloadSpec(unitKey, lessonKey) {
  return SPECS[String(unitKey ?? '').toLowerCase()]?.[String(lessonKey ?? '').toLowerCase()] ?? null;
}

export function getG6WorkbookPreloadCount(unitKey, lessonKey) {
  const spec = getG6WorkbookPreloadSpec(unitKey, lessonKey);
  return spec ? spec.vocab.length + spec.phrases.length : 0;
}

export function applyG6WorkbookTranslationPreload(unitKey, lessonKey, content) {
  const normalizedUnit = String(unitKey ?? '').toLowerCase();
  const normalizedLesson = String(lessonKey ?? '').toLowerCase();
  const spec = getG6WorkbookPreloadSpec(normalizedUnit, normalizedLesson);
  if (!spec) throw new Error(`Missing G6 workbook translation preload: ${normalizedUnit}/${normalizedLesson}`);

  assertPhaseEntries(normalizedUnit, normalizedLesson, 'vocab', spec.vocab);
  assertPhaseEntries(normalizedUnit, normalizedLesson, 'phrase', spec.phrases);

  const vocabItems = spec.vocab.map((_, index) => translationItem(normalizedUnit, normalizedLesson, 'vocab', spec.vocab, index));
  const phraseItems = spec.phrases.map((_, index) => translationItem(normalizedUnit, normalizedLesson, 'phrase', spec.phrases, index));
  const sourceItems = (content.items ?? []).map(item => item.learningPhase ? item : freeze({ ...item, learningPhase:'source' }));

  return freeze({
    ...content,
    translationPreload:freeze({
      required:true,
      order:freeze(['vocab','phrase','source']),
      purpose:'Nạp nghĩa từ/cụm của chính bài trước khi xử lý bài SBT.',
      answerLeakPolicy:'Không gắn từ/cụm preload với vị trí đáp án của bài nguồn; bài recall từ dùng từ khóa định nghĩa thay vì dạy trước target answer.'
    }),
    items:freeze([...vocabItems, ...phraseItems, ...sourceItems])
  });
}

export const G6_WORKBOOK_PRELOAD_KEYS = freeze(Object.fromEntries(
  Object.entries(SPECS).map(([unitKey, unitSpecs]) => [unitKey, freeze(Object.keys(unitSpecs))])
));
