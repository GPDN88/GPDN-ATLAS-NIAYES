// Vue 3D prospective : comment se présenteront les SfN appliquées sur chaque site (2026 → 2050)
// Maquette fondée sur l'implantation schématique (quantités ProDoc). Illustration indicative, pas un projet d'exécution.
(function(){
const A=window.ATLAS, S=window.ATLAS_SITES, SF=window.ATLAS_SFN, T=SF.types, V=window.ATLAS_VULN;
const TK=Object.fromEntries(T.map(t=>[t.k,t])); const COL2T=Object.fromEntries(T.map(t=>[t.c,t.k]));
const $=s=>document.querySelector(s);
const fmt=n=>Number(n).toLocaleString('fr-FR');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const D2R=Math.PI/180, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const LIBS=['https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js','https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'];

const YS=[{y:2026,l:"2026 · aujourd'hui",g:0,w:0},{y:2028,l:'2028 · travaux',g:.25,w:.5},{y:2031,l:'2031 · fin de projet',g:.6,w:1},{y:2040,l:'2040',g:.85,w:1},{y:2050,l:'2050 · maturité',g:1,w:1}];
const st=Object.assign({site:1,yi:4,scen:'avec',rain:false,sat:false,plan:true,labels:true,spin:false,hors:true,sfnLab:true},JSON.parse(localStorage.getItem('atlas_3d')||'{}'));
const save=()=>localStorage.setItem('atlas_3d',JSON.stringify(st));

// ---------- UI ----------
const root=document.createElement('div'); root.id='v3d'; root.className='v3d';
root.innerHTML=`<canvas id="v3c"></canvas><div id="v3labs" class="v3labs"></div>
 <div class="v3top">
  <div class="v3t1"><span class="k">Vue 3D prospective</span><select id="v3site">${S.map(s=>`<option value="${s.id}">${s.id}. ${esc(s.nom)}</option>`).join('')}</select><button class="v3x" id="v3x">× Fermer</button></div>
  <div class="v3t2"><div class="seg" id="v3year">${YS.map((y,i)=>`<button data-i="${i}">${y.l}</button>`).join('')}</div>
  <div class="seg" id="v3scen"><button data-v="avec">Avec SfN</button><button data-v="sans">Sans projet</button></div></div>
 </div>
 <div class="v3side" id="v3side"></div>
 <div class="v3tools">
  <button id="v3play">▶ Lecture 2026 → 2050</button>
  <button id="v3rain" data-k="rain">Averse décennale</button>
  <button id="v3hors" data-k="hors">Hors SfN</button>
  <button id="v3plan" data-k="plan">Emprises prévues</button>
  <button id="v3lab" data-k="labels">Étiquettes</button>
  <button id="v3sat" data-k="sat">Fond satellite</button>
  <button id="v3spin" data-k="spin">Rotation</button>
  <button id="v3png">Capture PNG</button>
 </div>
 <div class="v3leg" id="v3leg"></div>
 <div class="v3load" id="v3load">Chargement de la vue 3D…</div>`;
document.getElementById('mapwrap').appendChild(root);

// ---------- three ----------
let R,scene,cam,ctrl,world,sun,rainPts,flood,raf=null,ready=false;
const anim={rain:0,basins:[],noues:[],labels:[]};
function loadLibs(){return LIBS.reduce((p,u)=>p.then(()=>new Promise((ok,ko)=>{if(u.includes('three.min')&&window.THREE)return ok();if(u.includes('Orbit')&&window.THREE&&THREE.OrbitControls)return ok();const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>ko(new Error('three.js'));document.head.appendChild(s);})),Promise.resolve());}
function init(){
  const cv=$('#v3c');
  R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});
  R.setPixelRatio(Math.min(2,devicePixelRatio)); R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.outputEncoding=THREE.sRGBEncoding; R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=1.05;
  scene=new THREE.Scene(); scene.background=new THREE.Color('#cfdde3'); scene.fog=new THREE.Fog('#cfdde3',420,900);
  cam=new THREE.PerspectiveCamera(38,1,1,3000);
  ctrl=new THREE.OrbitControls(cam,cv); ctrl.enableDamping=true; ctrl.maxPolarAngle=1.42; ctrl.minDistance=25; ctrl.maxDistance=900;
  scene.add(new THREE.HemisphereLight('#eef4ff','#8a7a5a',.75));
  sun=new THREE.DirectionalLight('#fff3dc',1.25); sun.position.set(-160,260,140); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-230,right:230,top:230,bottom:-230,near:10,far:800}); sun.shadow.bias=-.0006;
  scene.add(sun);
  // pluie
  const N=5000,g=new THREE.BufferGeometry(),p=new Float32Array(N*6);
  for(let i=0;i<N;i++){const x=(Math.random()-.5)*440,y=Math.random()*160,z=(Math.random()-.5)*440;p.set([x,y,z,x-.6,y-4,z],i*6);}
  g.setAttribute('position',new THREE.BufferAttribute(p,3));
  rainPts=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#dbe8f2',transparent:true,opacity:.55})); rainPts.visible=false; scene.add(rainPts);
  world=new THREE.Group(); scene.add(world);
  new ResizeObserver(resize).observe(root); resize();
  ready=true;
}
function resize(){root.classList.toggle('narrow',root.clientWidth<1000);if(!R)return;const w=root.clientWidth,h=root.clientHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}

