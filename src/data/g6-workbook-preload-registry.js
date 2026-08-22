import {
  applyG6WorkbookTranslationPreload as applyLegacyPreload,
  getG6WorkbookPreloadCount as getLegacyPreloadCount,
  getG6WorkbookPreloadSpec as getLegacyPreloadSpec,
  G6_WORKBOOK_PRELOAD_KEYS as LEGACY_KEYS
} from './g6-workbook-translation-preload.js';
import { freeze, preload } from './workbook-content-helpers.js';

const entry = (en,vi,wrongs) => freeze([en,vi,freeze(wrongs)]);
const lesson = (vocab,phrases) => freeze({ vocab:freeze(vocab), phrases:freeze(phrases) });

// SSOT cho các lesson khôi phục sau audit PDF. Không lặp dữ liệu với legacy specs.
const RECOVERED_SPECS = freeze({
  u1: freeze({
    c2: lesson([
      entry('grandfather','ông',['thí nghiệm','tờ báo','thường']),
      entry('experiment','thí nghiệm',['ông','tờ báo','thường']),
      entry('newspaper','tờ báo',['ông','thí nghiệm','thường']),
      entry('usually','thường',['ông','thí nghiệm','tờ báo'])
    ],[
      entry('read newspapers','đọc báo',['làm thí nghiệm','chơi bóng đá sau giờ học','nghe nhạc']),
      entry('do experiments','làm thí nghiệm',['đọc báo','chơi bóng đá sau giờ học','nghe nhạc']),
      entry('play football after school','chơi bóng đá sau giờ học',['đọc báo','làm thí nghiệm','nghe nhạc']),
      entry('listen to music','nghe nhạc',['đọc báo','làm thí nghiệm','chơi bóng đá sau giờ học'])
    ])
  }),
  u2: freeze({
    b2: lesson([
      entry('across','theo chiều ngang',['theo đường chéo','hướng lên','hướng xuống']),
      entry('diagonally','theo đường chéo',['theo chiều ngang','hướng lên','hướng xuống']),
      entry('up','hướng lên',['theo chiều ngang','theo đường chéo','hướng xuống']),
      entry('down','hướng xuống',['theo chiều ngang','theo đường chéo','hướng lên'])
    ],[
      entry('word search puzzle','ô chữ tìm từ',['bài điền từ','bài sắp xếp câu','bài nghe']),
      entry('related to My house','liên quan đến chủ đề My house',['liên quan đến thời tiết','liên quan đến trường học','liên quan đến nghề nghiệp']),
      entry('run across','chạy theo chiều ngang',['chạy theo đường chéo','chạy hướng lên','chạy hướng xuống']),
      entry('run diagonally','chạy theo đường chéo',['chạy theo chiều ngang','chạy hướng lên','chạy hướng xuống'])
    ]),
    e3: lesson([
      entry('favourite','yêu thích',['thoải mái','tủ quần áo','đoạn mô tả']),
      entry('comfortable','thoải mái',['yêu thích','tủ quần áo','đoạn mô tả']),
      entry('wardrobe','tủ quần áo',['yêu thích','thoải mái','đoạn mô tả']),
      entry('description','đoạn mô tả',['yêu thích','thoải mái','tủ quần áo'])
    ],[
      entry('my favourite room','căn phòng yêu thích của tôi',['bên cạnh giường của tôi','trong căn phòng','vì nó thoải mái']),
      entry('next to my bed','bên cạnh giường của tôi',['căn phòng yêu thích của tôi','trong căn phòng','vì nó thoải mái']),
      entry('in the room','trong căn phòng',['căn phòng yêu thích của tôi','bên cạnh giường của tôi','vì nó thoải mái']),
      entry('because it is comfortable','vì nó thoải mái',['căn phòng yêu thích của tôi','bên cạnh giường của tôi','trong căn phòng'])
    ])
  })
});

function recoveredSpec(unitKey,lessonKey) {
  return RECOVERED_SPECS[String(unitKey ?? '').toLowerCase()]?.[String(lessonKey ?? '').toLowerCase()] ?? null;
}

function insertAfter(values,anchor,newValue) {
  const result = [...values];
  const index = result.indexOf(anchor);
  result.splice(index >= 0 ? index + 1 : result.length,0,newValue);
  return result;
}

export function getG6WorkbookPreloadSpec(unitKey,lessonKey) {
  return recoveredSpec(unitKey,lessonKey) ?? getLegacyPreloadSpec(unitKey,lessonKey);
}

export function getG6WorkbookPreloadCount(unitKey,lessonKey) {
  const recovered = recoveredSpec(unitKey,lessonKey);
  return recovered ? recovered.vocab.length + recovered.phrases.length : getLegacyPreloadCount(unitKey,lessonKey);
}

export function applyG6WorkbookTranslationPreload(unitKey,lessonKey,content) {
  const normalizedUnit = String(unitKey ?? '').toLowerCase();
  const normalizedLesson = String(lessonKey ?? '').toLowerCase();
  const spec = recoveredSpec(normalizedUnit,normalizedLesson);
  if (!spec) return applyLegacyPreload(normalizedUnit,normalizedLesson,content);

  const preloadItems = preload(`g6-${normalizedUnit}-wb-${normalizedLesson}-pre`,spec.vocab,spec.phrases);
  const sourceItems = (content.items ?? []).map(item => item.learningPhase ? item : freeze({ ...item,learningPhase:'source' }));
  return freeze({
    ...content,
    translationPreload:freeze({
      required:true,
      order:freeze(['vocab','phrase','source']),
      purpose:'Nạp nghĩa từ/cụm của chính bài trước khi xử lý bài SBT.',
      answerLeakPolicy:'Preload hỗ trợ hiểu đề nhưng không nêu vị trí hay đáp án của bài nguồn.'
    }),
    items:freeze([...preloadItems,...sourceItems])
  });
}

export const G6_WORKBOOK_PRELOAD_KEYS = freeze({
  u1:freeze(insertAfter(LEGACY_KEYS.u1,'c1','c2')),
  u2:freeze([...insertAfter(LEGACY_KEYS.u2,'a2','b2'),'e3']),
  u3:LEGACY_KEYS.u3
});
