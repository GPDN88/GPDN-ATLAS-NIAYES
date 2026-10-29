// Modèles 3D des solutions HORS SfN (ProDoc GEF 12082) — insérés dans la vue 3D future
(function(){
const A=window.ATLAS, HO=window.ATLAS_HORS; if(!HO) return;
const CK=HO.ck;
const fmt=n=>Number(n).toLocaleString('fr-FR');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let MAT=null;
function mats(){ if(MAT) return MAT; const T=THREE;
  const m=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.8},o||{}));
  return MAT={concrete:m('#b9b6ae'),dark:m('#55595f'),stone:m('#8d8a80',{flatShading:true}),earth:m('#9a8a62',{flatShading:true}),
    blue:m('#2f6db5',{roughness:.5}),lid:m('#1f3f6e'),white:m('#f2f2ee'),metal:m('#a8adb3',{metalness:.6,roughness:.35}),
    panel:m('#1d2a4a',{metalness:.4,roughness:.25}),purple:m('#7a4fb5',{roughness:.5}),green:m('#3f8a5a'),shade:m('#5fa36a',{transparent:true,opacity:.55,side:T.DoubleSide}),
    pot:m('#7a5a3a'),seed:m('#7fbf4f'),orange:m('#c0761f'),brick:m('#b8743c',{flatShading:true}),char:m('#2a2a2a'),roof:m('#9fa7ad',{metalness:.5,roughness:.4}),
    wood:m('#8a6440'),sign:m('#1b2453'),signface:m('#f6f3ec'),water:m('#4d9bc0',{roughness:.2}),crop:m('#5d9a3c'),drip:m('#2a2a2a'),soil:m('#8a6f4a')};}
const B=(w,h,d,mat)=>{const g=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),mat);g.castShadow=g.receiveShadow=true;return g;};
const C=(r,h,mat,seg=12,r2)=>{const g=new THREE.Mesh(new THREE.CylinderGeometry(r2??r,r,h,seg).translate(0,h/2,0),mat);g.castShadow=g.receiveShadow=true;return g;};
const at=(o,x,y,z,ry)=>{o.position.set(x,y,z);if(ry)o.rotation.y=ry;return o;};
const grp=(...a)=>{const g=new THREE.Group();a.forEach(o=>g.add(o));return g;};

