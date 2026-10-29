// Implantation cartographique des SfN sur chaque site
// Géométries SCHÉMATIQUES dimensionnées sur les quantités ProDoc (ha = surface réelle, km = linéaire réel,
// unités = nombre de points). Positions relatives indicatives, à caler sur les plans d'exécution.
(function(){
const A=window.ATLAS, S=window.ATLAS_SITES, map=A.map, T=window.ATLAS_SFN.types;
const TK=Object.fromEntries(T.map(t=>[t.k,t]));
const fmt=n=>Number(n).toLocaleString('fr-FR');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const D2R=Math.PI/180;
const off=(c,dx,dy)=>[c[0]+dy/111320, c[1]+dx/(111320*Math.cos(c[0]*D2R))];
const polar=(c,d,ang)=>off(c,d*Math.sin(ang*D2R),d*Math.cos(ang*D2R)); // ang : 0 = nord, sens horaire
const blob=(c,r,aspect=1,rot=0,seed=0)=>{const p=[];const a=r*Math.sqrt(aspect),b=r/Math.sqrt(aspect);
  for(let i=0;i<40;i++){const t=i/40*2*Math.PI,w=1+0.07*Math.sin(3*t+seed)+0.04*Math.sin(5*t+seed*2);
    const x=a*Math.cos(t)*w,y=b*Math.sin(t)*w,ro=rot*D2R;p.push(off(c,x*Math.cos(ro)-y*Math.sin(ro),x*Math.sin(ro)+y*Math.cos(ro)));}return p;};
const rOfHa=ha=>Math.sqrt(ha*1e4/Math.PI);

const AREA=['bassin','marais','typha','foret','dune','berge','agro','jardin','perm','nappe'];
const PREF={dune:270,marais:0,typha:180};
const geo=L.layerGroup(); A.sfnGeo=geo;
if(A.on.sfn===undefined) A.on.sfn=true;

function tip(s,a,nominal){const t=TK[a.t];
  return `<b style="color:${t.c}">${esc(t.n)}</b><br>${esc(a.x)}<br><span style="font-family:IBM Plex Mono;font-size:11px">${a.n!=null?fmt(a.n)+' '+a.u:'quantité non chiffrée'} · site ${s.id} · ProDoc p.${s.page}</span><br><span style="color:#6b7090;font-size:11px">Implantation schématique${nominal?', tracé symbolique':''} — à caler sur plan d'exécution</span>`;}

function addPoly(pts,a,s,nominal,extra){
  const t=TK[a.t];
  return L.polygon(pts,Object.assign({sfnT:a.t,sfnX:a.x,sfnQ:a.n!=null?fmt(a.n)+' '+a.u:'',color:t.c,weight:2,fillColor:t.c,fillOpacity:nominal?.12:.38,dashArray:nominal?'4 4':null},extra||{})).bindTooltip(tip(s,a,nominal),{sticky:true});
}
function addLine(pts,a,s,nominal,w){
  const t=TK[a.t];
  return L.polyline(pts,{sfnT:a.t,sfnX:a.x,sfnQ:a.n!=null?fmt(a.n)+' '+a.u:'',color:t.c,weight:w||3,opacity:.95,dashArray:nominal?'5 5':null,lineCap:'round'}).bindTooltip(tip(s,a,nominal),{sticky:true});
}
function pt(c,a,s,label){
  const t=TK[a.t], sq=a.t==='gouv'||a.t==='nappe';
  return L.marker(c,{sfnT:a.t,sfnX:a.x,sfnQ:a.n!=null?fmt(a.n)+' '+a.u:'',sfnColor:t.c,sfnSq:sq,sfnLabel:label||'',icon:L.divIcon({className:'',html:`<div class="sfnpt${sq?' sq':''}" style="background:${t.c}">${label||''}</div>`,iconSize:[label?24:12,12],iconAnchor:[label?12:6,6]})}).bindTooltip(tip(s,a,a.n==null),{sticky:true});
}

function drawSite(s,only,target){
  const items=s.sfn.filter(a=>!only||a.t===only); if(!items.length) return;
  const c=s.pos, R0=Math.max(220,rOfHa(s.sup)), G=[];
  const water=s.type==='exutoire'&&!s.sfn.some(a=>['bassin','typha'].includes(a.t)&&a.u==='ha');
  // objet central
  let rc=water?R0*0.55:R0*0.3, center=null;
  const ci=s.sfn.find(a=>['bassin','foret','typha'].includes(a.t)&&a.u==='ha');
  if(ci){center=ci; rc=rOfHa(ci.n);}
  if(center&&(!only||center.t===only)){
    G.push(addPoly(blob(c,rc,1.25,20,s.id),center,s,false,center.t==='bassin'?{fillOpacity:.45}:null));
    if(center.t==='foret'||center.t==='typha'){for(let i=0;i<26;i++){const d=rc*0.85*Math.sqrt((i*0.618)%1),g=i*137.5;
      G.push(L.circleMarker(polar(c,d,g),{radius:center.t==='foret'?3.5:2,color:'#fff',weight:.6,fillColor:TK[center.t].c,fillOpacity:1,interactive:false}));}}
  }
  // créneaux angulaires
  const slotted=items.filter(a=>a!==center&&a.t!=='noue'&&!(a.u==='km'&&['berge','foret'].includes(a.t)));
  const used=[], SEQ=[90,180,45,225,135,315,0,270,22,202,112,292];
  const angOf=a=>{let p=PREF[a.t]; if(p!=null&&!used.some(u=>Math.abs(((u-p+540)%360)-180)<35)){used.push(p);return p;}
    for(const q of SEQ){if(!used.some(u=>Math.abs(((u-q+540)%360)-180)<35)){used.push(q);return q;}} const q=(used.length*47)%360;used.push(q);return q;};
  // linéaires en anneau (berges, lisières)
  let ringR=rc;
  items.filter(a=>a.u==='km'&&['berge','foret'].includes(a.t)).forEach(a=>{
    const sp=Math.max(22,R0*0.035); let L0=a.n*1000, r=ringR+sp*1.5;
    while(L0>0){const circ=2*Math.PI*r, frac=Math.min(1,L0/circ), pts=[];
      for(let i=0;i<=Math.ceil(72*frac);i++){const g=i/72*360;pts.push(polar(c,r*(1+0.03*Math.sin(g*D2R*4+s.id)),g));}
      G.push(addLine(pts,a,s,false,a.t==='foret'?5:4)); L0-=circ; r+=sp;}
    ringR=r;
  });
  // réseau de noues (maillage le long des rues)
  items.filter(a=>a.t==='noue').forEach(a=>{
    const nominal=a.n==null, tot=(a.n||1.2)*1000, side=Math.max(2.3*R0,ringR*2.4), m=Math.max(2,Math.round(tot/(2*side)));
    const step=side/(m-1||1);
    for(let i=0;i<m;i++){const o=-side/2+i*step, j=(i%2?1:-1)*step*0.12;
      G.push(addLine([off(c,-side/2,o+j),off(c,-side/6,o-j),off(c,side/6,o+j),off(c,side/2,o-j)],a,s,nominal,2.5));
      G.push(addLine([off(c,o+j,-side/2),off(c,o-j,-side/6),off(c,o+j,side/6),off(c,o-j,side/2)],a,s,nominal,2.5));}
  });
  // éléments placés en couronne
  const base=Math.max(ringR,rc);
  slotted.forEach(a=>{
    const ang=angOf(a), t=TK[a.t], nominal=a.n==null;
    if(a.u==='ha'){
      const r=rOfHa(a.n), d=base+R0*0.12+r*(a.t==='dune'?0.6:1);
      const asp=a.t==='dune'?4:a.t==='berge'?2.2:1.3, rot=a.t==='dune'?ang+0:ang+90;
      G.push(addPoly(blob(polar(c,d,ang),r,asp,a.t==='dune'?-(ang-90)+90:-(ang),s.id+ang),a,s,false,a.t==='dune'?{dashArray:'2 4',fillOpacity:.45}:null));
      if(a.t==='agro'||a.t==='jardin'){const n=a.t==='agro'?18:10;for(let i=0;i<n;i++){const dd=r*0.8*Math.sqrt((i*0.618+.1)%1);
        G.push(L.circleMarker(polar(polar(c,d,ang),dd,i*137.5),{radius:a.t==='agro'?3:2.5,color:'#fff',weight:.6,fillColor:t.c,fillOpacity:1,interactive:false}));}}
    } else if(a.u==='km'){ // haies en courbes de niveau
      const len=Math.min(Math.max(R0*1.1,350),1800), k=Math.max(1,Math.round(a.n*1000/len)), sp=Math.max(18,R0*0.03);
      const ctr=polar(c,base+R0*0.25+k*sp/2,ang);
      for(let i=0;i<k;i++){const pts=[];const dperp=(i-(k-1)/2)*sp;
        for(let j=0;j<=16;j++){const u=(j/16-.5)*len, v=dperp+Math.sin(j/16*Math.PI*2+i*.6)*sp*0.5;
          const ro=ang*D2R; pts.push(off(ctr,u*Math.cos(ro)+v*Math.sin(ro),-u*Math.sin(ro)+v*Math.cos(ro)));}
        G.push(addLine(pts,a,s,false,2.5));}
    } else if(a.u==='m²'){
      const side=Math.sqrt(a.n/6);
      for(let i=0;i<6;i++){const p=polar(c,base+R0*0.2+i*side*1.4,ang+(i%2?8:-8));
        G.push(addPoly([off(p,-side/2,-side/2),off(p,side/2,-side/2),off(p,side/2,side/2),off(p,-side/2,side/2)],a,s,false,{fillOpacity:.6}));}
    } else if(nominal){
      const p=polar(c,base+R0*0.3,ang);
      if(a.t==='perm'){for(let i=0;i<4;i++){const q=polar(p,i*45,ang);G.push(addPoly([off(q,-18,-8),off(q,18,-8),off(q,18,8),off(q,-18,8)],a,s,true,{fillOpacity:.5}));}}
      else if(a.t==='jardin'){for(let i=0;i<4;i++)G.push(addPoly(blob(polar(p,i?40:0,i*120),22,1.2,0,i),a,s,true));}
      else if(a.t==='berge'){const pts=[];for(let i=0;i<=36;i++){const g=i/36*360;pts.push(polar(c,base+R0*0.08,g));}G.push(addLine(pts,a,s,true,4));}
      else G.push(pt(p,a,s,'n.c.'));
    } else { // dénombrements
      const n=a.n, show=Math.min(n,16), span=Math.min(150,show*14), r=base+R0*0.35;
      if(n>16) G.push(pt(polar(c,r,ang),a,s,n>=1000?fmt(Math.round(n/100)/10)+'k':fmt(n)));
      else for(let i=0;i<show;i++){const g=ang+(show>1?(i/(show-1)-.5)*span:0);G.push(pt(polar(c,r+(i%2)*R0*0.08,g),a,s));}
    }
  });
  G.forEach(g=>(target||geo).addLayer(g));
}

A.sfnLayersFor=s=>{const g=L.featureGroup(); drawSite(s,null,g); return g.getLayers();};

// ---------- plan SVG d'un site (export PDF) ----------
A.sfnPlanSVG=(s,W=700,H=430)=>{
  const grp=L.featureGroup(); drawSite(s,null,grp);
  const ls=grp.getLayers(); if(!ls.length) return '';
  const b=grp.getBounds().extend(s.pos); const c0=Math.cos(s.pos[0]*D2R);
  const mx=(b.getEast()-b.getWest())*c0*111320, my=(b.getNorth()-b.getSouth())*111320;
  const pad=34, k=Math.min((W-2*pad)/mx,(H-2*pad-18)/my);
  const cx=(b.getEast()+b.getWest())/2, cy=(b.getNorth()+b.getSouth())/2;
  const P=ll=>[(W/2+(ll.lng-cx)*c0*111320*k).toFixed(1),(H/2-9-(ll.lat-cy)*111320*k).toFixed(1)];
  const pts=a=>a.map(ll=>P(ll).join(',')).join(' ');
  let polys='',lines='',dots='';
  ls.forEach(l=>{const o=l.options;
    if(l instanceof L.Polygon) polys+=`<polygon points="${pts(l.getLatLngs()[0])}" fill="${o.fillColor}" fill-opacity="${o.fillOpacity}" stroke="${o.color}" stroke-width="1.4" ${o.dashArray?`stroke-dasharray="${o.dashArray}"`:''}/>`;
    else if(l instanceof L.Polyline) lines+=`<polyline points="${pts(l.getLatLngs())}" fill="none" stroke="${o.color}" stroke-width="${Math.max(1.6,(o.weight||3)*.7)}" stroke-linecap="round" ${o.dashArray?`stroke-dasharray="${o.dashArray}"`:''}/>`;
    else if(l instanceof L.CircleMarker){const [x,y]=P(l.getLatLng());dots+=`<circle cx="${x}" cy="${y}" r="${(o.radius||3)*.8}" fill="${o.fillColor}" stroke="#fff" stroke-width=".5"/>`;}
    else if(l instanceof L.Marker&&o.sfnColor){const [x,y]=P(l.getLatLng());
      dots+=o.sfnLabel?`<rect x="${x-11}" y="${y-6}" width="22" height="12" rx="6" fill="${o.sfnColor}" stroke="#fff"/><text x="${x}" y="${+y+3}" font-size="7.5" text-anchor="middle" fill="#fff" font-family="IBM Plex Mono" font-weight="600">${esc(o.sfnLabel)}</text>`
        :(o.sfnSq?`<rect x="${x-4}" y="${y-4}" width="8" height="8" rx="1" fill="${o.sfnColor}" stroke="#fff"/>`:`<circle cx="${x}" cy="${y}" r="4.5" fill="${o.sfnColor}" stroke="#fff"/>`);}
  });
  const [sx,sy]=P(L.latLng(s.pos));
  const nice=[100,200,250,500,1000,2000,5000].find(v=>v*k>W*0.12)||5000, bl=nice*k;
  const col=s.type==='bassin'?'#1f7a8c':'#b5651d';
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="background:#f3f1ea;border:1px solid #d9d2c2;border-radius:4px">
   <defs><pattern id="gr${s.id}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e4dfd2" stroke-width=".6"/></pattern></defs>
   <rect width="${W}" height="${H}" fill="url(#gr${s.id})"/>${polys}${lines}${dots}
   ${s.type==='bassin'?`<circle cx="${sx}" cy="${sy}" r="9" fill="${col}" stroke="#fff" stroke-width="2"/>`:`<rect x="${sx-9}" y="${sy-9}" width="18" height="18" rx="3" fill="${col}" stroke="#fff" stroke-width="2"/>`}
   <text x="${sx}" y="${+sy+3.5}" font-size="9" text-anchor="middle" fill="#fff" font-family="IBM Plex Mono" font-weight="600">${s.id}</text>
   <g transform="translate(${pad},${H-16})"><rect width="${bl/2}" height="4" fill="#1b2453"/><rect x="${bl/2}" width="${bl/2}" height="4" fill="#fff" stroke="#1b2453" stroke-width=".8"/>
    <text y="-4" font-size="9" fill="#1b2453" font-family="IBM Plex Mono">0</text><text x="${bl}" y="-4" font-size="9" text-anchor="middle" fill="#1b2453" font-family="IBM Plex Mono">${nice>=1000?nice/1000+' km':nice+' m'}</text></g>
   <g transform="translate(${W-26},30)"><path d="M0 -14 L5 4 L0 0 L-5 4Z" fill="#1b2453"/><text y="16" font-size="10" text-anchor="middle" fill="#1b2453" font-family="IBM Plex Mono" font-weight="600">N</text></g>
  </svg>`;
};

A.redrawSfnGeo=()=>{geo.clearLayers(); const k=A.state.sfnType; S.forEach(s=>drawSite(s,A.state.mode==='sfn'?k:null)); syncVis();};

// visibilité selon le zoom : pastilles (vue d'ensemble) / implantation (vue rapprochée)
function syncVis(){
  const z=map.getZoom(), proj=A.state.mode==='proj', sfn=A.state.mode==='sfn';
  const showGeo=!proj&&(sfn||A.on.sfn)&&z>=11.6;
  showGeo?geo.addTo(map):map.removeLayer(geo);
  if(A.sfnLayer){ (sfn&&(z<13.2||A.state.sfnType))?A.sfnLayer.addTo(map):map.removeLayer(A.sfnLayer); }
  const lg=document.getElementById('sfnlegend'); if(lg) lg.style.display=(!proj&&(sfn||A.on.sfn))?'block':'none';
  const hint=document.getElementById('sfnhint'); if(hint) hint.style.display=z<11.6?'block':'none';
  A.siteLayer.eachLayer(l=>l.setZIndexOffset(1000));
}
map.on('zoomend',syncVis);
const prev=A.applyLayers; A.applyLayers=()=>{prev(); syncVis();};

// légende carte
const lg=document.createElement('div'); lg.id='sfnlegend'; lg.className='sfnlegend';
lg.innerHTML=`<div class="h">SfN appliquées · implantation schématique</div>
 <div class="g">${T.map(t=>`<span class="sfnsw" style="background:${t.c}"></span><span>${t.n}</span>`).join('')}</div>
 <div class="f">Surfaces et linéaires à l'échelle des quantités ProDoc · tireté = non chiffré</div>
 <div class="hint" id="sfnhint">Zoomez sur un site pour voir l'implantation</div>`;
document.getElementById('mapwrap').appendChild(lg);

A.redrawSfnGeo();
})();
