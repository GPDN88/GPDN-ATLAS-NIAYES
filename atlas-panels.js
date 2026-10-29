(function(){
const A=window.ATLAS, S=window.ATLAS_SITES, P=window.ATLAS_PROJECT, map=A.map;
const $=s=>document.querySelector(s);
const fmt=n=>n==null?'—':Number(n).toLocaleString('fr-FR');
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

// ---------- tabs ----------
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.t));
function setTab(t){
  document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('on',p.id==='p-'+t));
  A.state.mode=t;
  if(t==='niayes'){A.on.nitrate=A.on.salin=A.on.nappe=A.on.degrad=true; syncChecks(); map.flyToBounds(A.layers.niayes.getBounds(),{padding:[30,30],duration:.9});}
  if(t==='proj'){drawProj(); map.flyTo([14.80,-17.30],11,{duration:.9});}
  if(t==='sfn'&&A.sfnShow) A.sfnShow(); else if(A.redrawSfnGeo) A.redrawSfnGeo();
  if(t==='hors'&&A.horsShow) A.horsShow();
  $('#yearbadge').style.display=t==='proj'?'block':'none';
  A.applyLayers(); localStorage.setItem('atlas_tab',t);
}

// ---------- sites list ----------
const STAT={ok:['ok','Validé'],approx:['warn','Approximatif'],faux:['','Erroné']};
function flags(s){
  const v=s.verif; if(!v) return '';
  return `<span class="flag ${STAT[v.statut][0]}">${STAT[v.statut][1]}</span>`;
}
function renderList(){
  const grp=(t,title)=>`<h3>${title}</h3><div class="list">`+S.filter(s=>s.type===t).map(s=>
    `<div class="row ${A.state.sel===s.id?'sel':''}" data-id="${s.id}"><div class="num ${s.type}">${s.id}</div>
     <div><div class="n">${s.nom}</div><div class="s">${s.pos[0].toFixed(4)}° N · ${(-s.pos[1]).toFixed(4)}° O · ${fmt(s.sup)} ha${s.moved?' · <span style="color:var(--green)">corrigé</span>':''}</div></div>${flags(s)}</div>`).join('')+'</div>';
  $('#sitelist').innerHTML=`
   <p style="margin-top:0">Ce sont les 15 sites retenus par le ProDoc : 10 bassins de rétention et 5 exutoires naturels. Cliquez sur un site pour ouvrir sa fiche et zoomer.</p>
   <div class="note"><b>Coordonnées de l'atlas : positions corrigées.</b> ${S.filter(s=>s.moved).length} sites ont été déplacés vers leur position vérifiée. ${S.filter(s=>!s.moved).length} conservent le point ProDoc, soit parce qu'il est validé, soit parce qu'aucune meilleure position n'existe.<br>Annexe E du ProDoc : ${S.filter(s=>s.verif?.statut==='ok').length} validés · ${S.filter(s=>s.verif?.statut==='approx').length} approximatifs · ${S.filter(s=>s.verif?.statut==='faux').length} erronés. Sur la carte, l'ancien point ProDoc reste visible en cercle pointillé (rouge s'il était erroné).<br>Confiance : <span class="conf haute">haute</span> ${S.filter(s=>s.ret.conf==='haute').length} · <span class="conf moyenne">moyenne</span> ${S.filter(s=>s.ret.conf==='moyenne').length} · <span class="conf faible">faible</span> ${S.filter(s=>s.ret.conf==='faible').length}</div>
   <div class="btns"><button class="btn" id="bTab">Tableau de vérification</button></div>
   <div class="btns"><button class="btn fill" id="bPrint">⤓ Télécharger en PDF</button><button class="btn" id="bGeo">GeoJSON</button><button class="btn" id="bCsv">CSV coordonnées</button></div>
   ${grp('bassin','10 bassins de rétention — Dakar')}${grp('exutoire','5 exutoires naturels — Niayes')}
   <h3>Couches</h3>
   <label class="chk"><input type="checkbox" data-l="sfn"> <b>SfN appliquées sur les sites (implantation)</b></label>
   <label class="chk"><input type="checkbox" data-l="hors"> <b>Solutions hors SfN (ouvrages, suivi, équipements)</b></label>
   <label class="chk"><input type="checkbox" data-l="niayes"> Bande des Niayes (schématique)</label>
   <label class="chk"><input type="checkbox" data-l="axes"> 500 km d'axes d'écoulement : zones cibles</label>
   <label class="chk"><input type="checkbox" data-l="marigots"> Trois Marigots : Khant, Ndjim, Ndiasséou, ouvrages</label>
   <label class="chk"><input type="checkbox" data-l="footprints"> Emprise théorique des sites (ha)</label>
   <label class="chk"><input type="checkbox" data-l="osm"> Anciens points ProDoc (cercle pointillé) et déplacement</label>`;
  document.querySelectorAll('#sitelist .row').forEach(r=>r.onclick=()=>A.select(+r.dataset.id));
  $('#bPrint').onclick=()=>A.pdfDialog?A.pdfDialog():printAll(); $('#bGeo').onclick=dlGeo; $('#bCsv').onclick=dlCsv; $('#bTab').onclick=showVerifTable;
  bindChecks($('#sitelist'));
}
function bindChecks(root){root.querySelectorAll('input[data-l]').forEach(i=>{i.checked=!!A.on[i.dataset.l];i.onchange=()=>{A.on[i.dataset.l]=i.checked;A.applyLayers();}});}
function syncChecks(){document.querySelectorAll('input[data-l]').forEach(i=>i.checked=!!A.on[i.dataset.l]);}

