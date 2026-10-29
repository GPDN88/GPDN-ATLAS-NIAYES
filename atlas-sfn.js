// Application des SfN par site — conformément au ProDoc (fiches p.45-59, programme p.99-101)
// t = type SfN · n/u = quantité cible (null si non chiffrée) · x = libellé ProDoc · p = page
(function(){
const A=window.ATLAS, S=window.ATLAS_SITES, map=A.map;
const $=s=>document.querySelector(s);
const fmt=n=>n==null?'—':Number(n).toLocaleString('fr-FR');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const T=[
 {k:'bassin', n:'Bassins de rétention végétalisés', s:'Rétention', c:'#1f7a8c', f:'Stocker et ralentir'},
 {k:'noue',   n:'Noues et fossés végétalisés',      s:'Noues',     c:'#2a9d8f', f:'Conduire et infiltrer'},
 {k:'jardin', n:'Jardins de pluie',                 s:'Jardins',   c:'#6aa84f', f:'Infiltrer à la parcelle'},
 {k:'perm',   n:'Surfaces perméables',              s:'Perméable', c:'#8a8f9c', f:'Réduire le ruissellement'},
 {k:'marais', n:'Marais filtrants, phytoépuration', s:'Marais',    c:'#3f7d3a', f:'Épurer'},
 {k:'berge',  n:'Revégétalisation des berges',      s:'Berges',    c:'#97b33f', f:'Stabiliser'},
 {k:'dune',   n:'Fixation des dunes',               s:'Dunes',     c:'#d9a93a', f:'Contenir l\u2019ensablement'},
 {k:'agro',   n:'Agroforesterie, haies vives',      s:'Agrofor.',  c:'#9a6a2a', f:'Protéger les sols'},
 {k:'foret',  n:'Forêt, reboisement',               s:'Forêt',     c:'#2c5d2a', f:'Conserver le couvert'},
 {k:'typha',  n:'Faucardage et valorisation du typha', s:'Typha',  c:'#b5651d', f:'Rouvrir les plans d\u2019eau'},
 {k:'nappe',  n:'Recharge de nappe, épandage',      s:'Recharge',  c:'#4a63c9', f:'Recharger la nappe'},
 {k:'gouv',   n:'Gouvernance et suivi participatif',s:'Gouvern.',  c:'#6b7090', f:'Entretenir et suivre'}
];
const TK=Object.fromEntries(T.map(t=>[t.k,t]));

const APP={
1:[{t:'bassin',n:5,u:'ha',x:'Curage et bassin de rétention végétalisé multifonctionnel (60 000 m³)'},
   {t:'noue',n:null,u:'',x:'Noues : quartiers Camel, Darou Salam, Médina Gounass'},
   {t:'jardin',n:null,u:'',x:'Jardins de pluie : quartiers Camel, Darou Salam, Médina Gounass'},
   {t:'perm',n:3,u:'rues',x:'Surfaces perméables : rues Dallal Diam, Haylane, Tanin'},
   {t:'gouv',n:3,u:'sous-comités',x:'Comité local paritaire, entretien participatif'}],
2:[{t:'marais',n:4,u:'ha',x:'Marais filtrant en ceinture nord'},
   {t:'noue',n:9,u:'km',x:'Noues et fossés végétalisés'},
   {t:'berge',n:4,u:'km',x:'Revégétalisation des berges'},
   {t:'jardin',n:4,u:'écoles',x:'Jardins pédagogiques dans 4 écoles primaires'}],
3:[{t:'bassin',n:6,u:'ha',x:'Bassin tampon végétalisé profond en aval du bassin Djiddah (70 000 m³)'},
   {t:'agro',n:7,u:'km',x:'Haies vives antiérosives (rues Dalaba, Cité Tapée)'},
   {t:'jardin',n:16,u:'sites',x:'Jardins de pluie : 12 cours d\u2019école et 4 places publiques'},
   {t:'gouv',n:30,u:'pers.',x:'Charte communale inondation, brigade verte de 30 personnes'}],
4:[{t:'bassin',n:22,u:'ha',x:'Reconquête et reprofilage du bassin, dragage léger, berges remodelées (50 000 m³)'},
   {t:'noue',n:8,u:'km',x:'Noues filtrantes périphériques (Lamtoro, Zone 18, Médina Gounass)'},
   {t:'perm',n:null,u:'',x:'Pavés drainants sur les axes marchands'},
   {t:'agro',n:200,u:'arbres',x:'Agroforesterie maraîchère riveraine (arbres fruitiers)'}],
5:[{t:'bassin',n:8,u:'ha',x:'Bassin de rétention végétalisé multifonctionnel, aval urbain nord (80 000 m³)'},
   {t:'noue',n:null,u:'',x:'Noues : axes Castors et Cité Keur Massar'},
   {t:'jardin',n:null,u:'',x:'Jardins de pluie : axes Castors et Cité Keur Massar'},
   {t:'perm',n:9000,u:'m²',x:'Surfaces perméables'},
   {t:'gouv',n:null,u:'',x:'Charte d\u2019urbanisme intégrant les SfN'}],
6:[{t:'marais',n:4,u:'ha',x:'Marais filtrant avec captage avant rejet'},
   {t:'noue',n:7,u:'km',x:'Noues et fossés végétalisés'},
   {t:'perm',n:null,u:'',x:'Surfaces perméables : rues, places, parvis'},
   {t:'gouv',n:7,u:'stations',x:'Stations pluviométriques complémentaires'}],
7:[{t:'dune',n:15,u:'ha',x:'Fixation des dunes (oyats, filaos)'},
   {t:'berge',n:12,u:'ha',x:'Revégétalisation des dépressions par halophytes'},
   {t:'marais',n:3,u:'ha',x:'Marais filtrant en sortie de dépression'},
   {t:'jardin',n:null,u:'',x:'Jardins de pluie côtiers, jardins adaptés à la salinité'}],
8:[{t:'foret',n:40,u:'ha',x:'Protection et restauration de la forêt classée, zone tampon renforcée'},
   {t:'noue',n:null,u:'',x:'Noues d\u2019interception et de dérivation en amont du massif'},
   {t:'nappe',n:null,u:'',x:'Infiltration par paillage et plantations d\u2019espèces locales'},
   {t:'foret',n:6,u:'km',x:'Reboisement participatif de lisière : 18 000 plants'}],
9:[{t:'bassin',n:8,u:'ha',x:'Bassin de décantation végétalisé (55 000 m³)'},
   {t:'marais',n:null,u:'',x:'Phytoépuration couplée, typha en sortie et lagunage secondaire'},
   {t:'noue',n:7,u:'km',x:'Noues en amont des zones habitées'},
   {t:'gouv',n:5,u:'stations',x:'Suivi participatif de la qualité de l\u2019eau'}],
10:[{t:'agro',n:22,u:'ha',x:'Agroforesterie, haies multi-étagées'},
   {t:'agro',n:22,u:'km',x:'Haies vives antiérosives en courbes de niveau'},
   {t:'nappe',n:null,u:'',x:'Petits bassins de collecte dans les bas-fonds (recharge de nappe)'},
   {t:'gouv',n:5,u:'comités',x:'Charte agri-urbanisme et comités paritaires'}],
11:[{t:'typha',n:60,u:'ha',x:'Faucardage et valorisation du typha (briques, biocharbon)'},
   {t:'bassin',n:3,u:'plans d\u2019eau',x:'Recreusement et reconnexion de plans d\u2019eau'},
   {t:'marais',n:4,u:'ha',x:'Marais filtrant en entrée de réserve'},
   {t:'berge',n:12,u:'km',x:'Revégétalisation des berges'}],
12:[{t:'nappe',n:null,u:'',x:'Restauration de l\u2019équilibre halin et hydrique du plan d\u2019eau'},
   {t:'dune',n:18,u:'ha',x:'Fixation des dunes périphériques (oyats, tamaris)'},
   {t:'berge',n:null,u:'',x:'Ceinture tampon riveraine'},
   {t:'gouv',n:null,u:'',x:'Suivi participatif de la salinité et de la qualité de l\u2019eau'}],
13:[{t:'nappe',n:8,u:'ouvrages',x:'Recharge de la nappe par ouvrages d\u2019épandage'},
   {t:'berge',n:12,u:'km',x:'Désensablement et reprofilage du lit et des chenaux'},
   {t:'berge',n:60,u:'ha',x:'Plantation d\u2019espèces tolérantes sur les berges (acacia, filao, tamaris)'},
   {t:'gouv',n:12,u:'piézomètres',x:'Plan de gestion concertée'}],
14:[{t:'typha',n:50,u:'ha',x:'Faucardage raisonné et valorisation du typha'},
   {t:'berge',n:8,u:'km',x:'Restauration des berges et chenaux'},
   {t:'nappe',n:6,u:'ouvrages',x:'Recharge de nappe par ouvrages d\u2019épandage'},
   {t:'agro',n:null,u:'',x:'Activités agri-piscicoles résilientes'}],
15:[{t:'jardin',n:25,u:'ha',x:'Jardins de pluie, collecte et stockage des eaux pluviales hors saison'},
   {t:'agro',n:60,u:'ha',x:'Agroforesterie avec haies brise-vent'},
   {t:'gouv',n:18,u:'piézomètres',x:'Gestion participative de la nappe'},
   {t:'gouv',n:1200,u:'maraîchers',x:'Formation (50 % de femmes)'}]
};
S.forEach(s=>s.sfn=APP[s.id]||[]);
const has=(s,k)=>s.sfn.some(a=>a.t===k);
const qty=a=>a.n==null?'':fmt(a.n)+(a.u?'\u202f'+a.u:'');
function totals(k){
  const by={}; let nq=0; S.forEach(s=>s.sfn.filter(a=>a.t===k).forEach(a=>{if(a.n==null){nq++;return;} by[a.u]=(by[a.u]||0)+a.n;}));
  const order=['ha','km','m²'];
  return Object.entries(by).sort((a,b)=>(order.indexOf(a[0])+1||9)-(order.indexOf(b[0])+1||9)).map(([u,n])=>fmt(n)+'\u202f'+u).join(' · ');
}

// ---------- couche carte ----------
const lay=L.layerGroup(); A.sfnLayer=lay;
const st=A.state; st.sfnType=st.sfnType||localStorage.getItem('atlas_sfnType')||null;
function drawMap(){
  lay.clearLayers(); const k=st.sfnType;
  S.forEach(s=>{
    if(!k){
      const ks=[...new Set(s.sfn.map(a=>a.t))], R=21, n=ks.length;
      const dots=ks.map((t,i)=>{const a=(-90+i*360/n)*Math.PI/180;return `<i style="left:${(30+R*Math.cos(a)-5).toFixed(1)}px;top:${(30+R*Math.sin(a)-5).toFixed(1)}px;background:${TK[t].c}" title="${esc(TK[t].n)}"></i>`;}).join('');
      lay.addLayer(L.marker(s.pos,{icon:L.divIcon({className:'',html:`<div class="sfnring">${dots}</div>`,iconSize:[60,60],iconAnchor:[30,30]}),interactive:false,zIndexOffset:-10}));
    } else if(has(s,k)){
      const t=TK[k], items=s.sfn.filter(a=>a.t===k);
      lay.addLayer(L.circleMarker(s.pos,{radius:22,color:t.c,weight:3,fillColor:t.c,fillOpacity:.32,interactive:false}));
      const lab=items.map(qty).filter(Boolean).join(' + ')||'non chiffré';
      lay.addLayer(L.marker(s.pos,{icon:L.divIcon({className:'',html:'',iconSize:[0,0]}),interactive:false})
        .bindTooltip(`<span style="color:${t.c}">■</span> ${esc(lab)}`,{permanent:true,direction:'left',offset:[-22,0],className:'lbl sfnlbl'}));
    }
  });
}
const prevApply=A.applyLayers;
A.applyLayers=()=>{
  prevApply();
  if(st.mode==='sfn'){[A.footprints,A.osmLayer,A.layers.axes].forEach(l=>map.removeLayer(l)); lay.addTo(map); A.siteLayer.eachLayer(l=>l.setZIndexOffset(1000));}
  else map.removeLayer(lay);
};

// ---------- panneau ----------
const IUCN=[
 ['1','Répondre efficacement aux défis sociétaux','ok','Aléa inondation qualifié pour chaque site (fiche « aléa principal ») ; 362 882 bénéficiaires directs ; −30 % sur la crue décennale visé (p.78).'],
 ['2','Concevoir à l\u2019échelle appropriée','part','Logique amont-aval : 500 km d\u2019axes, bassins et exutoires reliés. Mais les tracés des axes et les contours des 10 000 ha ne sont pas fournis.'],
 ['3','Gain net de biodiversité','part','Espèces vedettes par exutoire, réserve de la Grande Niaye (décret 2019-748), forêt classée de Mbao. Pas d\u2019état de référence ni d\u2019indicateur de biodiversité chiffré.'],
 ['4','Viabilité économique','ok','VAN 38,4 M$, TRI 24 %, B/C 2,7 (scénario hybride) ; cofinancement 49,6 M$ ; filières typha (briques, biocharbon).'],
 ['5','Gouvernance inclusive et transparente','ok','Comités paritaires, chartes communales, brigade verte, suivi participatif ; 50 % de femmes parmi les bénéficiaires.'],
 ['6','Arbitrages équitables','part','Conflits identifiés (22 ha à reconquérir à Wakhinane, front urbain de Bambilor, principe d\u2019évitement à Thiaroye) sans mécanisme d\u2019arbitrage formalisé.'],
 ['7','Gestion adaptative fondée sur des preuves','part','30 piézomètres, 15 stations pluviométriques, 5 stations qualité. Protocole de suivi et seuils de révision à préciser.'],
 ['8','Intégration et durabilité','ok','Articulation PROGEP II, PIS-2, PROTEC II ; ancrage dans la réserve naturelle urbaine et la forêt classée.']
];
const IST={ok:['Couvert','#3f7d3a','#e7f1e5'],part:['Partiel','#9a6a00','#fdf3dc']};

function render(){
  const k=st.sfnType, t=k&&TK[k];
  const nSites=x=>S.filter(s=>has(s,x)).length;
  const detail=t?`
   <div class="sfndet" style="border-color:${t.c}">
     <div class="sfndh"><span class="sfnsw" style="background:${t.c}"></span><b>${t.n}</b><button class="btn" id="sfnClr" style="margin-left:auto;padding:3px 8px">Tout afficher</button></div>
     <div class="sub" style="margin:4px 0 6px">Fonction : ${t.f.toLowerCase()} · ${nSites(k)} site${nSites(k)>1?'s':''}${totals(k)?' · cumul chiffré : '+totals(k):''}</div>
     <table>${S.filter(s=>has(s,k)).map(s=>s.sfn.filter(a=>a.t===k).map((a,i)=>`<tr data-id="${s.id}" style="cursor:pointer"><td class="mono" style="width:22px">${i?'':s.id}</td><td>${i?'':`<b>${esc(s.nom)}</b><br>`}${esc(a.x)}<span class="evs"> · p.${s.page}</span></td><td class="r mono" style="white-space:nowrap">${qty(a)||'<span style="color:var(--mute)">n.c.</span>'}</td></tr>`).join('')).join('')}</table>
   </div>`:'';
  $('#p-sfn').innerHTML=`
  <h2>Application des SfN, conformément au ProDoc</h2>
  <p style="margin-top:0">Chaque site reçoit les solutions fondées sur la nature inscrites dans sa fiche (p.45-59) et dans le programme de travaux (p.99-101). Sur la carte, les pastilles autour de chaque site indiquent les familles de SfN appliquées. Choisissez une famille pour voir où elle s'applique et en quelle quantité.</p>
  <h3>12 familles de SfN</h3>
  <div class="sfntypes">${T.map(x=>`<button class="sfnt ${k===x.k?'on':''} ${k&&k!==x.k?'dim':''}" data-k="${x.k}" style="--c:${x.c}"><span class="sfnsw" style="background:${x.c}"></span><span class="nm">${x.n}</span><span class="ct">${nSites(x.k)}</span></button>`).join('')}</div>
  ${detail}
  <h3>Matrice sites × SfN</h3>
  <div class="sfnmx-wrap"><table class="sfnmx"><tr><th></th><th></th>${T.map(x=>`<th title="${esc(x.n)}"><span style="background:${x.c}"></span><em>${x.s}</em></th>`).join('')}<th class="yr">An.</th></tr>
  ${S.map(s=>`<tr data-id="${s.id}" class="${A.state.sel===s.id?'sel':''}"><td><div class="num ${s.type}" style="width:18px;height:18px;font-size:9.5px">${s.id}</div></td><td class="nm" title="${esc(s.nom)}">${esc(s.nom.split(' (')[0].replace(' / Grande Niaye de Pikine','').replace('Keur Massar Sud / ','KM Sud / ').replace(' / Tivaouane Peulh',' / T. Peulh').replace(' / Louga côtier',' / Louga'))}</td>${T.map(x=>{const it=s.sfn.filter(a=>a.t===x.k);return `<td class="c ${k&&k!==x.k?'dim':''}" ${it.length?`title="${esc(TK[x.k].n+' — '+it.map(a=>a.x+(qty(a)?' ('+qty(a)+')':'')).join(' ; '))}"`:''}>${it.length?`<i style="background:${x.c}"></i>`:''}</td>`}).join('')}<td class="yr mono">${s.annee}</td></tr>`).join('')}
  </table></div>
  <p style="font-size:11.5px;color:var(--mute);margin-top:4px">Survolez une case pour lire l'intervention ProDoc ; cliquez une ligne pour ouvrir la fiche du site. « An. » = année principale des travaux (p.99-100).</p>

  <h3>Cibles du programme (ProDoc)</h3>
  <table>
   <tr><td>10 bassins de Dakar</td><td class="r mono">540 000 m³ · 47,5 ha</td><td class="evs r">p.99</td></tr>
   <tr><td>5 exutoires des Niayes</td><td class="r mono">320 ha traités</td><td class="evs r">p.100</td></tr>
   <tr><td>Axes d'écoulement réhabilités et revégétalisés</td><td class="r mono">500 km</td><td class="evs r">p.101</td></tr>
   <tr><td style="padding-left:16px;color:var(--ink2)">collecteurs · secondaires · tertiaires</td><td class="r mono">120 · 250 · 130 km</td><td class="evs r">p.101</td></tr>
   <tr><td>Ouvrages de ralentissement dynamique</td><td class="r mono">25</td><td class="evs r">p.101</td></tr>
   <tr><td>Berges stabilisées par ouvrages mixtes</td><td class="r mono">12 km</td><td class="evs r">p.101</td></tr>
   <tr><td>Sédiments en aval</td><td class="r mono">−40 %</td><td class="evs r">p.101</td></tr>
   <tr><td>Superficie sous gestion résiliente</td><td class="r mono">25 000 ha</td><td class="evs r">LDCF 2</td></tr>
  </table>
  <p style="font-size:11.5px;color:var(--mute)">Méthode des axes (p.101) : curage calibré, plantations étagées de vétiver, d'<i>Acacia nilotica</i>, de <i>Moringa</i> et de <i>Terminalia</i>, roseaux en pied de berge, seuils en pierre et micro-barrages végétalisés.</p>

  <h3>Conformité au Standard mondial de l'UICN pour les SfN</h3>
  <p style="margin:4px 0 8px">Lecture du ProDoc au regard des 8 critères du Standard (UICN, 2020). Il s'agit d'une auto-évaluation indicative, pas d'une évaluation certifiée.</p>
  <div class="iucn">${IUCN.map(c=>`<div class="iucr"><div class="iucn-n">${c[0]}</div><div><div class="iucn-h">${c[1]} <span class="flag" style="background:${IST[c[2]][2]};color:${IST[c[2]][1]}">${IST[c[2]][0]}</span></div><div class="iucn-t">${c[3]}</div></div></div>`).join('')}</div>
  <div class="note" style="margin-top:10px"><b>À renforcer avant validation :</b> état de référence biodiversité par site (critère 3), tracés géoréférencés des axes et des 10 000 ha (critère 2), mécanisme d'arbitrage foncier (critère 6), protocole de suivi avec seuils de révision (critère 7).</div>`;
  document.querySelectorAll('#p-sfn .sfnt').forEach(b=>b.onclick=()=>setType(st.sfnType===b.dataset.k?null:b.dataset.k));
  const c=$('#sfnClr'); if(c) c.onclick=()=>setType(null);
  document.querySelectorAll('#p-sfn tr[data-id]').forEach(r=>r.onclick=()=>A.select(+r.dataset.id));
}
function setType(k){
  st.sfnType=k; k?localStorage.setItem('atlas_sfnType',k):localStorage.removeItem('atlas_sfnType');
  render(); drawMap(); if(A.redrawSfnGeo) A.redrawSfnGeo();
  if(k){const pts=S.filter(s=>has(s,k)).map(s=>s.pos); if(pts.length) map.flyToBounds(pts,{padding:[70,70],maxZoom:13,duration:.8});}
}
A.sfnShow=()=>{render(); drawMap(); if(A.redrawSfnGeo) A.redrawSfnGeo(); map.flyTo([14.78,-17.33],11.3,{duration:.9});};

// ---------- fiche ----------
window.ATLAS_SFN={types:T,iucn:IUCN,ist:IST,qty,
  ficheSfn(s,print){
    if(!s.sfn.length) return '';
    return `<div class="sfnfiche"><h3 style="margin-top:0">SfN appliquées sur ce site (ProDoc p.${s.page})</h3>
    ${s.sfn.map(a=>{const t=TK[a.t];return `<div class="sfnrow"><span class="sfnsw" style="background:${t.c}"></span><div><div class="sfnk" style="color:${t.c}">${t.n}</div><div>${esc(a.x)}</div></div><div class="mono r">${qty(a)||'<span style="color:var(--mute)">n.c.</span>'}</div></div>`;}).join('')}</div>`;
  }
};
})();
