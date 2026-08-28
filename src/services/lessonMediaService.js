import { g2WorkbookMediaMap } from '../data/workbooks/gs23/g2-media.js';
import { mediaAssetById } from '../core/mediaCatalog.js';

const freeze=Object.freeze;

function normalizeMediaSpec(spec){
  if(!spec) return null;
  const ids=Array.isArray(spec.imageAssetIds)?spec.imageAssetIds.map(String):[];
  if(!ids.length) return null;
  for(const id of ids){
    const asset=mediaAssetById(id);
    if(asset.kind!=='image') throw new Error(`Lesson image mapping points to non-image asset: ${id}`);
  }
  return freeze({
    kind:'image',
    presentation:spec.presentation==='gallery'?'gallery':'single',
    imageAssetIds:freeze(ids)
  });
}

function withImageAdaptation(item,media){
  const current=item.digitalAdaptation??null;
  if(!current) return item;
  return freeze({
    ...item,
    media,
    digitalAdaptation:freeze({
      ...current,
      kind:'image-supported',
      note:`${current.note??''} Hình minh hoạ được cung cấp từ media SSOT của repo.`.trim()
    })
  });
}

export function applyLessonMedia(lesson){
  if(!lesson?.id) return lesson;
  const mapping=g2WorkbookMediaMap[lesson.id];
  if(!mapping) return lesson;

  const itemMap=mapping.items??{};
  const items=freeze((lesson.items??[]).map(item=>{
    const media=normalizeMediaSpec(itemMap[item.id]);
    if(!media) return item;
    if(item.digitalAdaptation) return withImageAdaptation(item,media);
    return freeze({...item,media});
  }));

  const theoryMedia=normalizeMediaSpec(mapping.theory);
  const preLessonTheory=theoryMedia && lesson.preLessonTheory
    ? freeze({...lesson.preLessonTheory,media:theoryMedia})
    : lesson.preLessonTheory;

  return freeze({
    ...lesson,
    items,
    preLessonTheory,
    mediaPolicy:freeze({source:'repo-ssot',provider:'imagekit',version:1})
  });
}