// ---------- helpers ----------
const G={box:null,cone:null,sph:null,cyl:null};
function geos(){if(G.box)return;G.box=new THREE.BoxGeometry(1,1,1).translate(0,.5,0);G.cone=new THREE.ConeGeometry(.5,1,6).translate(0,.5,0);
  G.sph=new THREE.IcosahedronGeometry(.5,1).translate(0,.5,0);G.cyl=new THREE.CylinderGeometry(.5,.5,1,8).translate(0,.5,0);}
const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9,metalness:0},o||{}));
let rnd; const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const col=c=>new THREE.Color(c);
function inst(geo,mat,items,shadow){if(!items.length)return null;const m=new THREE.InstancedMesh(geo,mat,items.length),d=new THREE.Object3D();
  items.forEach((it,i)=>{d.position.set(it.x,it.y||0,it.z);d.rotation.set(0,it.r||0,0);d.scale.set(it.sx,it.sy,it.sz??it.sx);d.updateMatrix();m.setMatrixAt(i,d.matrix);if(it.c)m.setColorAt(i,it.c);});
  if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=shadow!==false;m.receiveShadow=true;world.add(m);return m;}
const pip=(x,n,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,ni]=P[i],[xj,nj]=P[j];if((ni>n)!==(nj>n)&&x<(xj-xi)*(n-ni)/(nj-ni)+xi)c=!c;}return c;};
const areaOf=P=>Math.abs(P.reduce((a,p,i)=>{const q=P[(i+1)%P.length];return a+p[0]*q[1]-q[0]*p[1];},0)/2);
const centroid=P=>[P.reduce((a,p)=>a+p[0],0)/P.length,P.reduce((a,p)=>a+p[1],0)/P.length];
function scatter(P,n){const xs=P.map(p=>p[0]),ns=P.map(p=>p[1]);const x0=Math.min(...xs),x1=Math.max(...xs),n0=Math.min(...ns),n1=Math.max(...ns);const out=[];
  for(let k=0;k<n*10&&out.length<n;k++){const x=x0+rnd()*(x1-x0),y=n0+rnd()*(n1-n0);if(pip(x,y,P))out.push([x,y]);}return out;}
function sampleLine(P,sp){const out=[];for(let i=1;i<P.length;i++){const[a,b]=[P[i-1],P[i]];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<L;d+=sp)out.push([a[0]+(b[0]-a[0])*d/L,a[1]+(b[1]-a[1])*d/L]);}return out;}
const scaleP=(P,f)=>{const[c0,c1]=centroid(P);return P.map(p=>[c0+(p[0]-c0)*f,c1+(p[1]-c1)*f]);};
const distSeg=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy||1;const t=clamp(((x-a[0])*dx+(y-a[1])*dy)/L,0,1);return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};

// ---------- texture satellite ----------
const satCache={};
function satTexture(s,Hm){
  const key=s.id+':'+Math.round(Hm); if(satCache[key]) return satCache[key];
  const lat=s.pos[0],lng=s.pos[1],mx=111320*Math.cos(lat*D2R);
  const z=clamp(Math.floor(Math.log2(156543.03*Math.cos(lat*D2R)/(2*Hm/1400))),10,18);
  const W=256*2**z, px=lo=>(lo+180)/360*W, py=la=>{const r=Math.sin(la*D2R);return(.5-Math.log((1+r)/(1-r))/(4*Math.PI))*W;};
  const x0=px(lng-Hm/mx),x1=px(lng+Hm/mx),y0=py(lat+Hm/111320),y1=py(lat-Hm/111320);
  const cv=document.createElement('canvas');cv.width=Math.ceil(x1-x0);cv.height=Math.ceil(y1-y0);const ctx=cv.getContext('2d');
  const jobs=[];for(let tx=Math.floor(x0/256);tx<=Math.floor(x1/256);tx++)for(let ty=Math.floor(y0/256);ty<=Math.floor(y1/256);ty++)
    jobs.push(new Promise(ok=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{ctx.drawImage(im,tx*256-x0,ty*256-y0);ok();};im.onerror=ok;
      im.src=`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${ty}/${tx}`;}));
  return satCache[key]=Promise.all(jobs).then(()=>{const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;});
}
function sandTexture(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#ddd2b5';x.fillRect(0,0,512,512);
  for(let i=0;i<9000;i++){x.fillStyle=`rgba(${120+Math.random()*60|0},${105+Math.random()*50|0},${70+Math.random()*40|0},${Math.random()*.12})`;x.fillRect(Math.random()*512,Math.random()*512,2+Math.random()*5,2+Math.random()*5);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,6);t.encoding=THREE.sRGBEncoding;return t;}
function radialAlpha(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const g=x.createRadialGradient(128,128,40,128,128,128);g.addColorStop(0,'#fff');g.addColorStop(.75,'#bbb');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(c);}
let SAND=null,RADIAL=null;

