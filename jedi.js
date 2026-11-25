/* DinoDía · modo Jedi. Núcleo de cálculo (sirve para index, ver y evolucion) + interfaz (solo en index.html) */
(function(){
"use strict";
const CFG={nombre:"Kiro",clientId:"",evo:"evolucion.html"}; /* clientId: el ID de cliente de Google (tarea A) */
const R=[["Iniciado","#6EE7A0"],["Padawan","#4FC3F7"],["Caballero","#B388FF"],["Maestro","#FFB74D"],["Maestro Sabio","#FF8A80"],["Gran Maestro","#FFD54F"]];
const UM=[35,50,60,70,80],NS=[1,3,4,6,8];
const P=[["Habilidad","h",17.5],["Valor","v",30],["Espíritu","e",17.5],["Sabiduría","s",17.5],["Destino","d",17.5]];
const TX={
 frases:["Cada día que vuelves, la Fuerza crece.","Un paso pequeño también es un paso Jedi.","Descansar también es entrenar."],
 mide:{h:"Los días que haces deporte (hasta 4) y los minutos (hasta 150).",v:"Los días que vienes a contarme tu día (hasta 5).",e:"Los días con registro completo: ánimo y deporte, o «No he hecho deporte» (hasta 5).",s:"Las notas que escribes (hasta 5).",d:"Las semanas seguidas con al menos 3 días registrados (hasta 5)."},
 hoy:{h:"Anota tu deporte y pon los minutos al guardar el día.",v:"Guarda tu día hoy y sumas 6 puntos.",e:"Elige tu ánimo y tu deporte (o «No he hecho deporte»).",s:"Escribe una nota corta al guardar.",d:"Registra al menos 3 días esta semana."},
 sem:{h:(c)=>`Llevas ${c.dep} días con deporte y ${c.min} minutos.`,v:(c)=>`Llevas ${c.reg} de 5 días.`,e:(c)=>`Llevas ${c.comp} de 5 días completos.`,s:(c)=>`Llevas ${c.not} de 5 notas.`,d:(c,st)=>`Llevas ${st} de 5 semanas seguidas.`}
};
const pad=n=>String(n).padStart(2,"0");
const kd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const lunes=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
const fd=s=>new Date(s+"T00:00:00");

/* ---------- núcleo ---------- */
function semana(datos,J,l){
  const c={reg:0,dep:0,comp:0,not:0,min:0};
  for(let i=0;i<7;i++){
    const k=kd(add(l,i)),r=datos[k];
    if(r&&r.t>0){c.reg++;const hd=r.d&&Object.keys(r.d).length;if(hd)c.dep++;if(hd||r.nd)c.comp++;if(r.n&&String(r.n).trim())c.not++;}
    c.min+=(J.min&&J.min[k])||0;
  }
  return c;
}
function puntos(c,st){
  const m=Math.min,p={v:6*m(c.reg,5),h:2.5*m(c.dep,4)+7.5*m(c.min/150,1),e:3.5*m(c.comp,5),s:3.5*m(c.not,5),d:3.5*m(st,5)};
  p.f=Math.round(p.v+p.h+p.e+p.s+p.d);
  return p;
}
function calc(datos,J,hoy){
  J=J||{};hoy=hoy||new Date();
  const o={activo:!!J.inicio,rango:0,ok:0,asc:[],sem:{},st:0,cur:null,eq:0,mejor:0};
  const ks=Object.keys(datos).filter(x=>/^\d{4}-\d\d-\d\d$/.test(x)).sort(),h=kd(hoy);
  if(ks.length){
    for(let d=fd(ks[0]);kd(d)<=h;d=add(d,1)){
      const k=kd(d);
      if(datos[k])o.eq++;else if(k<h)o.eq=Math.max(0,o.eq-1);
      o.mejor=Math.max(o.mejor,o.eq);
    }
  }
  if(J.inicio){
    const lh=lunes(hoy);
    for(let l=lunes(fd(J.inicio));l<=lh;l=add(l,7)){
      const c=semana(datos,J,l),cerr=l<lh;
      const st=cerr?(c.reg>=3?o.st+1:Math.max(0,o.st-1)):(c.reg>=3?o.st+1:o.st);
      if(cerr)o.st=st;
      const p=puntos(c,st),w=kd(l);
      o.sem[w]={c,p,st,prov:!cerr};
      if(o.rango<5&&(cerr||o.rango===0)&&p.f>=UM[o.rango]){
        o.ok++;
        if(o.ok>=NS[o.rango]){o.rango++;o.ok=0;o.asc.push({r:o.rango,w});}
      }
      if(!cerr)o.cur={w,c,p,st};
    }
  }
  return o;
}
function tendencia(s){
  const f=Object.values(s.sem).filter(x=>!x.prov).map(x=>x.p.f);
  if(f.length<2)return["Empezando","#B8C4F0"];
  const d=f[f.length-1]-f[f.length-2];
  return d>5?["Subiendo","#8FE3B0"]:d<-5?["Semana tranquila","#B8C4F0"]:["Estable","#B8C4F0"];
}
function logros(s){
  const ws=Object.values(s.sem),n=f=>ws.some(f);
  return[["Primer paso",s.activo&&n(w=>w.c.reg>0)],["Palabra sabia",n(w=>w.c.not>0)],["Semana de valor",n(w=>w.c.reg>=5)],["Cuerpo en forma",n(w=>w.c.dep>=4)],["Padawan",s.rango>=1],["Caballero",s.rango>=2]];
}
function kiro(m,r){
  const c=R[r][1],boca=m<=1?"M158 79 q8 6 16 0":m===2?"M158 80 h16":"M158 82 q8 -6 16 0";
  return(r>=4?`<circle cx="100" cy="110" r="94" fill="${c}" opacity=".13"/>`:"")+
  `<path d="M70 70 L40 175 L130 175 L120 80Z" fill="#3949AB"/><path d="M62 128 Q20 118 8 92 Q38 100 66 112Z" fill="#3FA06B"/><ellipse cx="98" cy="128" rx="44" ry="34" fill="#4CB77F"/><ellipse cx="104" cy="140" rx="26" ry="20" fill="#B5E8C8"/><path d="M112 108 Q122 70 140 62 L150 82 Q136 92 134 116Z" fill="#4CB77F"/><ellipse cx="146" cy="68" rx="22" ry="17" fill="#4CB77F"/><ellipse cx="166" cy="74" rx="15" ry="9" fill="#4CB77F"/>`+
  (r>=2?`<path d="M64 128 Q100 152 142 124" stroke="${c}" stroke-width="6" fill="none"/>`:"")+
  (r>=3?`<path d="M124 64 Q146 34 172 54 L150 66Z" fill="#2B3A8F"/>`:"")+
  (r>=1?`<path d="M130 72 q-16 8 -12 30" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`:"")+
  (m===0?`<path d="M146 64 q6 -8 12 0" stroke="#10163A" stroke-width="3" fill="none" stroke-linecap="round"/>`:`<circle cx="152" cy="63" r="5" fill="#fff"/><circle cx="153" cy="63" r="2.5" fill="#10163A"/>`)+
  `<path d="${boca}" stroke="#10163A" stroke-width="2.5" fill="none" stroke-linecap="round"/>`+(m===4?'<path d="M150 70 q-3 8 0 10 q3 -2 0 -10Z" fill="#7ec8ff"/>':"")+
  `<path d="M82 156 L78 182 L66 184 M110 156 L112 182 L100 184" stroke="#2E7D55" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M120 128 L148 126" stroke="#3FA06B" stroke-width="7" stroke-linecap="round"/>`+
  (r>=1?`<line x1="150" y1="120" x2="176" y2="40" stroke="${c}" stroke-width="7" stroke-linecap="round" style="filter:drop-shadow(0 0 6px ${c})"/><line x1="146" y1="132" x2="152" y2="116" stroke="#9AA5C9" stroke-width="7" stroke-linecap="round"/>`:"")+
  (r>=5?`<circle cx="30" cy="40" r="3" fill="${c}"/><circle cx="170" cy="150" r="3" fill="${c}"/><circle cx="24" cy="120" r="2" fill="${c}"/>`:"");
}

/* ---------- estado (bloque "jedi" de alba.json) ---------- */
const LK="dinodia_jedi";
let J={min:{},avisos:{on:false,correo:""}};
try{J=Object.assign(J,JSON.parse(localStorage.getItem(LK)||"{}"));}catch(e){}
function cargar(j){
  if(!j)return;
  if(!J.inicio&&j.inicio)J.inicio=j.inicio;
  if(j.visto>(J.visto||0))J.visto=j.visto;
  if(j.avisoPreg)J.avisoPreg=1;
  J.min=Object.assign({},j.min||{},J.min);
  if(j.avisos&&!J.avisos.on&&!J.avisos.correo)J.avisos=j.avisos;
  try{localStorage.setItem(LK,JSON.stringify(J));}catch(e){}
}
function estado(){
  const s=calc(datos,J),sem={};
  Object.keys(s.sem).forEach(w=>{if(!s.sem[w].prov)sem[w]=s.sem[w].p.f;});
  return{v:1,inicio:J.inicio||"",visto:J.visto||0,avisoPreg:J.avisoPreg||0,min:J.min,avisos:J.avisos,rango:s.rango,semanasOk:s.ok,equilibrio:{actual:s.eq,mejor:s.mejor},semanas:sem,ascensos:s.asc};
}
window.JEDI={R,UM,NS,P,TX,calc,tendencia,logros,kiro,cargar,estado,kd,add,lunes,fd,CFG};

/* ---------- interfaz: solo en index.html ---------- */
if(typeof abrirDep!=="function"||!document.getElementById("dep"))return;
const $=id=>document.getElementById(id);
let S=calc(datos,J),minSel=0;
const sv=()=>{try{localStorage.setItem(LK,JSON.stringify(J));}catch(e){}try{pend(1);subir();}catch(e){}};
const st=document.createElement("style");
st.textContent=`body.jedi{color:#fff;background-color:#0B1330;background-image:radial-gradient(1.5px 1.5px at 20px 30px,#fff,transparent),radial-gradient(1px 1px at 90px 80px,#cfe3ff,transparent),radial-gradient(ellipse at 50% 0%,#24378A,#0B1330 70%);background-size:140px 120px,170px 150px,100% 100%;background-attachment:fixed}
.jedi h1,.jedi h2{color:#fff}.jedi .sub,.jedi .nube{color:#B8C4F0}.jedi .burbuja,.jedi .tarjeta,.jedi .dato,.jedi .dsem,.jedi .cel{color:#2d4a3e}
.jv{position:fixed;inset:0;background:rgba(5,8,25,.82);display:flex;align-items:center;justify-content:center;z-index:55}
.jc{background:#0B1330;border:2px solid var(--jc,#4FC3F7);color:#fff;border-radius:20px;padding:18px;width:92%;max-width:380px;max-height:92vh;overflow:auto;text-align:left;font-size:15px;line-height:1.4}
.jc h3{margin:0 0 6px;font-size:20px}.jc p{margin:6px 0}.jm{color:#B8C4F0;font-size:13px}
.jb{min-height:48px;border-radius:14px;border:2px solid #4FC3F7;background:#4FC3F7;color:#0B1330;font-weight:bold;font-size:16px;padding:0 18px;font-family:inherit;width:100%;margin-top:10px}.jb.s{background:transparent;color:#fff}
.jbar{height:10px;border-radius:99px;background:#16224F;overflow:hidden;margin:4px 0 2px}.jbar i{display:block;height:100%;background:var(--jc,#4FC3F7);border-radius:99px}
.jrow{display:block;width:100%;background:none;border:0;color:#fff;text-align:left;padding:6px 0;font-family:inherit;font-size:15px;font-weight:bold}.jrow span{float:right;color:#B8C4F0}
.jbox{background:#16224F;border:2px solid #3A4C99;border-radius:14px;padding:10px 12px;margin:8px 0}
.jch{display:inline-block;background:#16224F;border:2px solid #3A4C99;border-radius:99px;padding:5px 11px;margin:3px 3px 0 0;font-size:13px}.jch.ok{border-color:#8FE3B0}
#jmail{width:100%;min-height:46px;border-radius:12px;border:2px solid #3A4C99;background:#16224F;color:#fff;padding:0 12px;font-size:16px;box-sizing:border-box;margin-top:8px}`;
document.head.appendChild(st);

function modal(html,col,fin){
  const v=document.createElement("div");v.className="jv";
  v.innerHTML='<div class="jc" style="--jc:'+(col||R[S.rango][1])+'">'+html+'</div>';
  v.cerrar=()=>{v.remove();if(fin)fin();};
  document.body.appendChild(v);
  return v;
}
function gsi(cb){
  if(!CFG.clientId)return;
  const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";
  s.onload=()=>{google.accounts.id.initialize({client_id:CFG.clientId,callback:r=>{try{cb(JSON.parse(atob(r.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))).email);}catch(e){}}});
    google.accounts.id.renderButton($("jg"),{theme:"filled_blue",size:"large",text:"continue_with",locale:"es"});};
  document.head.appendChild(s);
}
function activar(correo,v){
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo))return;
  J.avisos={on:true,correo:correo};J.avisoPreg=1;sv();v.cerrar();
  if(window.aviso)aviso("¡Avisos activados! "+CFG.nombre+" te avisará a las 20:00.");
}
function pedirAvisos(){
  const v=modal(`<h3>Avisos de ${CFG.nombre}</h3><p>¿Quieres que ${CFG.nombre} te avise a las 20:00 si aún no has rellenado tu día? Solo ese aviso, y puedes quitarlo cuando quieras.</p>
  <div id="jg" style="margin:10px 0"></div><p class="jm">O escribe tu correo:</p><input id="jmail" type="email" inputmode="email" placeholder="tucorreo@gmail.com">
  <button class="jb" id="jok">Activar avisos</button><button class="jb s" id="jno">Ahora no</button>
  <p class="jm">El primer correo puede ir a spam: márcalo como «no es spam».</p>`);
  gsi(e=>activar(e,v));
  $("jok").onclick=()=>activar($("jmail").value.trim(),v);
  $("jno").onclick=()=>{J.avisoPreg=1;sv();v.cerrar();};
}
function celebra(r){
  const v=modal(`<div style="text-align:center"><svg viewBox="0 0 200 200" width="170" height="170">${kiro(0,r)}</svg><h3>¡Ahora eres ${R[r][0]}!</h3><p>${CFG.nombre} está muy orgulloso de ti.</p></div><button class="jb" id="jok">¡Genial!</button>`,R[r][1],()=>{if(r>=1&&!J.avisoPreg&&!J.avisos.on)pedirAvisos();});
  $("jok").onclick=()=>v.cerrar();
}
function invitacion(){
  const v=modal(`<div style="text-align:center"><svg viewBox="0 0 200 200" width="170" height="170">${kiro(1,0)}</svg></div><h3>${CFG.nombre} te invita</h3><p>Camina conmigo por el sendero Jedi: cada día que me cuentes cómo estás y te muevas, tu Fuerza crece y subes de rango.</p><button class="jb" id="jok">Quiero empezar</button><button class="jb s" id="jno">Ahora no</button>`);
  $("jok").onclick=()=>{J.inicio=kd(new Date());sv();v.cerrar();pintar();};
  $("jno").onclick=()=>{try{sessionStorage.setItem("jinv","1");}catch(e){}v.cerrar();};
}
function info(k){
  const p=P.find(x=>x[1]===k),cu=S.cur||{c:{reg:0,dep:0,comp:0,not:0,min:0},st:0};
  const v=modal(`<h3>${p[0]}</h3><div class="jbox"><b>Qué mide</b><br>${TX.mide[k]}</div><div class="jbox"><b>Tu semana</b><br>${TX.sem[k](cu.c,cu.st)}</div><div class="jbox"><b>Cómo subirla hoy</b><br>${TX.hoy[k]}</div><button class="jb" id="jok">Entendido</button>`);
  $("jok").onclick=()=>v.cerrar();
}
function panel(){
  const r=S.rango,cu=S.cur||{c:{},p:{f:0,v:0,h:0,e:0,s:0,d:0},st:0},t=tendencia(S);
  const pct=r<5?Math.round(Math.min(1,(S.ok+Math.min(cu.p.f/UM[r],1))/NS[r])*100):100;
  const sig=r<5?`Siguiente: ${R[r+1][0]} · Fuerza ${UM[r]} o más en ${NS[r]} semana${NS[r]>1?"s":""} (llevas ${S.ok})`:"Has llegado a lo más alto.";
  const filas=P.map(p=>`<button class="jrow" data-k="${p[1]}">${p[0]}<span>${Math.round(cu.p[p[1]]*10)/10} / ${p[2]} · ¿cómo subir?</span></button><div class="jbar"><i style="width:${Math.round(cu.p[p[1]]/p[2]*100)}%"></i></div>`).join("");
  const lg=logros(S).map(l=>`<span class="jch${l[1]?" ok":""}">${l[1]?"✓ ":"? "}${l[0]}</span>`).join("");
  const av=J.avisos.on?`<b>Avisos de ${CFG.nombre} a las 20:00</b><br><span class="jm">Activados. Solo si aún no has rellenado.</span><button class="jb s" id="jav">Desactivar avisos</button>`:`<b>Avisos de ${CFG.nombre} a las 20:00</b><br><span class="jm">Apagados.</span><button class="jb s" id="jav">Activar avisos</button>`;
  const v=modal(`<h3>Panel Jedi</h3><div class="jbox"><b style="font-size:20px">${R[r][0]}</b><div class="jbar"><i style="width:${pct}%"></i></div><span class="jm">${sig}</span></div>
  <div style="display:flex;gap:8px"><div class="jbox" style="flex:1"><span class="jm">FUERZA DE LA SEMANA</span><br><b style="font-size:28px">${cu.p.f}</b> / 100<br><span style="color:${t[1]};font-weight:bold">${t[0]}</span></div><div class="jbox" style="flex:1"><span class="jm">EQUILIBRIO</span><br><b style="font-size:28px">${S.eq}</b> días<br><span class="jm">Mejor: ${S.mejor}</span></div></div>
  <b>Pruebas</b>${filas}<div class="jbox">${av}</div><b>Códice</b><div>${lg}</div><p class="jm" style="margin-top:10px">«${TX.frases[new Date().getDate()%TX.frases.length]}» — ${CFG.nombre}</p>
  <a class="jb" style="display:block;text-align:center;line-height:44px;text-decoration:none;box-sizing:border-box" href="${CFG.evo}${(function(){try{const t=localStorage.getItem("dinodia_tk");return t?"#t="+t:"";}catch(e){return"";}})()}">Ver mi evolución</a><button class="jb s" id="jcl">Cerrar</button>`);
  v.querySelectorAll(".jrow").forEach(b=>b.onclick=()=>info(b.dataset.k));
  $("jcl").onclick=()=>v.cerrar();
  $("jav").onclick=()=>{if(J.avisos.on){J.avisos={on:false,correo:""};sv();v.cerrar();panel();}else{v.cerrar();pedirAvisos();}};
}
function pm(){
  let d=$("jmin");
  if(!d){d=document.createElement("div");d.id="jmin";d.style.margin="8px 0 10px";$("nota").parentNode.insertBefore(d,$("nota"));}
  d.innerHTML='<p class="ayuda">⏱️ Minutos de deporte (opcional)</p><div style="display:flex;gap:6px">'+[15,30,45,60].map(n=>`<button class="fr${minSel===n?" on":""}" style="flex:1;width:auto" data-m="${n}">${n}</button>`).join("")+"</div>";
  d.querySelectorAll("button").forEach(b=>b.onclick=()=>{const n=+b.dataset.m;minSel=minSel===n?0:n;pm();});
}
function post(){
  document.body.classList.toggle("jedi",!!J.inicio);
  const m=$("msg");
  if(m)m.textContent=datos[kd(new Date())]?m.textContent.replace(/Rexi/g,CFG.nombre):"Hoy aún no me has contado tu día. ¿Lo anotamos?";
  if(J.inicio){
    let b=$("jbtn");
    if(!b){b=document.createElement("button");b.id="jbtn";b.className="btncal";b.style.cssText="background:#16224F;color:#fff;border-color:#4FC3F7;margin:12px auto 0";const rc=document.querySelector(".racha");rc.parentNode.insertBefore(b,rc.nextSibling);b.onclick=panel;}
    b.textContent="⚔️ Panel Jedi · "+R[S.rango][0];
  }else if(!sessionStorage.getItem("jinv")&&!document.querySelector(".jv"))setTimeout(()=>{if(!J.inicio&&!sessionStorage.getItem("jinv")&&!document.querySelector(".jv"))invitacion();},600);
}
const _pt=window.pintar,_ab=window.abrirDep;
window.pintar=function(){
  S=calc(datos,J);
  if(J.inicio&&S.rango>(J.visto||0)){const r=S.rango;J.visto=r;sv();setTimeout(()=>celebra(r),500);}
  _pt();post();
};
window.abrirDep=function(a){_ab(a);minSel=J.min[kd(new Date())]||0;pm();};
window.rexi=m=>kiro(m,S.rango);
JEDI.alGuardar=function(){
  const h=kd(new Date());
  if(minSel)J.min[h]=minSel;else delete J.min[h];
  try{localStorage.setItem(LK,JSON.stringify(J));}catch(e){}
};
/* sincronización: añade el bloque "jedi" al guardar y lo lee al bajar (sin tocar el código de index.html) */
const b64j=s=>btoa(unescape(encodeURIComponent(s))),deb64j=s=>decodeURIComponent(escape(atob(s.replace(/\n/g,""))));
const _f=window.fetch;
window.fetch=async function(u,o){
  if(typeof u==="string"&&u.indexOf("dinodia-datos")>-1){
    if(o&&o.method==="PUT"){
      try{const b=JSON.parse(o.body),d=JSON.parse(deb64j(b.content));d.jedi=estado();b.content=b64j(JSON.stringify(d,null,1));o=Object.assign({},o,{body:JSON.stringify(b)});}catch(e){}
    }
    const r=await _f.call(this,u,o);
    if(!o||!o.method||o.method==="GET"){try{const j=await r.clone().json();cargar(JSON.parse(deb64j(j.content)).jedi);}catch(e){}}
    return r;
  }
  return _f.call(this,u,o);
};
const bar=document.querySelector(".barra");
if(bar)bar.addEventListener("click",e=>{if(e.target.id==="listo")JEDI.alGuardar();},true);
window.pintar();
})();
