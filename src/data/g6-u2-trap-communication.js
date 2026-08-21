const RAW = [{"key":"communication-01","trapCode":"C-FUNCTION","title":"Communication · Suggestion & Response","folderId":"global6-unit2-trap-communication","order":1,"difficulty":"medium","expectedTimeMinutes":7,"examType":"Communication · Appropriate response/function","sourceScope":"Unit 2 communication transcript","items":[["g6u2-trap-communication-01-q01","A gives a suggestion; B should respond to the suggestion.",false,"A: How about putting a picture on the wall?\nB:","On the wall.","đáp án On the wall.","chọn/dùng Great idea.","response phải khớp speech function của câu trước. Cụ thể: A gives a suggestion; B should respond to the suggestion."],["g6u2-trap-communication-01-q02","A asks for reaction to a suggestion, not the object name.",false,"A: How about putting a picture on the wall?\nB:","A picture.","đáp án A picture.","chọn/dùng Great idea.","response phải khớp speech function của câu trước. Cụ thể: A asks for reaction to a suggestion, not the object name."],["g6u2-trap-communication-01-q03","A asks for acceptance/reaction, not existence.",false,"A: How about putting a picture on the wall?\nB:","There is one.","đáp án There is one.","chọn/dùng Great idea.","response phải khớp speech function của câu trước. Cụ thể: A asks for acceptance/reaction, not existence."],["g6u2-trap-communication-01-q04","After accepting, the corpus continues with a plan/action.",false,"A: Great idea.\nB:","On the wall.","đáp án On the wall.","chọn/dùng Let's go to the department store to buy one.","response phải khớp speech function của câu trước. Cụ thể: After accepting, the corpus continues with a plan/action."],["g6u2-trap-communication-01-q05","The next move is a plan, not a noun answer.",false,"A: Great idea.\nB:","A picture.","đáp án A picture.","chọn/dùng Let's go to the department store to buy one.","response phải khớp speech function của câu trước. Cụ thể: The next move is a plan, not a noun answer."],["g6u2-trap-communication-01-q06","Let's + V performs a suggestion/plan.",false,"A: Let's go to the department store to buy one.\nWhat does this line do?","It asks where the picture is.","đáp án It asks where the picture is.","chọn/dùng It proposes the next action.","response phải khớp speech function của câu trước. Cụ thể: Let's + V performs a suggestion/plan."],["g6u2-trap-communication-01-q07","How about + V-ing is a suggestion frame.",false,"A: How about putting a picture on the wall?\nWhat is the function?","It asks for a location.","đáp án It asks for a location.","chọn/dùng It makes a suggestion.","response phải khớp speech function của câu trước. Cụ thể: How about + V-ing is a suggestion frame."],["g6u2-trap-communication-01-q08","Great idea is a positive response.",false,"B: Great idea.\nWhat is the function?","It gives a place.","đáp án It gives a place.","chọn/dùng It accepts/reacts positively to a suggestion.","response phải khớp speech function của câu trước. Cụ thể: Great idea is a positive response."]]}];

const decodeItem = (lesson, row, index) => Object.freeze({
  id: row[0],
  itemOrder: index + 1,
  trapCode: lesson.trapCode,
  examType: lesson.examType,
  sourceScope: lesson.sourceScope,
  sourceEvidence: row[1],
  exactCorpusRequired: row[2] === true,
  originalQuestion: row[3],
  wrongResponse: row[4],
  diagnosisPrompt: 'Bạn này sai ở đâu, nên sửa lại thế nào và vì sao?',
  correctDiagnosis: Object.freeze({ error: row[5], repair: row[6], reason: row[7] })
});

export const g6U2TrapCommunicationSource = Object.freeze(RAW.map(lesson => Object.freeze({
  ...lesson,
  items: Object.freeze(lesson.items.map((row, index) => decodeItem(lesson, row, index)))
})));
