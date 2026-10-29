(function(){
const S = window.ATLAS_SITES;
const A = window.ATLAS = { layers:{}, state:{ mode:'sites', scen:'2026', sel:null } };

// ---------- map ----------
const map = A.map = L.map('map',{ zoomSnap:0, zoomDelta:0.5, wheelPxPerZoomLevel:90, maxZoom:21, minZoom:6, zoomControl:true, attributionControl:true })
  .setView([14.80,-17.30], 11);
const bases = {
  sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxNativeZoom:19,maxZoom:21,attribution:'Imagerie © Esri, Maxar, Earthstar'}),
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxNativeZoom:19,maxZoom:21,attribution:'© OpenStreetMap'}),
  topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',{maxNativeZoom:17,maxZoom:21,attribution:'© OpenTopoMap (CC-BY-SA)'})
};
const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxNativeZoom:19,maxZoom:21,opacity:.9});
let curBase='sat'; bases.sat.addTo(map); labels.addTo(map);
document.querySelectorAll('#basemap button').forEach(b=>b.onclick=()=>{
  map.removeLayer(bases[curBase]); curBase=b.dataset.b; bases[curBase].addTo(map); bases[curBase].bringToBack();
  if(curBase==='sat') labels.addTo(map); else map.removeLayer(labels);
  document.querySelectorAll('#basemap button').forEach(x=>x.classList.toggle('on',x===b));
});
L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);

// ---------- scales (1:N à 96 dpi) ----------
const MPP = 0.0254/96;
const zForScale = (N,lat)=>Math.log2(156543.03392*Math.cos(lat*Math.PI/180)/(N*MPP));
const scaleAt = ()=>156543.03392*Math.cos(map.getCenter().lat*Math.PI/180)/Math.pow(2,map.getZoom())/MPP;
const SCALES=[1000,5000,50000,500000,1000000];
const fmtN=n=>Math.round(n).toLocaleString('fr-FR');
const sb=document.getElementById('scalebar');
SCALES.forEach(N=>{const b=document.createElement('button');b.textContent='1/'+fmtN(N);b.dataset.n=N;
  b.onclick=()=>A.setScale(N);sb.appendChild(b);});
A.setScale=(N,ll)=>{ const c=L.latLng(ll||map.getCenter()); const z=zForScale(N,c.lat);
  if(document.hidden) map.setView(c,z,{animate:false}); else map.flyTo(c,z,{duration:.9}); };
function upScale(){
  const N=scaleAt(); const z=map.getZoom();
  document.querySelectorAll('#scalebar button').forEach(b=>b.classList.toggle('on',Math.abs(Math.log(N/b.dataset.n))<0.12));
  const res=N*MPP; const nat=curBase==='topo'?17:19;
  document.getElementById('scaleread').innerHTML=`Échelle écran <b>1/${fmtN(N)}</b><br>${res<1?(res*100).toFixed(1)+' cm':res.toFixed(1)+' m'}/px · zoom ${z.toFixed(2)}`+
   (z>nat+0.05?`<br><span style="color:#b23a2e">au-delà de la résolution native du fond (z${nat})</span>`:'');
  document.querySelectorAll('.lbl-site').forEach(e=>e.style.display=z>10.3?'':'none');
}
map.on('zoomend moveend',upScale);
map.on('mousemove',e=>{document.getElementById('cursor').textContent=`${e.latlng.lat.toFixed(6)}° N  ${(-e.latlng.lng).toFixed(6)}° O  (WGS 84)`;});

// ---------- helpers ----------
A.dms=(v,pos,neg)=>{const s=v<0?neg:pos;v=Math.abs(v);const d=Math.floor(v);const m=Math.floor((v-d)*60);const sec=((v-d)*60-m)*60;return `${d}°${String(m).padStart(2,'0')}′${sec.toFixed(1).padStart(4,'0')}″ ${s}`;};
A.dist=(a,b)=>map.distance(L.latLng(a),L.latLng(b));
A.utm=(lat,lon)=>{ // WGS84 -> UTM zone 28N
  const a=6378137,f=1/298.257223563,k0=0.9996,e2=f*(2-f),ep2=e2/(1-e2);
  const zone=28,lon0=(zone-1)*6-180+3; const φ=lat*Math.PI/180,λ=(lon-lon0)*Math.PI/180;
  const N=a/Math.sqrt(1-e2*Math.sin(φ)**2),T=Math.tan(φ)**2,C=ep2*Math.cos(φ)**2,Aa=Math.cos(φ)*λ;
  const M=a*((1-e2/4-3*e2*e2/64-5*e2**3/256)*φ-(3*e2/8+3*e2*e2/32+45*e2**3/1024)*Math.sin(2*φ)+(15*e2*e2/256+45*e2**3/1024)*Math.sin(4*φ)-(35*e2**3/3072)*Math.sin(6*φ));
  const x=k0*N*(Aa+(1-T+C)*Aa**3/6+(5-18*T+T*T+72*C-58*ep2)*Aa**5/120)+500000;
  const y=k0*(M+N*Math.tan(φ)*(Aa*Aa/2+(5-T+9*C+4*C*C)*Aa**4/24+(61-58*T+T*T+600*C-330*ep2)*Aa**6/720));
  return [x,y];
};
const col=t=>t==='bassin'?'#1f7a8c':'#b5651d';

// ---------- layers ----------
// Niayes band
const N=window.ATLAS_NIAYES;
A.layers.niayes=L.polygon([...N.coast,...N.inland],{color:'#d9b44a',weight:1.5,dashArray:'6 4',fillColor:'#e8cf6a',fillOpacity:.18})
  .bindTooltip('Bande des Niayes (tracé schématique) · 180 km × 5–30 km · 8 883 km²',{sticky:true});
