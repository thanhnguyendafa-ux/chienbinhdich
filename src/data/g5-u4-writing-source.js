const rows = Object.freeze([
  [1, "Đang làm gì?", "What are you doing?", "Bạn đang làm gì?", "NOW", 6],
  [2, "Hoạt động đang diễn ra 1", "I'm watching a cartoon.", "Tôi đang xem một bộ phim hoạt hình.", "NOW", 6],
  [3, "Hoạt động đang diễn ra 2", "I'm reading a story.", "Tôi đang đọc một câu chuyện.", "NOW", 6],
  [4, "Hỏi về sở thích lúc rảnh", "What do you like doing in your free time?", "Bạn thích làm gì vào thời gian rảnh?", "LIKE", 7],
  [5, "Sở thích 1", "I like watching cartoons.", "Tôi thích xem phim hoạt hình.", "LIKE", 5],
  [6, "Sở thích 2", "I like playing the violin.", "Tôi thích chơi đàn violin.", "LIKE", 6],
  [7, "Sở thích 3", "I like surfing the Internet.", "Tôi thích lướt Internet.", "LIKE", 5],
  [8, "Sở thích 4", "I like going for a walk.", "Tôi thích đi dạo.", "LIKE", 6],
  [9, "Sở thích 5", "I like watering the flowers.", "Tôi thích tưới hoa.", "LIKE", 5],
  [10, "Hoạt động cuối tuần", "What do you do at the weekend?", "Bạn làm gì vào cuối tuần?", "ROUTINE", 7],
  [11, "Thói quen 1", "I always read stories.", "Tôi luôn đọc truyện.", "ROUTINE", 5],
  [12, "Thói quen 2", "I usually water the flowers.", "Tôi thường tưới hoa.", "ROUTINE", 6],
  [13, "Thói quen 3", "I often ride my bike.", "Tôi thường xuyên đi xe đạp.", "ROUTINE", 5],
  [14, "Thói quen 4", "I sometimes surf the Internet.", "Tôi thỉnh thoảng lướt Internet.", "ROUTINE", 6],
  [15, "Một câu hỏi về thói quen", "Do you often watch cartoons at the weekend?", "Bạn có thường xuyên xem phim hoạt hình vào cuối tuần không?", "FREQUENCY QUESTION", 7]
]);
export const g5U4WritingSource = Object.freeze(rows.map(([order, title, targetSentence, targetVi, family, expectedTimeMinutes]) => Object.freeze({
  id: `g5-u4-writing-target-${String(order).padStart(2, '0')}`, order, title, targetSentence, targetVi, family, expectedTimeMinutes,
  difficulty: expectedTimeMinutes <= 6 ? 'easy' : 'medium',
  feedbackReason: 'Dùng đúng từ/cụm đã luyện để hoàn thành câu đích của Unit; cách tiếng Anh khác có thể dùng được nhưng không phải target đang chấm.',
  sourceType: 'Global Success 5 transcript-aligned production lock',
  sourceNote: 'Global Success 5 Unit 4 target-first production spec.'
})));
