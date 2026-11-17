/* PaperVault frontend integration
   Uploaded PDFs are stored in this browser's IndexedDB. This is not a remote server. */
const DB_NAME = 'PaperVaultDB';
const DB_VERSION = 1;
const STORE = 'papers';
const samplePapers = [
 {id:'sample-1',title:'Data Structures & Algorithms',course:'B.Tech',branch:'CSE',semester:'3',year:2025,type:'End Semester',downloads:1240,university:'Sample University',description:'Sample listing: arrays, linked lists, trees, graphs and algorithm analysis.'},
 {id:'sample-2',title:'Engineering Mathematics II',course:'B.Tech',branch:'CSE',semester:'2',year:2025,type:'Mid Semester',downloads:986,university:'Sample University',description:'Sample listing: differential equations, matrices and multivariable calculus.'},
 {id:'sample-3',title:'Digital Logic Design',course:'B.Tech',branch:'ECE',semester:'3',year:2024,type:'End Semester',downloads:754,university:'Sample University',description:'Sample listing: number systems, Boolean algebra, combinational and sequential circuits.'},
 {id:'sample-4',title:'Object Oriented Programming',course:'B.Tech',branch:'CSE',semester:'4',year:2024,type:'End Semester',downloads:698,university:'Sample University',description:'Sample listing: classes, inheritance, polymorphism and operator overloading.'},
 {id:'sample-5',title:'Database Management Systems',course:'BCA',branch:'IT',semester:'4',year:2023,type:'Mid Semester',downloads:521,university:'Sample University',description:'Sample listing: ER models, relational algebra, SQL and normalisation.'},
 {id:'sample-6',title:'Computer Networks',course:'B.Tech',branch:'CSE',semester:'5',year:2025,type:'Internal',downloads:463,university:'Sample University',description:'Sample listing: network layers, protocols, routing and network security fundamentals.'},
 {id:'sample-7',title:'Operating Systems',course:'B.Tech',branch:'CSE',semester:'4',year:2023,type:'End Semester',downloads:412,university:'Sample University',description:'Sample listing: processes, threads, scheduling, memory and file systems.'},
 {id:'sample-8',title:'Business Communication',course:'BBA',branch:'IT',semester:'1',year:2024,type:'End Semester',downloads:308,university:'Sample University',description:'Sample listing: communication principles, reports and professional writing.'},
 {id:'sample-9',title:'Software Engineering',course:'B.Tech',branch:'IT',semester:'6',year:2025,type:'Mid Semester',downloads:277,university:'Sample University',description:'Sample listing: software processes, requirements, design and testing.'}
];
let uploadedPapers = [];
let visibleLimit = 6;
let toastTimer;
const $ = id => document.getElementById(id);
const grid = $('paperGrid');
const paperModal = $('paperModal');
const uploadModal = $('uploadModal');