// axes
A.layers.axes=L.layerGroup(window.ATLAS_AXES.map(z=>L.polygon(z.poly,{color:'#4a63c9',weight:1,fillColor:'#4a63c9',fillOpacity:.10,dashArray:'3 3'})
  .bindTooltip(`<b>${z.zone}</b><br>${z.km} km d'axes d'écoulement (cible)`,{sticky:true})));
// thematic zones
const zc={nitrate:'#b23a2e',salin:'#7b4fb5',nappe:'#c98a12',degrad:'#5b5b5b'};
A.layers.zones={};
Object.keys(zc).forEach(k=>A.layers.zones[k]=L.layerGroup(window.ATLAS_ZONES.filter(z=>z.k===k).map(z=>
  L.circle(z.c,{radius:z.r,color:zc[k],weight:1.2,fillColor:zc[k],fillOpacity:.16,dashArray:'4 3'})
   .bindPopup(`<b>${z.t}</b><br>${z.d}<br><span style="color:#6b7090;font-size:11px">Source : ${z.s}<br>Zone indicative, pas un relevé.</span>`))));
// sites
A.markers={}; A.footprints=L.layerGroup(); A.osmLayer=L.layerGroup(); A.siteLayer=L.layerGroup();
S.forEach(s=>{
  const icon=L.divIcon({className:'',html:`<div class="mk ${s.type}" style="background:${col(s.type)}">${s.id}</div>`,iconSize:[26,26],iconAnchor:[13,13]});
  const m=L.marker(s.pos,{icon,zIndexOffset:1000}).on('click',()=>A.select(s.id));
  m.bindTooltip(s.nom,{permanent:true,direction:'right',offset:[14,0],className:'lbl lbl-site'});
  A.siteLayer.addLayer(m); A.markers[s.id]=m;
  const r=Math.sqrt(s.sup*10000/Math.PI);
  A.footprints.addLayer(L.circle(s.pos,{radius:r,color:col(s.type),weight:1.5,fillOpacity:.08,dashArray:'5 4'})
    .bindTooltip(`Emprise théorique : ${s.sup} ha (cercle équivalent, r = ${Math.round(r)} m), pas le contour réel`,{sticky:true}));
  if(s.moved){
    const d=A.dist(s.prodoc,s.pos), bad=s.verif&&s.verif.statut==='faux';
    A.osmLayer.addLayer(L.polyline([s.prodoc,s.pos],{color:bad?'#ff6b5a':'#fff',weight:1.8,dashArray:'3 5',opacity:.9}));
    A.osmLayer.addLayer(L.marker(s.prodoc,{icon:L.divIcon({className:'',html:`<div class="ghost ${bad?'bad':''}">${s.id}</div>`,iconSize:[18,18],iconAnchor:[9,9]})})
      .bindTooltip(`<b>Ancien point ProDoc — site ${s.id}</b><br>${s.prodoc[0].toFixed(3)}° N, ${(-s.prodoc[1]).toFixed(3)}° O<br>tombe à : ${s.verif.rev}<br>déplacé de ${(d/1000).toFixed(2)} km`));
  }
});
A.layers.forages=L.layerGroup();
// Trois Marigots : composantes
A.layers.marigots=L.layerGroup();
(window.ATLAS_MARIGOTS||[]).forEach(g=>{
  if(g.line) A.layers.marigots.addLayer(L.polyline(g.line,{color:'#2fb7d6',weight:5,opacity:.85,lineCap:'round'}).bindTooltip('<b>'+g.nom+'</b><br>'+g.info,{sticky:true}));
  if(g.c){const ic=L.divIcon({className:'',html:'<div class="mg mg-'+g.k+'">'+g.id.slice(2).toUpperCase()+'</div>',iconSize:[20,20],iconAnchor:[10,10]});
    A.layers.marigots.addLayer(L.marker(g.c,{icon:ic}).bindPopup('<b>'+g.nom+'</b><br><span style="font-family:IBM Plex Mono;font-size:11px">'+g.c[0].toFixed(4)+'° N, '+(-g.c[1]).toFixed(4)+'° O</span><br>'+g.rev+'<br>'+g.info+(g.ha?'<br>Superficie : '+g.ha+' ha':'')+'<br><span style="color:#888;font-size:11px">Source géométrie : '+g.osm+'</span>'));}
  if(g.c && g.k==='marigot') A.layers.marigots.addLayer(L.marker(g.c,{icon:L.divIcon({className:'',html:'',iconSize:[0,0]})}).bindTooltip(g.nom.split(' (')[0],{permanent:true,direction:'right',offset:[10,0],className:'lbl lbl-site'}));
});
A.projLayer=L.layerGroup();

A.on={marigots:true,niayes:true,axes:true,footprints:true,osm:true,nitrate:false,salin:false,nappe:false,degrad:false,forages:true};
A.applyLayers=()=>{
  const want=(l,b)=>b?l.addTo(map):map.removeLayer(l);
  const proj=A.state.mode==='proj';
  want(A.layers.niayes,A.on.niayes); want(A.layers.axes,A.on.axes&&!proj);
  want(A.footprints,A.on.footprints&&!proj); want(A.osmLayer,A.on.osm&&!proj);
  Object.keys(zc).forEach(k=>want(A.layers.zones[k],A.on[k]));
  want(A.layers.forages,A.on.forages); want(A.layers.marigots,A.on.marigots); want(A.projLayer,proj); want(A.siteLayer,true);
  A.siteLayer.eachLayer(l=>l.setZIndexOffset(1000));
};
A.applyLayers();

A.zc=zc; upScale();
})();