// ---------- fiche ----------
function ficheHTML(s,print){
  const [lat,lon]=s.pos; const [x,y]=A.utm(lat,lon);
  const dm=(A.dist(s.prodoc,s.pos)/1000).toFixed(2);
  const li=a=>'<ul>'+a.map(t=>`<li>${esc(t)}</li>`).join('')+'</ul>';
  const d=s.osm?(A.dist(s.prodoc,s.osm)/1000).toFixed(2)+' km':'—';
  const v=s.verif||{};
  const verifBox=v.statut?`<div class="vbox ${v.statut}"><div class="vh">Vérification des coordonnées : <b>${STAT[v.statut][1]}</b></div>
    <div class="vl">Le point ProDoc tombe à : ${esc(v.rev)}</div>
    <p>${esc(v.note)}</p>
    <div class="vl">Ancien point ProDoc (Annexe E)</div><div class="mono">${s.prodoc[0].toFixed(3)}° N, ${(-s.prodoc[1]).toFixed(3)}° O${s.moved?` · déplacé de ${dm} km`:' · conservé'}</div>
    </div>`:'';
  const dep=(v.depuis||[]).map(e=>`<div class="ev"><div class="evd">${esc(e.d)}</div><div>${esc(e.t)} <span class="evs">${e.u&&!print?`<a href="${e.u}" target="_blank" rel="noopener">${esc(e.s)}</a>`:esc(e.s)}</span></div></div>`).join('');
  return `
  <div class="sub">${s.type==='bassin'?'BASSIN DE RÉTENTION':'EXUTOIRE NATUREL'} · SITE ${s.id}/15 · ProDoc p.${s.page}</div>
  <h2>${s.nom}</h2>
  <div class="sub">${esc(s.commune)} · dép. ${esc(s.dept)} · région ${esc(s.region)}</div>
  <div class="coordbox">
    <div class="l">Coordonnées retenues (WGS 84) · ${s.moved?'position corrigée':'point ProDoc conservé'}</div>
    <div class="g"><span>DD</span><span>${lat.toFixed(4)}° N, ${(-lon).toFixed(4)}° O</span>
    <span>DMS</span><span>${A.dms(lat,'N','S')}  ${A.dms(lon,'E','O')}</span>
    <span>UTM 28N</span><span>E ${fmt(Math.round(x))} · N ${fmt(Math.round(y))}</span>
    <span>Source</span><span>${esc(s.moved?s.osmRef:'ProDoc, Annexe E (p.246-247)')}</span>
    <span>Confiance</span><span><span class="conf ${s.ret.conf}">${s.ret.conf}</span></span></div>
    <div style="margin-top:6px;color:#cdd2ee;font-family:var(--sans);font-size:11.5px;line-height:1.4">${esc(s.ret.why)}</div>
  </div>
  ${verifBox}
  ${print?'':`<div class="btns">${[1000,5000,50000,500000,1000000].map(n=>`<button class="btn" data-sc="${n}">1/${fmt(n)}</button>`).join('')}</div>`}
  <table><tr><td>Superficie</td><td class="r mono">${fmt(s.sup)} ha</td></tr>
  <tr><td>Population exposée</td><td class="r mono">${fmt(s.pop)} hab.</td></tr>
  <tr><td>Aléa principal</td><td class="r">${esc(s.alea)}</td></tr>
  <tr><td>Action principale (p.99-100)</td><td class="r">${esc(s.action)} · ${s.annee}</td></tr>
  ${s.vol?`<tr><td>Volume utile cible</td><td class="r mono">${fmt(s.vol)} m³</td></tr>`:''}
  <tr><td>Surface ${s.type==='bassin'?'requalifiée':'traitée'} cible</td><td class="r mono">${s.surfReq} ha</td></tr>
  ${s.especes?`<tr><td>Espèces vedettes</td><td class="r">${s.especes}</td></tr>`:''}</table>
  ${window.ATLAS_SFN?ATLAS_SFN.ficheSfn(s,print):''}
  ${window.ATLAS_HORS?ATLAS_HORS.ficheHors(s,print):''}
  ${window.ATLAS_VULN?ATLAS_VULN.ficheVuln(s,print):''}
  <div class="${print?'grid':''}">
  ${s.id===14&&window.ATLAS_MARIGOTS?`<div style="grid-column:1/-1"><h3>Composantes du système (positions)</h3><table class="mgt"><tr><th>Élément</th><th>Coordonnées</th></tr>${ATLAS_MARIGOTS.map(g=>`<tr><td><b>${g.nom}</b><br><span style="color:var(--mute)">${esc(g.rev)}</span><br>${esc(g.info)}</td><td class="mono">${g.c?g.c[0].toFixed(4)+'° N<br>'+(-g.c[1]).toFixed(4)+'° O':'à localiser'}</td></tr>`).join('')}</table><p style="font-size:11.5px;color:var(--mute)">Noms attribués aux dépressions OSM dans l'ordre nord-ouest → sud-est. Attribution provisoire, à confirmer avec le plan de gestion OLAC 2019-2023.</p></div>`:''}
  <div><h3>Problèmes constatés</h3>${li(s.problemes)}</div>
  <div><h3>Interventions actuelles selon le ProDoc</h3>${li(s.actuel)}</div>
  <div style="grid-column:1/-1"><h3>Interventions réalisées depuis (sources publiques)</h3><div class="evs-wrap">${dep||'<p>Aucune intervention documentée trouvée.</p>'}</div></div>
  <div><h3>Interventions SfN prévues</h3>${li(s.prevu)}</div>
  <div><h3>Difficultés et points de vigilance</h3>${li(s.difficultes)}</div>
  </div>`;
}
A.select=(id)=>{
  const s=S.find(x=>x.id===id); A.state.sel=id;
  if(A.state.mode!=='sites') setTab('sites');
  $('#sitelist').style.display='none'; const f=$('#fiche'); f.style.display='block';
  f.innerHTML=`<button class="btn" id="back">← Liste des sites</button><div style="height:10px"></div>`+ficheHTML(s);
  $('#back').onclick=()=>{f.style.display='none';$('#sitelist').style.display='block';A.state.sel=null;renderList();};
  f.querySelectorAll('[data-sc]').forEach(b=>b.onclick=()=>A.setScale(+b.dataset.sc,L.latLng(s.pos)));
  A.setScale(s.type==='bassin'||s.sup<300?5000:50000, L.latLng(s.pos));
  localStorage.setItem('atlas_sel',id);
};

function showVerifTable(){
  const f=$('#fiche'); $('#sitelist').style.display='none'; f.style.display='block';
  f.innerHTML=`<button class="btn" id="back">← Liste des sites</button>
  <h2 style="margin-top:12px">Tableau de vérification des coordonnées</h2>
  <p>Coordonnées ProDoc comparées à la commune réelle du point et à l'objet cartographié le plus probable.</p>
  <table><tr><th>N°</th><th>Site · coordonnées retenues</th><th>ProDoc</th><th class="r">Dépl.</th></tr>
  ${S.map(s=>`<tr data-id="${s.id}" style="cursor:pointer"><td class="mono">${s.id}</td><td><b>${s.nom}</b><br><span class="mono" style="font-size:11px">${s.pos[0].toFixed(4)}, ${s.pos[1].toFixed(4)}</span> <span class="conf ${s.ret.conf}">${s.ret.conf}</span></td><td>${flags(s)}</td><td class="r mono">${s.moved?(A.dist(s.prodoc,s.pos)/1000).toFixed(1)+' km':'—'}</td></tr>`).join('')}</table>
  <div class="btns"><button class="btn" id="bCsv2">Exporter le CSV corrigé</button></div>`;
  $('#back').onclick=()=>{f.style.display='none';$('#sitelist').style.display='block';};
  f.querySelectorAll('tr[data-id]').forEach(r=>r.onclick=()=>A.select(+r.dataset.id));
  $('#bCsv2').onclick=dlCsv;
}

// ---------- exports ----------
function dl(name,txt,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click();}
function dlGeo(){
  dl('sites_SfN_GEF12082.geojson',JSON.stringify({type:'FeatureCollection',features:S.map(s=>({type:'Feature',
   geometry:{type:'Point',coordinates:[s.pos[1],s.pos[0]]},
   properties:{id:s.id,nom:s.nom,type:s.type,region:s.region,superficie_ha:s.sup,population:s.pop,alea:s.alea,annee:s.annee,volume_m3:s.vol,
     position:s.moved?'corrigee':'prodoc',confiance:s.ret.conf,source_position:s.moved?s.osmRef:'ProDoc Annexe E',prodoc_lat:s.prodoc[0],prodoc_lon:s.prodoc[1],statut_prodoc:s.verif.statut,deplacement_m:Math.round(A.dist(s.prodoc,s.pos))}}))},null,1),'application/geo+json');
}
function dlCsv(){
  const h='id;nom;type;region;lat;lon;lat_dms;lon_dms;utm28n_E;utm28n_N;position;confiance;source_position;superficie_ha;population;lat_prodoc;lon_prodoc;statut_prodoc;point_prodoc_tombe_a;deplacement_m';
  dl('sites_SfN_GEF12082_corriges.csv','\ufeff'+h+'\n'+S.map(s=>{const[x,y]=A.utm(...s.pos);
   return [s.id,s.nom,s.type,s.region,s.pos[0],s.pos[1],A.dms(s.pos[0],'N','S'),A.dms(s.pos[1],'E','O'),Math.round(x),Math.round(y),s.moved?'corrigee':'prodoc',s.ret.conf,'"'+(s.moved?s.osmRef:'ProDoc Annexe E')+'"',s.sup,s.pop,s.prodoc[0],s.prodoc[1],s.verif.statut,'"'+s.verif.rev+'"',Math.round(A.dist(s.prodoc,s.pos))].join(';')}).join('\n'),'text/csv');
}
function printAll(){
  $('#print').innerHTML=S.map(s=>`<div class="pf"><div class="sub">Atlas SfN Dakar–Niayes · GEF 12082 · PIMS 10290</div>${ficheHTML(s,true)}</div>`).join('');
  document.body.classList.add('printing'); setTimeout(()=>{window.print();document.body.classList.remove('printing');},300);
}

A.ficheHTML=ficheHTML; A.setTab=setTab;

// ---------- Niayes pane ----------
const NO3=[[0,25,'#2f8f4e','< 25 mg/L : bonne'],[25,50,'#c9b11a','25–50 : vigilance'],[50,100,'#e0751c','50–100 : > norme OMS'],[100,1e9,'#b23a2e','> 100 : forte pollution']];
function no3col(v){if(v==null||isNaN(v))return '#888';return NO3.find(c=>v>=c[0]&&v<c[1])[2];}
function renderNiayes(){
  $('#p-niayes').innerHTML=`
  <h2>Niayes : 10 000 ha de terres agricoles, nappe et forages</h2>
  <div class="kpis">
    <div class="kpi"><b>8 883 km²</b><span>dépressions humides, 180 km × 5–30 km</span></div>
    <div class="kpi"><b>10 000 ha</b><span>superficie cultivable, cible « terres agricoles restaurées »</span></div>
    <div class="kpi"><b>−7 m</b><span>baisse de nappe en 50 ans (ProDoc p.27)</span></div>
    <div class="kpi"><b>57 %</b><span>puits > 50 mg/L NO₃⁻ (131 puits, Sall 2009)</span></div>
  </div>
  <div class="note red"><b>Ce qu'il manque dans le ProDoc.</b> Le document n'a <u>ni contour géoréférencé des 10 000 ha</u>, <u>ni inventaire des forages existants</u>, <u>ni mesures de pollution</u>. Il prévoit seulement 50 forages solaires, 200 puits d'injection et 30 piézomètres à implanter. Les zones ci-dessous sont des <b>zones indicatives</b> tirées du ProDoc et de la littérature scientifique, pas des relevés. Pour cartographier les forages, importez l'inventaire DGPRE / OLAG ou vos relevés terrain.</div>
  <h3>Couches thématiques</h3>
  <label class="chk"><input type="checkbox" data-l="degrad"><span class="sw" style="background:${A.zc.degrad}"></span> Zones dégradées (urbanisation, perte de terres)</label>
  <label class="chk"><input type="checkbox" data-l="nappe"><span class="sw" style="background:${A.zc.nappe}"></span> Baisse de nappe / assèchement</label>
  <label class="chk"><input type="checkbox" data-l="nitrate"><span class="sw" style="background:${A.zc.nitrate}"></span> Pollution aux nitrates</label>
  <label class="chk"><input type="checkbox" data-l="salin"><span class="sw" style="background:${A.zc.salin}"></span> Salinisation / intrusion saline</label>
  <label class="chk"><input type="checkbox" data-l="niayes"> Bande des Niayes</label>
  <label class="chk"><input type="checkbox" data-l="forages"> Forages importés</label>
  <h3>Inventaire des forages : import</h3>
  <p style="margin:4px 0">CSV avec <span class="mono">nom;lat;lon;profondeur_m;niveau_statique_m;no3_mgL;ce_uScm;annee</span> (séparateur ; ou ,). Les points sont colorés selon la teneur en nitrates.</p>
  <div class="btns"><label class="btn fill" style="cursor:pointer">Importer un CSV<input type="file" id="fcsv" accept=".csv,.txt" hidden></label><button class="btn" id="ftpl">Modèle CSV</button><button class="btn" id="fclr">Vider</button></div>
  <div class="legend">${NO3.map(c=>`<span class="sw" style="background:${c[2]};border-radius:50%"></span><span>${c[3]}</span>`).join('')}</div>
  <div id="fstat"></div>
  <h3>Évolution de la nappe : Niayes</h3>
  <div class="chart">${nappeChart()}</div>
  <p style="font-size:11.5px;color:var(--mute)">Tendance historique : −0,14 m/an (−7 m/50 ans). Mboro : −0,30 m/an. Avec projet : remontée de 30 à 60 cm sur les sites pilotes (ProDoc p.84, 107).</p>`;
  bindChecks($('#p-niayes'));
  $('#ftpl').onclick=()=>dl('modele_forages.csv','\ufeffnom;lat;lon;profondeur_m;niveau_statique_m;no3_mgL;ce_uScm;annee\nF-exemple;15.1360;-16.8812;35;-8.5;;;2026\n','text/csv');
  $('#fclr').onclick=()=>{A.layers.forages.clearLayers();$('#fstat').innerHTML='';localStorage.removeItem('atlas_forages');};
  $('#fcsv').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{loadForages(t);localStorage.setItem('atlas_forages',t);});};
  const saved=localStorage.getItem('atlas_forages'); if(saved) loadForages(saved,true);
}
function loadForages(txt,silent){
  const lines=txt.replace(/^\ufeff/,'').split(/\r?\n/).filter(l=>l.trim());
  const sep=lines[0].includes(';')?';':','; const h=lines[0].split(sep).map(x=>x.trim().toLowerCase());
  const ix=k=>h.findIndex(x=>x.startsWith(k));
  const iL=ix('lat'),iO=ix('lon'),iN=ix('nom'),iP=ix('prof'),iS=ix('niveau'),iNO=ix('no3'),iC=ix('ce');
  A.layers.forages.clearLayers(); let n=0,over=0,b=[];
  lines.slice(1).forEach(l=>{const c=l.split(sep);const lat=parseFloat((c[iL]||'').replace(',','.')),lon=parseFloat((c[iO]||'').replace(',','.'));
    if(isNaN(lat)||isNaN(lon))return; const no3=iNO>=0&&c[iNO]?parseFloat(c[iNO].replace(',','.')):null; n++; if(no3>50)over++; b.push([lat,lon]);
    L.circleMarker([lat,lon],{radius:6,color:'#fff',weight:1.5,fillColor:no3col(no3),fillOpacity:.95})
     .bindPopup(`<b>${esc(c[iN]||'Forage')}</b><br>${lat.toFixed(5)}, ${lon.toFixed(5)}<br>Profondeur : ${c[iP]||'—'} m · Niveau : ${c[iS]||'—'} m<br>NO₃⁻ : ${no3??'—'} mg/L · CE : ${c[iC]||'—'} µS/cm`).addTo(A.layers.forages);});
  $('#fstat').innerHTML=`<div class="note">${n} forages chargés, dont ${over} au-dessus de 50 mg/L.</div>`;
  if(n&&!silent) map.fitBounds(b,{padding:[40,40],maxZoom:15});
}
function nappeChart(){
  const W=380,H=170,x0=36,y0=12,w=W-x0-10,h=H-y0-26;
  const X=yr=>x0+(yr-1975)/(2050-1975)*w, Y=v=>y0+(-v)/10*h;
  const base=[[1975,0],[2026,-7.1],[2031,-7.8],[2050,-10.5]];
  const proj=[[2026,-7.1],[2028,-7.2],[2031,-6.65],[2040,-6.9],[2050,-7.4]];
  const path=a=>a.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join('');
  let g='';for(let v=0;v>=-10;v-=2)g+=`<line x1="${x0}" x2="${W-10}" y1="${Y(v)}" y2="${Y(v)}" stroke="#eee"/><text x="${x0-4}" y="${Y(v)+3}" font-size="9" text-anchor="end" fill="#888" font-family="IBM Plex Mono">${v} m</text>`;
  [1975,2000,2026,2031,2050].forEach(yr=>g+=`<text x="${X(yr)}" y="${H-8}" font-size="9" text-anchor="middle" fill="#888" font-family="IBM Plex Mono">${yr}</text>`);
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">${g}<rect x="${X(2026)}" y="${y0}" width="${X(2031)-X(2026)}" height="${h}" fill="#1b2453" opacity=".06"/>
  <path d="${path(base)}" fill="none" stroke="#b23a2e" stroke-width="2" stroke-dasharray="${''}"/><path d="${path(proj)}" fill="none" stroke="#3f7d3a" stroke-width="2.5"/>
  <text x="${X(2050)-2}" y="${Y(-10.5)-5}" font-size="10" text-anchor="end" fill="#b23a2e" font-family="IBM Plex Sans Condensed">sans projet</text>
  <text x="${X(2050)-2}" y="${Y(-7.4)-6}" font-size="10" text-anchor="end" fill="#3f7d3a" font-family="IBM Plex Sans Condensed">avec SfN</text>
  <text x="${(X(2026)+X(2031))/2}" y="${y0+10}" font-size="9" text-anchor="middle" fill="#1b2453" font-family="IBM Plex Mono">projet</text></svg>`;
}

