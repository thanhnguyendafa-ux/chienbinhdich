export const global7Unit1Set1Content = Object.freeze({
  items: [
    { id: 'w-like', stage: 'word', vi: 'thích', en: 'like', buildsFrom: [] },
    { id: 'w-gardening', stage: 'word', vi: 'làm vườn', en: 'gardening', buildsFrom: [] },
    { id: 'w-because', stage: 'word', vi: 'vì', en: 'because', buildsFrom: [] },
    { id: 'w-help', stage: 'word', vi: 'giúp', en: 'help', buildsFrom: [] },
    { id: 'w-me', stage: 'word', vi: 'tôi (sau động từ)', en: 'me', buildsFrom: [] },
    { id: 'w-relax', stage: 'word', vi: 'thư giãn', en: 'relax', buildsFrom: [] },
    { id: 'w-interesting', stage: 'word', vi: 'thú vị', en: 'interesting', buildsFrom: [] },

    { id: 'p-like-gardening', stage: 'phrase', vi: 'thích làm vườn', en: 'like gardening', buildsFrom: ['w-like', 'w-gardening'] },
    { id: 'p-help-me', stage: 'phrase', vi: 'giúp tôi', en: 'help me', buildsFrom: ['w-help', 'w-me'] },
    { id: 'p-help-me-relax', stage: 'phrase', vi: 'giúp tôi thư giãn', en: 'help me relax', buildsFrom: ['p-help-me', 'w-relax'] },
    { id: 'p-it-interesting', stage: 'phrase', vi: 'nó thú vị', en: 'it is interesting', buildsFrom: ['w-interesting'] },
    { id: 'p-it-helps-me-relax', stage: 'phrase', vi: 'nó giúp tôi thư giãn', en: 'it helps me relax', buildsFrom: ['p-help-me-relax'] },
    { id: 'p-because-it-helps-me-relax', stage: 'phrase', vi: 'vì nó giúp tôi thư giãn', en: 'because it helps me relax', buildsFrom: ['w-because', 'p-it-helps-me-relax'] },

    { id: 's-like-gardening', stage: 'sentence', vi: 'Tôi thích làm vườn.', en: 'I like gardening.', buildsFrom: ['p-like-gardening'] },
    { id: 's-like-gardening-interesting', stage: 'sentence', vi: 'Tôi thích làm vườn vì nó thú vị.', en: 'I like gardening because it is interesting.', buildsFrom: ['p-like-gardening', 'w-because', 'p-it-interesting'] },
    { id: 's-like-gardening-relax', stage: 'sentence', vi: 'Tôi thích làm vườn vì nó giúp tôi thư giãn.', en: 'I like gardening because it helps me relax.', buildsFrom: ['p-like-gardening', 'p-because-it-helps-me-relax'] }
  ]
});
