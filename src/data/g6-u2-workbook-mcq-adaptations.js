const freeze = value => Object.freeze(value);

const adaptations = freeze({
  'g6-u2-wb-c3-01': freeze({
    correct:'B',
    options:freeze([
      freeze(['A','Mira, who are you live with?']),
      freeze(['B','Mira, who do you live with?']),
      freeze(['C','Mira, who does you live with?']),
      freeze(['D','Mira, who you live with do?'])
    ]),
    reason:"B đúng: live là hành động ở hiện tại đơn với you nên dùng do + you + live. A sai vì are không đứng trước live theo cách này. C sai vì does không đi với you. D sai vì trật tự từ của câu hỏi bị đảo.",
    evidence:'Khung cần nhớ: Who do you live with?'
  }),
  'g6-u2-wb-c3-02': freeze({
    correct:'A',
    options:freeze([
      freeze(['A','I live with my parents. And you?']),
      freeze(['B','I lives with my parents. And you?']),
      freeze(['C','I live in my parents. And you?']),
      freeze(['D','I am live with my parents. And you?'])
    ]),
    reason:"A đúng: với I dùng live, và live with somebody = sống cùng ai. B sai vì I không đi với lives. C sai vì phải là live with my parents, không phải live in my parents. D sai vì không dùng am + live ở câu này.",
    evidence:'Khung cần nhớ: I live with + người mình sống cùng.'
  }),
  'g6-u2-wb-c3-03': freeze({
    correct:'C',
    options:freeze([
      freeze(['A','I live with my parents and my younger brother. Does you live in a house?']),
      freeze(['B','I live with my parents and my younger brother. Do you lives in a house?']),
      freeze(['C','I live with my parents and my younger brother. Do you live in a house?']),
      freeze(['D','I live with my parents and my younger brother. Are you live in a house?'])
    ]),
    reason:"C đúng: câu kể dùng I live with..., còn câu hỏi dùng Do you live...? A sai vì does không đi với you. B sai vì sau do phải là live nguyên mẫu. D sai vì are không dùng để hỏi hành động live theo cấu trúc này.",
    evidence:'Khung cần nhớ: Do + you + live ...?'
  }),
  'g6-u2-wb-c3-04': freeze({
    correct:'D',
    options:freeze([
      freeze(['A',"No, I isn't. I live in a flat. Do you live in a house?"]),
      freeze(['B',"No, I don't. I live on a flat. Do you live in a house?"]),
      freeze(['C',"No, I don't. I live in a flat. Does you live in a house?"]),
      freeze(['D',"No, I don't. I live in a flat. Do you live in a house?"])
    ]),
    reason:"D đúng: Do you...? được trả lời No, I don't; nơi ở dùng live in a flat; hỏi lại dùng Do you live...? A sai vì I isn't không trả lời câu hỏi do. B sai vì phải là in a flat. C sai vì does không đi với you.",
    evidence:"Ba mảnh đúng: No, I don't. · live in a flat · Do you live...?"
  }),
  'g6-u2-wb-c3-05': freeze({
    correct:'B',
    options:freeze([
      freeze(['A','Yes, I am. Does your flat big?']),
      freeze(['B','Yes, I do. Is your flat big?']),
      freeze(['C','Yes, I do. Does your flat big?']),
      freeze(['D','Yes, I am. Is your flat big?'])
    ]),
    reason:"B đúng: câu trước là Do you live...? nên đáp Yes, I do. Big là đặc điểm nên hỏi Is your flat big? A và D sai ở phần trả lời Yes, I am; C sai vì không dùng does để hỏi tính từ big.",
    evidence:'Hành động → do; đặc điểm với be → Is your flat big?'
  }),
  'g6-u2-wb-c3-06': freeze({
    correct:'D',
    options:freeze([
      freeze(['A',"No, it doesn't. There is a living room, two bedrooms, a bathroom and a kitchen."]),
      freeze(['B',"No, it isn't. There are a living room, two bedrooms, a bathroom and a kitchen."]),
      freeze(['C',"No, it isn't. There is a living room, two bedroom, a bathroom and a kitchen."]),
      freeze(['D',"No, it isn't. There is a living room, two bedrooms, a bathroom and a kitchen."])
    ]),
    reason:"D đúng: Is your flat big? → No, it isn't. Danh sách bắt đầu bằng a living room nên mẫu nguồn dùng There is; two bedrooms phải có -s. A sai vì doesn't không trả lời câu hỏi với is. B sai vì are đứng trước a living room. C sai vì two cần bedrooms số nhiều.",
    evidence:"Khung nguồn: No, it isn't. There is a living room, two bedrooms..."
  }),

  'g6-u2-wb-d3b-01': freeze({
    correct:'B',
    options:freeze([
      freeze(['A','It is small and comfortable.']),
      freeze(['B','It is big and cozy.']),
      freeze(['C','It is small but cozy.']),
      freeze(['D','It is big and untidy.'])
    ]),
    reason:"B đúng: câu hỏi hỏi Tom, và email Tom nói phòng big, cozy. A lấy small/comfortable của Vy. C trộn small của Vy với cozy của Tom. D có big đúng nhưng untidy không có trong email Tom.",
    evidence:"Tom: 'It's big' và 'It's cozy.'"
  }),
  'g6-u2-wb-d3b-02': freeze({
    correct:'D',
    options:freeze([
      freeze(['A','A bed, a wardrobe, a chair, a desk, a lamp, a family picture and a bookshelf.']),
      freeze(['B','A bed, a wardrobe, a desk, a chair, a lamp and a television.']),
      freeze(['C','A bed, a desk, a chair, a bookshelf, a lamp and three posters.']),
      freeze(['D','A bed, a wardrobe, a desk, a chair, a lamp and three posters.'])
    ]),
    reason:"D đúng: Vy có bed, wardrobe, desk, chair, lamp và three posters. A là gần như danh sách của Tom. B thêm television không có trong email. C lấy bookshelf của Tom và bỏ wardrobe của Vy.",
    evidence:'Vy → bed · wardrobe · desk · chair · lamp · three posters.'
  }),
  'g6-u2-wb-d3b-03': freeze({
    correct:'A',
    options:freeze([
      freeze(['A','A bed, a wardrobe, a chair, a desk, a lamp, a family picture and a bookshelf.']),
      freeze(['B','A bed, a wardrobe, a desk, a chair, a lamp and three posters.']),
      freeze(['C','A bed, a chair, a desk, a television, a picture and a bookshelf.']),
      freeze(['D','A bed, a wardrobe, a lamp, three posters and a bookshelf.'])
    ]),
    reason:"A đúng: đây là các đồ Tom kể trong email. B là danh sách của Vy. C thêm television và thiếu wardrobe. D có three posters nhưng Tom nói rõ I don't have any posters.",
    evidence:'Tom có family picture và bookshelf; Tom không có posters.'
  }),
  'g6-u2-wb-d3b-04': freeze({
    correct:'C',
    options:freeze([
      freeze(['A','No. She thinks her bedroom is too small.']),
      freeze(['B','No. She does not like the posters in her room.']),
      freeze(['C','Yes. She thinks her bedroom is comfortable.']),
      freeze(['D','Yes. She thinks her bedroom is very big.'])
    ]),
    reason:"C đúng: Vy nói bedroom là favourite room và nói It's comfortable. A dùng chi tiết small có thật nhưng biến nó thành lý do không thích. B trái với việc Vy thích posters. D lấy big của Tom.",
    evidence:"Vy: 'My bedroom is my favourite room' và 'It's comfortable.'"
  }),
  'g6-u2-wb-d3b-05': freeze({
    correct:'B',
    options:freeze([
      freeze(['A','No. He thinks his bedroom is too small.']),
      freeze(['B','Yes. He thinks his bedroom is cozy.']),
      freeze(['C','Yes. He likes the three posters on the wall.']),
      freeze(['D','No. He does not like the bookshelf in his room.'])
    ]),
    reason:"B đúng: Tom viết I love my room và It's cozy. A lấy small của Vy. C sai vì Tom nói không có posters. D lấy bookshelf có thật nhưng tự thêm ý Tom không thích nó.",
    evidence:"Tom: 'I love my room. It's cozy.'"
  }),

  'g6-u2-wb-e1-01': freeze({
    correct:'B',
    options:freeze([
      freeze(['A',"There aren't a bookshelf in my bedroom."]),
      freeze(['B',"There isn't a bookshelf in my bedroom."]),
      freeze(['C',"There doesn't have a bookshelf in my bedroom."]),
      freeze(['D',"There isn't bookshelf in my bedroom."])
    ]),
    reason:"B đúng: a bookshelf là một vật nên dùng There isn't a bookshelf.... A sai vì aren't không đi với a bookshelf. C sai vì không dùng There doesn't have. D thiếu a trước bookshelf.",
    evidence:"don't have a bookshelf ↔ There isn't a bookshelf."
  }),
  'g6-u2-wb-e1-02': freeze({
    correct:'C',
    options:freeze([
      freeze(['A','There are a sink, a fridge, a cooker and a cupboard in our kitchen.']),
      freeze(['B','There have a sink, a fridge, a cooker and a cupboard in our kitchen.']),
      freeze(['C','There is a sink, a fridge, a cooker and a cupboard in our kitchen.']),
      freeze(['D','There is a sink, a fridge, a cooker and a cupboard on our kitchen.'])
    ]),
    reason:"C đúng theo mẫu nguồn: danh sách bắt đầu bằng a sink nên dùng There is, và vị trí là in our kitchen. A dùng are trước a sink. B dùng There have sai cấu trúc. D dùng on our kitchen sai giới từ.",
    evidence:'We have ... in our kitchen ↔ There is ... in our kitchen.'
  }),
  'g6-u2-wb-e1-03': freeze({
    correct:'A',
    options:freeze([
      freeze(['A',"Mai's notebook is on the table."]),
      freeze(['B','Mai notebook is on the table.']),
      freeze(['C',"Mais' notebook is on the table."]),
      freeze(['D','Mai is notebook on the table.'])
    ]),
    reason:"A đúng: notebook của Mai → Mai's notebook. B thiếu 's sở hữu. C đặt dấu sở hữu sai với tên Mai. D biến is thành cấu trúc sai và làm mất nghĩa sở hữu.",
    evidence:"Mai has a notebook ↔ Mai's notebook."
  }),
  'g6-u2-wb-e1-04': freeze({
    correct:'C',
    options:freeze([
      freeze(['A','The microwave is in front of the dog.']),
      freeze(['B','The microwave is next to the dog.']),
      freeze(['C','The microwave is behind the dog.']),
      freeze(['D','The microwave is between the dog.'])
    ]),
    reason:"C đúng: dog ở in front of microwave thì đổi góc nhìn, microwave ở behind dog. A đảo người/vật nhưng không đổi giới từ nên sai nghĩa. B là bên cạnh. D vừa sai nghĩa vừa thiếu mốc thứ hai sau between.",
    evidence:'in front of ↔ behind khi đổi góc nhìn.'
  }),
  'g6-u2-wb-e1-05': freeze({
    correct:'D',
    options:freeze([
      freeze(['A','I like the living room good in the house.']),
      freeze(['B','I like the living room more in the house.']),
      freeze(['C','I like the living room favourite in the house.']),
      freeze(['D','I like the living room best in the house.'])
    ]),
    reason:"D đúng: favourite = thích nhất, nên đổi sang like ... best. A dùng good sai vị trí. B chỉ mang nghĩa thích hơn, chưa phải thích nhất. C không dùng favourite sau động từ like theo cách này.",
    evidence:'My favourite room is X ↔ I like X best.'
  })
});

function toChoice([id, text]) {
  return freeze({ id, text, preserveOrder:true });
}

function adaptItem(item) {
  const spec = adaptations[item?.id];
  if (!spec) return item;
  const { vi, en, acceptedAnswers, typingUi, responseMode, teachingFeedback, ...rest } = item;
  const correctText = spec.options.find(([id]) => id === spec.correct)?.[1] ?? '';
  return freeze({
    ...rest,
    type:'mcq',
    prompt:vi,
    choices:freeze(spec.options.map(toChoice)),
    correctChoiceId:spec.correct,
    digitalAdaptation:freeze({
      sourceResponseType:'written_answer',
      adaptedResponseType:'mcq',
      reason:'Fixed long answer converted to A/B/C/D for deterministic grading; source prompt and target meaning are preserved.'
    }),
    teachingFeedback:freeze({
      ...(teachingFeedback ?? {}),
      correctLabel:correctText,
      reason:spec.reason,
      example:spec.evidence
    })
  });
}

export function adaptG6U2WorkbookLongAnswers(key, content) {
  if (!['c3','d3b','e1'].includes(String(key ?? '').toLowerCase())) return content;
  return freeze({
    ...content,
    items:freeze(content.items.map(adaptItem))
  });
}
