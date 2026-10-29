// Solutions et produits HORS SfN identifiés dans le ProDoc GEF 12082
// (infrastructures grises, ouvrages d'eau, réseau de suivi, équipements, filières, gouvernance)
// alloc : répartition par site. src:'prodoc' = site nommé dans le ProDoc ; src:'ind' = répartition indicative de l'atlas
(function(){
const A=window.ATLAS, S=window.ATLAS_SITES, map=A.map;
const $=s=>document.querySelector(s);
const fmt=n=>n==null?'—':Number(n).toLocaleString('fr-FR');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const CAT=[
 {k:'grise', n:'Infrastructures grises hydrauliques', c:'#5d6470'},
 {k:'eau',   n:'Ouvrages d\u2019eau : collecte, recharge, irrigation', c:'#2f6db5'},
 {k:'suivi', n:'Réseau hydro-météo et suivi', c:'#7a4fb5'},
 {k:'equip', n:'Équipements de site', c:'#3f8a5a'},
 {k:'prod',  n:'Filières vertes et production (C3)', c:'#c0761f'},
 {k:'gouv',  n:'Gouvernance, planification, finance', c:'#1b2453'}
];
const CK=Object.fromEntries(CAT.map(c=>[c.k,c]));
const all=n=>Object.fromEntries(S.map(s=>[s.id,n]));
const bassins=n=>Object.fromEntries(S.filter(s=>s.type==='bassin').map(s=>[s.id,n]));

const H=[
 // ---- infrastructures grises (C2)
 {k:'digue',cat:'grise',m:'digue',n:'Digue périphérique compactée, géomembrane si nécessaire',cible:'10 bassins',u:'',p:76,comp:'C2 · 2.1.1.3',resp:'ONAS-DCCTEFV',cal:'Y2-Y4',alloc:bassins(1),src:'prodoc'},
 {k:'deversoir',cat:'grise',m:'deversoir',n:'Déversoir latéral sur collecteur principal (bassin de dérivation, niveau 1)',cible:'bassins de dérivation',u:'',p:97,comp:'C2 · 2.1.1',resp:'ONAS',cal:'Y3',alloc:{3:1,9:1},src:'prodoc',note:'Sites dont l\u2019action principale est une dérivation (p.99)'},
 {k:'sortie',cat:'grise',m:'sortie',n:'Sortie calibrée du bassin (régulation du débit)',cible:'10 bassins',u:'',p:97,comp:'C2 · 2.1.1',resp:'ONAS',cal:'Y2-Y4',alloc:bassins(1),src:'ind'},
 {k:'seuil',cat:'grise',m:'seuil',n:'Ouvrages de ralentissement dynamique : seuils en pierre, micro-barrages',cible:25,u:'ouvrages',p:101,comp:'C2 · 2.1.1',resp:'DGPI-ONAS',cal:'Y2-Y4',alloc:{1:3,2:2,3:3,4:3,5:3,6:3,7:1,8:2,9:3,10:2},src:'ind'},
 {k:'pompe',cat:'grise',m:'pompe',n:'Station de pompage ONAS (existante) : coordination de l\u2019exploitation',cible:'existant',u:'',p:70,comp:'Référence',resp:'ONAS-communes',cal:'existant',alloc:{1:1,6:1},src:'prodoc',exist:true},
 // ---- ouvrages d'eau (Produit 2.2.2)
 {k:'citerne',cat:'eau',m:'citerne',n:'Citernes enterrées, récupération des eaux de toiture',cible:600,u:'citernes',p:108,comp:'C2 · 2.2.2.1',resp:'DGPRE',cal:'Y2-Y4',alloc:all(40),src:'ind',note:'« toutes zones » : 40 par site'},
 {k:'decant',cat:'eau',m:'decant',n:'Ouvrages de collecte toiture/voirie avec décanteur',cible:200,u:'ouvrages',p:84,comp:'C2 · 2.2.2',resp:'DGPRE',cal:'Y2-Y4',alloc:{15:40,13:40,11:40,8:40,6:40},src:'prodoc',note:'800 ouvrages de collecte dont 600 citernes ; sites cités p.84'},
 {k:'injection',cat:'eau',m:'injection',n:'Puits d\u2019injection, recharge ciblée de la nappe des Niayes',cible:200,u:'puits',p:108,comp:'C2 · 2.2.2.2',resp:'DGPRE-DGPI',cal:'Y3-Y5',alloc:{12:50,13:70,15:80},src:'ind',note:'« Niayes en aval, bas de pente »'},
 {k:'forage',cat:'eau',m:'forage',n:'Forages maraîchers à pompage solaire',cible:50,u:'forages',p:108,comp:'C2 · 2.2.2.3',resp:'DGPRE-communes',cal:'Y2-Y4',alloc:{15:30,14:20},src:'prodoc',note:'Sites pilotes : Mboro, Trois Marigots (p.107)'},
 {k:'goutte',cat:'eau',m:'goutte',n:'Irrigation goutte-à-goutte',cible:200,u:'ha',p:107,comp:'C2 · 2.2.2.3',resp:'DGPRE',cal:'Y2-Y4',alloc:{15:120,14:80},src:'ind',note:'Économie d\u2019eau 40 %'},
 // ---- suivi (p.109)
 {k:'piezoM',cat:'suivi',m:'piezo',n:'Piézomètres manuels (niveau de nappe, mensuel)',cible:18,u:'piézomètres',p:109,comp:'C2 · 2.2.2.4',resp:'ANACIM-DGPRE',cal:'Y1-Y5',alloc:Object.assign(all(1),{12:2,13:2,15:3}),src:'ind'},
 {k:'piezoA',cat:'suivi',m:'piezoA',n:'Piézomètres automatiques (sonde de pression, conductivité, temps réel)',cible:12,u:'piézomètres',p:109,comp:'C2 · 2.2.2.4',resp:'ANACIM-DGPRE',cal:'Y1-Y5',alloc:{1:1,2:1,4:1,5:1,6:1,7:1,10:1,11:1,12:1,13:1,14:1,15:1},src:'ind'},
 {k:'pluvioA',cat:'suivi',m:'pluvioA',n:'Stations pluviométriques automatiques (intensité 5 min)',cible:8,u:'stations',p:109,comp:'C2 · 2.2.2.4',resp:'ANACIM',cal:'Y1-Y5',alloc:{1:1,3:1,5:1,8:1,9:1,11:1,12:1,15:1},src:'ind'},
 {k:'pluvioM',cat:'suivi',m:'pluvio',n:'Stations pluviométriques manuelles (cumul journalier)',cible:7,u:'stations',p:109,comp:'C2 · 2.2.2.4',resp:'ANACIM',cal:'Y1-Y5',alloc:{2:1,4:1,6:1,7:1,10:1,13:1,14:1},src:'ind'},
 {k:'jauge',cat:'suivi',m:'jauge',n:'Stations de jaugeage (hauteur et débit)',cible:5,u:'stations',p:109,comp:'C2 · 2.2.2.4',resp:'DGPRE',cal:'Y1-Y5',alloc:{11:1,12:1,13:1,14:1,15:1},src:'prodoc',note:'« exutoires »'},
 // ---- équipements de site
 {k:'pepi',cat:'equip',m:'pepiniere',n:'Pépinière communautaire (80 000 plants/an)',cible:15,u:'pépinières',p:103,comp:'C2 · 2.1',resp:'comités, GIE, associations',cal:'Y1-Y5',alloc:{1:1,2:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1},src:'prodoc',note:'15e pépinière : Sainte-Bernadette (Dakar), hors des 15 sites',
   det:{1:'Leucaena, Nim · comité local',2:'Leucaena, Moringa · comité local',4:'Leucaena, Prosopis · association de femmes',5:'Leucaena, Acacia · comité local',6:'Leucaena, Moringa · comité local',7:'Filao, prosopis · association de jeunes',8:'Acacia, filao · ONAS-comité',9:'Leucaena, Moringa · comité local',10:'Filao, prosopis · GIE rural',11:'Papyrus · CoM SSA',12:'Filao · association de femmes',13:'Roseaux · UICN-comité',14:'Papyrus · association de femmes',15:'Moringa, Leucaena · GIE rural'}},
 {k:'signal',cat:'equip',m:'panneau',n:'Signalétique et éducation à la gestion des inondations',cible:15,u:'sites',p:98,comp:'C2 · 2.1.6',resp:'DCCTEFV-communes',cal:'Y3-Y5',alloc:all(1),src:'prodoc'},
 {k:'champ',cat:'equip',m:'champ',n:'Champs-écoles agroécologiques paysans',cible:60,u:'champs-écoles',p:105,comp:'C2 · 2.2.1.1',resp:'ANACIM-ISRA',cal:'Y2-Y5',alloc:{10:10,7:5,8:5,9:5,5:5,15:12,13:8,12:5,14:5},src:'ind',note:'30 Niayes + 30 Dakar périurbain'},
 // ---- filières (C3)
 {k:'typhaU',cat:'prod',m:'hangar',n:'Unité de valorisation du typha : briques, biocharbon, panneaux isolants, compost',cible:'2 771 t MS/an',u:'',p:102,comp:'C3 · 3.1.2',resp:'coopératives, PME',cal:'Y2-Y5',alloc:{11:1,14:1},src:'prodoc',note:'15 M FCFA de CA annuel, 60 emplois, faucardage 2 fois par an'},
 {k:'ecotour',cat:'prod',m:'mirador',n:'Écotourisme : observation d\u2019oiseaux, circuits guidés',cible:'239 espèces migratrices',u:'',p:114,comp:'C3 · 3.1.2',resp:'PME, communes',cal:'Y3-Y5',alloc:{11:1,12:1},src:'prodoc',note:'Réserve naturelle urbaine, Technopole, Lac Rose. Aménagement représenté à titre indicatif'},
 // ---- immatériel
 {k:'comite',cat:'gouv',n:'Comité local paritaire de gestion des inondations',cible:15,u:'comités',p:90,comp:'C1 · 1.1.2',resp:'DCCTEFV',cal:'Y1-Y2',alloc:all(1),src:'prodoc'},
 {k:'conv',cat:'gouv',n:'Convention de gestion et d\u2019entretien des ouvrages (communes, GIE)',cible:30,u:'conventions',p:108,comp:'C2 · 2.2.2.5',resp:'DCCTEFV-communes',cal:'Y2-Y5',alloc:all(2),src:'ind'},
 {k:'gap',cat:'gouv',n:'Groupes d\u2019apprentissage paysan (GAP), appui-conseil à 2 000 producteurs',cible:60,u:'GAP',p:105,comp:'C2 · 2.2.1.5-6',resp:'ANACIM-DER/FJ',cal:'Y2-Y5',alloc:{},src:'prodoc'},
 {k:'plan',cat:'gouv',n:'SfN intégrées dans 5 PDU/PUD et 8 PDC, directives techniques nationales',cible:'15 instruments',u:'',p:93,comp:'C1 · 1.1.3',resp:'DGPI-DCCTEFV',cal:'Y2-Y4',alloc:{},src:'prodoc'},
 {k:'budget',cat:'gouv',n:'Ligne budgétaire communale « SfN et inondations »',cible:8,u:'communes',p:93,comp:'C1 · 1.1.3.4',resp:'METE-communes',cal:'Y3-Y5',alloc:{},src:'prodoc'},
 {k:'reserve',cat:'gouv',n:'Plan d\u2019aménagement révisé de la réserve naturelle urbaine',cible:1,u:'plan',p:93,comp:'C1 · 1.1.3.5',resp:'CoM SSA-DCCTEFV',cal:'Y2',alloc:{11:1},src:'prodoc'},
 {k:'plateforme',cat:'gouv',n:'Plateforme nationale « SfN et inondations » et gestion des connaissances',cible:1,u:'plateforme',p:91,comp:'C1 / C4 · 4.1.1',resp:'DCCTEFV-DGPI',cal:'Y1-Y5',alloc:{},src:'prodoc'},
 {k:'garantie',cat:'gouv',n:'Fonds de garantie FONGIP / La Banque Agricole (levier 1 à 4)',cible:'1,2 M$ → 4,8 M$',u:'',p:116,comp:'C3 · 3.1.1',resp:'FONGIP, LBA, BNDE',cal:'Y1-Y5',alloc:{},src:'prodoc'},
 {k:'assur',cat:'gouv',n:'Micro-assurance indicielle inondations CNAAS (indice pluie 7 jours)',cible:50000,u:'polices',p:124,comp:'C3 · 3.1.1',resp:'CNAAS, Swiss Re',cal:'Y2-Y5',alloc:{},src:'prodoc',note:'Prime subventionnée à 50 %, 60 % de femmes'},
 {k:'pme',cat:'gouv',n:'Incubation de PME vertes (50 par région), 200 bourses d\u2019amorçage',cible:200,u:'PME',p:125,comp:'C3 · 3.1.2',resp:'DER/FJ, BNDE',cal:'Y1-Y5',alloc:{},src:'prodoc'},
 {k:'sap',cat:'gouv',n:'Alerte précoce avec l\u2019ANACIM (SMS / WhatsApp, comités locaux)',cible:'15 sites',u:'',p:176,comp:'Sendai',resp:'ANACIM',cal:'Y2-Y5',alloc:{},src:'prodoc'},
 {k:'com',cat:'gouv',n:'Communication en wolof et en français (radio, vidéos, bulletins)',cible:'30 émissions',u:'',p:131,comp:'C4 · 4.1.2',resp:'UGP',cal:'Y1-Y5',alloc:{},src:'prodoc'},
 {k:'se',cat:'gouv',n:'Dispositif de suivi-évaluation (baseline A1, mi-parcours A3, final A5)',cible:'260 167 $',u:'',p:133,comp:'5.1.1',resp:'UGP',cal:'Y1-Y5',alloc:{},src:'prodoc'}
];
S.forEach(s=>s.hors=H.filter(h=>h.alloc[s.id]).map(h=>({h,n:h.alloc[s.id]})));
const HK=Object.fromEntries(H.map(h=>[h.k,h]));

// ---------- carte 2D ----------
const lay=L.layerGroup(); A.horsLayer=lay;
const st=A.state; st.horsCat=st.horsCat||null;
function drawMap(){
  lay.clearLayers();
  S.forEach(s=>{
    const items=s.hors.filter(x=>x.h.m&&(!st.horsCat||x.h.cat===st.horsCat)); if(!items.length) return;
    const html=`<div class="hsclu">${items.map(x=>`<span style="background:${CK[x.h.cat].c}" title="${esc(x.h.n)}">${x.n>1?fmt(x.n):''}</span>`).join('')}</div>`;
    lay.addLayer(L.marker(s.pos,{icon:L.divIcon({className:'',html,iconSize:[0,0],iconAnchor:[-16,-16]})})
      .bindTooltip(`<b>${esc(s.nom)} · hors SfN</b><br>${items.map(x=>`<span style="color:${CK[x.h.cat].c}">■</span> ${esc(x.h.n)}${typeof x.h.cible==='number'||x.n>1?` : <b>${fmt(x.n)}</b>`:''}`).join('<br>')}`,{sticky:true}).on('click',()=>A.select(s.id)));
  });
}
const prevApply=A.applyLayers;
A.applyLayers=()=>{prevApply(); if(st.mode==='hors'||A.on.hors) lay.addTo(map); else map.removeLayer(lay);};
if(A.on.hors===undefined) A.on.hors=false;

// ---------- panneau ----------
const tot=h=>Object.values(h.alloc).reduce((a,b)=>a+b,0);
function render(){
  const k=st.horsCat;
  const list=H.filter(h=>!k||h.cat===k);
  $('#p-hors').innerHTML=`
  <h2>Solutions et produits hors SfN du ProDoc</h2>
  <p style="margin-top:0">Le projet combine les SfN avec des infrastructures grises, des ouvrages d'eau, un réseau de suivi, des équipements, des filières vertes et des instruments de gouvernance (scénario hybride retenu, p.68). Les produits matériels sont modélisés dans la <b>vue 3D future</b> de chaque site, et regroupés sur la carte à côté du site.</p>
  <div class="btns"><button class="btn fill" id="h3d">Voir en 3D sur un site</button></div>
  <h3>6 catégories</h3>
  <div class="sfntypes">${CAT.map(c=>`<button class="sfnt ${k===c.k?'on':''} ${k&&k!==c.k?'dim':''}" data-k="${c.k}" style="--c:${c.c}"><span class="sfnsw" style="background:${c.c}"></span><span class="nm">${c.n}</span><span class="ct">${H.filter(h=>h.cat===c.k).length}</span></button>`).join('')}</div>
  <h3>Catalogue ${k?'· '+CK[k].n:''}</h3>
  <table class="htab"><tr><th>Produit</th><th class="r">Cible</th><th class="r">3D</th></tr>
  ${list.map(h=>`<tr><td><span class="sfnsw" style="background:${CK[h.cat].c};margin-right:5px;vertical-align:-1px"></span><b>${esc(h.n)}</b><br><span class="evs">${h.comp} · ${esc(h.resp)} · ${h.cal} · p.${h.p}</span>${h.note?`<br><span class="hnote">${esc(h.note)}</span>`:''}${Object.keys(h.alloc).length?`<br><span class="hsites">${Object.entries(h.alloc).map(([id,n])=>`<a data-id="${id}">${id}${n>1?' ('+fmt(n)+')':''}</a>`).join(' ')}</span> <span class="hsrc ${h.src}">${h.src==='prodoc'?'sites ProDoc':'répartition indicative'}</span>`:'<br><span class="hsrc gl">niveau national / programme</span>'}</td>
   <td class="r mono" style="white-space:nowrap">${typeof h.cible==='number'?fmt(h.cible)+' '+h.u:esc(h.cible)}</td><td class="r">${h.m?'<span class="flag ok">3D</span>':'<span class="flag" style="background:#eef0f6;color:var(--mute)">—</span>'}</td></tr>`).join('')}</table>
  <h3>Matrice sites × catégories (nombre d'éléments)</h3>
  <table class="htab hmx"><tr><th>Site</th>${CAT.map(c=>`<th class="r" title="${esc(c.n)}"><span class="sfnsw" style="background:${c.c}"></span></th>`).join('')}</tr>
  ${S.map(s=>`<tr data-id="${s.id}" style="cursor:pointer"><td>${s.id}. ${esc(s.nom.split(' (')[0])}</td>${CAT.map(c=>{const n=s.hors.filter(x=>x.h.cat===c.k).reduce((a,x)=>a+x.n,0);return `<td class="r mono">${n||'·'}</td>`}).join('')}</tr>`).join('')}</table>
  <div class="note" style="margin-top:10px"><b>Lecture.</b> « Sites ProDoc » : le document nomme les sites (pépinières p.103, forages p.107, collecte p.84, jaugeage aux exutoires p.109…). « Répartition indicative » : le ProDoc donne une cible globale (« toutes zones », « Niayes en aval ») que l'atlas répartit pour la visualisation. Cette répartition est à valider en phase PPG.</div>`;
  document.querySelectorAll('#p-hors .sfnt').forEach(b=>b.onclick=()=>{st.horsCat=st.horsCat===b.dataset.k?null:b.dataset.k;render();drawMap();});
  document.querySelectorAll('#p-hors [data-id]').forEach(r=>r.onclick=e=>{e.stopPropagation();A.select(+r.dataset.id);});
  $('#h3d').onclick=()=>A.open3D&&A.open3D(A.state.sel||6);
}
A.horsShow=()=>{render();drawMap();map.flyTo([14.85,-17.15],10,{duration:.9});};

// ---------- fiche ----------
window.ATLAS_HORS={cat:CAT,ck:CK,items:H,hk:HK,
  ficheHors(s,print){
    if(!s.hors.length) return '';
    return `<div class="sfnfiche"><h3 style="margin-top:0">Solutions hors SfN sur ce site</h3>
    ${s.hors.map(x=>{const h=x.h,c=CK[h.cat];return `<div class="sfnrow"><span class="sfnsw" style="background:${c.c}"></span><div><div class="sfnk" style="color:${c.c}">${c.n}</div><div>${esc(h.n)}${h.det&&h.det[s.id]?` — ${esc(h.det[s.id])}`:''}<span class="evs"> · p.${h.p}${h.src==='ind'?' · répartition indicative':''}</span></div></div><div class="mono r">${x.n>1||typeof h.cible==='number'?fmt(x.n)+(h.u?'\u202f'+h.u:''):(h.exist?'existant':'1')}</div></div>`;}).join('')}
    <p class="vnote">S'ajoutent les produits de niveau programme : plateforme nationale, fonds de garantie FONGIP/LBA, micro-assurance CNAAS (50 000 polices), 200 PME incubées, alerte précoce ANACIM, suivi-évaluation.</p></div>`;
  }
};
drawMap();
})();
