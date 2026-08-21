const RAW = [{"key":"pronunciation-s-01","trapCode":"P-FINAL-S","title":"Pronunciation · Final -s /s/ vs /z/","folderId":"global6-unit2-trap-pronunciation","order":1,"difficulty":"medium","expectedTimeMinutes":7,"examType":"Pronunciation · Odd final -s","sourceScope":"Unit 2 pronunciation transcript","items":[["g6u2-trap-pronunciation-s-01-q01","lamps/sinks/flats end /s/; rooms ends /z/.",false,"Choose the word whose final -s is pronounced differently.\nlamps · sinks · flats · rooms","sinks","đáp án sinks","chọn/dùng rooms","phải phân loại đúng final -s /s/ và /z/ theo nhóm từ của Unit 2. Cụ thể: lamps/sinks/flats end /s/; rooms ends /z/."],["g6u2-trap-pronunciation-s-01-q02","cupboards/sofas/kitchens end /z/; toilets ends /s/.",false,"Choose the word whose final -s is pronounced differently.\ncupboards · sofas · kitchens · toilets","sofas","đáp án sofas","chọn/dùng toilets","phải phân loại đúng final -s /s/ và /z/ theo nhóm từ của Unit 2. Cụ thể: cupboards/sofas/kitchens end /z/; toilets ends /s/."],["g6u2-trap-pronunciation-s-01-q03","lamps/toilets/flats end /s/; sofas ends /z/.",false,"Choose the word whose final -s is pronounced differently.\nlamps · toilets · flats · sofas","flats","đáp án flats","chọn/dùng sofas","phải phân loại đúng final -s /s/ và /z/ theo nhóm từ của Unit 2. Cụ thể: lamps/toilets/flats end /s/; sofas ends /z/."],["g6u2-trap-pronunciation-s-01-q04","rooms/cupboards/kitchens end /z/; sinks ends /s/.",false,"Choose the word whose final -s is pronounced differently.\nrooms · cupboards · kitchens · sinks","rooms","đáp án rooms","chọn/dùng sinks","phải phân loại đúng final -s /s/ và /z/ theo nhóm từ của Unit 2. Cụ thể: rooms/cupboards/kitchens end /z/; sinks ends /s/."],["g6u2-trap-pronunciation-s-01-q05","sinks/flats/toilets end /s/; cupboards ends /z/.",false,"Choose the word whose final -s is pronounced differently.\nsinks · flats · toilets · cupboards","toilets","đáp án toilets","chọn/dùng cupboards","phải phân loại đúng final -s /s/ và /z/ theo nhóm từ của Unit 2. Cụ thể: sinks/flats/toilets end /s/; cupboards ends /z/."],["g6u2-trap-pronunciation-s-01-q06","sofas/rooms/cupboards end /z/; lamps ends /s/.",false,"Choose the word whose final -s is pronounced differently.\nsofas · rooms · cupboards · lamps","cupboards","đáp án cupboards","chọn/dùng lamps","phải phân loại đúng final -s /s/ và /z/ theo nhóm từ của Unit 2. Cụ thể: sofas/rooms/cupboards end /z/; lamps ends /s/."],["g6u2-trap-pronunciation-s-01-q07","kitchens/rooms/sofas end /z/; flats ends /s/.",false,"Choose the word whose final -s is pronounced differently.\nkitchens · rooms · sofas · flats","kitchens","đáp án kitchens","chọn/dùng flats","phải phân loại đúng final -s /s/ và /z/ theo nhóm từ của Unit 2. Cụ thể: kitchens/rooms/sofas end /z/; flats ends /s/."],["g6u2-trap-pronunciation-s-01-q08","toilets/lamps/sinks end /s/; rooms ends /z/.",false,"Choose the word whose final -s is pronounced differently.\ntoilets · lamps · sinks · rooms","lamps","đáp án lamps","chọn/dùng rooms","phải phân loại đúng final -s /s/ và /z/ theo nhóm từ của Unit 2. Cụ thể: toilets/lamps/sinks end /s/; rooms ends /z/."]]}];

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

export const g6U2TrapPronunciationSource = Object.freeze(RAW.map(lesson => Object.freeze({
  ...lesson,
  items: Object.freeze(lesson.items.map((row, index) => decodeItem(lesson, row, index)))
})));
