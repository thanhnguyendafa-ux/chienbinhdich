(()=>{const slides=[...document.querySelectorAll('.slide')],prev=document.getElementById('prev'),next=document.getElementById('next'),count=document.getElementById('counter');let i=0;
function show(n){i=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,j)=>s.classList.toggle('active',j===i));count.textContent=`${i+1}/${slides.length}`;prev.disabled=i===0;next.disabled=i===slides.length-1;history.replaceState(null,'',`#slide-${i+1}`);}
prev.addEventListener('click',()=>show(i-1));next.addEventListener('click',()=>show(i+1));
document.addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(i+1)}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(i-1)}});
const m=location.hash.match(/slide-(\d+)/);show(m?Number(m[1])-1:0);
})();
