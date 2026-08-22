const freeze = value => Object.freeze(value);
const LABELS = freeze(['A','B','C','D']);

function spec(id, correct, texts, reason, evidence) {
  return freeze({ id, correct, texts:freeze(texts), reason, evidence });
}

const SPECS = freeze([
  spec('g6-u2-wb-c3-01','B',['Mira, who are you live with?','Mira, who do you live with?','Mira, who does you live with?','Mira, who you live with do?'],"B đúng: live là hành động ở hiện tại đơn với you nên dùng do + you + live. A sai vì are không đứng trước live theo cách này. C sai vì does không đi với you. D sai vì trật tự từ của câu hỏi bị đảo.",'Khung cần nhớ: Who do you live with?'),
  spec('g6-u2-wb-c3-02','A',['I live with my parents. And you?','I lives with my parents. And you?','I live in my parents. And you?','I am live with my parents. And you?'],"A đúng: với I dùng live, và live with somebody = sống cùng ai. B sai vì I không đi với lives. C sai vì phải là live with my parents, không phải live in my parents. D sai vì không dùng am + live ở câu này.",'Khung cần nhớ: I live with + người mình sống cùng.'),
  spec('g6-u2-wb-c3-03','C',['I live with my parents and my younger brother. Does you live in a house?','I live with my parents and my younger brother. Do you lives in a house?','I live with my parents and my younger brother. Do you live in a house?','I live with my parents and my younger brother. Are you live in a house?'],"C đúng: câu kể dùng I live with..., còn câu hỏi dùng Do you live...? A sai vì does không đi với you. B sai vì sau do phải là live nguyên mẫu. D sai vì are không dùng để hỏi hành động live theo cấu trúc này.",'Khung cần nhớ: Do + you + live ...?'),
  spec('g6-u2-wb-c3-04','D',["No, I isn't. I live in a flat. Do you live in a house?","No, I don't. I live on a flat. Do you live in a house?","No, I don't. I live in a flat. Does you live in a house?","No, I don't. I live in a flat. Do you live in a house?"],"D đúng: Do you...? được trả lời No, I don't; nơi ở dùng live in a flat; hỏi lại dùng Do you live...? A sai vì I isn't không trả lời câu hỏi do. B sai vì phải là in a flat. C sai vì does không đi với you.","Ba mảnh đúng: No, I don't. · live in a flat · Do you live...?"),
  spec('g6-u2-wb-c3-05','B',['Yes, I am. Does your flat big?','Yes, I do. Is your flat big?','Yes, I do. Does your flat big?','Yes, I am. Is your flat big?'],"B đúng: câu trước là Do you live...? nên đáp Yes, I do. Big là đặc điểm nên hỏi Is your flat big? A và D sai ở phần trả lời Yes, I am; C sai vì không dùng does để hỏi tính từ big.",'Hành động → do; đặc điểm với be → Is your flat big?'),
  spec('g6-u2-wb-c3-06','D',["No, it doesn't. There is a living room, two bedrooms, a bathroom and a kitchen.","No, it isn't. There are a living room, two bedrooms, a bathroom and a kitchen.","No, it isn't. There is a living room, two bedroom, a bathroom and a kitchen.","No, it isn't. There is a living room, two bedrooms, a bathroom and a kitchen."],"D đúng: Is your flat big? → No, it isn't. Danh sách bắt đầu bằng a living room nên mẫu nguồn dùng There is; two bedrooms phải có -s. A sai vì doesn't không trả lời câu hỏi với is. B sai vì are đứng trước a living room. C sai vì two cần bedrooms số nhiều.","Khung nguồn: No, it isn't. There is a living room, two bedrooms..."),

  spec('g6-u2-wb-d3b-01','B',['It is small and comfortable.','It is big and cozy.','It is small but cozy.','It is big and untidy.'],"B đúng: câu hỏi hỏi Tom, và email Tom nói phòng big, cozy. A lấy small/comfortable của Vy. C trộn small của Vy với cozy của Tom. D có big đúng nhưng untidy không có trong email Tom.","Tom: 'It's big' và 'It's cozy.'"),
  spec('g6-u2-wb-d3b-02','D',['A bed, a wardrobe, a chair, a desk, a lamp, a family picture and a bookshelf.','A bed, a wardrobe, a desk, a chair, a lamp and a television.','A bed, a desk, a chair, a bookshelf, a lamp and three posters.','A bed, a wardrobe, a desk, a chair, a lamp and three posters.'],"D đúng: Vy có bed, wardrobe, desk, chair, lamp và three posters. A là gần như danh sách của Tom. B thêm television không có trong email. C lấy bookshelf của Tom và bỏ wardrobe của Vy.",'Vy → bed · wardrobe · desk · chair · lamp · three posters.'),
  spec('g6-u2-wb-d3b-03','A',['A bed, a wardrobe, a chair, a desk, a lamp, a family picture and a bookshelf.','A bed, a wardrobe, a desk, a chair, a lamp and three posters.','A bed, a chair, a desk, a television, a picture and a bookshelf.','A bed, a wardrobe, a lamp, three posters and a bookshelf.'],"A đúng: đây là các đồ Tom kể trong email. B là danh sách của Vy. C thêm television và thiếu wardrobe. D có three posters nhưng Tom nói rõ I don't have any posters.",'Tom có family picture và bookshelf; Tom không có posters.'),
  spec('g6-u2-wb-d3b-04','C',['No. She thinks her bedroom is too small.','No. She does not like the posters in her room.','Yes. She thinks her bedroom is comfortable.','Yes. She thinks her bedroom is very big.'],"C đúng: Vy nói bedroom là favourite room và nói It's comfortable. A dùng chi tiết small có thật nhưng biến nó thành lý do không thích. B trái với việc Vy thích posters. D lấy big của Tom.","Vy: 'My bedroom is my favourite room' và 'It's comfortable.'"),
  spec('g6-u2-wb-d3b-05','B',['No. He thinks his bedroom is too small.','Yes. He thinks his bedroom is cozy.','Yes. He likes the three posters on the wall.','No. He does not like the bookshelf in his room.'],"B đúng: Tom viết I love my room và It's cozy. A lấy small của Vy. C sai vì Tom nói không có posters. D lấy bookshelf có thật nhưng tự thêm ý Tom không thích nó.","Tom: 'I love my room. It's cozy.'"),

  spec('g6-u2-wb-e1-01','B',["There aren't a bookshelf in my bedroom.","There isn't a bookshelf in my bedroom.","There doesn't have a bookshelf in my bedroom.","There isn't bookshelf in my bedroom."],"B đúng: a bookshelf là một vật nên dùng There isn't a bookshelf.... A sai vì aren't không đi với a bookshelf. C sai vì không dùng There doesn't have. D thiếu a trước bookshelf.","don't have a bookshelf ↔ There isn't a bookshelf."),
  spec('g6-u2-wb-e1-02','C',['There are a sink, a fridge, a cooker and a cupboard in our kitchen.','There have a sink, a fridge, a cooker and a cupboard in our kitchen.','There is a sink, a fridge, a cooker and a cupboard in our kitchen.','There is a sink, a fridge, a cooker and a cupboard on our kitchen.'],"C đúng theo mẫu nguồn: danh sách bắt đầu bằng a sink nên dùng There is, và vị trí là in our kitchen. A dùng are trước a sink. B dùng There have sai cấu trúc. D dùng on our kitchen sai giới từ.",'We have ... in our kitchen ↔ There is ... in our kitchen.'),
  spec('g6-u2-wb-e1-03','A',["Mai's notebook is on the table.",'Mai notebook is on the table.',"Mais' notebook is on the table.",'Mai is notebook on the table.'],"A đúng: notebook của Mai → Mai's notebook. B thiếu 's sở hữu. C đặt dấu sở hữu sai với tên Mai. D biến is thành cấu trúc sai và làm mất nghĩa sở hữu.","Mai has a notebook ↔ Mai's notebook."),
  spec('g6-u2-wb-e1-04','C',['The microwave is in front of the dog.','The microwave is next to the dog.','The microwave is behind the dog.','The microwave is between the dog.'],"C đúng: dog ở in front of microwave thì đổi góc nhìn, microwave ở behind dog. A đảo người/vật nhưng không đổi giới từ nên sai nghĩa. B là bên cạnh. D vừa sai nghĩa vừa thiếu mốc thứ hai sau between.",'in front of ↔ behind khi đổi góc nhìn.'),
  spec('g6-u2-wb-e1-05','D',['I like the living room good in the house.','I like the living room more in the house.','I like the living room favourite in the house.','I like the living room best in the house.'],"D đúng: favourite = thích nhất, nên đổi sang like ... best. A dùng good sai vị trí. B chỉ mang nghĩa thích hơn, chưa phải thích nhất. C không dùng favourite sau động từ like theo cách này.",'My favourite room is X ↔ I like X best.')
]);

