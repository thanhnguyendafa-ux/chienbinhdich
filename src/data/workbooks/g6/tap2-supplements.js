import { defineG6WorkbookLesson } from './shared/workbook-lesson-v2.js';

const freeze = value => Object.freeze(value);

const DEFAULT_PRELOAD = freeze({
  vocab: freeze([
    freeze(['exercise','bài tập',freeze(['đáp án','câu','từ'])]),
    freeze(['answer','đáp án',freeze(['bài tập','câu','từ'])]),
    freeze(['sentence','câu',freeze(['bài tập','đáp án','từ'])]),
    freeze(['word','từ',freeze(['bài tập','đáp án','câu'])])
  ]),
  phrases: freeze([
    freeze(['choose the correct answer','chọn đáp án đúng',freeze(['sắp xếp câu','đọc kỹ','kiểm tra lại'])]),
    freeze(['put in order','sắp xếp theo thứ tự',freeze(['chọn đáp án đúng','đọc kỹ','kiểm tra lại'])]),
    freeze(['read carefully','đọc kỹ',freeze(['chọn đáp án đúng','sắp xếp câu','kiểm tra lại'])]),
    freeze(['check again','kiểm tra lại',freeze(['chọn đáp án đúng','sắp xếp câu','đọc kỹ'])])
  ])
});

function theory(rule, example='Đọc yêu cầu → làm từng bước → kiểm tra lại.') {
  return freeze({
    rule,
    steps: freeze(['Đọc đúng yêu cầu nguồn.', 'Làm từng câu theo dữ kiện của bài.', 'Kiểm tra lại trước khi Submit.']),
    trap: 'Không đoán theo cảm giác; bám đúng dữ kiện và cấu trúc của SBT.',
    example
  });
}

function makeSpec({id,unit,unitName,page,exercise,title,blocks,rule,sourceNote=null}) {
  return freeze({
    id, unit, unitName, page, exercise, title,
    section: String(exercise).replace(/[^A-Za-z].*$/, '').toUpperCase() || 'TEST',
    theory: theory(rule),
    blocks: freeze(blocks),
    preload: DEFAULT_PRELOAD,
    sourceItemCount: blocks.reduce((total, block) => {
      if (Array.isArray(block.items)) return total + block.items.length;
      if (Array.isArray(block.sentences)) return total + block.sentences.length;
      if (Array.isArray(block.prompts)) return total + block.prompts.length;
      return total + 1;
    }, 0),
    sourceActivityTypes: freeze([...new Set(blocks.map(block => block.type === 'reading_mcq' ? 'mcq' : block.type === 'reading_tf' ? 'true_false' : block.type === 'reading_typing' ? 'typing' : block.type))]),
    expectedTimeMinutes: 18,
    sourceNote
  });
}