// ---------- Projections ----------
// indice de risque inondation 1–5 (dérivé des fiches) ; effets SfN dérivés des cibles ProDoc
const RISK={1:4.2,2:4.6,3:4.8,4:4.3,5:4.4,6:4.5,7:3.6,8:3.0,9:3.8,10:3.2,11:4.0,12:3.4,13:3.3,14:3.1,15:3.0};
const st=A.state; st.scen=st.scen||'avec'; st.year=st.year||2031;
function riskAt(id,year,scen){
  const r0=RISK[id]; const clim=year<=2026?0:year<=2031?0.25:0.7; // RCP6.0 : épisodes intenses ↑
  if(scen==='sans'||year<=2026) return Math.min(5,r0+clim+(year>2026?0.15:0));
  const s=S.find(x=>x.id===id); const eff=s.type==='bassin'?0.30+Math.min(.15,(s.vol||0)/600000):0.25; // −30 % crues décennales
  return Math.max(1,r0*(1-eff)+clim*0.6);
}
const rcol=r=>r>=4.3?'#b23a2e':r>=3.6?'#e0751c':r>=2.8?'#c9b11a':'#2f8f4e';
function drawProj(){
  const y=st.year, sc=st.scen; A.projLayer.clearLayers();
  $('#yearbadge').textContent=(y===2026?'2026 · état actuel':y===2031?'2031 · fin de projet':'2050 · horizon climatique RCP 6.0')+(y>2026?(sc==='avec'?' · avec SfN':' · sans projet'):'');
  S.forEach(s=>{const r=riskAt(s.id,y,sc); const rad=Math.max(500,Math.sqrt(s.pop)*14*(s.type==='exutoire'&&s.id>12?2.5:1));
    A.projLayer.addLayer(L.circle(s.pos,{radius:rad,color:rcol(r),weight:2,fillColor:rcol(r),fillOpacity:.38})
      .bindTooltip(`<b>${s.nom}</b><br>Indice de risque : ${r.toFixed(1)}/5<br>${fmt(s.pop)} hab. exposés`,{sticky:true}));});
  renderProj();
}
function kpisFor(y,sc){
  const prog=y<=2026?0:1, w=sc==='avec'&&y>2026;
  const ny = y===2026?-7.1:(w?(y===2031?-6.65:-7.4):(y===2031?-7.8:-10.5));
  return [
   ['Stockage pluvial des bassins', w?fmt(P.vol)+' m³':'≈ 0 (saturés, comblés)', w?'+540 000 m³':''],
   ['Crue décennale (débit de pointe)', w?'−30 %':(y>2026?'+15 à +25 %':'réf.'), w?'':'neg'],
   ['Ruissellement agricole', w?'−30 à −55 %':'réf.', ''],
   ['Nappe des Niayes (vs 1975)', ny.toFixed(1)+' m', w?'+30–60 cm pilotes':(y>2026?'neg':'')],
   ['Typha, Grande Niaye', w?'≈ 40 ha':(y>2026?'> 130 ha':'100 ha'), w?'−60 ha':(y>2026?'neg':'')],
   ['Lac Tanma, zone humide', w?'600 ha restaurés':(y>2026?(y===2031?'≈ 480 ha en eau':'≈ 350 ha en eau'):'≈ 560 ha en eau'), w?'':(y>2026?'neg':'')],
   ['Ha sous gestion résiliente', w?fmt(P.haTotal)+' ha':'0', w?'Indicateur LDCF 2':''],
   ['Bénéficiaires directs', w?fmt(P.benef):'—', w?'50 % femmes':''],
   ['Emplois verts', w?fmt(P.emplois):'—', w?'55 % femmes':''],
   ['VAN (hybride, 25 ans, 10 %)', w?P.van+' M$':'—', w?'TRI 24 % · B/C 2,7':'']
  ];
}
function renderProj(){
  const y=st.year, sc=st.scen, k=kpisFor(y,sc);
  const tot=S.reduce((a,s)=>a+s.pop,0), hi=S.filter(s=>riskAt(s.id,y,sc)>=4.3).reduce((a,s)=>a+s.pop,0);
  $('#p-proj').innerHTML=`
  <h2>Projections pour le décideur</h2>
  <p style="margin-top:0">Sur la carte, chaque site prend la couleur de son indice de risque d'inondation. La taille du cercle suit la population exposée. Comparez l'évolution sans projet avec la mise en œuvre des SfN (scénario hybride retenu).</p>
  <h3>Horizon</h3><div class="seg" id="sy">${[[2026,'2026 · actuel'],[2031,'2031 · fin projet'],[2050,'2050 · RCP 6.0']].map(([v,l])=>`<button data-v="${v}" class="${v===y?'on':''}">${l}</button>`).join('')}</div>
  <h3>Scénario</h3><div class="seg" id="ss">${[['sans','Sans projet (tendanciel)'],['avec','Avec SfN (hybride)']].map(([v,l])=>`<button data-v="${v}" class="${v===sc?'on':''}">${l}</button>`).join('')}</div>
  <div class="kpis"><div class="kpi"><b style="color:${hi/tot>.4?'#b23a2e':'#3f7d3a'}">${fmt(hi)}</b><span>habitants des 15 sites en risque élevé (≥ 4,3/5), sur ${fmt(tot)}</span></div>
  <div class="kpi"><b>${(S.reduce((a,s)=>a+riskAt(s.id,y,sc),0)/15).toFixed(2)}</b><span>indice de risque moyen /5</span></div></div>
  <table>${k.map(r=>`<tr><td>${r[0]}</td><td class="r mono"><b>${r[1]}</b>${r[2]&&r[2]!=='neg'?`<br><span style="color:#3f7d3a;font-size:10.5px">${r[2]}</span>`:''}</td></tr>`).join('')}</table>
  <h3>Vulnérabilité climatique par site (indice E-S-CA, scénarios SSP)</h3>
  ${window.ATLAS_VULN?ATLAS_VULN.summaryTable():''}
  <p style="font-size:11.5px;color:var(--mute)">Cliquez sur un site pour voir le détail dans sa fiche.</p>
  <h3>Indice de risque par site</h3>
  <table><tr><th>Site</th><th class="r">2026</th><th class="r">${y}</th></tr>${S.map(s=>{const a=riskAt(s.id,2026,sc),b=riskAt(s.id,y,sc);
    return `<tr><td>${s.id}. ${s.nom}</td><td class="r mono" style="color:${rcol(a)}">${a.toFixed(1)}</td><td class="r mono" style="color:${rcol(b)}"><b>${b.toFixed(1)}</b></td></tr>`}).join('')}</table>
  <div class="legend" style="margin-top:10px"><span class="sw" style="background:#b23a2e"></span><span>Élevé ≥ 4,3</span><span class="sw" style="background:#e0751c"></span><span>Fort 3,6–4,3</span><span class="sw" style="background:#c9b11a"></span><span>Modéré 2,8–3,6</span><span class="sw" style="background:#2f8f4e"></span><span>Faible &lt; 2,8</span></div>
  <div class="note" style="margin-top:12px"><b>Hypothèses.</b> L'indice 2026 est noté à partir des fiches (aléa, dégradation, population). Effet SfN : −30 % sur les crues décennales (ProDoc p.78), avec un bonus selon le volume de stockage par bassin (p.99). Climat : épisodes intenses en hausse selon RCP 6.0 (PIK 2022, p.25). Sans projet, la tendance suit l'urbanisation 1978-2019 (p.40) et la baisse de nappe de −0,14 m/an (p.27). Ces projections sont <b>indicatives</b> et ne remplacent pas une modélisation hydraulique (SWMM / MIKE).</div>`;
  document.querySelectorAll('#p-proj .vtall tr[data-id]').forEach(r=>r.onclick=()=>A.select(+r.dataset.id));
  document.querySelectorAll('#sy button').forEach(b=>b.onclick=()=>{st.year=+b.dataset.v;drawProj();});
  document.querySelectorAll('#ss button').forEach(b=>b.onclick=()=>{st.scen=b.dataset.v;drawProj();});
}

