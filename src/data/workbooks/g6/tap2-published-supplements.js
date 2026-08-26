import { defineG6WorkbookLesson } from './shared/workbook-lesson-v2.js';
import { g6Tap2SupplementRegistry } from './tap2-supplements.js';

const freeze = value => Object.freeze(value);
const PRELOAD = freeze({
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

function sourceType(block) {
  if (block.type === 'reading_mcq') return 'mcq';
  if (block.type === 'reading_tf' || block.type === 'tf') return 'true_false';
  if (block.type === 'reading_typing') return 'typing';
  return block.type;
}
function itemCount(block) {
  if (Array.isArray(block.items)) return block.items.length;
  if (Array.isArray(block.sentences)) return block.sentences.length;
  if (Array.isArray(block.prompts)) return block.prompts.length;
  return 1;
}
function spec({id,unit,unitName,page,exercise,title,rule,blocks,sourceNote}) {
  return freeze({
    id,unit,unitName,page,exercise,title,section:String(exercise).match(/[A-Za-z]+/)?.[0]?.toUpperCase() ?? 'TEST',
    theory:freeze({rule,steps:freeze(['Đọc đúng đề nguồn.','Làm từng câu theo dữ kiện.','Kiểm tra đáp án trước khi Submit.']),trap:'Không thay đề bằng kiến thức ngoài sách.',example:'Bám đúng từ khóa, cấu trúc và passage của SBT.'}),
    blocks:freeze(blocks),preload:PRELOAD,
    sourceItemCount:blocks.reduce((sum,block)=>sum+itemCount(block),0),
    sourceActivityTypes:freeze([...new Set(blocks.map(sourceType))]),expectedTimeMinutes:18,sourceNote
  });
}

const corrected = freeze({
  'g6-u11-wb-c3': spec({
    id:'g6-u11-wb-c3',unit:11,unitName:'Our Greener World',page:36,exercise:'C3',title:'C3 · So sánh hai bộ tranh sống xanh · bản online MCQ',
    rule:'Dùng bảng đáp án nguồn để mô tả đúng từng cặp tranh; bản online chuyển hình thành mô tả chữ.',
    sourceNote:'SOURCE ADAPTATION · picture pairs → text MCQ. Source key page 61: right bin/street; plastic/reusable bags; tap off/on; recycled book in both pictures.',
    blocks:[{type:'mcq',items:[
      {prompt:'Pair 1 · Which text matches the source pictures?',options:['1st: a girl throws rubbish into the right bin; 2nd: a girl throws rubbish into the street.','1st: rubbish in the river; 2nd: rubbish in the bin.','Both: rubbish in the street.','Both: rubbish in the right bin.'],answer:'1st: a girl throws rubbish into the right bin; 2nd: a girl throws rubbish into the street.'},
      {prompt:'Pair 2 · Which text matches the source pictures?',options:['1st: two students use plastic bags; 2nd: two students use reusable bags.','1st: reusable bags; 2nd: plastic bags.','Both: reusable bags.','Both: plastic bags.'],answer:'1st: two students use plastic bags; 2nd: two students use reusable bags.'},
      {prompt:'Pair 3 · Which text matches the source pictures?',options:['1st: a boy turns off the tap while brushing his teeth; 2nd: a boy turns on the tap.','1st: tap on; 2nd: tap off.','Both: tap off.','Both: tap on.'],answer:'1st: a boy turns off the tap while brushing his teeth; 2nd: a boy turns on the tap.'},
      {prompt:'Pair 4 · Which text matches the source pictures?',options:['Both pictures: a girl is using the recycled book.','1st: recycled book; 2nd: no book.','1st: no book; 2nd: recycled book.','Both pictures: no recycled book.'],answer:'Both pictures: a girl is using the recycled book.'}
    ]}]
  }),

  'g6-ty3-wb-1': spec({
    id:'g6-ty3-wb-1',unit:'Test Yourself 3',unitName:'Test Yourself 3',page:22,exercise:'1',title:'Test Yourself 3 · Exercise 1 · Pronunciation',
    rule:'Find the word that has a different sound in the part underlined.',sourceNote:'SOURCE-LOCKED · page 22 + key page 59.',
    blocks:[{type:'mcq',items:[
      {prompt:'1. Find the word with a different sound.',options:['test','dress','these','then'],answer:'these'},
      {prompt:'2. Find the word with a different sound.',options:['gather','monthly','father','brother'],answer:'monthly'},
      {prompt:'3. Find the word with a different sound.',options:['fold','close','cloth','hold'],answer:'cloth'},
      {prompt:'4. Find the word with a different sound.',options:['man','woman','relax','badminton'],answer:'woman'},
      {prompt:'5. Find the word with a different sound.',options:['mountain','mouse','round','cousin'],answer:'cousin'}
    ]}]
  }),
  'g6-ty3-wb-2': spec({
    id:'g6-ty3-wb-2',unit:'Test Yourself 3',unitName:'Test Yourself 3',page:22,exercise:'2',title:'Test Yourself 3 · Exercise 2 · Fill each blank',
    rule:'Fill each blank with a suitable word. The first letter is given.',sourceNote:'SOURCE-LOCKED · page 22 + key page 59.',
    blocks:[{type:'typing',items:[
      {prompt:'1a. Let’s turn to c_____ 5 to watch Mr Bean.',answer:'channel'},
      {prompt:'1b. It’s my favourite c_____.',answer:'comedy'},
      {prompt:'2. My little brother likes Tom and Jerry very much. He thinks it’s the best c_____.',answer:'cartoon'},
      {prompt:'3. I like this programme because it’s very e_____. It has good lessons for children.',answer:'educational'},
      {prompt:'4a. Did you run a m_____ last year?',answer:'marathon'},
      {prompt:'4b. No, I didn’t, but my brother did. He’s very s_____.',answer:'sporty'},
      {prompt:'5a. To play t_____ t_____, you need a ball, a net, and two rackets.',answer:'table tennis'},
      {prompt:'5b. To play table tennis, you need a ball, a net, and two r_____.',answer:'rackets'},
      {prompt:'6. Ha Noi has a lot of t_____ food. Many people like it.',answer:'tasty'},
      {prompt:'7. What’s the w_____ like in your city in the summer?',answer:'weather'}
    ]}]
  }),
  'g6-ty3-wb-3': spec({
    id:'g6-ty3-wb-3',unit:'Test Yourself 3',unitName:'Test Yourself 3',page:22,exercise:'3',title:'Test Yourself 3 · Exercise 3 · Albert Park T/F',
    rule:'Read the passage and decide if the sentences are true or false.',sourceNote:'SOURCE-LOCKED · pages 22–23 + key page 59.',
    blocks:[{type:'reading_tf',title:'ALBERT PARK',passage:'Albert Park is located only three kilometres from the Melbourne city centre. It is a 225 hectare sporting and recreational park.\n\nThe park is a beautiful, relaxing, and fun place to spend the day. You can enjoy a picnic or barbecue at one of the nine picnic areas. There is also a large lake. It is home to a gorgeous family of swans and is a lovely place to take a walk. If you are more adventurous, you can join the yacht and rowing club, take some lessons, or hire a boat just for fun and go for a paddle.\n\nPeople organise some of Melbourne’s most exciting events in Albert Park. In May, the “Million Paws Walk” sees many dogs play and run through the park with their owners, raising money for charity. Throughout the year there are various “Fun Runs”, and in March the “Fosters Australian Grand Prix Carnival” is held here.',items:[
      {statement:'Albert Park has an area of 225 hectares.',answer:true},
      {statement:'The park is a nice place for picnics.',answer:true},
      {statement:'Here you can see swans.',answer:true},
      {statement:'The yacht and rowing club is only for adventurous people to learn how to sail and row.',answer:false},
      {statement:'Dogs running to raise money for charity is an exciting event held in March.',answer:false}
    ]}]
  }),
  'g6-ty3-wb-4': spec({
    id:'g6-ty3-wb-4',unit:'Test Yourself 3',unitName:'Test Yourself 3',page:23,exercise:'4',title:'Test Yourself 3 · Exercise 4 · Grammar MCQ',
    rule:'Choose A, B, C, or D for each gap in the following sentences.',sourceNote:'SOURCE-LOCKED · page 23 + key page 59.',
    blocks:[{type:'mcq',items:[
      {prompt:'1. My house is near _____ house, so I usually go there and play badminton with her.',options:['his','her','she','hers'],answer:'her'},
      {prompt:'2. _____ watch TV too much.',options:['See','Do',"Don’t",'Did'],answer:"Don’t"},
      {prompt:'3. “_____ films did you see last week?” – “Only one.”',options:['What','Which','Who','How many'],answer:'How many'},
      {prompt:'4. There is one bedroom in my house, but there are two in _____.',options:['they','their','theirs','them'],answer:'theirs'},
      {prompt:'5. I first _____ Melbourne in 2003.',options:['went','have been','have gone','visited'],answer:'visited'},
      {prompt:'6. My brother is afraid of water, _____ he can’t swim.',options:['because','but','and','so'],answer:'so'},
      {prompt:'7. “_____ is your favourite tennis player?” – “I don’t like tennis.”',options:['What','Which','Who','Where'],answer:'Who'},
      {prompt:'8. _____ eat too much salt. It’s not good for you.',options:['Do',"Don’t",'Please',"Can’t"],answer:"Don’t"},
      {prompt:'9. “_____ is she so sad?” – “Because she can’t watch her favourite film.”',options:['Why','How','What','When'],answer:'Why'},
      {prompt:'10. She was tired, _____ she went to bed early.',options:['but','or','so','because'],answer:'so'}
    ]}]
  }),
  'g6-ty3-wb-5': spec({
    id:'g6-ty3-wb-5',unit:'Test Yourself 3',unitName:'Test Yourself 3',page:24,exercise:'5',title:'Test Yourself 3 · Exercise 5 · Postcard gap fill',
    rule:'Put one word in each gap in the postcard.',sourceNote:'SOURCE-LOCKED · page 24 + key page 59.',
    blocks:[{type:'reading_typing',title:'Postcard from Mi to Nick',passage:'July 20\nHi Nick,\nHue is (1) _____ great city. The (2) _____ is fine, sunny all the time. The food is cheap and (3) _____. The (4) _____ here are friendly and hospitable. The hotel where we’re staying is small (5) _____ comfortable. Yesterday we (6) _____ the historic monuments. Tomorrow we’re (7) _____ on a trip along Huong River. I (8) _____ a small present for you yesterday. You must visit this (9) _____ someday. You’ll love (10) _____.\nBye for now!\nCheers,\nMi',items:[
      {prompt:'Gap (1)',answer:'a'},{prompt:'Gap (2)',answer:'weather'},{prompt:'Gap (3)',answer:'delicious',accepted:['tasty']},{prompt:'Gap (4)',answer:'people'},{prompt:'Gap (5)',answer:'but'},{prompt:'Gap (6)',answer:'visited'},{prompt:'Gap (7)',answer:'going'},{prompt:'Gap (8)',answer:'bought'},{prompt:'Gap (9)',answer:'place',accepted:['city']},{prompt:'Gap (10)',answer:'it'}
    ]}]
  }),
  'g6-ty3-wb-6': spec({
    id:'g6-ty3-wb-6',unit:'Test Yourself 3',unitName:'Test Yourself 3',page:24,exercise:'6',title:'Test Yourself 3 · Exercise 6 · Find and correct mistakes',
    rule:'Find one mistake in each sentence and correct it. Bản online dùng MCQ để tránh gõ đáp án sửa dài.',sourceNote:'SOURCE ADAPTATION · correction typing → MCQ; page 24 + key page 59.',
    blocks:[{type:'mcq',items:[
      {prompt:'1. I learn how to swim in 2010.',options:['learn → learned / learnt','how → what','swim → swimming','in → on'],answer:'learn → learned / learnt'},
      {prompt:'2. Last week I come back to my home town.',options:['come → came','Last → Next','to → at','my → mine'],answer:'come → came'},
      {prompt:'3. Mine home town is a very beautiful place.',options:['Mine → My','is → are','very → many','place → places'],answer:'Mine → My'},
      {prompt:'4. This is my book; it isn’t your.',options:['your → yours','my → mine','is → are','isn’t → don’t'],answer:'your → yours'},
      {prompt:'5. Do eat much meat because it isn’t good for you.',options:["Do → Don’t",'meat → meats','isn’t → doesn’t','for → to'],answer:"Do → Don’t"}
    ]}]
  }),
  'g6-ty3-wb-7': spec({
    id:'g6-ty3-wb-7',unit:'Test Yourself 3',unitName:'Test Yourself 3',page:24,exercise:'7',title:'Test Yourself 3 · Exercise 7 · Combine sentences',
    rule:'Combine each pair of sentences below to make a complete sentence. Use and, but, or so. Bản online dùng sentence_order.',sourceNote:'SOURCE ADAPTATION · long canonical typing → sentence_order; pages 24–25 + key page 59.',
    blocks:[{type:'sentence_order',sentences:[
      'My sister can swim well, but she can’t play badminton.',
      'She loves French food, so she goes to that French restaurant every week.',
      'He stayed up late to watch a football match, so he was tired.',
      'This TV programme is boring, but she still watches it every Sunday.',
      'My mum and his mum went to Ho Chi Minh City last month, too.'
    ]}]
  }),
  'g6-ty3-wb-8': spec({
    id:'g6-ty3-wb-8',unit:'Test Yourself 3',unitName:'Test Yourself 3',page:25,exercise:'8',title:'Test Yourself 3 · Exercise 8 · Rubber-band jumping',
    rule:'Write full sentences using the suggested words/phrases. Bản online dùng sentence_order theo đáp án nguồn.',sourceNote:'SOURCE ADAPTATION · long canonical typing → sentence_order; page 25 + key page 60.',
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
    ]}]
  }),

  'g6-ty4-wb-1': spec({
    id:'g6-ty4-wb-1',unit:'Test Yourself 4',unitName:'Test Yourself 4',page:49,exercise:'1',title:'Test Yourself 4 · Exercise 1 · Stress',
    rule:'Find the word that has a different stress pattern in each line.',sourceNote:'SOURCE-LOCKED · page 49 + key page 63.',
    blocks:[{type:'mcq',items:[
      {prompt:'1. Find the different stress pattern.',options:['planet','machine','houseboat','solar'],answer:'machine'},
      {prompt:'2. Find the different stress pattern.',options:['schedule','super','effect','tower'],answer:'effect'},
      {prompt:'3. Find the different stress pattern.',options:['symbol','channel','water','repair'],answer:'repair'},
      {prompt:'4. Find the different stress pattern.',options:['wireless','exchange','pollute','reduce'],answer:'wireless'},
      {prompt:'5. Find the different stress pattern.',options:['broken','robot','station','career'],answer:'career'}
    ]}]
  }),
  'g6-ty4-wb-2': spec({
    id:'g6-ty4-wb-2',unit:'Test Yourself 4',unitName:'Test Yourself 4',page:49,exercise:'2',title:'Test Yourself 4 · Exercise 2 · Name the activities',
    rule:'Name the activities. Bài nguồn dùng tranh; bản online thay mỗi tranh bằng mô tả chữ tương đương.',sourceNote:'SOURCE ADAPTATION · picture → text clue; page 49 + key page 63.',
    blocks:[{type:'mcq',items:[
      {prompt:'1. Picture clue: the three-arrow recycling symbol.',options:['recycling','cycling','watering plants / trees','doing the gardening'],answer:'recycling'},
      {prompt:'2. Picture clue: a person waters young trees.',options:['watering plants / trees','recycling','talking with a robot','cycling'],answer:'watering plants / trees'},
      {prompt:'3. Picture clue: a person talks with a robot.',options:['talking with a robot','doing the gardening','recycling','cycling'],answer:'talking with a robot'},
      {prompt:'4. Picture clue: people work with plants in a garden.',options:['doing the gardening','watering plants / trees','cycling','talking with a robot'],answer:'doing the gardening'},
      {prompt:'5. Picture clue: a person rides a bicycle.',options:['cycling','recycling','doing the gardening','watering plants / trees'],answer:'cycling'}
    ]}]
  }),
  'g6-ty4-wb-3': spec({
    id:'g6-ty4-wb-3',unit:'Test Yourself 4',unitName:'Test Yourself 4',page:49,exercise:'3',title:'Test Yourself 4 · Exercise 3 · Grammar MCQ',
    rule:'Choose the correct option A, B, C, or D to complete the sentences.',sourceNote:'SOURCE-LOCKED · pages 49–50 + key page 63.',
    blocks:[{type:'mcq',items:[
      {prompt:'1. _____ is the longest river in Viet Nam, Mekong River or Dong Nai River?',options:['Where','Which','How','Who'],answer:'Which'},
      {prompt:'2. If we cut down more forests, there _____ more floods.',options:['are','were','have been','will be'],answer:'will be'},
      {prompt:'3. Here is their son’s telephone number; I don’t have _____.',options:['their','theirs','they','them'],answer:'theirs'},
      {prompt:'4. A robot can do _____ different things from looking after a baby to building a house.',options:['much','many','few','little'],answer:'many'},
      {prompt:'5. Lake Baikal is the _____ freshwater lake in the world.',options:['large','larger','largest','more large'],answer:'largest'},
      {prompt:'6. The opposite of “dangerous” is _____.',options:['polluted','good','safe','dirty'],answer:'safe'},
      {prompt:'7. Do you think the robot is only _____ intelligent machine?',options:['an','a','the','ø (no article)'],answer:'an'},
      {prompt:'8. The three Rs _____ for Reduce, Reuse and Recycle.',options:['stand','sit','make','explain'],answer:'stand'},
      {prompt:'9. I like this gym. _____ equipment here is new and cool.',options:['An','A','The','ø'],answer:'The'},
      {prompt:'10. In the future, robots _____ behave like humans.',options:['should','must','need','might'],answer:'might'}
    ]}]
  }),
  'g6-ty4-wb-4': spec({
    id:'g6-ty4-wb-4',unit:'Test Yourself 4',unitName:'Test Yourself 4',page:50,exercise:'4',title:'Test Yourself 4 · Exercise 4 · Robot-show letter',
    rule:'Put a suitable word in each blank to complete the letter.',sourceNote:'SOURCE-LOCKED · page 50 + key page 63.',
    blocks:[{type:'reading_typing',title:'Letter from Nathja Phan to Kitty',passage:'Hello Kitty,\nI am now at the robot show. I am surprised to (1) _____ so many kinds of robots. They (2) _____ of different sizes! The (3) _____ one is only 20 centimetres long, but the biggest is 10 metres tall! I am interested (4) _____ Robot Kiku. It can talk (5) _____ me in English. My mum likes the robot that can cook and (6) _____ the dishes. My sister loves Homy as it can (7) _____ all the housework. Now I want a robot that can answer all my (8) _____. And I hope in the future more people (9) _____ have robots at home, and we won’t (10) _____ to school because a robot will teach us everything.\nYour friend,\nNathja Phan',items:[
      {prompt:'Gap (1)',answer:'see'},{prompt:'Gap (2)',answer:'are'},{prompt:'Gap (3)',answer:'smallest'},{prompt:'Gap (4)',answer:'in'},{prompt:'Gap (5)',answer:'to',accepted:['with']},{prompt:'Gap (6)',answer:'wash'},{prompt:'Gap (7)',answer:'do'},{prompt:'Gap (8)',answer:'questions'},{prompt:'Gap (9)',answer:'will'},{prompt:'Gap (10)',answer:'go'}
    ]}]
  }),
  'g6-ty4-wb-5': spec({
    id:'g6-ty4-wb-5',unit:'Test Yourself 4',unitName:'Test Yourself 4',page:51,exercise:'5',title:'Test Yourself 4 · Exercise 5 · Energy-saving reading',
    rule:'Read the passage and choose the correct answer to each question.',sourceNote:'SOURCE-LOCKED · page 51 + key page 63.',
    blocks:[{type:'reading_mcq',title:'Simple ways to save energy',passage:'When you’re using electricity, think about where it comes from and how you can use less to save the environment. Here are some simple ways to save energy:\n\n• On or OFF?\nLeaving televisions and computers on standby with the little red light showing still uses up electricity, even though they might look like they’re turned off. To stop this you can turn them off.\n\n• Lights out!\nTurning lights off when you’re not in the room can save a lot of energy.\n\n• Shopping\nMany products are now helping you to reduce your energy use and your parents’ energy bills! Check new products for their efficiency grade and rating. Keep an eye out for the “Energy Efficiency Recommended” logo.\n\n• In the refrigerator\nThe fridge is an important part of the kitchen. It keeps food fresh, cool and healthy! But it takes a lot of energy to keep cool, so help it by not leaving the fridge door open or putting hot things inside.',items:[
      {prompt:'1. This passage tells you _____.',options:['how to keep the environment clean','some ways to save energy','some kinds of electrical appliances'],answer:'some ways to save energy'},
      {prompt:'2. When you leave televisions and computers on standby, _____.',options:['they still use electricity','they are turned off','you can save energy'],answer:'they still use electricity'},
      {prompt:'3. When you go out of the room, you should _____.',options:['close the door','turn on the lights','switch off the lights'],answer:'switch off the lights'},
      {prompt:'4. Why should you choose products with the “Energy Efficiency Recommended” logo?',options:['Because they use more electricity.','Because they are new products.','Because they are more economical.'],answer:'Because they are more economical.'},
      {prompt:'5. Putting hot things in the fridge _____.',options:['can save a lot of energy','is not a good thing to do','is a quick way to keep cool'],answer:'is not a good thing to do'}
    ]}]
  }),
  'g6-ty4-wb-6': spec({
    id:'g6-ty4-wb-6',unit:'Test Yourself 4',unitName:'Test Yourself 4',page:52,exercise:'6',title:'Test Yourself 4 · Exercise 6 · Verb tenses',
    rule:'Put the verbs into correct tense to finish the sentences. Bản online dùng MCQ theo đáp án in trong sách.',sourceNote:'SOURCE ADAPTATION · short verb-form typing → MCQ; page 52 + key page 63. Source key is preserved even where wording may feel unusual.',
    blocks:[{type:'mcq',items:[
      {prompt:'1. _____ you ever (see) _____ a real robot at work? – No, never.',options:['Do you ever see','Did you ever see','Have you ever saw','Are you ever see'],answer:'Do you ever see'},
      {prompt:'2. Tung is learning to play the guitar. He (buy) _____ a guitar last month.',options:['bought','buys','will buy','buy'],answer:'bought'},
      {prompt:'3. If it (be) _____ nice tomorrow, we (plant) _____ some young trees in our garden.',options:['is – will plant','will be – plant','was – planted','is – planted'],answer:'is – will plant'},
      {prompt:'4. Do you think there (be) _____ a city underwater?',options:['will be','is','was','has'],answer:'will be'}
    ]}]
  }),
  'g6-ty4-wb-7': spec({
    id:'g6-ty4-wb-7',unit:'Test Yourself 4',unitName:'Test Yourself 4',page:52,exercise:'7',title:'Test Yourself 4 · Exercise 7 · Conversation order',
    rule:'Put the following in the correct order to make a conversation. The first one is given.',sourceNote:'SOURCE-LOCKED · page 52 + key page 63.',
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
    ],correctOrder:['A','D','F','E','G','I','J','C','H','B']}]
  }),
  'g6-ty4-wb-8': spec({
    id:'g6-ty4-wb-8',unit:'Test Yourself 4',unitName:'Test Yourself 4',page:52,exercise:'8',title:'Test Yourself 4 · Exercise 8 · Sentence transformation',
    rule:'Complete the second sentence so that it means the same as the sentence before it. Bản online dùng sentence_order.',sourceNote:'SOURCE ADAPTATION · long canonical typing → sentence_order; page 52 + key page 63.',
    blocks:[{type:'sentence_order',sentences:[
      'Don’t swim in that polluted lake, boys!',
      'No river in the world is longer than the Nile.',
      'They live far from the school, but we live near it.',
      'That is his racket over there, but this one is mine.',
      'Minh hopes that he will speak English well in 3 years.'
    ]}]
  })
});

