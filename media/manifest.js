export const mediaManifest = Object.freeze({
  version: 1,
  assets: Object.freeze([
    Object.freeze({
      id: 'imagekit-pipeline-image-smoke',
      kind: 'image',
      sourcePath: 'media-staging/global-success/_pipeline-test/img/sample-card-046ff2a8.svg',
      remotePath: 'global-success/_pipeline-test/img/sample-card-046ff2a8.svg',
      sha256: '046ff2a8a339a7c70ea26885a21660fadb0fe96abc69b7e9a6c3042103405023',
      alt: 'Thẻ kiểm thử media Chiến Binh Dịch với biểu tượng sách và tai nghe.'
    }),
    Object.freeze({
      id: 'imagekit-pipeline-audio-smoke',
      kind: 'audio',
      sourcePath: 'media-staging/global-success/_pipeline-test/audio/sample-tone-7ae4eed9.wav',
      remotePath: 'global-success/_pipeline-test/audio/sample-tone-7ae4eed9.wav',
      sha256: '7ae4eed902670e6c16e88d114a37a1bf53c6dbb532e498a2b95d250390ea4e05',
      description: 'Âm kiểm thử cục bộ 440 Hz, dài 0,05 giây; chỉ dùng để chứng minh pipeline upload/playback.'
    })
  ])
});
