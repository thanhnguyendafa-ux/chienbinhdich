function typingItem(id, stage, vi, en, buildsFrom = []) {
  return Object.freeze({ id, stage, vi, en, buildsFrom: Object.freeze([...buildsFrom]) });
}

function content(items) {
  return Object.freeze({ items: Object.freeze(items) });
}

function statementLesson({ subjectVi, subjectEn, placeVi, placeEn, locationVi, locationEn, targetVi, targetEn }) {
  return content([
    typingItem('word-subject', 'word', subjectVi, subjectEn),
    typingItem('word-place', 'word', placeVi, placeEn),
    typingItem('phrase-location', 'phrase', locationVi, locationEn, ['word-place']),
    typingItem('phrase-subject-location', 'phrase', `${subjectVi} ${locationVi}`, `${subjectEn} ${locationEn}`, ['word-subject', 'phrase-location']),
    typingItem('phrase-there-is', 'phrase', 'ở đó có', 'there is'),
    typingItem('phrase-there-is-subject', 'phrase', `ở đó có ${subjectVi}`, `there is ${subjectEn}`, ['phrase-there-is', 'word-subject']),
    typingItem('sentence-target', 'sentence', targetVi, targetEn, ['phrase-there-is-subject', 'phrase-location'])
  ]);
}

function questionLesson({ subjectVi, subjectEn, placeVi, placeEn, locationVi, locationEn, targetVi, targetEn }) {
  return content([
    typingItem('word-subject', 'word', subjectVi, subjectEn),
    typingItem('word-place', 'word', placeVi, placeEn),
    typingItem('phrase-location', 'phrase', locationVi, locationEn, ['word-place']),
    typingItem('phrase-subject-location', 'phrase', `${subjectVi} ${locationVi}`, `${subjectEn} ${locationEn}`, ['word-subject', 'phrase-location']),
    typingItem('phrase-is-there', 'phrase', 'ở đó có ... không?', 'is there'),
    typingItem('sentence-question-short', 'sentence', `Ở đó có ${subjectVi} không?`, `Is there ${subjectEn}?`, ['phrase-is-there', 'word-subject']),
    typingItem('sentence-target', 'sentence', targetVi, targetEn, ['sentence-question-short', 'phrase-subject-location'])
  ]);
}

function yesAnswerLesson({ subjectVi, subjectEn, placeVi, placeEn, locationVi, locationEn, questionVi, questionEn }) {
  return content([
    typingItem('word-subject', 'word', subjectVi, subjectEn),
    typingItem('word-place', 'word', placeVi, placeEn),
    typingItem('phrase-location', 'phrase', locationVi, locationEn, ['word-place']),
    typingItem('phrase-subject-location', 'phrase', `${subjectVi} ${locationVi}`, `${subjectEn} ${locationEn}`, ['word-subject', 'phrase-location']),
    typingItem('phrase-is-there', 'phrase', 'ở đó có ... không?', 'is there'),
    typingItem('sentence-question-short', 'sentence', `Ở đó có ${subjectVi} không?`, `Is there ${subjectEn}?`, ['phrase-is-there', 'word-subject']),
    typingItem('sentence-question', 'sentence', questionVi, questionEn, ['sentence-question-short', 'phrase-subject-location']),
    typingItem('sentence-answer', 'sentence', 'Có, ở đó có.', 'Yes, there is.'),
    typingItem('sentence-boss', 'sentence', `${questionVi} Có, ở đó có.`, `${questionEn} Yes, there is.`, ['sentence-question', 'sentence-answer'])
  ]);
}