// ---------- Méthode ----------
$('#p-meth').innerHTML=`
<h2>Sources, échelles et limites</h2>
<h3>Source principale</h3>
<p>ProDoc FEM-8 LDCF Sénégal, « Résilience face aux inondations par les SfN » (GEF ID 12082, PIMS 10290), 279 pages. Fiches sites p.45-59, programme de travaux p.99-101, Annexe E (cartes et coordonnées) p.243-248.</p>
<h3>Ce que l'atlas montre / ne montre pas</h3>
<table>
<tr><td>10 bassins + 5 exutoires</td><td>Positions corrigées (13 sites) ou point ProDoc validé (Malika, Rufisque Est), fiches complètes</td></tr>
<tr><td>500 km d'axes</td><td>Répartition par zone (p.101) ; <b>tracés non fournis</b> dans le ProDoc</td></tr>
<tr><td>Niayes 8 883 km²</td><td>Bande schématique ; contour officiel à obtenir (ANAT / CSE)</td></tr>
<tr><td>10 000 ha agricoles</td><td><b>Non délimités</b> dans le ProDoc</td></tr>
<tr><td>Forages + pollution</td><td><b>Aucun inventaire</b> ; import CSV prévu (DGPRE / OLAG)</td></tr>
</table>
<h3>Échelles</h3>
<p>Les boutons 1/1000 à 1/1 000 000 calent l'affichage écran à 96 dpi. Au 1/1000 et au 1/5000, le fond satellite (environ 0,3–0,5 m/px) est agrandi, et la précision des points ProDoc (± 55 m) est <b>plus faible que l'échelle</b>. Une vraie cartographie au 1/1000 demande des levés GPS RTK ou drone (orthophoto 5 cm) sur chaque emprise.</p>
<h3>Incohérences relevées dans le ProDoc</h3>
<ul>
<li><b>Vérification d'octobre 2026</b> : géocodage inverse de chaque point (OSM Nominatim) et recherche de l'ouvrage réel dans OpenStreetMap (bassins de rétention, lacs, zones humides), complétés par Wikipédia, des rapports de l'ADM, de l'ONAS et de la Banque mondiale, et la presse.</li>
<li>Site 11 (Technopole) : coordonnées identiques au site 1 (Pikine Ouest).</li>
<li>Site 13 (Lac Tanma) : commune « Mboro » (p.57), « Sangalkam » (p.100), région « Thiès » (p.247).</li>
<li>Site 14 (Trois Marigots) : « Sébikhotane, Rufisque » (p.58), « Mboro » (p.100), « Louga 15,085 °N » (p.247). Le seul site de ce nom est le système du delta du fleuve Sénégal (Khant, Ndjim, Ndiasséou, Guélack ; communes de Gandon, Diama et Fass Ngom). L'atlas le replace à cet endroit, et ses 3 marigots sont tracés d'après les zones humides OSM.</li>
<li>Site 15 : point placé près de Potou (Louga), alors que la fiche indique Mboro. Les deux pôles sont à environ 90 km l'un de l'autre.</li>
<li>Site 10 : point à environ 8 km de Bambylor.</li>
<li>Lac Rose : « Sangalkam » (p.56) / « Rufisque-Niaga » (p.100) ; OSM : Tivaouane Peulh-Niaga.</li>
</ul>
<h3>Références complémentaires</h3>
<ul><li>Sall M. et al. (2009), <i>Agricultural Water Management</i> : nitrates dans 131 puits des Niayes.</li>
<li>Tandia A.A. et al. (1999), <i>J. Afr. Earth Sci.</i> : nappe de Yeumbeul.</li>
<li>OpenStreetMap / Nominatim : contrôle des localités (oct. 2026).</li></ul>`;

// ---------- init ----------
renderList(); renderNiayes();
const t=localStorage.getItem('atlas_tab'); if(t&&t!=='sites') setTab(t);
const sel=+localStorage.getItem('atlas_sel'); if(sel&&(!t||t==='sites')) A.select(sel);
})();