function openDB(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(new Error('This browser does not support local PDF storage.'));return;}
  const request=indexedDB.open(DB_NAME,DB_VERSION);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
}
async function dbAll(){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const req=tx.objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});}
async function dbPut(record){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
async function dbDelete(id){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>{db.close();reject(tx.error);};});}
function allPapers(){return [...uploadedPapers,...samplePapers];}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderPapers(){
 const query=($('filterQuery').value||$('heroQuery').value).trim().toLowerCase();
 const course=$('courseFilter').value,branch=$('branchFilter').value,semester=$('semesterFilter').value;
 let list=allPapers().filter(p=>(!query||[p.title,p.course,p.branch,p.year,p.type,p.university].join(' ').toLowerCase().includes(query))&&(!course||p.course===course)&&(!branch||p.branch===branch)&&(!semester||p.semester===semester));
 if($('sortFilter').value==='title')list.sort((a,b)=>a.title.localeCompare(b.title));else list.sort((a,b)=>Number(b.year)-Number(a.year));
 $('resultCount').textContent=`Showing ${Math.min(list.length,visibleLimit)} of ${list.length} papers`;
 grid.innerHTML=list.slice(0,visibleLimit).map(p=>`<article class="paper-card"><div class="card-top"><span class="file-badge">${p.file?'PDF UPLOADED':'SAMPLE PAPER'}</span><span class="year-badge">${esc(p.year)}</span></div><h3>${esc(p.title)}</h3><div class="card-meta">${esc(p.course)} · ${esc(p.branch)} · Semester ${esc(p.semester)}<br>${esc(p.type)} · ${esc(p.university||'')}</div><div class="card-tags"><span>${esc(p.branch)}</span><span>Semester ${esc(p.semester)}</span><span>${esc(p.type)}</span></div><div class="card-bottom"><span class="downloads">${p.file?'Saved in this browser':`${Number(p.downloads||0).toLocaleString('en-IN')} views`}</span><button class="view-paper" data-paper="${esc(p.id)}">View details <span>↗</span></button></div></article>`).join('');
 $('emptyState').hidden=list.length!==0;$('loadMore').hidden=list.length<=visibleLimit;
}
function applySearch(q){$('filterQuery').value=q;$('browse').scrollIntoView({behavior:'smooth'});renderPapers();}
$('heroSearch').addEventListener('submit',e=>{e.preventDefault();applySearch($('heroQuery').value)});
['filterQuery','courseFilter','branchFilter','semesterFilter','sortFilter'].forEach(id=>$(id).addEventListener('input',()=>{visibleLimit=6;renderPapers()}));
function reset(){['filterQuery','heroQuery','courseFilter','branchFilter','semesterFilter'].forEach(id=>$(id).value='');visibleLimit=6;renderPapers();}
$('resetFilters').addEventListener('click',reset);$('emptyReset').addEventListener('click',reset);
$('loadMore').addEventListener('click',()=>{visibleLimit+=3;renderPapers()});
function showToast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3500);}
function openModal(el){el.hidden=false;document.body.style.overflow='hidden';}
function closeModals(){paperModal.hidden=true;uploadModal.hidden=true;document.body.style.overflow='';}
function showPaper(p){
 const detail=$('modalContent');
 const fileActions=p.file?`<div class="detail-preview"><strong>PDF ready</strong><small>${esc(p.fileName||'Uploaded PDF')} · stored in this browser</small><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:16px"><button class="button button-dark" id="previewPdf">Preview PDF ↗</button><button class="button button-outline" id="downloadPdf">Download PDF ↓</button></div><iframe id="pdfFrame" title="PDF preview" style="display:none;width:100%;height:430px;border:1px solid #e3e7ef;border-radius:5px;margin-top:16px"></iframe></div>`:`<div class="detail-preview"><div style="font-size:30px;color:#e16b56">▤</div><strong>Sample listing — no PDF attached</strong><small>Upload the actual question paper to make its PDF available here.</small></div>`;
 detail.innerHTML=`<h2 class="detail-title">${esc(p.title)}</h2><div class="detail-meta">${esc(p.course)} · ${esc(p.branch)} · Semester ${esc(p.semester)}<br>${esc(p.type)} · ${esc(p.year)} · ${esc(p.university||'')}</div>${fileActions}<p style="font-size:11px;color:#78839a;line-height:1.7">${esc(p.description||'')}</p>${p.file?`<button class="button button-outline" id="deletePaper">Delete my local upload</button>`:''}`;
 openModal(paperModal);
 if(p.file){$('previewPdf').addEventListener('click',()=>{const frame=$('pdfFrame');frame.src=URL.createObjectURL(p.file);frame.style.display='block';});$('downloadPdf').addEventListener('click',()=>downloadFile(p));$('deletePaper').addEventListener('click',async()=>{if(!confirm('Delete this PDF from this browser?'))return;await dbDelete(p.id);uploadedPapers=uploadedPapers.filter(x=>x.id!==p.id);closeModals();renderPapers();showToast('Your local upload was deleted.');});}
}
function downloadFile(p){const url=URL.createObjectURL(p.file);const a=document.createElement('a');a.href=url;a.download=p.fileName||`${p.title}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-paper]');if(btn){const p=allPapers().find(x=>String(x.id)===btn.dataset.paper);if(p)showPaper(p);}if(e.target.matches('[data-close]')||e.target===paperModal||e.target===uploadModal)closeModals();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});
$('openUpload').addEventListener('click',()=>openModal(uploadModal));
$('uploadForm').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget;const file=form.elements.file.files[0];const msg=$('formMessage');
 if(!file||file.type!=='application/pdf'){msg.textContent='Please select a valid PDF file.';return;}
 if(file.size>20*1024*1024){msg.textContent='Please choose a PDF smaller than 20 MB.';return;}
 const record={id:`upload-${Date.now()}-${Math.random().toString(16).slice(2)}`,title:form.elements.title.value.trim(),course:form.elements.course.value,branch:form.elements.branch.value,semester:form.elements.semester.value,year:Number(form.elements.year.value),type:form.elements.type.value,university:form.elements.university.value.trim()||'Not specified',description:'User-contributed paper saved locally in this browser.',file,fileName:file.name,downloads:0,createdAt:new Date().toISOString()};
 try{await dbPut(record);uploadedPapers.unshift(record);form.reset();msg.textContent='Paper saved successfully in this browser. It is now visible in the library.';visibleLimit=99;renderPapers();setTimeout(()=>{closeModals();msg.textContent='';},1800);}catch(err){msg.textContent=`Could not save the PDF: ${err.message||'storage error'}`;}
});
$('loginBtn').addEventListener('click',()=>showToast('Login is not connected in this frontend-only version.'));
$('mobileMenu').addEventListener('click',()=>$('mainNav').classList.toggle('open'));
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('mainNav').classList.remove('open')));
(async function init(){try{uploadedPapers=await dbAll();}catch(err){showToast('Browser PDF storage is unavailable. Try Chrome or Edge using Live Server.');}renderPapers();})();
