// Indice de vulnérabilité climatique des 15 sites (cadre GIEC AR5/AR6)
// V = 0,40·Exposition + 0,35·Sensibilité + 0,25·(1 − Capacité d'adaptation)   — chaque composante sur 0–1
// Exposition future = E0 × (1 + Σ poids_aléa × signal_climatique(SSP, horizon))
// Signaux climatiques (côte Dakar–Saint-Louis, référence 1995-2014), ensemble CMIP6 / GIEC AR6 — valeurs médianes indicatives :
//  - pluies intenses (Rx1day) : +6/+9/+13 % en 2050 ; +7/+15/+27 % en 2080 (≈ +7 %/°C, Clausius-Clapeyron)
//  - niveau marin : +0,19/+0,20/+0,23 m en 2050 ; +0,40/+0,50/+0,68 m en 2080-2100 (GIEC AR6, moyenne globale ≈ Dakar)
//  - réchauffement / déficit hydrique : +1,3/+1,6/+2,0 °C en 2050 ; +1,6/+2,6/+4,3 °C en 2080 ; cumul annuel −2 à −10 %
(function(){
const SC = {
  '2050-126':{lbl:'SSP1-2.6',h:2050,pluie:.06,mer:.19,dT:1.3,P:-2, urb:.03,ac:.05},
  '2050-245':{lbl:'SSP2-4.5',h:2050,pluie:.09,mer:.20,dT:1.6,P:-4, urb:.05,ac:.00},
  '2050-585':{lbl:'SSP5-8.5',h:2050,pluie:.13,mer:.23,dT:2.0,P:-6, urb:.07,ac:.03},
  '2080-126':{lbl:'SSP1-2.6',h:2080,pluie:.07,mer:.40,dT:1.6,P:-2, urb:.04,ac:.10},
  '2080-245':{lbl:'SSP2-4.5',h:2080,pluie:.15,mer:.50,dT:2.6,P:-6, urb:.08,ac:.03},
  '2080-585':{lbl:'SSP5-8.5',h:2080,pluie:.27,mer:.68,dT:4.3,P:-10,urb:.12,ac:.05}
};
// incréments d'exposition par aléa
const inc = s => ({ pluie: s.pluie*2.2, mer: s.mer/0.8*0.6, sec: s.dT*0.09 + (-s.P)/100*1.2 });

// Paramètres par site — notes 0–1 dérivées des fiches ProDoc (p.45-59) et des interventions documentées
// w : poids des aléas (pluie = inondation pluviale/remontée de nappe ; mer = submersion, érosion, intrusion saline ; sec = sécheresse, baisse de nappe)
const P = {
 1:{e0:.72,w:{pluie:.75,mer:.10,sec:.15},s:.78,ac:.35,dS:.18,dAC:.20,
    eT:"25 000 hab. exposés, 6 points bas, nappe proche de la surface",sT:"Bâti informel à 70 %, bassin partiellement comblé",aT:"Station de pompage 2024 (fragile), PROGEP / PIS-2"},
 2:{e0:.78,w:{pluie:.70,mer:.15,sec:.15},s:.85,ac:.25,dS:.15,dAC:.20,
    eT:"Remontée de nappe permanente, sols saturés 6 mois/an",sT:"Habitat spontané à 78 %, nappe polluée (nitrates)",aT:"Pompage limité, assainissement insuffisant"},
 3:{e0:.80,w:{pluie:.85,mer:.05,sec:.10},s:.82,ac:.30,dS:.18,dAC:.20,
    eT:"Crues éclair, rues en torrents, 28 000 hab.",sT:"82 % de la voirie dégradée, dépotoirs qui colmatent le bassin",aT:"Curage ONAS du bassin de Bagdad (2024), plan communal en cours"},
 4:{e0:.70,w:{pluie:.80,mer:.05,sec:.15},s:.80,ac:.30,dS:.20,dAC:.20,
    eT:"Nappe affleurante en hivernage, 22 000 hab.",sT:"Bassin comblé à 60 %, décharge sauvage, empiétements",aT:"Ouvrages PROGEP 1, peu d'entretien"},
 5:{e0:.74,w:{pluie:.85,mer:.00,sec:.15},s:.72,ac:.45,dS:.16,dAC:.20,
    eT:"Zone dépressionnaire, 30 000 hab.",sT:"Sols imperméabilisés à 60 %, 6 axes sous-dimensionnés",aT:"PROGEP 2 : bassin de l'Unité 3 étendu (+18 000 m³, 2025)"},
 6:{e0:.76,w:{pluie:.80,mer:.05,sec:.15},s:.75,ac:.42,dS:.16,dAC:.20,
    eT:"Quartiers enclavés plusieurs jours par an",sT:"Voiries étanches à 70 %, sols gorgés d'eau",aT:"Pompage permanent ONAS (7 pompes en 2025)"},
 7:{e0:.62,w:{pluie:.40,mer:.45,sec:.15},s:.66,ac:.30,dS:.14,dAC:.20,
    eT:"Frange littorale : dunes mobiles, crues éclair, sel",sT:"Dunes vives dégradées, maraîchage menacé par le sel",aT:"Résorption de Mbeubeuss (PROMOGED) à proximité"},
 8:{e0:.50,w:{pluie:.55,mer:.05,sec:.40},s:.55,ac:.55,dS:.12,dAC:.15,
    eT:"Ruissellement urbain sur la frange forestière",sT:"Couvert réduit à 55 %, 86 ha amputés (autoroute, TER)",aT:"Forêt classée clôturée, 8 comités de surveillance, pépinière"},
 9:{e0:.64,w:{pluie:.65,mer:.25,sec:.10},s:.70,ac:.35,dS:.15,dAC:.20,
    eT:"Ruissellement chargé, façade littorale",sT:"Sols imperméabilisés à 75 %, pollution industrielle",aT:"7 grands bassins en construction dans le département (2023)"},
 10:{e0:.52,w:{pluie:.60,mer:.00,sec:.40},s:.60,ac:.28,dS:.14,dAC:.20,
    eT:"Ruissellement sur sols latéritiques, nappe à −3 m",sT:"Front d'urbanisation : 200 maisons/an sur les terres maraîchères",aT:"Bassin annoncé par l'État (2023), aucune gouvernance agri-urbaine"},
 11:{e0:.70,w:{pluie:.65,mer:.10,sec:.25},s:.62,ac:.50,dS:.18,dAC:.15,
    eT:"Inondation pluviale et remontée de nappe, 48 500 hab.",sT:"Plans d'eau 165 → 89 ha, typha sur 15 %, bâti ×6,6",aT:"Réserve naturelle urbaine (décret 2019-748), PROTEC II"},
 12:{e0:.58,w:{pluie:.55,mer:.25,sec:.20},s:.64,ac:.45,dS:.12,dAC:.20,
    eT:"Apports d'eaux pluviales (crue 2022), dunes périphériques",sT:"Équilibre halin fragile, saliculture et tourisme dépendants",aT:"Pompage communautaire, retour de la couleur rose (2025)"},
 13:{e0:.55,w:{pluie:.15,mer:.15,sec:.70},s:.70,ac:.22,dS:.16,dAC:.20,
    eT:"Assèchement saisonnier, nappe d'accompagnement en baisse",sT:"30 % de la zone humide asséchée en 10 ans, sols très salés",aT:"Mobilisation citoyenne (CNCR 2022), pas de gestionnaire"},
 14:{e0:.52,w:{pluie:.25,mer:.25,sec:.50},s:.62,ac:.45,dS:.14,dAC:.20,
    eT:"Entrées d'eau irrégulières (Diama, Ndiawdoune), salinisation du delta",sT:"40 % envahi par la végétation aquatique",aT:"Plan de gestion OLAC 2019-2023, dragage Khant / Ndjim"},
 15:{e0:.58,w:{pluie:.05,mer:.30,sec:.65},s:.66,ac:.35,dS:.15,dAC:.20,
    eT:"Nappe en baisse d'environ 3 m en 10 ans, intrusion saline",sT:"12 % des périmètres salinisés, surpompage",aT:"Encadrement ISRA / ANCAR, cartographie DGPRE 2017"}
};
const clamp=v=>Math.max(0,Math.min(1,v));
function compute(id,key,sfn){
  const p=P[id];
  if(key==='now'){ const V=.40*p.e0+.35*p.s+.25*(1-p.ac); return {E:p.e0,S:p.s,AC:p.ac,V}; }
  const sc=SC[key], i=inc(sc);
  const E=clamp(p.e0*(1+p.w.pluie*i.pluie+p.w.mer*i.mer+p.w.sec*i.sec));
  let S=clamp(p.s+sc.urb), AC=clamp(p.ac+sc.ac);
  if(sfn){ S=clamp(S-p.dS); AC=clamp(AC+p.dAC); }
  const V=.40*E+.35*S+.25*(1-AC);
  return {E,S,AC,V};
}
const CLASS=[[0,.35,'#2f8f4e','Faible'],[.35,.50,'#c9b11a','Modérée'],[.50,.65,'#e0751c','Élevée'],[.65,2,'#b23a2e','Très élevée']];
const cls=v=>CLASS.find(c=>v>=c[0]&&v<c[1]);
const KEYS=['now','2050-126','2050-245','2050-585','2080-126','2080-245','2080-585'];
function dominant(id){const w=P[id].w; return Object.entries(w).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({pluie:'pluies intenses / nappe',mer:'mer (submersion, sel)',sec:'sécheresse / baisse de nappe'}[k]+' '+Math.round(v*100)+' %')).join(' · ');}

function ficheVuln(s,print){
  const id=s.id, esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const R=KEYS.map(k=>compute(id,k,false)), Rs=KEYS.map(k=>k==='now'?compute(id,k,false):compute(id,k,true));
  const cell=(v,isV)=>{const c=cls(v);const bg=isV?c[2]:`rgba(27,36,83,${(.08+v*.5).toFixed(2)})`;const fg=isV||v>.55?'#fff':'#1b2453';return `<td class="vc" style="background:${bg};color:${fg}">${v.toFixed(2)}</td>`;};
  const row=(lbl,arr,f,isV)=>`<tr><th class="vl2">${lbl}</th>${arr.map(r=>cell(r[f],isV)).join('')}</tr>`;
  const n=R[0], f50=R[2], f80=R[6], sf=Rs[2];
  return `<div class="vuln">
  <h3>Vulnérabilité climatique : exposition, sensibilité, capacité d'adaptation (scénarios SSP)</h3>
  <div class="vsum"><span class="vbadge" style="background:${cls(n.V)[2]}">Actuelle : ${cls(n.V)[3]} (${n.V.toFixed(2)})</span>
   <span class="vbadge" style="background:${cls(f50.V)[2]}">2050 SSP2-4.5 : ${cls(f50.V)[3]}</span>
   <span class="vbadge" style="background:${cls(f80.V)[2]}">2080 SSP5-8.5 : ${cls(f80.V)[3]}</span>
   <span class="vbadge" style="background:${cls(sf.V)[2]}">2050 SSP2-4.5 avec SfN : ${cls(sf.V)[3]}</span></div>
  <table class="vt"><tr><th></th><th>2026</th><th colspan="3">2050</th><th colspan="3">2080</th></tr>
   <tr><th></th><th>actuel</th><th>1-2.6</th><th>2-4.5</th><th>5-8.5</th><th>1-2.6</th><th>2-4.5</th><th>5-8.5</th></tr>
   ${row('Exposition',R,'E')}${row('Sensibilité',R,'S')}${row('Capacité adapt.',R,'AC')}
   ${row('<b>Vulnérabilité</b>',R,'V',true)}${row('<b>V avec SfN</b>',Rs,'V',true)}</table>
  <table class="vd">
   <tr><td><b>Exposition</b></td><td>${esc(P[id].eT)}. Aléas dominants : ${dominant(id)}.</td></tr>
   <tr><td><b>Sensibilité</b></td><td>${esc(P[id].sT)}.</td></tr>
   <tr><td><b>Capacité d'adaptation</b></td><td>${esc(P[id].aT)}.</td></tr>
   <tr><td><b>Effet des SfN</b></td><td>Sensibilité −${P[id].dS.toFixed(2)}, capacité +${P[id].dAC.toFixed(2)}, soit une vulnérabilité ${(f50.V-sf.V>0?'réduite de ':'')}${(((f50.V-sf.V)/f50.V)*100).toFixed(0)} % en 2050 (SSP2-4.5).</td></tr>
  </table>
  ${print?'':`<div class="vleg">${CLASS.map(c=>`<span><i style="background:${c[2]}"></i>${c[3]}</span>`).join('')}</div>`}
  <p class="vnote">Indice 0–1, V = 0,40 E + 0,35 S + 0,25 (1 − CA). Les signaux climatiques sont des médianes CMIP6 / GIEC AR6 pour la côte Dakar–Saint-Louis. Pour 2050 (SSP1-2.6 / 2-4.5 / 5-8.5) : pluies intenses +6 / +9 / +13 %, niveau marin +0,19 / +0,20 / +0,23 m, +1,3 / +1,6 / +2,0 °C. Pour 2080 : +7 / +15 / +27 %, +0,40 / +0,50 / +0,68 m, +1,6 / +2,6 / +4,3 °C. Les notes de base sont des notes d'expert tirées des fiches. Indice indicatif, à calibrer avec les données CCKP / ANACIM à l'échelle des sites.</p>
  </div>`;
}
function summaryTable(){
  const S=window.ATLAS_SITES;
  return `<table class="vt vtall"><tr><th>Site</th><th>2026</th><th>2050<br>2-4.5</th><th>2050<br>5-8.5</th><th>2080<br>5-8.5</th><th>2050 2-4.5<br>+SfN</th></tr>
  ${S.map(s=>{const a=[compute(s.id,'now'),compute(s.id,'2050-245'),compute(s.id,'2050-585'),compute(s.id,'2080-585'),compute(s.id,'2050-245',true)];
   return `<tr data-id="${s.id}" style="cursor:pointer"><th class="vl2">${s.id}. ${s.nom}</th>${a.map(r=>`<td class="vc" style="background:${cls(r.V)[2]};color:#fff">${r.V.toFixed(2)}</td>`).join('')}</tr>`}).join('')}</table>`;
}
window.ATLAS_VULN={compute,cls,CLASS,SC,P,ficheVuln,summaryTable,KEYS};
})();