function normalizedLegacy(entry) {
  return freeze({
    ...entry,
    expectedTimeMinutes:Math.min(20,entry.expectedTimeMinutes),
    activityTypes:freeze(entry.activityTypes.map(type=>type==='tf'?'true_false':type))
  });
}
function correctedDescriptor(entry, sourceSpec) {
  const sourceTypes=sourceSpec.sourceActivityTypes;
  return freeze({
    ...entry,
    version:3,
    title:sourceSpec.title,
    expectedTimeMinutes:Math.min(20,sourceSpec.expectedTimeMinutes+2),
    sourceActivityTypes:sourceTypes,
    activityTypes:freeze([...new Set(['mcq',...sourceTypes,...(sourceTypes.includes('typing')?['sentence_order']:[])])]),
    sourceItemCount:sourceSpec.sourceItemCount,
    preloadItemCount:8,
    itemCount:sourceSpec.sourceItemCount+8,
    description:`SOURCE-LOCKED theo SBT Tập Hai. ${sourceSpec.sourceItemCount} lượt nguồn; hình/lưới hoặc typing dài được chuyển sang tương tác số tương đương, không bỏ bài.`,
    loadContent:async()=>defineG6WorkbookLesson(sourceSpec)
  });
}

export const g6Tap2PublishedSupplementRegistry=freeze(g6Tap2SupplementRegistry.map(entry=>corrected[entry.id]?correctedDescriptor(entry,corrected[entry.id]):normalizedLegacy(entry)));