// modèles (unités = mètres « maquette »)
const MOD={
 deversoir(M){return grp(B(6,2,4,M.concrete),at(B(6,.4,8,M.dark),0,0,-5),at(C(.7,6,M.dark,10),0,1,3).rotateX(Math.PI/2));},
 sortie(M){const p=C(.6,5,M.dark,10);p.rotation.z=Math.PI/2;return grp(B(4,2.4,3,M.concrete),at(p,4.5,.9,0),at(B(2.6,.3,2,M.metal),0,2.4,0));},
 seuil(M){const g=new THREE.Group();for(let i=0;i<9;i++){const s=new THREE.Mesh(new THREE.DodecahedronGeometry(.9+Math.random()*.4,0),M.stone);s.position.set(-4+i,.5,(Math.random()-.5)*.8);s.castShadow=true;g.add(s);}return g;},
 pompe(M){return grp(B(10,5,7,M.white),at(B(10.6,.5,7.6,M.blue),0,5,0),at(C(.6,9,M.blue,10),5.5,1,0).rotateZ(Math.PI/2),at(B(2,3,.2,M.dark),0,0,3.6));},
 citerne(M){return grp(C(1.4,.7,M.lid,14),at(C(.4,.6,M.blue,8),0,.7,0),at(C(.12,3.2,M.dark,6),1.2,0,0));},
 decant(M){return grp(B(2,1,1.6,M.concrete),at(C(1.2,1.6,M.blue,14),2.4,0,0),at(C(.12,3.4,M.dark,6),-1,0,0));},
 injection(M){const r=new THREE.Mesh(new THREE.RingGeometry(1.6,2.6,24).rotateX(-Math.PI/2),M.water);r.position.y=.08;return grp(C(.7,1.4,M.concrete,12),at(C(.85,.25,M.blue,12),0,1.4,0),r);},
 forage(M){const pn=B(4.5,.15,2.6,M.panel);pn.rotation.x=-.45;pn.position.set(0,3.2,0);return grp(at(C(.15,3.2,M.metal,6),0,0,0),pn,at(C(1.3,2.6,M.white,14),4,0,0),at(C(.15,2.4,M.metal,6),4,2.6,0),at(B(1,.8,1,M.dark),-2,0,1.5));},
 goutte(M){const g=grp(at(B(22,.08,14,M.soil),0,0,0));for(let i=0;i<7;i++){g.add(at(B(21,.5,.7,M.crop),0,.08,-6+i*2));g.add(at(B(21,.06,.1,M.drip),0,.1,-6.6+i*2));}g.add(at(B(.4,.4,14,M.blue),-11,0,0));return g;},
 piezo(M){return grp(C(.25,2.2,M.white,8),at(C(.32,.4,M.purple,8),0,2.2,0),at(B(1.2,.15,1.2,M.concrete),0,0,0));},
 piezoA(M){const pn=B(1.4,.08,.9,M.panel);pn.rotation.x=-.6;pn.position.set(0,3.7,.2);return grp(C(.12,3.6,M.metal,6),at(B(.8,1,.5,M.purple),0,1.6,.35),pn,at(B(1.4,.15,1.4,M.concrete),0,0,0));},
 pluvio(M){return grp(C(.1,2,M.metal,6),at(C(.45,.9,M.white,12,.6),0,2,0),at(B(1,.15,1,M.concrete),0,0,0));},
 pluvioA(M){const pn=B(1.6,.08,1,M.panel);pn.rotation.x=-.6;pn.position.set(0,5.4,0);return grp(C(.12,6,M.metal,6),at(C(.45,.8,M.white,12,.6),.9,4.4,0),at(B(.9,1.1,.5,M.purple),0,2.4,.3),pn,at(B(1.6,.15,1.6,M.concrete),0,0,0));},
 jauge(M){const g=grp(at(B(3,2.6,3,M.white),0,0,0),at(B(3.4,.3,3.4,M.purple),0,2.6,0));const post=B(.3,5,.15,M.white);post.position.set(4,0,0);g.add(post);for(let i=0;i<5;i++)g.add(at(B(.32,.18,.17,i%2?M.purple:M.dark),4,.5+i,0));g.add(at(B(5,.15,.8,M.wood),2,1.2,0));return g;},
 pepiniere(M){const g=new THREE.Group();const w=12,d=8,h=3;[[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2],[0,-d/2],[0,d/2]].forEach(([x,z])=>g.add(at(C(.1,h,M.wood,6),x,0,z)));
   const roof=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),M.shade);roof.position.y=h;g.add(roof);
   for(let i=0;i<5;i++)for(let j=0;j<9;j++){g.add(at(C(.35,.4,M.pot,6),-w/2+1.2+j*1.2,0,-d/2+1.4+i*1.3));g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(.4,0),M.seed),-w/2+1.2+j*1.2,.7,-d/2+1.4+i*1.3));}
   return g;},
 panneau(M){const f=B(3.4,1.8,.15,M.signface);f.position.y=1.6;const bd=B(3.6,2,.1,M.sign);bd.position.set(0,1.5,-.1);return grp(at(C(.1,3.4,M.dark,6),-1.4,0,0),at(C(.1,3.4,M.dark,6),1.4,0,0),bd,f);},
 champ(M){const g=grp(at(B(20,.08,16,M.soil),0,0,0));for(let i=0;i<8;i++)g.add(at(B(18,.6,.8,i%3===0?M.orange:M.crop),0,.08,-7+i*2));
   g.add(at(C(.12,2.6,M.wood,6),-9,0,-7.5));g.add(at(C(.12,2.6,M.wood,6),-6,0,-7.5));g.add(at(B(4,.15,2.4,M.roof),-7.5,2.6,-7.5));return g;},
 hangar(M){const g=grp(B(16,5,9,M.white));const r1=B(16.6,.25,5.4,M.roof);r1.rotation.x=.35;r1.position.set(0,5.4,-2.3);const r2=r1.clone();r2.rotation.x=-.35;r2.position.z=2.3;g.add(r1,r2);
   for(let i=0;i<4;i++)for(let j=0;j<3;j++)g.add(at(B(2.6,1.6,1.6,M.brick),-6+i*3,j*0,7.5+j*1.8));
   for(let i=0;i<3;i++)g.add(at(B(1.4,1.1,1.4,M.char),10+i*1.8,0,-2));g.add(at(B(3,.08,1.2,M.dark),0,.02,-5.5));return g;},
 mirador(M){const g=new THREE.Group();[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]].forEach(([x,z])=>g.add(at(C(.18,8,M.wood,6),x,0,z)));
   g.add(at(B(4.4,.3,4.4,M.wood),0,7,0));const rf=new THREE.Mesh(new THREE.ConeGeometry(3.6,2,4).translate(0,1,0),M.roof);rf.rotation.y=Math.PI/4;rf.position.y=9.4;rf.castShadow=true;g.add(rf);
   [[0,2.2],[0,-2.2]].forEach(([x,z])=>g.add(at(B(4.4,1,.12,M.wood),x,7.3,z)));g.add(at(C(.16,1.4,M.wood,6),0,8,0));
   for(let i=0;i<10;i++)g.add(at(B(1.6,.15,2,M.wood),3+i*1.8,.5,0));return g;}
};
MOD.digue=null;