// ---------- construction de la scène ----------
let ctx3=null;
function features(s){
  const lat0=s.pos[0],lng0=s.pos[1],mx=111320*Math.cos(lat0*D2R);
  const P=ll=>[(ll.lng-lng0)*mx,(ll.lat-lat0)*111320];
  return A.sfnLayersFor(s).map((l,i)=>{const o=l.options;
    if(l instanceof L.Polygon) return {i,kind:'poly',t:o.sfnT,x:o.sfnX,q:o.sfnQ,pts:l.getLatLngs()[0].map(P)};
    if(l instanceof L.Polyline) return {i,kind:'line',t:o.sfnT,x:o.sfnX,q:o.sfnQ,pts:l.getLatLngs().map(P)};
    if(l instanceof L.CircleMarker) return null;
    if(l instanceof L.Marker&&o.sfnT) return {i,kind:'pt',t:o.sfnT,x:o.sfnX,q:o.sfnQ,label:o.sfnLabel,pts:[P(l.getLatLng())]};
    return null;}).filter(Boolean);
}
function build(){
  geos(); if(!SAND){SAND=sandTexture();RADIAL=radialAlpha();}
  while(world.children.length){const c=world.children.pop();c.geometry&&c.geometry!==G.box&&c.geometry!==G.cone&&c.geometry!==G.sph&&c.geometry!==G.cyl&&c.geometry.dispose();}
  anim.basins=[];anim.noues=[];anim.labels=[];
  const s=S.find(x=>x.id===st.site), Y=YS[st.yi], sans=st.scen==='sans';
  const F=features(s); rnd=rng(s.id*977);
  let ext=0; F.forEach(f=>f.pts.forEach(p=>ext=Math.max(ext,Math.abs(p[0]),Math.abs(p[1]))));
  const R0=Math.max(220,Math.sqrt(s.sup*1e4/Math.PI));
  const Hm=Math.max(320,ext*1.18,R0*0.9), k=200/Hm, vex=clamp(Hm/230,1.6,7), hx=clamp(Hm/420,1,3.2);
  const K=m=>m*k, H=m=>m*k*vex;
  const X=p=>K(p[0]), Z=p=>-K(p[1]);
  const fresh=!sans&&Y.w>0, grow=sans?0:Y.g, encro=sans?(Y.y-2026)/24:0;
  const builtF=f=>fresh&&(Y.w>=1||((f.i*0.618)%1)<Y.w);
  ctx3={s,Y,sans,Hm,k,vex,H,K,grow,encro,fresh};

  // sol
  const gm=M('#ffffff',{map:SAND});
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(400,400).rotateX(-Math.PI/2),gm); ground.receiveShadow=true; world.add(ground);
  const skirt=new THREE.Mesh(new THREE.CircleGeometry(900,48).rotateX(-Math.PI/2),M('#d6ccb0')); skirt.position.y=-.4; skirt.receiveShadow=true; world.add(skirt);
  if(st.sat){satTexture(s,Hm).then(t=>{if(ctx3&&ctx3.s===s&&st.sat){gm.map=t;gm.needsUpdate=true;}}).catch(()=>{});}

  const shapeOf=(P,f=1)=>{const Q=f===1?P:scaleP(P,f);const sh=new THREE.Shape();Q.forEach((p,i)=>i?sh.lineTo(K(p[0]),K(p[1])):sh.moveTo(K(p[0]),K(p[1])));return sh;};
  const flat=(P,mat,y,f)=>{const m=new THREE.Mesh(new THREE.ShapeGeometry(shapeOf(P,f)).rotateX(-Math.PI/2),mat);m.position.y=y;m.receiveShadow=true;world.add(m);return m;};
  const outline=(P,c,closed)=>{const pts=P.map(p=>new THREE.Vector3(X(p),.35,Z(p)));if(closed)pts.push(pts[0].clone());const g=new THREE.BufferGeometry().setFromPoints(pts);
    const l=new THREE.Line(g,new THREE.LineDashedMaterial({color:c,dashSize:2.2,gapSize:1.6}));l.computeLineDistances();world.add(l);};

  const trees=[],trunks=[],reeds=[],shrubs=[],tufts=[],mounds=[],houses=[],poles=[],caps=[],tanks=[];
  const tree=(x,n,h,w,c)=>{trunks.push({x:K(x),z:-K(n),sx:w*.14,sy:h*.45});trees.push({x:K(x),z:-K(n),y:h*.3,sx:w,sy:h*.78,c:col(c).offsetHSL(0,0,(rnd()-.5)*.08),r:rnd()*6});};
  const reed=(x,n,h,c)=>reeds.push({x:K(x),z:-K(n),sx:.35*hx,sy:h,c:col(c).offsetHSL((rnd()-.5)*.03,0,(rnd()-.5)*.1),r:rnd()*6});
  const densN=(P,sp,cap)=>Math.min(cap,Math.round(areaOf(P)/(sp*sp)));
  const sp=Math.max(10,Hm/55); // espacement végétal (m)
  const gg=Math.max(.18,grow);
  const lakes=[];

  // plan d'eau naturel des exutoires
  const hasCenter=F.some(f=>f.kind==='poly'&&['bassin','typha','foret'].includes(f.t)&&Math.abs(centroid(f.pts)[0])<5&&Math.abs(centroid(f.pts)[1])<5);
  if(s.type==='exutoire'&&!hasCenter){
    const r=R0*.55,P=[];for(let i=0;i<48;i++){const t=i/48*2*Math.PI,w=1+.08*Math.sin(3*t+s.id)+.05*Math.sin(5*t);P.push([Math.cos(t)*r*1.15*w,Math.sin(t)*r*.87*w]);}
    lakes.push(P);
    const pink=s.id===12, dry=s.id===13&&(sans||Y.y===2026);
    const c=pink?(sans&&Y.y>2026?'#b79a8f':(Y.y===2026?'#d89aa2':'#e2899a')):(dry?'#8f9a7a':'#3f8aa6');
    flat(P,M('#bfae86'),.06,1.08);
    const lm=flat(dry?scaleP(P,.7):P,M(c,{roughness:.25,metalness:.1,transparent:true,opacity:.92}),.12);
    if(!dry) anim.basins.push({m:lm,y0:.12,rise:H(.6)});
  }

  F.forEach(f=>{
    const t=TK[f.t], P=f.pts, built=builtF(f);
    if(f.kind==='poly'){
      const a=areaOf(P);
      if(!built){
        if(st.plan) outline(P,t.c,true);
        // état actuel / tendanciel
        if(f.t==='bassin'){flat(P,M('#7a7352',{roughness:.6}),.08);scatter(P,densN(P,sp*1.4,260)).forEach(q=>reed(q[0],q[1],H(2.5)*(1+encro),'#7c7a3a'));}
        else if(f.t==='typha'){flat(P,M('#6f7a4a'),.06);scatter(P,densN(P,sp*.8,900)).forEach(q=>reed(q[0],q[1],H(3)*(1+encro*.3),'#8a7d3c'));}
        else if(f.t==='foret'){scatter(P,densN(P,sp*1.6,400)*(sans?1-encro*.5:1)).forEach(q=>tree(q[0],q[1],H(9),K(7)*hx,'#4f6b33'));}
        else if(f.t==='dune'){scatter(P,densN(P,sp*2.2,120)).forEach(q=>mounds.push({x:K(q[0]),z:-K(q[1]),sx:K(sp*1.8)*hx,sy:H(2.5),sz:K(sp*1.2)*hx,r:rnd()*3,c:col('#e3d3a6')}));}
        else if(f.t==='marais'&&s.type==='exutoire'){flat(P,M('#8c9a6c'),.05);}
        return;
      }
      if(f.t==='bassin'){
        flat(P,M('#86a55a'),.05,1.14); flat(P,M('#6f8f49'),.07,1.05);
        const w=flat(P,M('#3a86a3',{roughness:.2,metalness:.15,transparent:true,opacity:.9}),.1,.96); anim.basins.push({m:w,y0:.1,rise:H(.9)});
        const perim=sampleLine([...scaleP(P,1.0),scaleP(P,1.0)[0]],sp*.5);
        perim.forEach(q=>{if(rnd()<.8)reed(q[0]+(rnd()-.5)*sp*.4,q[1]+(rnd()-.5)*sp*.4,H(2.2)*gg,'#6c9a3e');});
        sampleLine([...scaleP(P,1.12),scaleP(P,1.12)[0]],sp*2.2).forEach(q=>tree(q[0],q[1],H(8)*gg,K(6)*hx*(.4+.6*gg),'#4f7f34'));
      } else if(f.t==='marais'){
        flat(P,M('#5f9c8e',{roughness:.35,transparent:true,opacity:.92}),.07);
        scatter(P,densN(P,sp*.7,700)).forEach(q=>reed(q[0],q[1],H(2)*gg,'#5b9a3c'));
      } else if(f.t==='typha'){
        const w=flat(P,M('#3a86a3',{roughness:.2,metalness:.15}),.09,.9); anim.basins.push({m:w,y0:.09,rise:H(.5)});
        flat(P,M('#7fa055'),.06);
        sampleLine([...P,P[0]],sp*.45).forEach(q=>reed(q[0],q[1],H(2.4)*Math.max(.5,gg),'#7c9a3e'));
        scatter(P,Math.round(densN(P,sp,500)*.12)).forEach(q=>reed(q[0],q[1],H(2.6),'#8a7d3c'));
      } else if(f.t==='foret'){
        flat(P,M('#7d9a52'),.05);
        scatter(P,densN(P,sp*1.05,700)).forEach(q=>{const h=H(5+9*gg)*(.8+rnd()*.4);tree(q[0],q[1],h,K(4+5*gg)*hx,rnd()<.3?'#5d8a3a':'#3f6a2c');});
      } else if(f.t==='dune'){
        scatter(P,densN(P,sp*2.2,120)).forEach(q=>mounds.push({x:K(q[0]),z:-K(q[1]),sx:K(sp*1.8)*hx,sy:H(2.2),sz:K(sp*1.2)*hx,r:rnd()*3,c:col('#e3d3a6')}));
        scatter(P,densN(P,sp*.6,900)).forEach(q=>tufts.push({x:K(q[0]),z:-K(q[1]),y:H(.6),sx:K(2.2)*hx*(.5+gg),sy:H(1.3)*gg,c:col(rnd()<.5?'#a9b65f':'#8ea44c')}));
        sampleLine(scaleP(P,1.05).concat([scaleP(P,1.05)[0]]),sp*1.6).forEach(q=>tree(q[0],q[1],H(9)*gg,K(4)*hx*(.5+gg),'#5a7a3e'));
      } else if(f.t==='berge'){
        flat(P,M('#93a565'),.05);
        scatter(P,densN(P,sp*.8,600)).forEach(q=>shrubs.push({x:K(q[0]),z:-K(q[1]),sx:K(3)*hx*(.5+gg),sy:H(1.6)*gg+.2,c:col(rnd()<.5?'#8aa04e':'#6f8f45')}));
      } else if(f.t==='agro'){
        flat(P,M('#a5b46a'),.05);
        const rows=scatter(P,densN(P,sp*1.3,600));
        rows.forEach(q=>{const qq=[Math.round(q[0]/(sp*1.3))*sp*1.3,q[1]];tree(qq[0],qq[1],H(4+6*gg),K(3+4*gg)*hx,rnd()<.4?'#6f9a3a':'#557f30');});
      } else if(f.t==='jardin'){
        flat(P,M('#86b05a'),.06);
        scatter(P,densN(P,sp*.9,300)).forEach(q=>shrubs.push({x:K(q[0]),z:-K(q[1]),sx:K(2.5)*hx,sy:H(1)*gg+.15,c:col(['#d6739a','#e2b43a','#6fae4a','#c95f5f'][rnd()*4|0])}));
      } else if(f.t==='perm'){
        flat(P,M('#c9c4b6',{roughness:.7}),.09);
      }
    }
    else if(f.kind==='line'){
      if(!built){if(st.plan) outline(P,t.c,false); return;}
      if(f.t==='noue'){
        for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L2=Math.hypot(b[0]-a[0],b[1]-a[1]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const w=Math.max(K(6),1.1);
          const g=new THREE.Mesh(new THREE.PlaneGeometry(K(L2),w).rotateX(-Math.PI/2),M('#6f9e4c'));g.rotation.y=ang;g.position.set((X(a)+X(b))/2,.14,(Z(a)+Z(b))/2);g.receiveShadow=true;world.add(g);
          const wm=new THREE.Mesh(new THREE.PlaneGeometry(K(L2),w*.45).rotateX(-Math.PI/2),M('#4d9bc0',{roughness:.2,transparent:true,opacity:0}));wm.rotation.y=ang;wm.position.set(g.position.x,.17,g.position.z);world.add(wm);anim.noues.push(wm);}
        sampleLine(P,sp*1.2).forEach(q=>shrubs.push({x:K(q[0]),z:-K(q[1]),sx:K(2.2)*hx*(.5+gg),sy:H(1.2)*gg+.15,c:col('#5f8f3c')}));
      } else {
        const big=f.t==='foret'||f.t==='agro';
        sampleLine(P,sp*(big?.9:.55)).forEach(q=>big?tree(q[0],q[1],H(4+7*gg),K(3+3*gg)*hx,'#4f7f34'):shrubs.push({x:K(q[0]),z:-K(q[1]),sx:K(3)*hx*(.5+gg),sy:H(1.5)*gg+.2,c:col(f.t==='berge'?'#7d9a48':'#6a8f3e')}));
      }
    }
    else if(f.kind==='pt'){
      const [x,n]=P[0];
      if(!built){if(st.plan){const r=new THREE.Mesh(new THREE.RingGeometry(1,1.5,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:t.c}));r.position.set(K(x),.3,-K(n));world.add(r);}return;}
      if(f.t==='nappe'){tanks.push({x:K(x),z:-K(n),sx:2.2,sy:H(1.5)+.6,c:col('#3d63c4')});const r=new THREE.Mesh(new THREE.RingGeometry(2.4,3.6,32).rotateX(-Math.PI/2),M('#4a8fd0',{transparent:true,opacity:.6}));r.position.set(K(x),.2,-K(n));world.add(r);}
      else if(f.t==='gouv'){poles.push({x:K(x),z:-K(n),sx:.35,sy:H(4)+2.5});caps.push({x:K(x),z:-K(n),y:H(4)+2.5,sx:1.4,sy:.9,c:col('#6b7090')});}
      else if(f.t==='jardin'){const d=new THREE.Mesh(new THREE.CircleGeometry(2.4,20).rotateX(-Math.PI/2),M('#7fb257'));d.position.set(K(x),.15,-K(n));world.add(d);
        for(let j=0;j<5;j++)shrubs.push({x:K(x)+(rnd()-.5)*3,z:-K(n)+(rnd()-.5)*3,sx:.9,sy:.8*gg+.2,c:col(['#d6739a','#e2b43a','#c95f5f'][j%3])});}
      else tanks.push({x:K(x),z:-K(n),sx:1.8,sy:1.4,c:col(t.c)});
    }
  });

  // solutions hors SfN (ProDoc)
  let HS={spots:[],labels:[]};
  if(A.hors3D) try{HS=A.hors3D({world,K,Hm,F,lakes,rnd,s,Y,sans,fresh,plan:st.plan,on:st.hors,pip,scaleP,sampleLine,centroid});}catch(e){console.warn('hors3D',e);}

  // bâti
  const urb=s.type==='bassin'?(s.id===7||s.id===10?.45:.82):(s.id===11?.6:.12);
  const bsp=Math.max(16,Hm/48);
  const polys=F.filter(f=>f.kind==='poly'), lines=F.filter(f=>f.kind==='line'&&f.t==='noue');
  const hues=['#efe6d2','#e8dcc0','#f3efe6','#dccdb0','#e6d2b3','#d9c3a0','#ece4d6'];
  if(!st.sat) for(let x=-Hm;x<Hm;x+=bsp) for(let n=-Hm;n<Hm;n+=bsp){
    const jx=x+(rnd()-.5)*bsp*.3, jn=n+(rnd()-.5)*bsp*.3, rr=Math.hypot(jx,jn);
    if(rnd()>urb*(1-Math.max(0,rr/Hm-.55)*1.2)+encro*.15) continue;
    if(lakes.some(P=>pip(jx,jn,scaleP(P,1.15)))) continue;
    const inPoly=polys.find(f=>pip(jx,jn,scaleP(f.pts,1.08)));
    if(inPoly){const c=inPoly.t; if(!(sans&&!['bassin','typha','marais'].includes(c)&&rnd()<encro*.7)&&!(sans&&c==='bassin'&&rnd()<encro*.35)) continue;}
    if(lines.some(f=>f.pts.some((p,i)=>i&&distSeg(jx,jn,f.pts[i-1],p)<bsp*.45))) continue;
    if(HS.spots.some(p=>Math.hypot(p[0]-jx,p[1]-jn)<p[2]+bsp*.6)) continue;
    const fl=1+(rnd()<.55?0:rnd()<.7?1:2)+(s.type==='bassin'&&rnd()<.08?1:0);
    houses.push({x:K(jx),z:-K(jn),sx:K(bsp*(.45+rnd()*.25)),sy:H(3.1*fl),sz:K(bsp*(.45+rnd()*.25)),r:(rnd()-.5)*.3,c:col(hues[rnd()*hues.length|0])});
  }

  const white=M('#ffffff');
  inst(G.box,white,houses);
  inst(G.cyl,M('#6b5a3e'),trunks,false);
  inst(G.sph,M('#ffffff',{flatShading:true}),trees);
  inst(G.cone,M('#ffffff'),reeds);
  inst(G.sph,M('#ffffff',{flatShading:true}),shrubs);
  inst(G.cone,M('#ffffff'),tufts,false);
  inst(G.sph,M('#ffffff',{flatShading:true}),mounds);
  inst(G.cyl,M('#eeeeee'),poles); inst(G.box,M('#ffffff'),caps); inst(G.cyl,M('#ffffff',{roughness:.4}),tanks);

  // nappe d'inondation
  const fm=M('#8a8460',{roughness:.3,metalness:.05,transparent:true,opacity:.82,alphaMap:RADIAL,depthWrite:false});
  flood=new THREE.Mesh(new THREE.CircleGeometry(Math.min(195,K(R0*1.6)),64).rotateX(-Math.PI/2),fm); flood.renderOrder=2; world.add(flood);
  const crue=fresh?1.3*(1-.65*Y.w*(.55+.45*grow)):1.3+encro*1.1;
  const stagnant=(!fresh&&[2,4,6,11].includes(s.id))?.35+encro*.4:0;
  ctx3.flood={dry:H(stagnant),wet:H(crue)};

  // étiquettes
  const seen={}; const labs=[];
  F.forEach(f=>{if(seen[f.t])return; seen[f.t]=1; const P=f.pts; const c=f.kind==='poly'?centroid(P):P[Math.floor(P.length/2)];
    const built=F.some(g=>g.t===f.t&&builtF(g));
    labs.push({p:new THREE.Vector3(K(c[0]),H(10)+4,-K(c[1])),t:f.t,built,q:F.filter(g=>g.t===f.t&&g.q).map(g=>g.q).filter((v,i,a)=>a.indexOf(v)===i).join(' + ')});});
  const sfnL=st.sfnLab===false?[]:labs;
  $('#v3labs').innerHTML=sfnL.map((l,i)=>`<div class="lab3d ${l.built?'':'plan'}" data-i="${i}"><i style="background:${TK[l.t].c}"></i>${l.built?'':'Prévu · '}${TK[l.t].s}${l.q?` <b>${esc(l.q)}</b>`:''}</div>`).join('')+HS.labels.map(l=>A.hors3DLabel(l)).join('');
  const allP=sfnL.map(l=>l.p).concat(HS.labels.map(l=>new THREE.Vector3(l.x,l.y+3,l.z)));
  anim.labels=allP.map((p,i)=>({p,el:$('#v3labs').children[i]}));
  ctx3.horsN=HS.labels.length;

  // ombres : cadre
  renderSide();
}

