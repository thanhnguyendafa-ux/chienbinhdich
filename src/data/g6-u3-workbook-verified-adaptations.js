const VERIFIED_B1 = Object.freeze({
  bodyDescription: Object.freeze(['big','long','small','short','slim']),
  bodyParts: Object.freeze(['arms','legs','shoulders','hands','eyes','feet','ears','hair','head']),
  personDescription: Object.freeze(['big','small','fast','short','cute','strong','weak','smart','tall','slim','sporty'])
});

function remapTokens(item, members) {
  const correct = new Set(members);
  return Object.freeze(item.tokens.map(token => Object.freeze({
    ...token,
    correctGroupId: correct.has(token.text) ? 'yes' : 'no'
  })));
}

function verifiedFeedback(item, index) {
  const specs = [
    {
      members: VERIFIED_B1.bodyDescription,
      correctLabel: 'Dùng được: big, long, small, short, slim',
      reason: 'Theo bảng đáp án đã đối chiếu, các từ này có thể mô tả hình dáng/kích thước của bộ phận cơ thể: big eyes, long hair, small hands, short hair, slim body.'
    },
    {
      members: VERIFIED_B1.bodyParts,
      correctLabel: 'Dùng được: arms, legs, shoulders, hands, eyes, feet, ears, hair, head',
      reason: 'Đây là tên các bộ phận cơ thể. Ta có thể nói she has long hair, he has strong arms...'
    },
    {
      members: VERIFIED_B1.personDescription,
      correctLabel: 'Dùng được: big, small, fast, short, cute, strong, weak, smart, tall, slim, sporty',
      reason: 'Các từ này có thể đi sau BE để tả cả người: He is tall. She is smart. He is sporty.'
    }
  ];
  const spec = specs[index];
  return Object.freeze({
    ...item,
    tokens: remapTokens(item, spec.members),
    teachingFeedback: Object.freeze({
      ...item.teachingFeedback,
      correctLabel: spec.correctLabel,
      reason: spec.reason
    }),
    sourceKeyVerification: Object.freeze({
      status: 'verified_against_multiple_published_solution_guides',
      note: 'The workbook page supplies the table and word bank but not its answer key. This digital key was cross-checked before production.'
    })
  });
}

export function applyG6U3VerifiedAdaptations(key, content) {
  if (key !== 'b1') return content;
  return Object.freeze({
    ...content,
    items: Object.freeze(content.items.map((item, index) => verifiedFeedback(item, index)))
  });
}

export const g6U3VerifiedB1Key = VERIFIED_B1;