// combien d'instances dessiner pour une quantité
const capOf=(m,n)=>({citerne:14,decant:6,injection:10,forage:8,piezo:3,seuil:4,champ:3}[m]||1);

let picks=[];
A.hors3D=(o)=>{
  const M=mats(), {world,K,Hm,F,lakes,rnd,s,Y,sans,fresh,plan,pip,scaleP,sampleLine,centroid}=o;
  picks=[];
  const items=(s.hors||[]).filter(x=>x.h.m&&o.on);
  const ex=clamp(Hm/230,1.1,5.5), u=K(1)*ex;
  const spots=[], labels=[];
  const polys=F.filter(f=>f.kind==='poly'), noues=F.filter(f=>f.kind==='line'&&f.t==='noue');
  const centerB=polys.find(f=>f.t==='bassin'&&Math.hypot(...centroid(f.pts))<10)||polys.find(f=>['bassin','typha'].includes(f.t));
  const free=(x,n,r)=>Math.abs(x)<Hm*.95&&Math.abs(n)<Hm*.95&&!polys.some(f=>pip(x,n,scaleP(f.pts,1.08)))&&!lakes.some(P=>pip(x,n,scaleP(P,1.12)))&&!spots.some(p=>Math.hypot(p[0]-x,p[1]-n)<p[2]+r);
  const findSpot=(r,rMin,rMax,ang0)=>{for(let k=0;k<400;k++){const a=(ang0??rnd()*360)+(k>60?rnd()*360:(rnd()-.5)*60), d=rMin+rnd()*(rMax-rMin);
      const x=d*Math.sin(a*Math.PI/180), n=d*Math.cos(a*Math.PI/180); if(free(x,n,r)) return [x,n];} return null;};
  const place=(model,x,n,ry,h,cnt,lbl)=>{const g=MOD[model](M);g.scale.setScalar(u);g.position.set(K(x),0,-K(n));g.rotation.y=ry||0;
    g.userData={h,n:cnt};g.traverse(c=>c.userData.root=g);world.add(g);picks.push(g);return g;};
  const ghost=(x,n,c)=>{const r=new THREE.Mesh(new THREE.RingGeometry(u*2,u*2.8,6).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:c}));r.position.set(K(x),.32,-K(n));world.add(r);};
  const built=(h,i)=>h.exist||(fresh&&(Y.w>=1||((i*0.618+h.k.length*.13)%1)<Y.w));
  // digue : talus le long du bassin central
  const dig=items.find(x=>x.h.k==='digue');
  if(dig&&centerB&&built(dig.h,0)){
    const P=scaleP(centerB.pts,1.2), pts=sampleLine([...P,P[0]],Math.max(4,Hm/90));
    const im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1).translate(0,.5,0),M.earth,pts.length), d=new THREE.Object3D();
    pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];d.position.set(K(p[0]),0,-K(p[1]));d.rotation.y=Math.atan2(-(q[1]-p[1]),q[0]-p[0]);d.scale.set(K(Math.max(4,Hm/90))*1.15,u*1.6,u*3.2);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
    im.castShadow=im.receiveShadow=true;im.userData={h:dig.h,n:1};im.userData.root=im;world.add(im);picks.push(im);
    const c=centroid(P); labels.push({x:K(P[0][0]),y:u*6,z:-K(P[0][1]),h:dig.h,cnt:1});
  }
  const R0=Math.max(220,Math.sqrt(s.sup*1e4/Math.PI));
  items.filter(x=>x.h.m&&x.h.k!=='digue').forEach((x,ii)=>{
    const h=x.h, cat=CK[h.cat], m=h.m, n=Math.min(x.n,capOf(m,x.n)); let first=null;
    const ok=built(h,ii);
    if(!ok&&!(plan&&!sans)) return;
    const foot={pompe:9,hangar:16,mirador:12,pepiniere:10,goutte:16,champ:16,jauge:6}[m]||3.5;
    const r=foot*ex;
    for(let i=0;i<n;i++){
      let p=null, ry=rnd()*Math.PI*2;
      if((m==='deversoir'||m==='sortie')&&centerB){const P=centerB.pts;const q=P[m==='deversoir'?Math.floor(P.length*.75):Math.floor(P.length*.25)];const c=centroid(P);const f=1.12;p=[c[0]+(q[0]-c[0])*f,c[1]+(q[1]-c[1])*f];ry=Math.atan2(q[1]-c[1],q[0]-c[0])*-1+(m==='sortie'?0:Math.PI/2);}
      else if(m==='seuil'&&noues.length){const L=noues[(i*3+ii)%noues.length].pts;const k=1+((i*2)%(L.length-1));const a=L[k-1],b=L[k];p=[(a[0]+b[0])/2,(a[1]+b[1])/2];ry=-Math.atan2(b[1]-a[1],b[0]-a[0])+Math.PI/2;}
      else if(m==='jauge'&&(lakes[0]||centerB)){const P=lakes[0]||centerB.pts;const q=P[Math.floor(P.length*.6)];p=[q[0],q[1]];}
      else if(m==='mirador'&&(lakes[0]||centerB)){const P=lakes[0]||centerB.pts;const q=P[Math.floor(P.length*.12)];const c=centroid(P);p=[c[0]+(q[0]-c[0])*1.12,c[1]+(q[1]-c[1])*1.12];ry=-Math.atan2(c[1]-q[1],c[0]-q[0]);}
      else if(m==='pompe'&&centerB){const P=centerB.pts;const q=P[Math.floor(P.length*.5)];const c=centroid(P);p=findSpot(r,Math.hypot(q[0]-c[0],q[1]-c[1])*1.25,Math.hypot(q[0]-c[0],q[1]-c[1])*1.25+R0*.5,Math.atan2(q[0]-c[0],q[1]-c[1])*180/Math.PI);}
      if(p&&!['deversoir','sortie','seuil','jauge','mirador'].includes(m)&&!free(p[0],p[1],r*.5)) p=null;
      if(!p){const near=['citerne','decant'].includes(m)?[Hm*.2,Hm*.9]:['piezo','piezoA','pluvio','pluvioA','injection'].includes(m)?[R0*.25,Hm*.8]:[Hm*.3,Hm*.88];
        p=findSpot(r,near[0],near[1], first?first.a+(rnd()-.5)*40:null);}
      if(!p) continue;
      spots.push([p[0],p[1],r]);
      if(ok) place(m,p[0],p[1],ry,h,x.n); else ghost(p[0],p[1],cat.c);
      if(!first){first={p,a:Math.atan2(p[0],p[1])*180/Math.PI};}
    }
    if(first) labels.push({x:K(first.p[0]),y:u*({mirador:12,pompe:8,hangar:8,pluvioA:8}[m]||6)+K(10)*.0,z:-K(first.p[1]),h,cnt:x.n,ok});
  });
  return {spots,labels};
};