const supplementSpecs = freeze({
  'g6-u08-wb-b2': makeSpec({
    id:'g6-u08-wb-b2', unit:8, unitName:'Sports and Games', page:10, exercise:'B2',
    title:'B2 · Wordsearch động từ bất quy tắc · bản online MCQ',
    rule:'Giữ nguyên 11 cặp động từ của wordsearch; bản online bỏ lưới và chọn đúng dạng quá khứ.',
    sourceNote:'SOURCE ADAPTATION · wordsearch grid → MCQ; no source exercise omitted.',
    blocks:[{type:'mcq',items:[
      {prompt:'Past form of write',options:['wrote','written','write','writed'],answer:'wrote'},
      {prompt:'Past form of sit',options:['sat','sit','sitted','set'],answer:'sat'},
      {prompt:'Past form of put',options:['put','putted','puts','puting'],answer:'put'},
      {prompt:'Past form of tell',options:['told','telled','tell','telt'],answer:'told'},
      {prompt:'Past form of win',options:['won','winned','win','wan'],answer:'won'},
      {prompt:'Past form of run',options:['ran','runned','run','runed'],answer:'ran'},
      {prompt:'Past form of make',options:['made','maked','make','making'],answer:'made'},
      {prompt:'Past form of take',options:['took','taked','taken','take'],answer:'took'},
      {prompt:'Past form of pay',options:['paid','payed','pay','payd'],answer:'paid'},
      {prompt:'Past form of get',options:['got','getted','get','gotten'],answer:'got'},
      {prompt:'Past form of sell',options:['sold','selled','sell','seld'],answer:'sold'}
    ]}]
  }),
  'g6-u09-wb-c3': makeSpec({
    id:'g6-u09-wb-c3', unit:9, unitName:'Cities of the World', page:18, exercise:'C3',
    title:'C3 · Câu cảm thán từ tranh thành phố · bản online sentence order',
    rule:'Dùng What + a/an + adjective + singular noun; với weather/trees dùng cấu trúc phù hợp danh từ.',
    sourceNote:'SOURCE ADAPTATION · picture cues → source-key sentence_order; no source exercise omitted.',
    blocks:[{type:'sentence_order',sentences:[
      'What a crowded city!','What a high tower!','What beautiful weather!','What green trees!','What modern buildings!'
    ]}]
  }),
  'g6-u11-wb-b2': makeSpec({
    id:'g6-u11-wb-b2', unit:11, unitName:'Our Greener World', page:33, exercise:'B2',
    title:'B2 · Ghép cách bảo vệ môi trường · bản online text match',
    rule:'Ghép mỗi hành động bảo vệ môi trường với mô tả văn bản tương đương của tranh nguồn.',
    sourceNote:'SOURCE ADAPTATION · source pictures → text-equivalent matching; source key 1-f 2-h 3-c 4-g 5-e 6-a 7-d 8-b.',
    blocks:[{type:'match',pairs:[
      ['Put rubbish in the right bin.','Rubbish is put into the correct bin.'],
      ['Have a shower instead of a bath.','A person is taking a shower.'],
      ['Reduce, reuse and recycle.','The three-R recycling symbol is shown.'],
      ['Plant more trees.','A person is planting a young tree.'],
      ['Use reusable bags when shopping.','A shopper carries a reusable bag.'],
      ['Turn off the lights when going out of the room.','The light is switched off before leaving.'],
      ["Don't smoke.",'A no-smoking sign is shown.'],
      ["Don't throw rubbish into the river.",'Rubbish is kept out of the river.']
    ]}]
  }),
  'g6-u11-wb-c3': makeSpec({
    id:'g6-u11-wb-c3', unit:11, unitName:'Our Greener World', page:36, exercise:'C3',
    title:'C3 · So sánh hai bộ tranh sống xanh · bản online MCQ',
    rule:'Nhận ra điểm khác nhau giữa Picture 1 và Picture 2 theo bốn hành động trong đáp án nguồn.',
    sourceNote:'SOURCE ADAPTATION · paired pictures → text comparison MCQ using the source answer-key descriptions.',
    blocks:[{type:'mcq',items:[
      {prompt:'Rubbish: which comparison matches the two source pictures?',options:['Picture 1: rubbish in the right bin; Picture 2: rubbish in the street.','Both pictures: rubbish in the street.','Picture 1: rubbish in the river; Picture 2: rubbish in a bin.','Both pictures: rubbish in the right bin.'],answer:'Picture 1: rubbish in the right bin; Picture 2: rubbish in the street.'},
      {prompt:'Shopping bags: which comparison matches the two source pictures?',options:['Picture 1: plastic bags; Picture 2: reusable bags.','Picture 1: reusable bags; Picture 2: plastic bags.','Both pictures: no bags.','Both pictures: plastic bags.'],answer:'Picture 1: plastic bags; Picture 2: reusable bags.'},
      {prompt:'Brushing teeth: which comparison matches the two source pictures?',options:['Picture 1: tap off; Picture 2: tap on.','Picture 1: tap on; Picture 2: tap off.','Both pictures: tap off.','Both pictures: tap on.'],answer:'Picture 1: tap off; Picture 2: tap on.'},
      {prompt:'Book use: which comparison matches the two source pictures?',options:['Picture 1: a recycled book is being used; Picture 2: a new/non-recycled book is being used.','Both pictures: no book.','Picture 1: no book; Picture 2: recycled book.','Both pictures: the same recycled book.'],answer:'Picture 1: a recycled book is being used; Picture 2: a new/non-recycled book is being used.'}
    ]}]
  }),
  'g6-u11-wb-d2c': makeSpec({
    id:'g6-u11-wb-d2c', unit:11, unitName:'Our Greener World', page:38, exercise:'D2c',
    title:'D2c · Sắp xếp quy trình tái chế · bản online sequence',
    rule:'Sắp xếp đúng 5 bước theo passage: bỏ vào thùng → thu gom → xử lý → bán nguyên liệu → sản xuất đồ mới.',
    sourceNote:'SOURCE ADAPTATION · source process pictures → textual sequence; source key picture order 1-b 2-d 3-c 4-e 5-a.',
    blocks:[{type:'sequence',lines:[
      {id:'a',text:'Manufacturers make new items from the recycled materials.'},
      {id:'b',text:'People put bottles and cans in the recycling bin.'},
      {id:'c',text:'The collected materials are processed into raw materials.'},
      {id:'d',text:'Collectors take the recyclable materials to a processing factory.'},
      {id:'e',text:'Factories sell the raw materials to manufacturers.'}
    ],correctOrder:['b','d','c','e','a']}]
  }),

  'g6-ty3-wb-1': makeSpec({
    id:'g6-ty3-wb-1', unit:'Test Yourself 3', unitName:'Test Yourself 3', page:22, exercise:'1', title:'Test Yourself 3 · Exercise 1 · Pronunciation',
    rule:'Chọn từ có phần gạch chân phát âm khác trong mỗi dòng.',
    blocks:[{type:'mcq',items:[
      {prompt:'Line 1 · choose the different pronunciation.',options:['A','B','C','D'],answer:'C'},
      {prompt:'Line 2 · choose the different pronunciation.',options:['A','B','C','D'],answer:'B'},
      {prompt:'Line 3 · choose the different pronunciation.',options:['A','B','C','D'],answer:'C'},
      {prompt:'Line 4 · choose the different pronunciation.',options:['A','B','C','D'],answer:'B'},
      {prompt:'Line 5 · choose the different pronunciation.',options:['A','B','C','D'],answer:'D'}
    ]}], sourceNote:'SOURCE-LOCKED · answer positions follow the workbook key.'
  }),
  'g6-ty3-wb-2': makeSpec({
    id:'g6-ty3-wb-2', unit:'Test Yourself 3', unitName:'Test Yourself 3', page:22, exercise:'2', title:'Test Yourself 3 · Exercise 2 · Complete the words',
    rule:'Dựa vào chữ cái đầu và ngữ cảnh để hoàn thành từ/cụm từ.',
    blocks:[{type:'typing',items:[
      {prompt:'(1a) Let’s turn to c_____ 5 to watch Mr Bean.',answer:'channel'},
      {prompt:'(1b) It’s my favourite c_____.',answer:'comedy'},
      {prompt:'(2) Tom and Jerry is a c_____.',answer:'cartoon'},
      {prompt:'(3) The programme has good lessons for children. It is e_____.',answer:'educational'},
      {prompt:'(4a) Did you run a m_____ last year?',answer:'marathon'},
      {prompt:'(4b) My brother plays lots of sport. He is s_____.',answer:'sporty'},
      {prompt:'(5a) To play t_____ t_____, you need a ball and a net.',answer:'table tennis'},
      {prompt:'(5b) You also need two r_____.',answer:'rackets'},
      {prompt:'(6) Ha Noi has a lot of t_____ food.',answer:'tasty',accepted:['delicious']},
      {prompt:'(7) What’s the w_____ like in your city in the summer?',answer:'weather'}
    ]}], sourceNote:'SOURCE-LOCKED · short answers from Test Yourself 3 key.'
  }),
  'g6-ty3-wb-3': makeSpec({
    id:'g6-ty3-wb-3', unit:'Test Yourself 3', unitName:'Test Yourself 3', page:22, exercise:'3', title:'Test Yourself 3 · Exercise 3 · Albert Park T/F',
    rule:'Đọc thông tin về Albert Park và chọn True/False đúng theo bài.',
    blocks:[{type:'tf',items:[
      {statement:'Statement 1',answer:true},{statement:'Statement 2',answer:true},{statement:'Statement 3',answer:true},{statement:'Statement 4',answer:false},{statement:'Statement 5',answer:false}
    ]}], sourceNote:'SOURCE-LOCKED · T,T,T,F,F from workbook key.'
  }),
  'g6-ty3-wb-4': makeSpec({
    id:'g6-ty3-wb-4', unit:'Test Yourself 3', unitName:'Test Yourself 3', page:23, exercise:'4', title:'Test Yourself 3 · Exercise 4 · Grammar MCQ',
    rule:'Chọn đáp án đúng A/B/C/D để hoàn thành từng câu.',
    blocks:[{type:'mcq',items:[
      {prompt:'Question 1',options:['A','B','C','D'],answer:'B'},{prompt:'Question 2',options:['A','B','C','D'],answer:'C'},
      {prompt:'Question 3',options:['A','B','C','D'],answer:'D'},{prompt:'Question 4',options:['A','B','C','D'],answer:'C'},
      {prompt:'Question 5',options:['A','B','C','D'],answer:'D'},{prompt:'Question 6',options:['A','B','C','D'],answer:'D'},
      {prompt:'Question 7',options:['A','B','C','D'],answer:'C'},{prompt:'Question 8',options:['A','B','C','D'],answer:'B'},
      {prompt:'Question 9',options:['A','B','C','D'],answer:'A'},{prompt:'Question 10',options:['A','B','C','D'],answer:'C'}
    ]}], sourceNote:'SOURCE-LOCKED · answer positions from workbook key.'
  }),
  'g6-ty3-wb-5': makeSpec({
    id:'g6-ty3-wb-5', unit:'Test Yourself 3', unitName:'Test Yourself 3', page:24, exercise:'5', title:'Test Yourself 3 · Exercise 5 · Postcard gap fill',
    rule:'Điền một từ phù hợp vào mỗi chỗ trống của postcard.',
    blocks:[{type:'typing',items:[
      {prompt:'Postcard gap (1)',answer:'a'},{prompt:'Postcard gap (2)',answer:'weather'},{prompt:'Postcard gap (3)',answer:'delicious',accepted:['tasty']},
      {prompt:'Postcard gap (4)',answer:'people'},{prompt:'Postcard gap (5)',answer:'but'},{prompt:'Postcard gap (6)',answer:'visited'},
      {prompt:'Postcard gap (7)',answer:'going'},{prompt:'Postcard gap (8)',answer:'bought'},{prompt:'Postcard gap (9)',answer:'place',accepted:['city']},
      {prompt:'Postcard gap (10)',answer:'it'}
    ]}], sourceNote:'SOURCE-LOCKED · answers from Test Yourself 3 key.'
  }),
  'g6-ty3-wb-6': makeSpec({
    id:'g6-ty3-wb-6', unit:'Test Yourself 3', unitName:'Test Yourself 3', page:24, exercise:'6', title:'Test Yourself 3 · Exercise 6 · Find and correct mistakes',
    rule:'Tìm lỗi trong mỗi câu rồi chọn cách sửa đúng.',
    blocks:[{type:'mcq',items:[
      {prompt:'I learn how to swim in 2010. Correct the mistake.',options:['learn → learned / learnt','how → what','swim → swimming','in → on'],answer:'learn → learned / learnt'},
      {prompt:'Last week I come back to my home town. Correct the mistake.',options:['come → came','Last → Next','to → at','my → mine'],answer:'come → came'},
      {prompt:'Mine home town is a very beautiful place. Correct the mistake.',options:['Mine → My','is → are','very → many','place → places'],answer:'Mine → My'},
      {prompt:'This is my book; it isn’t your. Correct the mistake.',options:['your → yours','my → mine','is → are','isn’t → don’t'],answer:'your → yours'},
      {prompt:'Do eat much meat because it isn’t good for you. Correct the mistake.',options:["Do → Don’t",'meat → meats','isn’t → doesn’t','for → to'],answer:"Do → Don’t"}
    ]}], sourceNote:'SOURCE ADAPTATION · source correction typing → MCQ; correction targets come from workbook key.'
  }),
  'g6-ty3-wb-7': makeSpec({
    id:'g6-ty3-wb-7', unit:'Test Yourself 3', unitName:'Test Yourself 3', page:24, exercise:'7', title:'Test Yourself 3 · Exercise 7 · Combine sentences',
    rule:'Nối hai câu bằng and, but, so hoặc too đúng nghĩa.',
    blocks:[{type:'sentence_order',sentences:[
      'My sister can swim well, but she can’t play badminton.',
      'She loves French food, so she goes to that French restaurant every week.',
      'He stayed up late to watch a football match, so he was tired.',
      'This TV programme is boring, but she still watches it every Sunday.',
      'My mum and his mum went to Ho Chi Minh City last month, too.'
    ]}], sourceNote:'SOURCE ADAPTATION · long canonical typing → sentence_order using workbook key.'
  }),
  'g6-ty3-wb-8': makeSpec({
    id:'g6-ty3-wb-8', unit:'Test Yourself 3', unitName:'Test Yourself 3', page:25, exercise:'8', title:'Test Yourself 3 · Exercise 8 · Rubber-band jumping',
    rule:'Dùng các từ/cụm gợi ý để tạo câu hoàn chỉnh; bản online sắp xếp câu theo đáp án nguồn.',
    blocks:[{type:'sentence_order',sentences:[
      'Rubber-band jumping is an inexpensive game.',
      'You only need some rubber bands.',
      'You loop rubber bands together and make a longer one.',
      'When there are three people, you can start the game.',
      'Two people stand opposite each other and extend the rubber band.',
      'One player stands on one side of the rubber band and jumps.',
      'She has to bring the two sides together.',
      'Then she jumps again and makes the two sides separate.',
      'If she finishes without any mistakes, she can start the next level.',
      'There are four jumping levels: ankle-high, knee-high, waist-high, and under the shoulder.'
    ]}], sourceNote:'SOURCE ADAPTATION · long canonical typing → sentence_order using workbook key.'
  }),

  'g6-ty4-wb-1': makeSpec({
    id:'g6-ty4-wb-1', unit:'Test Yourself 4', unitName:'Test Yourself 4', page:49, exercise:'1', title:'Test Yourself 4 · Exercise 1 · Stress',
    rule:'Chọn từ có trọng âm khác trong mỗi dòng.',
    blocks:[{type:'mcq',items:[
      {prompt:'Line 1',options:['A','B','C','D'],answer:'B'},{prompt:'Line 2',options:['A','B','C','D'],answer:'C'},
      {prompt:'Line 3',options:['A','B','C','D'],answer:'D'},{prompt:'Line 4',options:['A','B','C','D'],answer:'A'},
      {prompt:'Line 5',options:['A','B','C','D'],answer:'D'}
    ]}], sourceNote:'SOURCE-LOCKED · answer positions from workbook key.'
  }),
  'g6-ty4-wb-2': makeSpec({
    id:'g6-ty4-wb-2', unit:'Test Yourself 4', unitName:'Test Yourself 4', page:49, exercise:'2', title:'Test Yourself 4 · Exercise 2 · Name the activities',
    rule:'Bài nguồn dùng tranh; bản online dùng mô tả tranh và chọn đúng tên hoạt động.',
    blocks:[{type:'mcq',items:[
      {prompt:'Picture clue: the recycling symbol.',options:['recycling','cycling','watering plants','talking with a robot'],answer:'recycling'},
      {prompt:'Picture clue: a person waters young trees.',options:['watering plants / trees','doing the gardening','recycling','cycling'],answer:'watering plants / trees'},
      {prompt:'Picture clue: a person communicates with a robot.',options:['talking with a robot','cycling','recycling','watering plants / trees'],answer:'talking with a robot'},
      {prompt:'Picture clue: people work with plants in a garden.',options:['doing the gardening','talking with a robot','cycling','recycling'],answer:'doing the gardening'},
      {prompt:'Picture clue: a person rides a bicycle.',options:['cycling','recycling','watering plants / trees','doing the gardening'],answer:'cycling'}
    ]}], sourceNote:'SOURCE ADAPTATION · pictures → text clues; answer labels from workbook key.'
  }),
  'g6-ty4-wb-3': makeSpec({
    id:'g6-ty4-wb-3', unit:'Test Yourself 4', unitName:'Test Yourself 4', page:49, exercise:'3', title:'Test Yourself 4 · Exercise 3 · Grammar MCQ',
    rule:'Chọn A/B/C/D để hoàn thành đúng câu.',
    blocks:[{type:'mcq',items:[
      {prompt:'Question 1',options:['A','B','C','D'],answer:'B'},{prompt:'Question 2',options:['A','B','C','D'],answer:'D'},
      {prompt:'Question 3',options:['A','B','C','D'],answer:'B'},{prompt:'Question 4',options:['A','B','C','D'],answer:'B'},
      {prompt:'Question 5',options:['A','B','C','D'],answer:'C'},{prompt:'Question 6',options:['A','B','C','D'],answer:'C'},
      {prompt:'Question 7',options:['A','B','C','D'],answer:'A'},{prompt:'Question 8',options:['A','B','C','D'],answer:'A'},
      {prompt:'Question 9',options:['A','B','C','D'],answer:'C'},{prompt:'Question 10',options:['A','B','C','D'],answer:'D'}
    ]}], sourceNote:'SOURCE-LOCKED · answer positions from workbook key.'
  }),
  'g6-ty4-wb-4': makeSpec({
    id:'g6-ty4-wb-4', unit:'Test Yourself 4', unitName:'Test Yourself 4', page:50, exercise:'4', title:'Test Yourself 4 · Exercise 4 · Robot-show letter',
    rule:'Điền một từ phù hợp vào mỗi chỗ trống trong lá thư.',
    blocks:[{type:'typing',items:[
      {prompt:'Letter gap (1)',answer:'see'},{prompt:'Letter gap (2)',answer:'are'},{prompt:'Letter gap (3)',answer:'smallest'},
      {prompt:'Letter gap (4)',answer:'in'},{prompt:'Letter gap (5)',answer:'to',accepted:['with']},{prompt:'Letter gap (6)',answer:'wash'},
      {prompt:'Letter gap (7)',answer:'do'},{prompt:'Letter gap (8)',answer:'questions'},{prompt:'Letter gap (9)',answer:'will'},
      {prompt:'Letter gap (10)',answer:'go'}
    ]}], sourceNote:'SOURCE-LOCKED · short answers from workbook key.'
  }),
  'g6-ty4-wb-5': makeSpec({
    id:'g6-ty4-wb-5', unit:'Test Yourself 4', unitName:'Test Yourself 4', page:51, exercise:'5', title:'Test Yourself 4 · Exercise 5 · Energy-saving reading',
    rule:'Đọc đoạn về tiết kiệm điện rồi chọn đáp án đúng.',
    blocks:[{type:'mcq',items:[
      {prompt:'Question 1',options:['A','B','C'],answer:'B'},{prompt:'Question 2',options:['A','B','C'],answer:'A'},
      {prompt:'Question 3',options:['A','B','C'],answer:'C'},{prompt:'Question 4',options:['A','B','C'],answer:'C'},
      {prompt:'Question 5',options:['A','B','C'],answer:'B'}
    ]}], sourceNote:'SOURCE-LOCKED · answer positions from workbook key.'
  }),
  'g6-ty4-wb-6': makeSpec({
    id:'g6-ty4-wb-6', unit:'Test Yourself 4', unitName:'Test Yourself 4', page:52, exercise:'6', title:'Test Yourself 4 · Exercise 6 · Verb tenses',
    rule:'Chọn dạng động từ đúng theo thời gian và cấu trúc câu.',
    blocks:[{type:'mcq',items:[
      {prompt:'(1) ___ you ever (see) ___ a real robot at work?',options:['Do you ever see','Did you ever saw','Are you ever see','Will you ever saw'],answer:'Do you ever see'},
      {prompt:'(2) Tung (buy) ___ a guitar last month.',options:['bought','buys','will buy','buy'],answer:'bought'},
      {prompt:'(3) If it (be) ___ nice tomorrow, we (plant) ___ some young trees.',options:['is – will plant','will be – plant','was – planted','is – planted'],answer:'is – will plant'},
      {prompt:'(4) Do you think there (be) ___ a city underwater?',options:['will be','is','was','has'],answer:'will be'}
    ]}], sourceNote:'SOURCE ADAPTATION · verb-form typing → MCQ; answers follow the workbook key as printed.'
  }),
  'g6-ty4-wb-7': makeSpec({
    id:'g6-ty4-wb-7', unit:'Test Yourself 4', unitName:'Test Yourself 4', page:52, exercise:'7', title:'Test Yourself 4 · Exercise 7 · Conversation order',
    rule:'Sắp xếp 10 câu của hội thoại theo mạch logic.',
    blocks:[{type:'sequence',lines:[
      {id:'A',text:'What’s the matter with you? You don’t look very happy.'},
      {id:'B',text:'Thank you, Sue.'},
      {id:'C',text:'I’ll write about kitchen robots that can cook meals and lay the table.'},
      {id:'D',text:'Oh, I have to write a paper about the most important recent invention. It’s for my science class.'},
      {id:'E',text:'Yeah, but it’s due tomorrow.'},
      {id:'F',text:'That’s good. There are lots of good inventions.'},
      {id:'G',text:'Well, what are you going to write about?'},
      {id:'H',text:'OK. Well, I’m sure you’ll have interesting ideas. Good luck.'},
      {id:'I',text:'Hmm, the robot, I guess.'},
      {id:'J',text:'Hmm ... Isn’t everybody going to write about that too?'}
    ],correctOrder:['A','D','F','E','G','I','J','C','H','B']}], sourceNote:'SOURCE-LOCKED · sequence A-D-F-E-G-I-J-C-H-B from workbook key.'
  }),
  'g6-ty4-wb-8': makeSpec({
    id:'g6-ty4-wb-8', unit:'Test Yourself 4', unitName:'Test Yourself 4', page:52, exercise:'8', title:'Test Yourself 4 · Exercise 8 · Sentence transformation',
    rule:'Viết lại câu sao cho nghĩa không đổi; bản online dùng sentence order vì đáp án là câu dài.',
    blocks:[{type:'sentence_order',sentences:[
      'Don’t swim in that polluted lake, boys!',
      'No river in the world is longer than the Nile.',
      'They live far from the school, but we live near it.',
      'That is his racket over there, but this one is mine.',
      'Minh hopes that he will speak English well in 3 years.'
    ]}], sourceNote:'SOURCE ADAPTATION · long canonical typing → sentence_order using workbook key.'
  })
});

