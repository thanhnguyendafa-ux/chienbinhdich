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
        choice('a', 'False — because she lives in a big city.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'True — because she lives in a small village.', true, true),
        choice('c', 'True — because her favourite colour is pink.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'False — because she lives with her brother.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'b',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: '“I live in a small village” cho biết Lucy sống ở một ngôi làng nhỏ, tức vùng countryside.', theory: 'Đọc statement trước, sau đó tìm đúng câu trong bài chứng minh statement đó.', example: 'small village → countryside' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q02', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Green is Lucy’s favourite colour.',
      choices: Object.freeze([
        choice('a', 'True — because Lucy says she likes green.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'False — because Lucy does not like colours.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'True — because her brother likes green.', false, true, 'wrong_verdict_right_evidence'),
        choice('d', 'False — because Lucy likes pink; green is her brother’s colour.', true, true)
      ]),
      correctChoiceId: 'd',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Bài nói Lucy thích pink, còn green thuộc về người em trai. Đây là bẫy đổi chủ thể.', theory: 'Luôn kiểm tra “ai” sở hữu thông tin, không chỉ nhìn thấy đúng từ khóa.', example: 'Lucy → pink; brother → green.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q03', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Lucy likes sandwiches better than pizza.',
      choices: Object.freeze([
        choice('a', 'True — because sandwiches are her favourite food and she does not like pizza very much.', true, true),
        choice('b', 'False — because pizza is her favourite food.', false, false, 'wrong_verdict_wrong_reason'),
        choice('c', 'True — because table tennis is her favourite sport.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'False — because she likes both foods equally.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'a',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Hai dữ kiện “favourite food is sandwiches” và “don’t like pizza very much” cùng chứng minh statement.', theory: 'Một statement có thể cần ghép hai dữ kiện thay vì chỉ scan một từ.', example: 'favourite sandwiches + not like pizza very much → prefers sandwiches.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q04', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Lucy’s favourite sport is table tennis.',
      choices: Object.freeze([
        choice('a', 'False — because she only watches table tennis.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'True — because dolphins can jump beautifully.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'True — because the passage says table tennis is her favourite sport.', true, true),
        choice('d', 'False — because her favourite sport is swimming.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'c',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Có câu trực tiếp: “Table tennis is my favourite sport.”', theory: 'Ưu tiên bằng chứng trực tiếp nhất nếu bài đã nói rõ.', example: 'favourite sport = table tennis.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q05', type: 'mcq', passageId: 'g5u1-reading-p01',
      prompt: 'Lucy likes dolphins because they are pink.',
      choices: Object.freeze([
        choice('a', 'True — because pink is Lucy’s favourite colour.', false, true, 'wrong_verdict_right_evidence'),
        choice('b', 'False — because she likes dolphins because they can jump beautifully.', true, true),
        choice('c', 'False — because Lucy does not like animals.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'True — because dolphins are her favourite food.', false, false, 'wrong_verdict_wrong_reason')
      ]),
      correctChoiceId: 'b',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Lý do thật là dolphins “can jump beautifully”, không liên quan đến màu pink.', theory: 'Khi statement có “because”, phải kiểm tra cả sự thật lẫn nguyên nhân.', example: 'likes dolphins → because they can jump beautifully.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q06', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Nam lives in a quiet village.',
      choices: Object.freeze([
        choice('a', 'False — because Nam lives in Da Nang, which he describes as a busy city.', true, true),
        choice('b', 'True — because Nam likes living with his family.', false, true, 'wrong_verdict_right_evidence'),
        choice('c', 'False — because Nam is in Class 5C.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'True — because he plays football on Saturdays.', false, false, 'wrong_verdict_wrong_reason')
      ]),
      correctChoiceId: 'a',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Nam sống ở Da Nang và bài mô tả đó là “a busy city”, không phải quiet village.', theory: 'Đối chiếu cả loại nơi chốn và tính chất của nơi chốn.', example: 'Da Nang → busy city.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q07', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Maths is Nam’s favourite subject.',
      choices: Object.freeze([
        choice('a', 'True — because Nam studies maths at school.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'True — because Minh likes maths.', false, true, 'wrong_verdict_right_evidence'),
        choice('c', 'False — because Nam’s favourite subject is English; Minh likes maths.', true, true),
        choice('d', 'False — because Nam’s favourite subject is football.', true, false, 'right_verdict_wrong_reason')
      ]),
      correctChoiceId: 'c',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'English thuộc về Nam; maths thuộc về Minh. Đây là bẫy đổi người.', theory: 'Tên người gần từ khóa không có nghĩa từ khóa thuộc về người đang hỏi.', example: 'Nam → English; Minh → maths.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q08', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Nam often plays football at the weekend.',
      choices: Object.freeze([
        choice('a', 'False — because he plays table tennis every day.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'True — because he usually plays football on Saturday afternoons.', true, true),
        choice('c', 'True — because blue is his favourite colour.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'False — because he only watches football.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'b',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Saturday là một ngày cuối tuần, nên câu “usually ... on Saturday afternoons” hỗ trợ statement.', theory: 'Reading có thể yêu cầu paraphrase nhẹ: Saturday → weekend.', example: 'Saturday afternoon = at the weekend.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q09', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Noodles are Nam’s favourite food.',
      choices: Object.freeze([
        choice('a', 'True — because Nam says he likes noodles.', false, true, 'wrong_verdict_right_evidence'),
        choice('b', 'False — because Nam does not eat noodles.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'True — because noodles and fish are the same food.', false, false, 'wrong_verdict_wrong_reason'),
        choice('d', 'False — because he likes noodles, but fish and chips is his favourite food.', true, true)
      ]),
      correctChoiceId: 'd',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Nam “likes noodles” nhưng “favourite food” là fish and chips.', theory: 'like ≠ favourite. Đừng đổi “thích” thành “thích nhất”.', example: 'like noodles; favourite food = fish and chips.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q10', type: 'mcq', passageId: 'g5u1-reading-p02',
      prompt: 'Nam’s favourite animal and favourite colour are a dolphin and blue.',
      choices: Object.freeze([
        choice('a', 'True — because the passage gives both a dolphin and blue as his favourites.', true, true),
        choice('b', 'False — because his favourite animal is a fish.', false, false, 'wrong_verdict_wrong_reason'),
        choice('c', 'True — because he lives in Da Nang.', true, false, 'right_verdict_wrong_reason'),
        choice('d', 'False — because blue is Minh’s favourite colour.', false, true, 'wrong_verdict_right_evidence')
      ]),
      correctChoiceId: 'a',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Statement chứa hai facts và cả hai đều xuất hiện trực tiếp trong bài.', theory: 'Nếu statement có hai phần nối bằng “and”, phải kiểm tra đủ cả hai.', example: 'animal = dolphin AND colour = blue.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q11', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'Sophie lives in the countryside.',
      choices: Object.freeze([
        choice('a', 'True — because she visits her grandparents there.', false, true, 'wrong_verdict_right_evidence'),
        choice('b', 'False — because her grandparents live in another country.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'False — because Sophie lives in a big city; she only visits the countryside.', true, true),
        choice('d', 'True — because she goes there at weekends.', false, false, 'wrong_verdict_wrong_reason')
      ]),
      correctChoiceId: 'c',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Sophie “lives in a big city” và chỉ “visits” grandparents in the countryside.', theory: 'live ≠ visit. Phải đọc đúng động từ quan hệ với địa điểm.', example: 'lives in city; visits countryside.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q12', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'PE is Sophie’s favourite subject because she enjoys sports.',
      choices: Object.freeze([
        choice('a', 'True — because the passage states both PE as her favourite subject and enjoying sports as the reason.', true, true),
        choice('b', 'False — because her favourite subject is maths.', false, false, 'wrong_verdict_wrong_reason'),
        choice('c', 'False — because swimming is a sport, not a subject.', false, true, 'wrong_verdict_right_evidence'),
        choice('d', 'True — because green is her favourite colour.', true, false, 'right_verdict_wrong_reason')
      ]),
      correctChoiceId: 'a',
      teachingFeedback: Object.freeze({ correctLabel: 'TRUE + đúng bằng chứng', reason: 'Bài cho cả fact và reason trong cùng câu: favourite subject = PE because she enjoys sports.', theory: 'Với câu có because, evidence phải hỗ trợ đúng quan hệ nguyên nhân.', example: 'PE ← because she enjoys sports.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q13', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'Basketball is Sophie’s favourite sport.',
      choices: Object.freeze([
        choice('a', 'True — because she can play basketball.', false, true, 'wrong_verdict_right_evidence'),
        choice('b', 'False — because Sophie cannot play basketball.', true, false, 'right_verdict_wrong_reason'),
        choice('c', 'True — because PE is her favourite subject.', false, false, 'wrong_verdict_wrong_reason'),
        choice('d', 'False — because she can play basketball, but she likes swimming best.', true, true)
      ]),
      correctChoiceId: 'd',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: '“can play basketball” chỉ là khả năng; “likes swimming best” mới cho biết favourite sport.', theory: 'can do ≠ favourite. Phân biệt khả năng với sở thích.', example: 'can play basketball; favourite = swimming.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q14', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'Cats are Sophie’s favourite animals.',
      choices: Object.freeze([
        choice('a', 'False — because she dislikes cats.', true, false, 'right_verdict_wrong_reason'),
        choice('b', 'True — because Sophie says she likes cats.', false, true, 'wrong_verdict_right_evidence'),
        choice('c', 'False — because she likes cats, but dolphins are her favourite animals.', true, true),
        choice('d', 'True — because cats live in the countryside.', false, false, 'wrong_verdict_wrong_reason')
      ]),
      correctChoiceId: 'c',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Sophie likes cats nhưng dolphins mới là favourite animals.', theory: 'like ≠ favourite; “but” thường báo hiệu contrast cần đọc kỹ.', example: 'likes cats, but favourite animals = dolphins.' })
    }),
    Object.freeze({
      id: 'g5u1-reading-q15', type: 'mcq', passageId: 'g5u1-reading-p03',
      prompt: 'Sophie often eats her favourite food for lunch.',
      choices: Object.freeze([
        choice('a', 'True — because she often has pizza for lunch.', false, false, 'wrong_verdict_wrong_reason'),
        choice('b', 'False — because she often has a sandwich for lunch, while pizza is her favourite food.', true, true),
        choice('c', 'True — because a sandwich is her favourite food.', false, true, 'wrong_verdict_right_evidence'),
        choice('d', 'False — because she never eats lunch.', true, false, 'right_verdict_wrong_reason')
      ]),
      correctChoiceId: 'b',
      teachingFeedback: Object.freeze({ correctLabel: 'FALSE + đúng bằng chứng', reason: 'Lunch thường là sandwich, còn favourite food là pizza; hai thông tin không phải cùng một thứ.', theory: 'often eat ≠ favourite. Phải nối đúng hành động thường xuyên với sở thích cao nhất.', example: 'often lunch = sandwich; favourite food = pizza.' })
    })
  ])
});