// ---------- panneau ----------
function vulnAt(id,y,sfn){
  if(y===2026) return V.compute(id,'now');
  const a=V.compute(id,'now'), b=V.compute(id,'2050-245',sfn); if(y>=2050) return b;
  const t=(y-2026)/24, bS=sfn?b:b; return {V:a.V+(bS.V-a.V)*t};
}
function renderSide(){
  const {s,Y,sans,grow}=ctx3, w=sans?0:Y.w;
  const v0=V.compute(s.id,'now').V, v=vulnAt(s.id,Y.y,!sans&&Y.y>2026).V, c=V.cls(v);
  const veg=s.sfn.filter(a=>a.u==='ha'&&!['perm','bassin'].includes(a.t)).reduce((x,a)=>x+a.n,0);
  const km=s.sfn.filter(a=>a.u==='km').reduce((x,a)=>x+a.n,0);
  const fl=ctx3.flood.wet/(ctx3.k*ctx3.vex);
  const caption=Y.y===2026?"État actuel : les SfN ne sont pas encore réalisées. Les emprises prévues apparaissent en pointillé. Activez l'averse pour voir le comportement en crue."
   :sans?`Scénario tendanciel ${Y.y} : pas de SfN. L'urbanisation gagne les emprises libres, ${s.id===11||s.id===14?'le typha progresse, ':''}et la crue décennale monte plus haut.`
   :Y.w<1?`Chantier en cours : environ la moitié des ouvrages SfN sont réalisés, avec de jeunes plantations.`
   :Y.y===2031?"Fin de projet : tous les ouvrages sont réalisés. La végétation atteint environ 60 % de son développement."
   :`${Y.y} : végétation ${Y.y===2050?'mature':'à 85 % de son développement'}. Les SfN stockent, infiltrent et épurent l'eau de pluie.`;
  $('#v3side').innerHTML=`<div class="v3h">${esc(s.nom)}</div><div class="v3s">${s.type==='bassin'?'Bassin de rétention':'Exutoire naturel'} · ${fmt(s.sup)} ha · ${fmt(s.pop)} hab. exposés</div>
   <div class="v3cap">${caption}</div>
   <div class="v3k"><div><b style="color:${c[2]}">${v.toFixed(2)}</b><span>Vulnérabilité ${c[3].toLowerCase()}<br>(2026 : ${v0.toFixed(2)})</span></div>
   <div><b>${s.vol?fmt(Math.round(s.vol*w/1000))+'k':fmt(Math.round(s.surfReq*w))}</b><span>${s.vol?'m³ de stockage pluvial':'ha traités'}</span></div>
   <div><b>${fmt(Math.round(veg*w))}</b><span>ha de SfN végétalisées${w?` · ${Math.round(grow*100)} % de croissance`:''}</span></div>
   <div><b>${fmt(Math.round(km*w*10)/10)}</b><span>km de noues, haies et berges</span></div></div>
   <div class="v3fl">Hauteur d'eau en crue décennale (indicative) : <b>${fl.toFixed(2)} m</b> ${st.rain?'':'<span>· activez « Averse »</span>'}</div>
   <div class="v3n">Maquette illustrative. Les surfaces et linéaires sont dimensionnés sur les quantités ProDoc, mais l'implantation est schématique. Hauteurs exagérées ×${ctx3.vex.toFixed(1)}.</div>`;
  const fams=[...new Set(s.sfn.map(a=>a.t))];
  const HO=window.ATLAS_HORS, hc=st.hors&&HO?[...new Set((s.hors||[]).filter(x=>x.h.m).map(x=>x.h.cat))]:[];
  $('#v3leg').innerHTML=`<div class="lh">SfN</div>`+fams.map(k=>`<span><i style="background:${TK[k].c}"></i>${TK[k].n}</span>`).join('')+(hc.length?`<div class="lh">Hors SfN</div>`+hc.map(k=>`<span><i style="background:${HO.ck[k].c};border-radius:50%"></i>${HO.ck[k].n}</span>`).join(''):'');
  if(st.hors&&HO){const g=(s.hors||[]);const im=HO.items.filter(h=>!h.m&&(!Object.keys(h.alloc).length||h.alloc[s.id]));
    $('#v3side').insertAdjacentHTML('beforeend',`<div class="v3hors"><div class="lh">Hors SfN sur ce site · ${g.filter(x=>x.h.m).length} produits modélisés</div><div class="v3imm">${im.slice(0,6).map(h=>`<span title="${esc(h.n)} · p.${h.p}">${esc(h.n.split(/[,(:]/)[0])}</span>`).join('')}${im.length>6?`<span>+${im.length-6}</span>`:''}</div><div class="v3n" style="margin-top:4px">Survolez un ouvrage pour sa fiche ProDoc. Produits immatériels listés ci-dessus.</div></div>`);}
  root.querySelectorAll('#v3year button').forEach(b=>b.classList.toggle('on',+b.dataset.i===st.yi));
  root.querySelectorAll('#v3scen button').forEach(b=>b.classList.toggle('on',b.dataset.v===st.scen));
  root.querySelectorAll('.v3tools [data-k]').forEach(b=>b.classList.toggle('on',!!st[b.dataset.k]));
  $('#v3site').value=st.site;
}

// ---------- boucle ----------
function loop(){
  raf=requestAnimationFrame(loop);
  const tgt=st.rain?1:0; anim.rain+=(tgt-anim.rain)*.025;
  if(rainPts){rainPts.visible=anim.rain>.03; rainPts.material.opacity=.55*anim.rain;
    if(rainPts.visible){const p=rainPts.geometry.attributes.position.array;for(let i=0;i<p.length;i+=6){p[i+1]-=3.2;p[i+4]-=3.2;if(p[i+4]<0){const y=150+Math.random()*20;p[i+1]=y;p[i+4]=y-4;}}rainPts.geometry.attributes.position.needsUpdate=true;}}
  if(ctx3&&flood){const h=ctx3.flood.dry+(ctx3.flood.wet-ctx3.flood.dry)*anim.rain;flood.position.y=h;flood.visible=h>.05;}
  anim.basins.forEach(b=>b.m.position.y=b.y0+b.rise*anim.rain);
  anim.noues.forEach(m=>m.material.opacity=.85*anim.rain);
  scene.background.setStyle(anim.rain>.05?'#b9c6cc':'#cfdde3'); scene.fog.color.copy(scene.background); sun.intensity=1.25-.55*anim.rain;
  ctrl.autoRotate=st.spin; ctrl.autoRotateSpeed=.6; ctrl.update();
  R.render(scene,cam);
  if(st.labels){const w=root.clientWidth,h=root.clientHeight;anim.labels.forEach(l=>{const v=l.p.clone().project(cam);const vis=v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.1;
    l.el.style.display=vis?'':'none'; if(vis) l.el.style.transform=`translate(${(v.x+1)/2*w}px,${(1-v.y)/2*h}px) translate(-50%,-100%)`;});}
  $('#v3labs').style.display=st.labels?'':'none';
}
A._3d={cam:()=>cam,site:()=>ctx3&&ctx3.s};
function resetCam(){cam.position.set(-150,190,250);ctrl.target.set(0,0,0);ctrl.update();}

// ---------- ouverture ----------
let playT=null;
A.open3D=async(id)=>{
  if(id) st.site=id; save();
  root.classList.add('on'); $('#v3load').style.display='grid';
  try{await loadLibs(); if(!ready) init();}catch(e){$('#v3load').innerHTML='Impossible de charger le moteur 3D (connexion requise).';return;}
  resize(); build(); resetCam(); $('#v3load').style.display='none'; if(!raf) loop();
};
function close3D(){root.classList.remove('on'); if(raf){cancelAnimationFrame(raf);raf=null;} stopPlay();}
function stopPlay(){if(playT){clearInterval(playT);playT=null;$('#v3play').textContent='▶ Lecture 2026 → 2050';}}
$('#v3x').onclick=close3D;
$('#v3site').onchange=e=>{st.site=+e.target.value;save();build();resetCam();};
root.querySelectorAll('#v3year button').forEach(b=>b.onclick=()=>{stopPlay();st.yi=+b.dataset.i;save();build();});
root.querySelectorAll('#v3scen button').forEach(b=>b.onclick=()=>{st.scen=b.dataset.v;save();build();});
root.querySelectorAll('.v3tools [data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;st[k]=!st[k];save();if(k==='sat'||k==='plan'||k==='hors')build();else renderSide();});
$('#v3play').onclick=()=>{if(playT)return stopPlay();st.scen='avec';st.yi=0;build();$('#v3play').textContent='❚❚ Pause';
  playT=setInterval(()=>{if(st.yi>=YS.length-1)return stopPlay();st.yi++;save();build();},2600);};
$('#v3png').onclick=()=>{const a=document.createElement('a');a.download=`SfN_3D_site${st.site}_${YS[st.yi].y}_${st.scen}.png`;a.href=$('#v3c').toDataURL('image/png');a.click();};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&root.classList.contains('on'))close3D();});