export const g6Tap2SupplementFolders = freeze([
  freeze({id:'global6-test-yourself-3',name:'Test Yourself 3',description:'Global Success 6 · Test Yourself 3.',parentId:'global6',order:93}),
  freeze({id:'global6-test-yourself-3-workbook',name:'Sách bài tập · Test Yourself 3',description:'Đủ 8 bài Test Yourself 3 từ SBT Tập Hai; bài dài được chuyển sang sentence order/MCQ.',parentId:'global6-test-yourself-3',order:1}),
  freeze({id:'global6-test-yourself-4',name:'Test Yourself 4',description:'Global Success 6 · Test Yourself 4.',parentId:'global6',order:94}),
  freeze({id:'global6-test-yourself-4-workbook',name:'Sách bài tập · Test Yourself 4',description:'Đủ 8 bài Test Yourself 4 từ SBT Tập Hai; bài dài được chuyển sang sentence order/MCQ.',parentId:'global6-test-yourself-4',order:1})
]);

const unitFolder = id => {
  const match = id.match(/^g6-u(\d{2})-wb-/);
  return match ? `global6-unit${Number(match[1])}-workbook` : id.startsWith('g6-ty3-') ? 'global6-test-yourself-3-workbook' : 'global6-test-yourself-4-workbook';
};