function noAnswerLesson({ subjectVi, subjectEn, placeVi, placeEn, locationVi, locationEn, questionVi, questionEn }) {
  return content([
    typingItem('word-subject', 'word', subjectVi, subjectEn),
    typingItem('word-place', 'word', placeVi, placeEn),
    typingItem('phrase-location', 'phrase', locationVi, locationEn, ['word-place']),
    typingItem('phrase-subject-location', 'phrase', `${subjectVi} ${locationVi}`, `${subjectEn} ${locationEn}`, ['word-subject', 'phrase-location']),
    typingItem('phrase-is-there', 'phrase', 'ở đó có ... không?', 'is there'),
    typingItem('phrase-there-isnt', 'phrase', 'ở đó không có', "there isn't"),
    typingItem('sentence-question-short', 'sentence', `Ở đó có ${subjectVi} không?`, `Is there ${subjectEn}?`, ['phrase-is-there', 'word-subject']),
    typingItem('sentence-question', 'sentence', questionVi, questionEn, ['sentence-question-short', 'phrase-subject-location']),
    typingItem('sentence-answer', 'sentence', 'Không, ở đó không có.', "No, there isn't.", ['phrase-there-isnt']),
    typingItem('sentence-boss', 'sentence', `${questionVi} Không, ở đó không có.`, `${questionEn} No, there isn't.`, ['sentence-question', 'sentence-answer'])
  ]);
}

export const g2U6Translation01Content = statementLesson({
  subjectVi: 'một con cáo', subjectEn: 'a fox',
  placeVi: 'nông trại', placeEn: 'the farm',
  locationVi: 'ở nông trại', locationEn: 'on the farm',
  targetVi: 'Ở đó có một con cáo ở nông trại.',
  targetEn: 'There is a fox on the farm.'
});

export const g2U6Translation02Content = statementLesson({
  subjectVi: 'một con bò đực', subjectEn: 'an ox',
  placeVi: 'nông trại', placeEn: 'the farm',
  locationVi: 'ở nông trại', locationEn: 'on the farm',
  targetVi: 'Ở đó có một con bò đực ở nông trại.',
  targetEn: 'There is an ox on the farm.'
});

export const g2U6Translation03Content = statementLesson({
  subjectVi: 'một con cáo', subjectEn: 'a fox',
  placeVi: 'cái hộp', placeEn: 'the box',
  locationVi: 'trong cái hộp', locationEn: 'in the box',
  targetVi: 'Ở đó có một con cáo trong cái hộp.',
  targetEn: 'There is a fox in the box.'
});

export const g2U6Translation04Content = questionLesson({
  subjectVi: 'một con cáo', subjectEn: 'a fox',
  placeVi: 'nông trại', placeEn: 'the farm',
  locationVi: 'ở nông trại', locationEn: 'on the farm',
  targetVi: 'Ở đó có một con cáo ở nông trại không?',
  targetEn: 'Is there a fox on the farm?'
});

export const g2U6Translation05Content = yesAnswerLesson({
  subjectVi: 'một con bò đực', subjectEn: 'an ox',
  placeVi: 'nông trại', placeEn: 'the farm',
  locationVi: 'ở nông trại', locationEn: 'on the farm',
  questionVi: 'Ở đó có một con bò đực ở nông trại không?',
  questionEn: 'Is there an ox on the farm?'
});

export const g2U6Translation06Content = yesAnswerLesson({
  subjectVi: 'một con cáo', subjectEn: 'a fox',
  placeVi: 'nông trại', placeEn: 'the farm',
  locationVi: 'ở nông trại', locationEn: 'on the farm',
  questionVi: 'Ở đó có một con cáo ở nông trại không?',
  questionEn: 'Is there a fox on the farm?'
});

export const g2U6Translation07Content = yesAnswerLesson({
  subjectVi: 'một con bò đực', subjectEn: 'an ox',
  placeVi: 'nông trại', placeEn: 'the farm',
  locationVi: 'ở nông trại', locationEn: 'on the farm',
  questionVi: 'Ở đó có một con bò đực ở nông trại không?',
  questionEn: 'Is there an ox on the farm?'
});

export const g2U6Translation08Content = noAnswerLesson({
  subjectVi: 'một con cáo', subjectEn: 'a fox',
  placeVi: 'cái hộp', placeEn: 'the box',
  locationVi: 'trong cái hộp', locationEn: 'in the box',
  questionVi: 'Ở đó có một con cáo trong cái hộp không?',
  questionEn: 'Is there a fox in the box?'
});

export const g2U6Translation09Content = noAnswerLesson({
  subjectVi: 'một con bò đực', subjectEn: 'an ox',
  placeVi: 'cái hộp', placeEn: 'the box',
  locationVi: 'trong cái hộp', locationEn: 'in the box',
  questionVi: 'Ở đó có một con bò đực trong cái hộp không?',
  questionEn: 'Is there an ox in the box?'
});