// étiquettes HTML
A.hors3DLabel=(l)=>`<div class="lab3d hors ${l.ok===false?'plan':''}"><i style="background:${CK[l.h.cat].c}"></i>${l.ok===false?'Prévu · ':''}${esc(short(l.h))}${(typeof l.h.cible==='number'||l.cnt>1)?` <b>${fmt(l.cnt)}</b>`:''}</div>`;
function short(h){return ({digue:'Digue',deversoir:'Déversoir',sortie:'Sortie calibrée',seuil:'Seuils en pierre',pompe:'Station de pompage',citerne:'Citernes enterrées',decant:'Collecte + décanteur',injection:'Puits d\u2019injection',forage:'Forages solaires',goutte:'Goutte-à-goutte (ha)',piezoM:'Piézomètre',piezoA:'Piézomètre auto.',pluvioA:'Pluviomètre auto.',pluvioM:'Pluviomètre',jauge:'Station de jaugeage',pepi:'Pépinière',signal:'Signalétique',champ:'Champs-écoles',typhaU:'Unité typha',ecotour:'Écotourisme'})[h.k]||h.n;}

// survol : info-bulle
const tipEl=document.createElement('div'); tipEl.className='v3tip'; 
let rc=null, mouse=null;
document.addEventListener('pointermove',e=>{
  const cv=document.getElementById('v3c'); if(!cv||!A._3d||!window.THREE||!document.getElementById('v3d').classList.contains('on')){tipEl.style.display='none';return;}
  if(!tipEl.parentNode) document.getElementById('v3d').appendChild(tipEl);
  const r=cv.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){tipEl.style.display='none';return;}
  rc=rc||new THREE.Raycaster(); mouse=mouse||new THREE.Vector2();
  mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); rc.setFromCamera(mouse,A._3d.cam());
  const hit=rc.intersectObjects(picks,true)[0];
  if(!hit){tipEl.style.display='none';cv.style.cursor='grab';return;}
  let o=hit.object; while(o&&!o.userData.h&&o.parent) o=o.parent; const h=o.userData.h; if(!h){tipEl.style.display='none';return;}
  const s=A._3d.site();
  tipEl.innerHTML=`<b style="color:${CK[h.cat].c}">${esc(CK[h.cat].n)}</b><br><b>${esc(h.n)}</b><br><span class="mono">${typeof h.cible==='number'?'Cible ProDoc : '+fmt(h.cible)+' '+h.u+' · ce site : '+fmt(h.alloc[s.id]||0):'Cible : '+esc(h.cible)}</span><br>${esc(h.comp)} · ${esc(h.resp)} · ${h.cal} · p.${h.p}${h.det&&h.det[s.id]?'<br>'+esc(h.det[s.id]):''}${h.src==='ind'?'<br><i>Répartition par site indicative</i>':''}`;
  tipEl.style.display='block'; tipEl.style.left=(e.clientX-r.left+14)+'px'; tipEl.style.top=(e.clientY-r.top+14)+'px'; cv.style.cursor='help';
});
})();