function descriptor(spec, order) {
  const testLabel = String(spec.unit).startsWith('Test Yourself') ? spec.unit : `Unit ${spec.unit} · ${spec.unitName}`;
  const sourceTypes = spec.sourceActivityTypes;
  const activityTypes = [...new Set(['mcq', ...sourceTypes, ...(sourceTypes.includes('typing') ? ['sentence_order'] : [])])];
  return freeze({
    id: spec.id,
    folderId: unitFolder(spec.id),
    order,
    version: 2,
    course: 'Global Success 6',
    unit: `${testLabel} · Sách bài tập`,
    title: spec.title,
    subtitle: 'SBT Tập Hai · SOURCE-LOCKED · giải thích sau Submit',
    expectedTimeMinutes: Math.min(24, spec.expectedTimeMinutes + 4),
    lessonSlug: spec.id,
    passThreshold: 80,
    completionPolicy: 'explain-and-accept',
    typingTolerance: true,
    teacher: 'Thầy Thành MRT',
    description: `Bài SBT Tập Hai được giữ đủ; nếu nguồn phụ thuộc hình/lưới hoặc có đáp án typing dài thì dùng tương tác số tương đương. ${spec.sourceItemCount} lượt nguồn.`,
    sourceActivityTypes: sourceTypes,
    activityTypes: freeze(activityTypes),
    sourceItemCount: spec.sourceItemCount,
    preloadItemCount: 8,
    itemCount: spec.sourceItemCount + 8,
    loadContent: async () => defineG6WorkbookLesson(spec)
  });
}

const orderedIds = freeze([
  'g6-u08-wb-b2','g6-u09-wb-c3','g6-u11-wb-b2','g6-u11-wb-c3','g6-u11-wb-d2c',
  'g6-ty3-wb-1','g6-ty3-wb-2','g6-ty3-wb-3','g6-ty3-wb-4','g6-ty3-wb-5','g6-ty3-wb-6','g6-ty3-wb-7','g6-ty3-wb-8',
  'g6-ty4-wb-1','g6-ty4-wb-2','g6-ty4-wb-3','g6-ty4-wb-4','g6-ty4-wb-5','g6-ty4-wb-6','g6-ty4-wb-7','g6-ty4-wb-8'
]);

export const g6Tap2SupplementRegistry = freeze(orderedIds.map((id, index) => descriptor(supplementSpecs[id], 80 + index)));

export const g6Tap2SupplementManifest = freeze(orderedIds.map(id => {
  const spec = supplementSpecs[id];
  return freeze({
    id,
    unit: spec.unit,
    unitName: spec.unitName,
    exercise: spec.exercise,
    page: spec.page,
    status: 'retained-adapted',
    title: spec.title,
    sourceNote: spec.sourceNote
  });
}));
