const feedback = (correctLabel, reason, theory, example) => Object.freeze({ correctLabel, reason, theory, example });
const choice = (id, text) => Object.freeze({ id, text });
const mcq = (id, prompt, choices, correctChoiceId, teachingFeedback) => Object.freeze({
  id,
  type: 'mcq',
  prompt,
  choices: Object.freeze(choices),
  correctChoiceId,
  teachingFeedback
});
const tf = (id, statement, answer, teachingFeedback) => Object.freeze({
  id,
  type: 'true_false',
  statement,
  answer,
  teachingFeedback
});
const group = (id, label, helper) => Object.freeze({ id, label, helper });
const token = (id, text, correctGroupId) => Object.freeze({ id, text, correctGroupId });
const classification = ({ id, prompt, groups, tokens, classificationKind, classificationHint, teachingFeedback }) => Object.freeze({
  id,
  type: 'classification',
  prompt,
  groups: Object.freeze(groups),
  tokens: Object.freeze(tokens),
  classificationKind,
  classificationHint,
  teachingFeedback
});

export const global5Unit2StressVocab01Content = Object.freeze({
  items: Object.freeze([
    mcq(
      'g5u2-sv-q01',
      'Which word has stress on the second syllable?',
      [choice('a', 'fifty'), choice('b', 'sixteen'), choice('c', 'ninety'), choice('d', 'sixty')],
      'b',
      feedback(
        'sixteen',
        'sixTEEN có trọng âm chính ở âm tiết thứ hai; FIFty, NINEty và SIXty nhấn âm tiết thứ nhất.',
        'Trong các cặp số của bài này, số có đuôi -teen nhấn mạnh phần -TEEN; số chục có đuôi -ty nhấn âm tiết đầu.',
        'SIXty ↔ sixTEEN.'
      )
    ),
    mcq(
      'g5u2-sv-q02',
      'Which word has stress on the second syllable?',
      [choice('a', 'fifteen'), choice('b', 'sixty'), choice('c', 'ninety'), choice('d', 'fifty')],
      'a',
      feedback(
        'fifteen',
        'fifTEEN nhấn âm tiết thứ hai. Các từ SIXty, NINEty và FIFty trong lựa chọn đều nhấn âm tiết thứ nhất.',
        'Đừng chỉ nhìn chữ giống nhau. Hãy so sánh phần cuối -teen và -ty để xác định trọng âm.',
        'FIFty ↔ fifTEEN.'
      )
    ),
    tf(
      'g5u2-sv-q03',
      'The word “nineteen” has stress on the second syllable.',
      true,
      feedback(
        'TRUE',
        'nineTEEN có trọng âm chính ở âm tiết thứ hai, vì vậy nhận định là đúng.',
        'Các số -teen đang luyện trong Unit 2 được đọc với trọng âm nổi bật ở phần -TEEN khi đứng độc lập trong bài.',
        'NINEty ↔ nineTEEN.'
      )
    ),
    classification({
      id: 'g5u2-sv-q04',
      prompt: 'Put the words in the correct stress group.',
      groups: [
        group('stress-1', 'STRESS 1', 'Nhấn âm tiết thứ nhất'),
        group('stress-2', 'STRESS 2', 'Nhấn âm tiết thứ hai')
      ],
      tokens: [
        token('thirteen', 'thirteen', 'stress-2'),
        token('thirty', 'thirty', 'stress-1'),
        token('fourteen', 'fourteen', 'stress-2'),
        token('forty', 'forty', 'stress-1'),
        token('eighteen', 'eighteen', 'stress-2'),
        token('eighty', 'eighty', 'stress-1')
      ],
      classificationKind: 'stress',
      classificationHint: 'Hãy so sánh từng cặp: THIRty ↔ thirTEEN, FORty ↔ fourTEEN, EIGHty ↔ eighTEEN. Chú ý âm tiết được nhấn mạnh.',
      teachingFeedback: feedback(
        'Phân loại trọng âm -ty / -teen',
        'THIRty, FORty, EIGHty thuộc Stress 1; thirTEEN, fourTEEN, eighTEEN thuộc Stress 2.',
        'Mẹo của bài: -ty → nhấn âm đầu; -teen → nhấn phần -TEEN. So sánh theo cặp giúp tránh nhầm số chục với số “teen”.',
        'FORty ↔ fourTEEN.'
      )
    }),
    mcq(
      'g5u2-sv-q05',
      'Which word means “địa chỉ”?',
      [choice('a', 'road'), choice('b', 'address'), choice('c', 'tower'), choice('d', 'house')],
      'b',
      feedback(
        'address',
        'address nghĩa là “địa chỉ” — thông tin cho biết một người hoặc một nơi ở đâu.',
        'Trong Unit 2, mẫu hỏi quan trọng là “What’s your address?” để hỏi địa chỉ nhà.',
        'My address is 16 Oxford Street.'
      )
    ),
    mcq(
      'g5u2-sv-q06',
      'I live in a ___ on the tenth floor.',
      [choice('a', 'street'), choice('b', 'flat'), choice('c', 'road'), choice('d', 'address')],
      'b',
      feedback(
        'flat',
        '“On the tenth floor” cho thấy người nói đang ở một căn hộ trong tòa nhà; flat = căn hộ.',
        'Dùng live in + house/flat/building để nói nơi mình sống. Street và road là từ chỉ đường, không phải loại nhà.',
        'I live in a flat on the tenth floor.'
      )
    ),
    tf(
      'g5u2-sv-q07',
      'A tower is usually a tall building.',
      true,
      feedback(
        'TRUE',
        'tower có thể chỉ một tòa nhà/tháp cao, nên mô tả “a tall building” phù hợp trong chủ đề Our homes.',
        'building là từ chung cho tòa nhà; tower thường nhấn mạnh công trình cao.',
        'That tall tower is near my house.'
      )
    ),
    mcq(
      'g5u2-sv-q08',
      'Which word means “ngôi nhà”?',
      [choice('a', 'house'), choice('b', 'street'), choice('c', 'flat'), choice('d', 'address')],
      'a',
      feedback(
        'house',
        'house = ngôi nhà. Flat = căn hộ; street = đường phố; address = địa chỉ.',
        'Phân biệt loại nơi ở (house, flat) với từ dùng để mô tả địa chỉ (street, road, address).',
        'My house is near the school.'
      )
    ),
    mcq(
      'g5u2-sv-q09',
      'Complete the address: 16 Oxford ___.',
      [choice('a', 'Flat'), choice('b', 'Street'), choice('c', 'House'), choice('d', 'Tower')],
      'b',
      feedback(
        'Street',
        'Oxford Street là tên đường; sau số nhà có thể là tên đường + Street.',
        'Street và Road thường xuất hiện trong địa chỉ. House, flat và tower chỉ loại nơi ở/công trình.',
        '16 Oxford Street.'
      )
    ),
    tf(
      'g5u2-sv-q10',
      '“Near” and “far from” have the same meaning.',
      false,
      feedback(
        'FALSE',
        'near nghĩa là “gần”, còn far from nghĩa là “xa”; hai cụm mang nghĩa đối lập.',
        'near + place = gần một nơi; far from + place = xa một nơi.',
        'My house is near the park, but it is far from the airport.'
      )
    ),
    mcq(
      'g5u2-sv-q11',
      'Kim’s school is seven kilometres from her home. Her school is ___ her home.',
      [choice('a', 'near'), choice('b', 'far from'), choice('c', 'in'), choice('d', 'over there')],
      'b',
      feedback(
        'far from',
        'Khoảng cách bảy kilometres cho thấy trường ở khá xa nhà, nên dùng far from.',
        'Dùng far from để nói hai nơi cách xa nhau; kilometre là đơn vị đo khoảng cách.',
        'My school is five kilometres from my home. It is far from my home.'
      )
    ),
    classification({
      id: 'g5u2-sv-q12',
      prompt: 'Put the words in the correct vocabulary group.',
      groups: [
        group('home-building', 'HOME / BUILDING', 'Nơi ở hoặc tòa nhà'),
        group('address-word', 'ADDRESS WORD', 'Từ thường dùng trong địa chỉ')
      ],
      tokens: [
        token('house', 'house', 'home-building'),
        token('flat', 'flat', 'home-building'),
        token('tower', 'tower', 'home-building'),
        token('building', 'building', 'home-building'),
        token('street', 'street', 'address-word'),
        token('road', 'road', 'address-word')
      ],
      classificationKind: 'vocabulary',
      classificationHint: 'Hãy hỏi: từ này là một nơi ở/tòa nhà, hay là từ thường nằm trong phần tên đường của địa chỉ?',
      teachingFeedback: feedback(
        'Phân loại home/building và address words',
        'house, flat, tower, building là từ về nơi ở/công trình; street và road thường dùng trong tên đường/địa chỉ.',
        'Nhóm từ theo nghĩa giúp nhớ từ lâu hơn: “nơi ở/công trình” khác với “từ dùng trong địa chỉ”.',
        'a flat in a building · Oxford Street · Green Road.'
      )
    })
  ])
});