// ---------- points d'entrée ----------
const bm=document.getElementById('basemap'); const b3=document.createElement('button'); b3.className='b3d'; b3.textContent='Vue 3D future'; b3.onclick=()=>A.open3D(A.state.sel||st.site); bm.appendChild(b3);
const prevSel=A.select;
A.select=id=>{prevSel(id); if(root.classList.contains('on')&&ready){st.site=id;save();build();resetCam();}
  const b=$('#bPdfOne')||$('#back'); if(b&&!$('#b3dOne')){b.insertAdjacentHTML('afterend',' <button class="btn" id="b3dOne">Vue 3D future</button>');$('#b3dOne').onclick=()=>A.open3D(id);}};
const sfnPane=$('#p-sfn');
function addSfn3d(){const b=$('#bPdfSfn'); if(b&&!$('#b3dSfn')){b.insertAdjacentHTML('afterend',' <button class="btn" id="b3dSfn">Voir les SfN en 3D (2026 → 2050)</button>');$('#b3dSfn').onclick=()=>A.open3D(A.state.sel||st.site);}}
const prevShow=A.sfnShow; A.sfnShow=()=>{prevShow();addSfn3d();};
sfnPane.addEventListener('click',()=>setTimeout(addSfn3d,0)); addSfn3d();
if(A.state.sel){const b=$('#bPdfOne')||$('#back'); if(b&&!$('#b3dOne')){b.insertAdjacentHTML('afterend',' <button class="btn" id="b3dOne">Vue 3D future</button>');$('#b3dOne').onclick=()=>A.open3D(A.state.sel);}}
})();
