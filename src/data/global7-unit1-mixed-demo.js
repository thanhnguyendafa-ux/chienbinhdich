export const global7Unit1MixedDemo = Object.freeze({
  id: 'g7-u1-mixed-demo',
  version: 1,
  course: 'Global Success 7',
  unit: 'Unit 1 · Hobbies',
  title: 'Mixed Mastery Demo · Hobbies',
  subtitle: 'MCQ · True/False · Sentence Order',
  passThreshold: 80,
  teacher: 'Thầy Thành MRT',
  description: 'Sample A kiểm chứng một Set trộn ba dạng câu nhưng vẫn dùng chung Mastery, retry sau 2 câu và mốc PASS 80%.',
  items: [
    {
      id: 'mix-q1',
      type: 'mcq',
      prompt: 'Which word means “làm vườn”?',
      choices: [
        { id: 'a', text: 'gardening' },
        { id: 'b', text: 'drawing' },
        { id: 'c', text: 'swimming' },
        { id: 'd', text: 'cooking' }
      ],
      correctChoiceId: 'a'
    },
    {
      id: 'mix-q2',
      type: 'true_false',
      statement: '“relax” means “thư giãn”.',
      answer: true
    },
    {
      id: 'mix-q3',
      type: 'sentence_order',
      prompt: 'Sắp xếp thành câu đúng.',
      tokens: ['I', 'like', 'gardening.'],
      displayOrder: ['gardening.', 'I', 'like'],
      correctOrder: ['I', 'like', 'gardening.']
    },
    {
      id: 'mix-q4',
      type: 'mcq',
      prompt: 'Which phrase means “giúp tôi thư giãn”?',
      choices: [
        { id: 'a', text: 'help me relax' },
        { id: 'b', text: 'like gardening' },
        { id: 'c', text: 'draw a picture' },
        { id: 'd', text: 'play outside' }
      ],
      correctChoiceId: 'a'
    },
    {
      id: 'mix-q5',
      type: 'true_false',
      statement: '“I like gardening.” is a correct English sentence.',
      answer: true
    },
    {
      id: 'mix-q6',
      type: 'sentence_order',
      prompt: 'Sắp xếp thành câu đúng.',
      tokens: ['Gardening', 'helps', 'me', 'relax.'],
      displayOrder: ['relax.', 'Gardening', 'me', 'helps'],
      correctOrder: ['Gardening', 'helps', 'me', 'relax.']
    },
    {
      id: 'mix-q7',
      type: 'mcq',
      prompt: 'Which word means “thú vị”?',
      choices: [
        { id: 'a', text: 'interesting' },
        { id: 'b', text: 'expensive' },
        { id: 'c', text: 'difficult' },
        { id: 'd', text: 'hungry' }
      ],
      correctChoiceId: 'a'
    },
    {
      id: 'mix-q8',
      type: 'true_false',
      statement: '“He like gardening.” is grammatically correct.',
      answer: false
    },
    {
      id: 'mix-q9',
      type: 'sentence_order',
      prompt: 'Sắp xếp thành câu đúng.',
      tokens: ['Gardening', 'is', 'interesting.'],
      displayOrder: ['interesting.', 'Gardening', 'is'],
      correctOrder: ['Gardening', 'is', 'interesting.']
    },
    {
      id: 'mix-q10',
      type: 'mcq',
      prompt: 'Why can someone like gardening?',
      choices: [
        { id: 'a', text: 'Because it helps them relax.' },
        { id: 'b', text: 'Because it is a car.' },
        { id: 'c', text: 'Because it is Monday.' },
        { id: 'd', text: 'Because it is blue.' }
      ],
      correctChoiceId: 'a'
    }
  ]
});