const adaptations = new Map(SPECS.map(entry => [entry.id, entry]));

function choices(texts) {
  return freeze(texts.map((text, index) => freeze({ id:LABELS[index], text, preserveOrder:true })));
}

function adaptItem(item) {
  const entry = adaptations.get(item?.id);
  if (!entry) return item;
  const { vi, en, acceptedAnswers, typingUi, responseMode, teachingFeedback, ...rest } = item;
  const correctText = entry.texts[LABELS.indexOf(entry.correct)] ?? '';
  return freeze({
    ...rest,
    type:'mcq',
    prompt:vi,
    choices:choices(entry.texts),
    correctChoiceId:entry.correct,
    digitalAdaptation:freeze({ sourceResponseType:'written_answer', adaptedResponseType:'mcq', reason:'Fixed long answer converted to A/B/C/D for deterministic grading; source prompt and target meaning are preserved.' }),
    teachingFeedback:freeze({ ...(teachingFeedback ?? {}), correctLabel:correctText, reason:entry.reason, example:entry.evidence })
  });
}

export function adaptG6U2WorkbookLongAnswers(key, content) {
  if (!['c3','d3b','e1'].includes(String(key ?? '').toLowerCase())) return content;
  return freeze({ ...content, items:freeze(content.items.map(adaptItem)) });
}
