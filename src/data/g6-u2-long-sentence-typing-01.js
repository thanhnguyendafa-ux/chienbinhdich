const freeze = value => Object.freeze(value);

const targetSentence = 'My bedroom also has a big window and a clock on the wall.';
const targetVietnamese = 'Phòng ngủ của tôi cũng có một cửa sổ lớn và một cái đồng hồ trên tường.';

function typing(id, vi, en, stage = 'phrase', buildsFrom = []) {
  return freeze({
    id,
    type: 'typing',
    stage,
    vi,
    en,
    buildsFrom: freeze([...buildsFrom])
  });
}

export const g6U2LongSentenceTyping01Content = freeze({
  preLessonTheory: freeze({
    required: true,
    level: 'grade-6',
    title: 'Nhìn câu đích trước khi luyện',
    intro: 'Đọc và hiểu câu đích trước. Khi vào bài, câu tiếng Anh sẽ được ẩn; con sẽ gõ các mảng ngắn rồi tăng dần cho đến khi tự gõ lại đúng toàn câu.',
    sourceSections: freeze([]),
    sections: freeze([
      freeze({
        heading: '1. Câu đích tiếng Anh',
        bullets: freeze([targetSentence])
      }),
      freeze({
        heading: '2. Nghĩa tiếng Việt',
        bullets: freeze([targetVietnamese])
      }),
      freeze({
        heading: '3. Chú ý khi nhìn câu',
        bullets: freeze([
          'Nhìn kỹ cụm “my bedroom also has”: chủ ngữ số ít nên dùng has.',
          'Nhìn kỹ phần đuôi “a clock on the wall”.',
          'Mục tiêu cuối cùng là tự gõ lại đúng câu đích, không nhìn mẫu.'
        ])
      })
    ]),
    summary: 'Vào bài: gõ từ cụm rất ngắn → cụm chồng lấn → câu hoàn chỉnh.'
  }),
  items: freeze([
    typing('g6u2-long-01-q01', 'phòng ngủ của tôi', 'my bedroom'),
    typing('g6u2-long-01-q02', 'cũng có', 'also has'),
    typing('g6u2-long-01-q03', 'một cửa sổ lớn', 'a big window'),
    typing('g6u2-long-01-q04', 'một cái đồng hồ', 'a clock'),
    typing('g6u2-long-01-q05', 'trên tường', 'on the wall'),
    typing('g6u2-long-01-q06', 'phòng ngủ của tôi cũng có', 'my bedroom also has', 'phrase', [
      'g6u2-long-01-q01',
      'g6u2-long-01-q02'
    ]),
    typing('g6u2-long-01-q07', 'cũng có một cửa sổ lớn', 'also has a big window', 'phrase', [
      'g6u2-long-01-q02',
      'g6u2-long-01-q03'
    ]),
    typing('g6u2-long-01-q08', 'một cửa sổ lớn và một cái đồng hồ', 'a big window and a clock', 'phrase', [
      'g6u2-long-01-q03',
      'g6u2-long-01-q04'
    ]),
    typing('g6u2-long-01-q09', 'một cái đồng hồ trên tường', 'a clock on the wall', 'phrase', [
      'g6u2-long-01-q04',
      'g6u2-long-01-q05'
    ]),
    typing('g6u2-long-01-q10', 'Phòng ngủ của tôi cũng có một cửa sổ lớn', 'My bedroom also has a big window', 'phrase', [
      'g6u2-long-01-q06',
      'g6u2-long-01-q07'
    ]),
    typing('g6u2-long-01-q11', 'cũng có một cửa sổ lớn và một cái đồng hồ', 'also has a big window and a clock', 'phrase', [
      'g6u2-long-01-q07',
      'g6u2-long-01-q08'
    ]),
    typing('g6u2-long-01-q12', 'một cửa sổ lớn và một cái đồng hồ trên tường', 'a big window and a clock on the wall', 'phrase', [
      'g6u2-long-01-q08',
      'g6u2-long-01-q09'
    ]),
    typing('g6u2-long-01-q13', targetVietnamese, targetSentence, 'sentence', [
      'g6u2-long-01-q10',
      'g6u2-long-01-q11',
      'g6u2-long-01-q12'
    ])
  ])
});
