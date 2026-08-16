const diag = (verdictCorrect, reasonCorrect, errorCode) => Object.freeze({ verdictCorrect, reasonCorrect, errorCode });
const choice = (id, text, verdictCorrect, reasonCorrect, errorCode = null) => Object.freeze({
  id, text, diagnostic: diag(verdictCorrect, reasonCorrect, errorCode)
});

export const global5Unit1Reading01Content = Object.freeze({
  passages: Object.freeze([
    Object.freeze({
      id: 'g5u1-reading-p01',
      title: 'Meet Lucy',
      text: 'Hi! My name is Lucy. I’m eleven years old. I’m in Class 5A. I live in a small village with my parents and my brother. I like my village because it is quiet. My favourite colour is pink, but my brother likes green. My favourite food is sandwiches. I don’t like pizza very much. After school, I sometimes play table tennis with my friends. Table tennis is my favourite sport. I also love dolphins because they can jump beautifully.'
    }),
    Object.freeze({
      id: 'g5u1-reading-p02',
      title: 'All about Nam',
      text: 'Hello. I’m Nam. I’m in Grade 5 and my class is 5C. I live in Da Nang with my family. It is a busy city, but I like living there. At school, my favourite subject is English. My best friend Minh likes maths, but maths is not my favourite subject. My favourite sport is football. I usually play it on Saturday afternoons. My favourite animal is a dolphin, and my favourite colour is blue. I like noodles, but my favourite food is fish and chips.'
    }),
    Object.freeze({
      id: 'g5u1-reading-p03',
      title: 'This is Sophie',
      text: 'Hi everyone! I’m Sophie. I’m ten and I’m in Class 5B. My family lives in a big city in Australia. I like the city, but I love visiting my grandparents in the countryside at weekends. My favourite subject is PE because I enjoy sports. I can play basketball, but it isn’t my favourite sport. I like swimming best. My favourite colour is green. I love animals too. I like cats, but dolphins are my favourite animals. For lunch, I often have a sandwich. However, my favourite food is pizza.'
    })
  ]),
  items: Object.freeze([
    Object.freeze({
      id: 'g5u1-reading-q01', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Lucy lives in the countryside.',
      choices: Object.freeze([
        choice('a', 'False — because Lucy says she lives in a large city.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'True — because Lucy says she lives in a small village.', true, true),
        choice('c', 'True — because Lucy says her favourite colour is bright pink.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'False — because Lucy says she lives with her brother.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'b',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: '“I live in a small village” cho biết Lucy sống ở một ngôi làng nhỏ, tức vùng countryside.', theory: 'Đọc statement trước, sau đó tìm đúng câu trong bài chứng minh statement đó.', example: 'small village → countryside' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q02', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Green is Lucy’s favourite colour.',
      choices: Object.freeze([
        choice('a', 'True — because Lucy says green is her favourite colour.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'False — because Lucy says she does not like any colours.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'True — because the passage says her brother likes green.', false, true, 'wrong_verdict_right_evidence'),
        choice('d', 'False — because Lucy likes pink while her brother likes green.', true, true)
      ]),
      correctChoiceId: 'd',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Bài nói Lucy thích pink, còn green thuộc về người em trai. Đây là bẫy đổi chủ thể.', theory: 'Luôn kiểm tra “ai” sở hữu thông tin, không chỉ nhìn thấy đúng từ khóa.', example: 'Lucy → pink; brother → green.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q03', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Lucy likes sandwiches better than pizza.',
      choices: Object.freeze([
        choice('a', 'True — because sandwiches are her favourite and pizza is not.', true, true),
        choice('b', 'False — because pizza is her favourite and sandwiches are not.', false, false, 'wrong_verdict_wrong_reason'),
        choice('c', 'True — because table tennis is her favourite sport after school.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'False — because sandwiches are her favourite and pizza is not.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'a',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Hai dữ kiện “favourite food is sandwiches” và “don’t like pizza very much” cùng chứng minh statement.', theory: 'Một statement có thể cần ghép hai dữ kiện thay vì chỉ scan một từ.', example: 'favourite sandwiches + not like pizza very much → prefers sandwiches.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q04', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Lucy’s favourite sport is table tennis.',
      choices: Object.freeze([
        choice('a', 'False — because Lucy only watches table tennis after school.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'True — because dolphins can jump beautifully in the passage.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'True — because table tennis is named as her favourite sport.', true, true),
        choice('d', 'False — because table tennis is named as her favourite sport.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'c',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Có câu trực tiếp: “Table tennis is my favourite sport.”', theory: 'Ưu tiên bằng chứng trực tiếp nhất nếu bài đã nói rõ.', example: 'favourite sport = table tennis.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q05', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Lucy likes dolphins because they are pink.',
      choices: Object.freeze([
        choice('a', 'True — because pink is Lucy’s favourite colour in the passage.', false, true, 'wrong_verdict_right_evidence'),
        choice('b', 'False — because she likes dolphins for their beautiful jumps.', true, true),
        choice('c', 'False — because Lucy says she does not like animals at all.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'True — because Lucy names dolphins as her favourite food.', false, false, 'wrong_verdict_wrong_reason')
      ]),
      correctChoiceId: 'b',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Lý do thật là dolphins “can jump beautifully”, không liên quan đến màu pink.', theory: 'Khi statement có “because”, phải kiểm tra cả sự thật lẫn nguyên nhân.', example: 'likes dolphins → because they can jump beautifully.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q06', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Nam lives in a quiet village.',
      choices: Object.freeze([
        choice('a', 'False — because Nam lives in Da Nang, a busy city.', true, true),
        choice('b', 'True — because Nam enjoys living in Da Nang with his family.', false, true, 'wrong_verdict_right_evidence'),
        choice('c', 'False — because Nam studies in Class 5C at his school.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'True — because Nam plays football there on Saturday afternoons.', false, false, 'wrong_verdict_wrong_reason')
      ]),
      correctChoiceId: 'a',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Nam sống ở Da Nang và bài mô tả đó là “a busy city”, không phải quiet village.', theory: 'Đối chiếu cả loại nơi chốn và tính chất của nơi chốn.', example: 'Da Nang → busy city.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q07', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Maths is Nam’s favourite subject.',
      choices: Object.freeze([
        choice('a', 'True — because Nam studies maths as his favourite school subject.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'True — because Minh says he likes maths at school.', false, true, 'wrong_verdict_right_evidence'),
        choice('c', 'False — because Nam prefers English while Minh likes maths.', true, true),
        choice('d', 'False — because Nam says football is his favourite school subject.', true, false, 'right_verdict_wrong_reason')
      ]),
      correctChoiceId: 'c',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'English thuộc về Nam; maths thuộc về Minh. Đây là bẫy đổi người.', theory: 'Tên người gần từ khóa không có nghĩa từ khóa thuộc về người đang hỏi.', example: 'Nam → English; Minh → maths.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q08', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Nam often plays football at the weekend.',
      choices: Object.freeze([
        choice('a', 'False — because Nam plays table tennis every Saturday afternoon.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'True — because he usually plays football on Saturday afternoons.', true, true),
        choice('c', 'True — because blue is his favourite colour in the passage.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'False — because he usually plays football on Saturday afternoons.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'b',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Saturday là một ngày cuối tuần, nên câu “usually ... on Saturday afternoons” hỗ trợ statement.', theory: 'Reading có thể yêu cầu paraphrase nhẹ: Saturday → weekend.', example: 'Saturday afternoon = at the weekend.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q09', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Noodles are Nam’s favourite food.',
      choices: Object.freeze([
        choice('a', 'True — because Nam says he likes noodles in the passage.', false, true, 'wrong_verdict_right_evidence'),
        choice('b', 'False — because Nam says he never eats noodles at home.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'True — because noodles and fish and chips mean the same meal.', false, false, 'wrong_verdict_wrong_reason'),
        choice('d', 'False — because he likes noodles but prefers fish and chips.', true, true)
      ]),
      correctChoiceId: 'd',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Nam “likes noodles” nhưng “favourite food” là fish and chips.', theory: 'like ≠ favourite. Đừng đổi “thích” thành “thích nhất”.', example: 'like noodles; favourite food = fish and chips.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q10', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Nam’s favourite animal and favourite colour are a dolphin and blue.',
      choices: Object.freeze([
        choice('a', 'True — because his favourites are a dolphin and the colour blue.', true, true),
        choice('b', 'False — because his favourite animal is a fish and blue.', false, false, 'wrong_verdict_wrong_reason'),
        choice('c', 'True — because he lives with his family in Da Nang city.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'False — because the passage says Nam’s favourite colour is blue.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'a',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Statement chứa hai facts và cả hai đều xuất hiện trực tiếp trong bài.', theory: 'Nếu statement có hai phần nối bằng “and”, phải kiểm tra đủ cả hai.', example: 'animal = dolphin AND colour = blue.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q11', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'Sophie lives in the countryside.',
      choices: Object.freeze([
        choice('a', 'True — because she regularly visits her grandparents in the countryside at weekends.', false, true, 'wrong_verdict_right_evidence'),
        choice('b', 'False — because her grandparents live in a different country from Sophie.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'False — because Sophie lives in a city and only visits the countryside.', true, true),
        choice('d', 'True — because she visits the countryside with her grandparents at weekends.', false, false, 'wrong_verdict_wrong_reason')
      ]),
      correctChoiceId: 'c',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Sophie “lives in a big city” và chỉ “visits” grandparents in the countryside.', theory: 'live ≠ visit. Phải đọc đúng động từ quan hệ với địa điểm.', example: 'lives in city; visits countryside.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q12', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'PE is Sophie’s favourite subject because she enjoys sports.',
      choices: Object.freeze([
        choice('a', 'True — because PE is her favourite and she enjoys sports.', true, true),
        choice('b', 'False — because maths is her favourite subject at school.', false, false, 'wrong_verdict_wrong_reason'),
        choice('c', 'False — because swimming is a sport but PE is a subject.', false, true, 'wrong_verdict_right_evidence'),
        choice('d', 'True — because green is her favourite colour in the passage.', true, false, 'right_verdict_wrong_reason')
      ]),
      correctChoiceId: 'a',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Bài cho cả fact và reason trong cùng câu: favourite subject = PE because she enjoys sports.', theory: 'Với câu có because, evidence phải hỗ trợ đúng quan hệ nguyên nhân.', example: 'PE ← because she enjoys sports.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q13', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'Basketball is Sophie’s favourite sport.',
      choices: Object.freeze([
        choice('a', 'True — because she says she can play basketball in the passage.', false, true, 'wrong_verdict_right_evidence'),
        choice('b', 'False — because Sophie says she cannot play basketball at all.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'True — because PE is her favourite subject at school.', false, false, 'wrong_verdict_wrong_reason'),
        choice('d', 'False — because she can play basketball but prefers swimming.', true, true)
      ]),
      correctChoiceId: 'd',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: '“can play basketball” chỉ là khả năng; “likes swimming best” mới cho biết favourite sport.', theory: 'can do ≠ favourite. Phân biệt khả năng với sở thích.', example: 'can play basketball; favourite = swimming.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q14', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'Cats are Sophie’s favourite animals.',
      choices: Object.freeze([
        choice('a', 'False — because Sophie says she does not like cats at all.', true, false, 'right_verdict_wrong_reason'),
        choice('b', 'True — because Sophie says she likes cats in the passage.', false, true, 'wrong_verdict_right_evidence'),
        choice('c', 'False — because Sophie likes cats but prefers dolphins as animals.', true, true),
        choice('d', 'True — because cats live in the countryside near her grandparents.', false, false, 'wrong_verdict_wrong_reason')
      ]),
      correctChoiceId: 'c',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Sophie likes cats nhưng dolphins mới là favourite animals.', theory: 'like ≠ favourite; “but” thường báo hiệu contrast cần đọc kỹ.', example: 'likes cats, but favourite animals = dolphins.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q15', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'Sophie often eats her favourite food for lunch.',
      choices: Object.freeze([
        choice('a', 'True — because Sophie often has pizza as her lunch at school.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'False — because lunch is often a sandwich while pizza is favourite.', true, true),
        choice('c', 'True — because she says sandwiches are her favourite food.', false, true, 'wrong_verdict_right_evidence'),
        choice('d', 'False — because Sophie never eats lunch during the school day.', true, false, 'right_verdict_wrong_reason')
      ]),
      correctChoiceId: 'b',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Lunch thường là sandwich, còn favourite food là pizza; hai thông tin không phải cùng một thứ.', theory: 'often eat ≠ favourite. Phải nối đúng hành động thường xuyên với sở thích cao nhất.', example: 'often lunch = sandwich; favourite food = pizza.' })
    })
  ])
});
