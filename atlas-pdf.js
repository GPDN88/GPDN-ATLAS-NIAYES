// Export PDF de l'atlas : synthèse SfN, conformité UICN, fiches sites avec plan d'implantation SfN
(function(){
const A=window.ATLAS, S=window.ATLAS_SITES, SF=window.ATLAS_SFN, T=SF.types;
const TK=Object.fromEntries(T.map(t=>[t.k,t]));
const $=s=>document.querySelector(s);
const fmt=n=>n==null?'—':Number(n).toLocaleString('fr-FR');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
const LIB='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';

// ---------- contenu ----------
function cover(sites){
  return `<section class="pdfp first">
  <div class="pk">GEF 12082 · PIMS 10290 · FEM-8 LDCF · Sénégal</div>
  <h1>Atlas des sites SfN — Dakar &amp; Niayes</h1>
  <div class="psub">Application des solutions fondées sur la nature par site, conformément au ProDoc · édition du ${today}</div>
  <div class="pkpis">
   <div><b>10</b><span>bassins de rétention, Dakar · 540 000 m³ · 47,5 ha</span></div>
   <div><b>5</b><span>exutoires naturels, Niayes · 320 ha traités</span></div>
   <div><b>500 km</b><span>axes d'écoulement réhabilités et revégétalisés</span></div>
   <div><b>25 000 ha</b><span>sous gestion résiliente (indicateur LDCF 2)</span></div>
  </div>
  <h3>Matrice des SfN appliquées par site</h3>
  <table class="pmx"><tr><th></th><th class="l">Site</th>${T.map((t,i)=>`<th><span style="background:${t.c}">${i+1}</span></th>`).join('')}<th>An.</th></tr>
  ${sites.map(s=>`<tr><td class="mono">${s.id}</td><td class="l">${esc(s.nom)}</td>${T.map(t=>`<td>${s.sfn.some(a=>a.t===t.k)?`<i style="background:${t.c}"></i>`:''}</td>`).join('')}<td class="mono">${s.annee}</td></tr>`).join('')}</table>
  <div class="pleg">${T.map((t,i)=>`<span><b style="background:${t.c}">${i+1}</b>${t.n}</span>`).join('')}</div>
  <h3>Coordonnées retenues (WGS 84)</h3>
  <table class="ptab"><tr><th>N°</th><th>Site</th><th>Type</th><th class="r">Latitude N</th><th class="r">Longitude O</th><th class="r">Superficie</th><th>Confiance</th></tr>
  ${sites.map(s=>`<tr><td class="mono">${s.id}</td><td><b>${esc(s.nom)}</b></td><td>${s.type==='bassin'?'Bassin':'Exutoire'}</td><td class="r mono">${s.pos[0].toFixed(4)}°</td><td class="r mono">${(-s.pos[1]).toFixed(4)}°</td><td class="r mono">${fmt(s.sup)} ha</td><td><span class="conf ${s.ret.conf}">${s.ret.conf}</span></td></tr>`).join('')}</table>
  <p class="pnote">Sources : ProDoc FEM-8 LDCF Sénégal (fiches p.45-59, programme p.99-101, Annexe E p.243-248) ; vérification des coordonnées OSM / Nominatim, oct. 2026.</p>
  </section>`;
}
function targets(){
  return `<section class="pdfp">
  <h2>Cibles du programme et conformité au Standard UICN</h2>
  <table class="ptab">
   <tr><td>10 bassins de Dakar</td><td class="r mono">540 000 m³ · 47,5 ha</td><td class="r pg">p.99</td></tr>
   <tr><td>5 exutoires des Niayes</td><td class="r mono">320 ha traités</td><td class="r pg">p.100</td></tr>
   <tr><td>Axes d'écoulement réhabilités (collecteurs 120 · secondaires 250 · tertiaires 130 km)</td><td class="r mono">500 km</td><td class="r pg">p.101</td></tr>
   <tr><td>Ouvrages de ralentissement dynamique</td><td class="r mono">25</td><td class="r pg">p.101</td></tr>
   <tr><td>Berges stabilisées par ouvrages mixtes</td><td class="r mono">12 km</td><td class="r pg">p.101</td></tr>
   <tr><td>Sédiments en aval</td><td class="r mono">−40 %</td><td class="r pg">p.101</td></tr>
   <tr><td>Bénéficiaires directs · emplois verts</td><td class="r mono">362 882 · 3 200</td><td class="r pg">ProDoc</td></tr>
  </table>
  <h3>8 critères du Standard mondial de l'UICN pour les SfN (auto-évaluation indicative)</h3>
  ${SF.iucn.map(c=>`<div class="piucn"><div class="n">${c[0]}</div><div><b>${c[1]}</b> <span class="flag" style="background:${SF.ist[c[2]][2]};color:${SF.ist[c[2]][1]}">${SF.ist[c[2]][0]}</span><div class="t">${esc(c[3])}</div></div></div>`).join('')}
  <div class="note" style="margin-top:10px"><b>À renforcer avant validation :</b> état de référence biodiversité par site (critère 3), tracés géoréférencés des axes et des 10 000 ha (critère 2), mécanisme d'arbitrage foncier (critère 6), protocole de suivi avec seuils de révision (critère 7).</div>
  </section>`;
}
function sitePage(s,opt){
  const fams=[...new Set(s.sfn.map(a=>a.t))];
  let f=A.ficheHTML(s,true);
  if(!opt.vuln) f=f.replace(/<div class="vuln">[\s\S]*?<\/p>\s*<\/div>/,'');
  if(!opt.events) f=f.replace(/<div style="grid-column:1\/-1"><h3>Interventions réalisées depuis[\s\S]*?<\/div><\/div>/,'');
  return `<section class="pdfp">
   <div class="phead"><span>Atlas SfN Dakar–Niayes · GEF 12082</span><span>Site ${s.id}/15</span></div>
   ${opt.plan?`<div class="plan"><div class="planh">Plan d'implantation des SfN — ${esc(s.nom)}</div>${A.sfnPlanSVG(s,700,400)}
     <div class="pleg sm">${fams.map(k=>`<span><b style="background:${TK[k].c}"></b>${TK[k].n}</span>`).join('')}</div>
     <div class="pnote">Implantation schématique : surfaces et linéaires dimensionnés sur les quantités ProDoc ; positions relatives indicatives, à caler sur les plans d'exécution. Tireté = quantité non chiffrée.</div></div>`:''}
   <div class="pf">${f}</div>
  </section>`;
}
function buildDoc(opt){
  const sites=opt.scope==='one'&&A.state.sel?S.filter(s=>s.id===A.state.sel):S;
  return `<div class="pdfdoc">${opt.synth?cover(sites):''}${opt.uicn?targets():''}${opt.fiches?sites.map(s=>sitePage(s,opt)).join(''):''}</div>`;
}

// ---------- génération ----------
function loadLib(){return window.html2pdf?Promise.resolve():new Promise((ok,ko)=>{const sc=document.createElement('script');sc.src=LIB;sc.onload=ok;sc.onerror=()=>ko(new Error('lib'));document.head.appendChild(sc);});}
async function download(opt,status){
  status('Préparation de la bibliothèque PDF…');
  await loadLib(); await document.fonts.ready;
  const host=document.createElement('div'); host.className='pdfhost'; host.innerHTML=buildDoc(opt); document.body.appendChild(host);
  const one=opt.scope==='one'&&A.state.sel;
  const name=one?`Fiche_SfN_site${A.state.sel}_GEF12082.pdf`:'Atlas_SfN_Dakar-Niayes_GEF12082.pdf';
  status('Mise en page des '+host.querySelectorAll('.pdfp').length+' sections…');
  try{
    await html2pdf().set({
      margin:[12,12,14,12], filename:name, image:{type:'jpeg',quality:.95},
      html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
      pagebreak:{mode:['css','legacy'],before:'.pdfp:not(.first)',avoid:['tr','.plan','.coordbox','.vbox','.sfnrow','.piucn','.pkpis','li','h3','.vt','.vd','.ev']}
    }).from(host.firstElementChild).toPdf().get('pdf').then(pdf=>{
      const n=pdf.internal.getNumberOfPages();
      for(let i=1;i<=n;i++){pdf.setPage(i);pdf.setFontSize(7.5);pdf.setTextColor(110,112,144);
        pdf.text('Atlas SfN Dakar–Niayes · GEF 12082 · PIMS 10290 · '+today,12,290);pdf.text(i+' / '+n,198,290,{align:'right'});}
    }).save();
  } finally { host.remove(); }
}
function printDoc(opt){
  $('#print').innerHTML=buildDoc(opt);
  document.body.classList.add('printing'); setTimeout(()=>{window.print();document.body.classList.remove('printing');},350);
}

// ---------- dialogue ----------
const dlg=document.createElement('div'); dlg.id='pdfdlg'; dlg.className='pdfdlg'; document.body.appendChild(dlg);
const OPT=Object.assign({scope:'all',synth:true,uicn:true,fiches:true,plan:true,vuln:true,events:true},JSON.parse(localStorage.getItem('atlas_pdfopt')||'{}'));
A.pdfDialog=(scope)=>{
  if(scope) OPT.scope=scope;
  const sel=A.state.sel&&S.find(s=>s.id===A.state.sel);
  if(!sel&&OPT.scope==='one') OPT.scope='all';
  const ck=(k,l,sub)=>`<label class="chk"><input type="checkbox" data-o="${k}" ${OPT[k]?'checked':''}> <span>${l}${sub?`<br><small>${sub}</small>`:''}</span></label>`;
  dlg.innerHTML=`<div class="pdfbox">
   <div class="pdfh"><b>Télécharger en PDF</b><button class="x" id="pdfx" aria-label="Fermer">×</button></div>
   <h3>Périmètre</h3>
   <div class="seg" id="pdfscope"><button data-v="all" class="${OPT.scope==='all'?'on':''}">Atlas complet · 15 sites</button><button data-v="one" class="${OPT.scope==='one'?'on':''}" ${sel?'':'disabled title="Ouvrez d\'abord une fiche de site"'}>${sel?'Site '+sel.id+' · '+esc(sel.nom.split(' (')[0]):'Site sélectionné (aucun)'}</button></div>
   <h3>Contenu</h3>
   ${ck('synth','Synthèse : matrice des SfN et coordonnées')}
   ${ck('uicn','Cibles du programme et conformité UICN')}
   ${ck('fiches','Fiches sites (A4)')}
   <div class="pdfsub">${ck('plan',"Plan d'implantation des SfN","schéma à l'échelle des quantités ProDoc")}${ck('vuln','Vulnérabilité climatique (SSP)')}${ck('events','Interventions réalisées depuis (sources)')}</div>
   <div class="pdfstat" id="pdfstat"></div>
   <div class="btns" style="margin-top:12px"><button class="btn fill" id="pdfgo">⤓ Télécharger le PDF</button><button class="btn" id="pdfprint">Imprimer…</button></div>
   <p class="pdfnote">« Télécharger » produit directement un fichier PDF A4. « Imprimer » ouvre la boîte d'impression du navigateur : choisissez « Enregistrer au format PDF » pour un texte sélectionnable.</p>
  </div>`;
  dlg.classList.add('on');
  const save=()=>localStorage.setItem('atlas_pdfopt',JSON.stringify(OPT));
  dlg.querySelectorAll('input[data-o]').forEach(i=>i.onchange=()=>{OPT[i.dataset.o]=i.checked;save();sync();});
  dlg.querySelectorAll('#pdfscope button').forEach(b=>b.onclick=()=>{if(b.disabled)return;OPT.scope=b.dataset.v;save();dlg.querySelectorAll('#pdfscope button').forEach(x=>x.classList.toggle('on',x===b));});
  const close=()=>dlg.classList.remove('on');
  $('#pdfx').onclick=close; dlg.onclick=e=>{if(e.target===dlg)close();};
  const st=$('#pdfstat'), go=$('#pdfgo');
  function sync(){dlg.querySelectorAll('.pdfsub input').forEach(i=>i.disabled=!OPT.fiches); go.disabled=!(OPT.synth||OPT.uicn||OPT.fiches);}
  sync();
  go.onclick=async()=>{go.disabled=true; st.className='pdfstat on';
    try{await download(OPT,m=>st.textContent=m); st.textContent='PDF téléchargé.'; setTimeout(close,900);}
    catch(e){st.className='pdfstat on err'; st.textContent='Téléchargement direct impossible ('+e.message+'). Utilisez « Imprimer… » puis « Enregistrer au format PDF ».';}
    finally{go.disabled=false;}};
  $('#pdfprint').onclick=()=>{close();printDoc(OPT);};
};
document.addEventListener('keydown',e=>{if(e.key==='Escape')dlg.classList.remove('on');});

// bouton PDF dans la fiche et dans l'onglet SfN
const origSelect=A.select;
A.select=id=>{origSelect(id); const b=$('#back'); if(b&&!$('#bPdfOne')){b.insertAdjacentHTML('afterend',' <button class="btn fill" id="bPdfOne">⤓ PDF de cette fiche</button>'); $('#bPdfOne').onclick=()=>A.pdfDialog('one');}};
const sfnPane=$('#p-sfn');
const origShow=A.sfnShow;
function addSfnBtn(){if(!$('#bPdfSfn')){const h=sfnPane.querySelector('h2'); if(h){h.insertAdjacentHTML('afterend','<div class="btns"><button class="btn fill" id="bPdfSfn">⤓ Télécharger l\'atlas SfN en PDF</button></div>'); $('#bPdfSfn').onclick=()=>A.pdfDialog('all');}}}
A.sfnShow=()=>{origShow(); addSfnBtn();};
sfnPane.addEventListener('click',()=>setTimeout(addSfnBtn,0));
const addOne=()=>{const b=$('#back'); if(b&&A.state.sel&&!$('#bPdfOne')){b.insertAdjacentHTML('afterend',' <button class="btn fill" id="bPdfOne">⤓ PDF de cette fiche</button>'); $('#bPdfOne').onclick=()=>A.pdfDialog('one');}};
addOne(); if(A.state.mode==='sfn') addSfnBtn();
})();
