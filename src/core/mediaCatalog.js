import { mediaManifest } from '../../media/manifest.js';
import { mediaAssetUrl } from './mediaAsset.js';

const byId=new Map(mediaManifest.assets.map(asset=>[String(asset.id),asset]));

export function mediaAssetById(assetId){
  const asset=byId.get(String(assetId??''));
  if(!asset) throw new Error(`Unknown media asset id: ${assetId}`);
  return asset;
}

export function imageAssetView(assetId){
  const asset=mediaAssetById(assetId);
  if(asset.kind!=='image') throw new Error(`Media asset is not an image: ${assetId}`);
  return Object.freeze({
    id:asset.id,
    url:mediaAssetUrl(asset.remotePath),
    alt:String(asset.alt??''),
    width:Number(asset.width??0),
    height:Number(asset.height??0)
  });
}
