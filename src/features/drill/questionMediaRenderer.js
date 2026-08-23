import { imageAssetView } from '../../core/mediaCatalog.js';

export function renderMediaBlock(media,{variant='question'}={}){
  if(media?.kind!=='image') return '';
  const ids=Array.isArray(media.imageAssetIds)?media.imageAssetIds:[];
  if(!ids.length) return '';
  const assets=ids.map(imageAssetView);
  const gallery=media.presentation==='gallery'||assets.length>1;
  return `
    <section class="learning-media learning-media-${escAttr(variant)} ${gallery?'is-gallery':'is-single'}" aria-label="${gallery?'Hình minh hoạ cho bài tập':'Hình minh hoạ'}">
      <div class="learning-media-grid">
        ${assets.map(asset=>`
          <figure class="learning-media-card">
            <img src="${escAttr(asset.url)}" alt="${escAttr(asset.alt)}" width="${asset.width}" height="${asset.height}" loading="lazy" decoding="async" />
          </figure>`).join('')}
      </div>
    </section>`;
}

export function renderQuestionWithMedia(item,interactionHtml){
  const mediaHtml=renderMediaBlock(item?.media,{variant:'question'});
  const count=Array.isArray(item?.media?.imageAssetIds)?item.media.imageAssetIds.length:0;
  const mode=count===1?'has-single-media':count>1?'has-gallery-media':'has-no-media';
  return `<div class="question-media-layout ${mode}">${mediaHtml}<div class="question-media-content">${interactionHtml}</div></div>`;
}

function escAttr(value){
  return String(value??'').replace(/[&<>'"]/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[char]).replace(/`/g,'&#96;');
}
