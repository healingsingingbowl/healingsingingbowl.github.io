/*! © 2026 @bunt.0_0 (Instagram) · 힐링 싱잉볼 · All rights reserved. */
(function(){
"use strict";
var $=function(id){return document.getElementById(id)};
if(!window.THREE){$("note").hidden=false;$("note").textContent="3D 화면을 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.";return}
var T=THREE;

/* ============ bowls ============ */
var BOWLS=[
 {id:"dawn",name:"새벽",spec:"티베트 황동 싱잉볼 · 174Hz · 새벽 6시",cushion:"lotus",
  profile:[[0,0],[.42,0],[.64,.025],[.84,.1],[.98,.23],[1.06,.38],[1.09,.5],[1.085,.585],[1.065,.615],[1.035,.6],[1.03,.52],[.995,.38],[.9,.25],[.74,.14],[.5,.08],[0,.065]],
  f0:174.6,attack:.012,noise:.22,knock:6,sing:1,
  partials:[[1,1,19,1.1],[2.76,.42,12,1.9],[5.40,.18,6.5,2.7],[8.93,.07,3.6,3.5]],
  mallet:{head:0x5c3d2a,len:.34,r:.088,wood:0x9a6538},
  light:{sun:"#ffc2b4",at:[-7.5,1.5,2.2],sunI:.85,sky:"#93a9dc",ground:"#56596f",hemiI:.95,fill:"#7f9bdb",fillI:.48,room:"#c3cde3",exp:.95,out:"#cfc9c4",backI:.45}},
 {id:"clear",name:"맑음",spec:"크리스탈 싱잉볼 · 264Hz · 오전 10시",cushion:"plain",
  profile:[[0,0],[.7,0],[.86,.02],[.95,.08],[.985,.24],[1,.55],[1.003,.84],[.99,.87],[.968,.86],[.966,.55],[.95,.25],[.9,.11],[.74,.07],[0,.07]],
  f0:264,attack:.16,noise:.04,knock:8,sing:1.25,
  partials:[[1,1,23,.55],[2.0,.09,13,.9],[3.0,.035,7,1.3]],
  mallet:{head:0xe9e4da,len:.3,r:.095,wood:0xd9cbb2},
  light:{sun:"#fff7ea",at:[-3,8.5,4.5],sunI:2.8,sky:"#e9f0fb",ground:"#b8a894",hemiI:.7,fill:"#e4ecff",fillI:.4,room:"#ece9e2",exp:1.1,out:"#ffffff",backI:.9}},
 {id:"forest",name:"숲",spec:"청자 싱잉볼 · 396Hz · 오후 5시 30분",cushion:"ditsy",
  profile:[[0,0],[.3,0],[.33,.045],[.37,.075],[.56,.13],[.8,.26],[.96,.44],[1.03,.58],[1.045,.655],[1.03,.685],[1.0,.67],[.99,.6],[.92,.45],[.75,.28],[.5,.165],[0,.13]],
  f0:396,attack:.008,noise:.26,knock:4,sing:.85,
  partials:[[1,1,12,1.6],[2.71,.5,7.5,2.4],[5.18,.22,4.2,3.1],[8.4,.08,2.4,4.1]],
  mallet:{head:0x3c4a3f,len:.3,r:.08,wood:0x7a5130},
  light:{sun:"#ff8a32",at:[-7,2.4,1],sunI:2.8,sky:"#ffbd80",ground:"#8c4a22",hemiI:.55,fill:"#ff7a38",fillI:.36,room:"#f0c497",exp:1.0,out:"#e2f0da",backI:.7}}
];
var TEXT={idle:"막대를 끌어서 종을 쳐 보세요",idleSub:"테두리를 천천히 문지르면 종이 길게 노래해요",
  think:"오늘 꼭 해낼 한 가지를 떠올려 보세요",rest:"눈을 감고, 숨을 천천히 따라가세요",
  done:"준비됐어요. 좋은 하루 되세요",doneSub:"다시 하려면 종을 쳐 주세요"};
var TOTAL=30,THINK=10;
var DURS=[30,60,180,300];
function thinkFor(t){return t<=30?10:t<=60?15:t<=180?30:45}

/* ============ renderer & scene ============ */
var canvas=$("scene");
var renderer;
try{renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:"high-performance"})}
catch(e){$("note").hidden=false;$("note").textContent="이 기기에서는 3D 화면을 띄울 수 없어요. 다른 브라우저로 열어 주세요.";return}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputEncoding=T.sRGBEncoding;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
var maxAniso=renderer.capabilities.getMaxAnisotropy();

var scene=new T.Scene();
var ROOM=new T.Color("#ece4d8");
scene.background=ROOM;scene.fog=new T.Fog(ROOM,10,26);
var camera=new T.PerspectiveCamera(30,1,.1,80);
var target=new T.Vector3(0,.55,0);

/* ---- canvas texture helpers ---- */
function cv(w,h){var c=document.createElement("canvas");c.width=w;c.height=h;return c}
function rnd(a,b){return a+Math.random()*(b-a)}
function tex(c,srgb,rep){var t=new T.CanvasTexture(c);if(srgb)t.encoding=T.sRGBEncoding;t.anisotropy=maxAniso;
  if(rep){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t}
function soft(ctx,W,blur,color,draw){ctx.save();ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.shadowOffsetX=W*3;ctx.translate(-W*3,0);ctx.fillStyle="#000";draw();ctx.restore()}

/* wood floor */
function woodTex(){
  /* dark walnut planks with fine grain, a few knots and tight seams */
  var S=2048,c=cv(S,S),x=c.getContext("2d"),n=7,pw=S/n;
  for(var p=0;p<n;p++){
    var cuts=[0,rnd(.25,.75)*S,S];
    for(var q=0;q<2;q++){
      var base=[rnd(46,60),rnd(26,34),rnd(16,22)],y0=cuts[q],y1=cuts[q+1];
      var g=x.createLinearGradient(p*pw,0,(p+1)*pw,0);
      g.addColorStop(0,"rgb("+(base[0]-6|0)+","+(base[1]-4|0)+","+(base[2]-3|0)+")");
      g.addColorStop(.5,"rgb("+(base[0]+8|0)+","+(base[1]+5|0)+","+(base[2]+3|0)+")");
      g.addColorStop(1,"rgb("+(base[0]-4|0)+","+(base[1]-3|0)+","+(base[2]-2|0)+")");
      x.fillStyle=g;x.fillRect(p*pw,y0,pw,y1-y0);
      x.save();x.beginPath();x.rect(p*pw,y0,pw,y1-y0);x.clip();
      for(var k=0;k<110;k++){
        var gx=p*pw+rnd(0,pw),dark=Math.random()<.7;
        x.strokeStyle=dark?"rgba(28,14,6,"+rnd(.08,.22)+")":"rgba(128,82,50,"+rnd(.04,.1)+")";x.lineWidth=rnd(.6,2.6);
        x.beginPath();var amp=rnd(2,9),fr=rnd(.0015,.006),ph=rnd(0,6);
        for(var yy=y0;yy<=y1;yy+=12){var xx=gx+Math.sin(yy*fr+ph)*amp;if(yy===y0)x.moveTo(xx,yy);else x.lineTo(xx,yy)}
        x.stroke();
      }
      if(Math.random()<.4){var kx=p*pw+rnd(30,pw-30),ky=rnd(y0+60,y1-60);
        for(var r=4;r<40;r+=5){x.strokeStyle="rgba(30,15,6,"+(.25-r/200)+")";x.lineWidth=1.4;x.beginPath();x.ellipse(kx,ky,r*.55,r*1.6,0,0,7);x.stroke()}}
      x.restore();
      x.fillStyle="rgba(18,9,4,.6)";x.fillRect(p*pw,y0,pw,2);
    }
    x.fillStyle="rgba(18,9,4,.65)";x.fillRect(p*pw,0,3,S);
  }
  return tex(c,true,[3,3]);
}
/* plaster wall with morning window light and leaf shadows */
function wallTex(){
  var W=2048,H=1024,c=cv(W,H),x=c.getContext("2d");
  x.fillStyle="#ebe2d5";x.fillRect(0,0,W,H);
  var img=x.getImageData(0,0,W,H),d=img.data;
  for(var i=0;i<d.length;i+=4){var n=(Math.random()-.5)*7;d[i]+=n;d[i+1]+=n;d[i+2]+=n}
  x.putImageData(img,0,0);
  function pane(px){x.beginPath();x.moveTo(px,140);x.lineTo(px+260,110);x.lineTo(px+300,620);x.lineTo(px+40,660);x.closePath();x.fill()}
  soft(x,W,60,"rgba(255,246,226,.85)",function(){pane(560);pane(880)});
  soft(x,W,40,"rgba(255,248,232,.55)",function(){pane(560);pane(880)});
  soft(x,W,26,"rgba(120,100,70,.10)",function(){
    for(var k=0;k<46;k++){x.save();x.translate(rnd(520,1240),rnd(90,520));x.rotate(rnd(-1.4,.4));
      x.beginPath();x.ellipse(0,0,rnd(18,42),rnd(6,12),0,0,Math.PI*2);x.fill();x.restore()}
    x.fillRect(840,100,10,600);
  });
  x.fillStyle="rgba(120,96,70,.18)";x.fillRect(0,H-26,W,26);
  return tex(c,true);
}
function fabricTex(col){
  var S=256,c=cv(S,S),x=c.getContext("2d");x.fillStyle=col;x.fillRect(0,0,S,S);
  for(var i=0;i<S;i+=2){x.fillStyle="rgba(255,255,255,"+rnd(0,.05)+")";x.fillRect(0,i,S,1);x.fillStyle="rgba(0,0,0,"+rnd(0,.06)+")";x.fillRect(i,0,1,S)}
  return tex(c,true,[6,3]);
}
function hammerBump(){
  var S=1024,c=cv(S,S),x=c.getContext("2d");x.fillStyle="#808080";x.fillRect(0,0,S,S);
  for(var i=0;i<1600;i++){var px=rnd(0,S),py=rnd(0,S),r=rnd(8,22),g=x.createRadialGradient(px,py,0,px,py,r);
    g.addColorStop(0,"rgba(40,40,40,.5)");g.addColorStop(.7,"rgba(128,128,128,.15)");g.addColorStop(1,"rgba(200,200,200,0)");
    x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill()}
  var t=tex(c,false);t.wrapS=T.RepeatWrapping;return t;
}
function surfaceTex(kind,vRim){
  var S=1024,c=cv(S,S),x=c.getContext("2d"),y;
  if(kind==="dawn"){
    var g=x.createLinearGradient(0,0,0,S);g.addColorStop(0,"#9c7436");g.addColorStop(.5,"#caa060");g.addColorStop(1,"#a77d3d");
    x.fillStyle=g;x.fillRect(0,0,S,S);
    for(var i=0;i<900;i++){x.fillStyle="rgba("+(Math.random()<.5?"70,45,15":"240,210,150")+","+rnd(.03,.09)+")";x.fillRect(rnd(0,S),rnd(0,S),rnd(4,30),rnd(1,3))}
    y=vRim*S;x.fillStyle="rgba(60,38,12,.55)";[-.05,-.065,-.12].forEach(function(o){x.fillRect(0,y+o*S,S,o===-.12?5:3)});
    y=(1-vRim)*S; // inner side rings (mapped in second half)
    x.fillStyle="rgba(60,38,12,.35)";x.fillRect(0,vRim*S+.07*S,S,3);
  }else if(kind==="clear"){
    x.fillStyle="#f4f2ed";x.fillRect(0,0,S,S);
    for(var j=0;j<6000;j++){x.fillStyle="rgba(255,255,255,"+rnd(.1,.4)+")";x.fillRect(rnd(0,S),rnd(0,S),2,2)}
    for(var k=0;k<3000;k++){x.fillStyle="rgba(200,195,185,"+rnd(.05,.2)+")";x.fillRect(rnd(0,S),rnd(0,S),2,2)}
  }else{
    var g2=x.createLinearGradient(0,0,0,S);g2.addColorStop(0,"#9ab9a3");g2.addColorStop(.55,"#adc8b4");g2.addColorStop(1,"#97b6a0");
    x.fillStyle=g2;x.fillRect(0,0,S,S);
    x.fillStyle="#cdb796";x.fillRect(0,0,S,S*.09); // unglazed foot ring
    x.strokeStyle="rgba(70,90,75,.16)";x.lineWidth=1;
    for(var m=0;m<140;m++){x.beginPath();var cx=rnd(0,S),cy=rnd(S*.1,S);x.moveTo(cx,cy);for(var s=0;s<5;s++){cx+=rnd(-40,40);cy+=rnd(-40,40);x.lineTo(cx,cy)}x.stroke()}
  }
  return tex(c,true);
}

/* environment for reflections: a warm room with a bright window */
(function(){
  var es=new T.Scene();
  es.add(new T.Mesh(new T.BoxGeometry(20,10,20),new T.MeshBasicMaterial({color:0x9c8a76,side:T.BackSide})));
  var floor=new T.Mesh(new T.PlaneGeometry(20,20),new T.MeshBasicMaterial({color:0x7a5a3c}));floor.rotation.x=-Math.PI/2;floor.position.y=-4.9;es.add(floor);
  var win=new T.Mesh(new T.PlaneGeometry(7,5),new T.MeshBasicMaterial({color:0xfff2dc}));win.position.set(-9.9,1,0);win.rotation.y=Math.PI/2;es.add(win);
  var box=new T.Mesh(new T.PlaneGeometry(8,8),new T.MeshBasicMaterial({color:0xfffaf0}));box.position.set(0,4.9,0);box.rotation.x=Math.PI/2;es.add(box);
  var side=new T.Mesh(new T.PlaneGeometry(6,3),new T.MeshBasicMaterial({color:0xd8c8b2}));side.position.set(9.9,0,2);side.rotation.y=-Math.PI/2;es.add(side);
  var pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(es,.04).texture;pm.dispose();
})();

/* lights */
var hemi=new T.HemisphereLight(0xfff4e6,0xa58664,.55);scene.add(hemi);
var sun=new T.DirectionalLight(0xfff0d8,2.3);sun.position.set(-5.5,7,4.5);sun.castShadow=true;
sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-4;sun.shadow.camera.right=4;sun.shadow.camera.top=4;sun.shadow.camera.bottom=-4;
sun.shadow.camera.near=1;sun.shadow.camera.far=20;sun.shadow.radius=6;sun.shadow.bias=-.0006;scene.add(sun);
var fill=new T.DirectionalLight(0xffe2c4,.35);fill.position.set(5,3,6);scene.add(fill);

/* room */
var floor=new T.Mesh(new T.PlaneGeometry(40,40),new T.MeshPhysicalMaterial({map:woodTex(),roughness:.42,metalness:0,clearcoat:.55,clearcoatRoughness:.22}));
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
var wall=new T.Mesh(new T.PlaneGeometry(36,18),new T.MeshStandardMaterial({map:wallTex(),roughness:.95}));
wall.position.set(0,9,-7);wall.receiveShadow=true;scene.add(wall);



/* props: cork blocks */
var block=new T.Mesh(new T.BoxGeometry(1.1,.42,.7),new T.MeshStandardMaterial({color:0xc9a57a,roughness:.85}));
block.position.set(3.2,.21,-3.2);block.rotation.y=-.4;block.castShadow=block.receiveShadow=true;scene.add(block);
var block2=block.clone();block2.position.set(3.3,.63,-3.15);block2.rotation.y=-.25;scene.add(block2);

/* cushion */
function lathe(pts,seg){return new T.LatheGeometry(pts.map(function(p){return new T.Vector2(p[0],p[1])}),seg||96)}
/* plum-burgundy cushion; its embroidery changes with the bowl: lotus band, plain, or a scatter of tiny flowers */
var cushionTex={},cushion=(function(){
  var prof=[[0,0],[.9,0],[1.22,.04],[1.4,.15],[1.42,.24],[1.32,.33],[1.05,.38],[.7,.35],[0,.33]].map(function(p){return new T.Vector2(p[0],p[1])});
  var curve=new T.SplineCurve(prof),N=120,pts=curve.getSpacedPoints(N),L=curve.getLength();
  var side=0;pts.forEach(function(p,i){if(p.x>pts[side].x)side=i});
  var W=2048,H=1024,uy=H/L,cy=(1-side/N)*H;
  function base(){
    var c=cv(W,H),x=c.getContext("2d"),bc=cv(W,H),bx=bc.getContext("2d");
    x.fillStyle="#3a1128";x.fillRect(0,0,W,H);bx.fillStyle="#808080";bx.fillRect(0,0,W,H);
    for(var i=0;i<H;i+=3){x.fillStyle="rgba(255,220,230,"+rnd(0,.035)+")";x.fillRect(0,i,W,1)}
    for(i=0;i<W;i+=3){x.fillStyle="rgba(15,0,8,"+rnd(0,.06)+")";x.fillRect(i,0,1,H)}
    return {c:c,x:x,bc:bc,bx:bx};
  }
  function done(o){return {map:tex(o.c,true),bump:tex(o.bc,false)}}
  /* lotus band */
  (function(){
    var o=base(),ux=W/(2*Math.PI*1.4);
    function both(fn){fn(o.x,false);fn(o.bx,true)}
    function stitchLine(yu){both(function(g,b){g.strokeStyle=b?"#d0d0d0":"#e9cf9f";g.lineWidth=3;g.setLineDash([14,10]);g.beginPath();g.moveTo(0,cy+yu*uy);g.lineTo(W,cy+yu*uy);g.stroke();g.setLineDash([])})}
    stitchLine(-.2);stitchLine(.2);
    var count=12,step=W/count;
    for(var m=0;m<count;m++){var mx=step*(m+.5);
      both(function(g,b){
        g.save();g.translate(mx,cy);g.scale(ux*2.3,uy*2.3);
        g.fillStyle=b?"#c8c8c8":"#8fae84";
        [-1,1].forEach(function(sg){g.save();g.rotate(sg*1.15);g.beginPath();g.ellipse(0,.035,.012,.032,0,0,7);g.fill();g.restore()});
        g.lineWidth=.004;g.strokeStyle=b?"#e0e0e0":"#f6e6c8";
        [[-.75,"#e9a0a6"],[.75,"#e9a0a6"],[-.38,"#f2b9b8"],[.38,"#f2b9b8"],[0,"#f7cfc8"]].forEach(function(pt){
          g.save();g.rotate(pt[0]);g.beginPath();g.ellipse(0,-.032,.016,.036,0,0,7);g.fillStyle=b?"#d8d8d8":pt[1];g.fill();g.stroke();g.restore()});
        g.fillStyle=b?"#f0f0f0":"#e0b04f";g.beginPath();g.arc(0,.004,.008,0,7);g.fill();g.restore();
        g.save();g.translate(mx+step/2,cy);g.scale(ux*2.3,uy*2.3);g.fillStyle=b?"#e0e0e0":"#e0b04f";
        [[0,-.025],[-.012,.012],[.012,.012]].forEach(function(d){g.beginPath();g.arc(d[0],d[1],.0045,0,7);g.fill()});g.restore();
      });
    }
    cushionTex.lotus=done(o);
  })();
  /* plain */
  cushionTex.plain=done(base());
  /* tiny scattered flowers over the whole cushion */
  (function(){
    var o=base(),cols=["#c9919e","#d8c3a6","#a994bd","#c9a08c"];
    for(var arc=.06;arc<L;arc+=.15){
      var idx=Math.min(N,Math.round(arc/L*N)),r=pts[idx].x;if(r<.35)continue;
      var y=(1-idx/N)*H,n=Math.floor(2*Math.PI*r/.2),ux=W/(2*Math.PI*r),off=rnd(0,1);
      for(var k=0;k<n;k++){
        var x0=((k+off+rnd(-.25,.25))/n)*W,y0=y+rnd(-.02,.02)*uy,col=cols[Math.floor(Math.random()*cols.length)],rot=rnd(0,6.3);
        [[o.x,false],[o.bx,true]].forEach(function(pair){var g=pair[0],b=pair[1];
          g.save();g.translate(x0,y0);g.scale(ux*.95,uy*.95);g.rotate(rot);g.globalAlpha=b?.5:.38;
          if(Math.random()<.2){g.fillStyle=b?"#a0a0a0":"#6f8a66";g.beginPath();g.ellipse(.024,.006,.011,.005,.5,0,7);g.fill()}
          g.fillStyle=b?"#d8d8d8":col;
          for(var q=0;q<5;q++){var an=q/5*Math.PI*2;g.beginPath();g.arc(Math.cos(an)*.012,Math.sin(an)*.012,.008,0,7);g.fill()}
          g.fillStyle=b?"#f0f0f0":"#e3b453";g.beginPath();g.arc(0,0,.005,0,7);g.fill();g.restore();
        });
      }
    }
    cushionTex.ditsy=done(o);
  })();
  return new T.Mesh(new T.LatheGeometry(pts,128),new T.MeshStandardMaterial({map:cushionTex.lotus.map,bumpMap:cushionTex.lotus.bump,bumpScale:.012,roughness:.9,side:T.DoubleSide}));
})();
function dressCushion(b){var t=cushionTex[b.cushion]||cushionTex.plain;cushion.material.map=t.map;cushion.material.bumpMap=t.bump;cushion.material.needsUpdate=true}
cushion.castShadow=cushion.receiveShadow=true;scene.add(cushion);

/* bowls */
var hammer=hammerBump();
function buildBowl(b){
  var pts=b.profile.map(function(p){return new T.Vector2(p[0],p[1])});
  var curve=new T.SplineCurve(pts),sm=curve.getPoints(150);
  var top=0,rimY=0;sm.forEach(function(p,i){if(p.y>rimY){rimY=p.y;top=i}});
  var geo=new T.LatheGeometry(sm,128);
  var m;
  if(b.id==="dawn")m=new T.MeshStandardMaterial({map:surfaceTex("dawn",top/150),metalness:1,roughness:.3,bumpMap:hammer,bumpScale:.02,side:T.DoubleSide,envMapIntensity:1.25});
  else if(b.id==="clear")m=new T.MeshPhysicalMaterial({map:surfaceTex("clear"),roughness:.48,metalness:0,clearcoat:.35,clearcoatRoughness:.4,side:T.DoubleSide});
  else m=new T.MeshPhysicalMaterial({map:surfaceTex("forest"),roughness:.18,metalness:0,clearcoat:1,clearcoatRoughness:.06,side:T.DoubleSide,envMapIntensity:1.1});
  var mesh=new T.Mesh(geo,m);mesh.castShadow=true;mesh.receiveShadow=true;
  var g=new T.Group();g.add(mesh);g.position.y=.355;g.userData={mesh:mesh,rimY:rimY};g.visible=false;scene.add(g);
  return g;
}
var bowlObjs=BOWLS.map(buildBowl);

/* mallet */
var mallet=new T.Group(),malletHead,malletWood;
(function(){
  malletWood=new T.Mesh(new T.CylinderGeometry(.045,.052,1.55,32),new T.MeshStandardMaterial({color:0x9a6538,roughness:.5}));
  malletWood.position.y=.93;malletHead=new T.Mesh(new T.CylinderGeometry(.088,.088,.34,40),new T.MeshStandardMaterial({color:0x5c3d2a,roughness:1}));
  var cap=new T.Mesh(new T.SphereGeometry(.088,32,16,0,Math.PI*2,0,Math.PI/2),malletHead.material);cap.position.y=-.17;cap.rotation.x=Math.PI;
  malletHead.add(cap);
  [malletWood,malletHead,cap].forEach(function(o){o.castShadow=true});
  mallet.add(malletWood);mallet.add(malletHead);scene.add(mallet);
})();
function styleMallet(b){
  malletHead.material.color.setHex(b.mallet.head);malletWood.material.color.setHex(b.mallet.wood);
  malletHead.scale.set(b.mallet.r/.088,b.mallet.len/.34,b.mallet.r/.088);
}
var UP=new T.Vector3(0,1,0);
var REST={pos:new T.Vector3(),dir:new T.Vector3()};
function setRest(b){
  REST.pos.set(.95,.09,1.3);REST.dir.set(.55,0,-.83).normalize();
}
setRest(BOWLS[0]);
var HOLD_DIR=new T.Vector3(.55,.78,.32).normalize();
var m={pos:REST.pos.clone(),q:new T.Quaternion().setFromUnitVectors(UP,REST.dir),tPos:REST.pos.clone(),tDir:REST.dir.clone()};
mallet.position.copy(m.pos);mallet.quaternion.copy(m.q);

/* ============ camera framing (portrait phone vs landscape PC) ============ */
var reels=false;
function frame(){
  reels=location.hash==="#reels";document.body.classList.toggle("reels",reels);
  var W=window.innerWidth,H=window.innerHeight,w=W,h=H;
  if(reels){h=H;w=Math.round(H*9/16);if(w>W){w=W;h=Math.round(W*16/9)}}
  var st=document.documentElement.style;st.setProperty("--boxw",w+"px");st.setProperty("--boxh",h+"px");
  st.setProperty("--boxl",Math.round((W-w)/2)+"px");st.setProperty("--boxt",Math.round((H-h)/2)+"px");
  var a=w/h;renderer.setSize(w,h,false);camera.aspect=a;
  var portrait=a<1;camera.fov=portrait?34:28;camera.clearViewOffset();camera.updateProjectionMatrix();
  var vh=Math.tan(T.MathUtils.degToRad(camera.fov/2)),hh=vh*a;
  var needW=portrait?3.3:4.8,needH=3.1;
  var d=Math.max((needW/2)/hh,(needH/2)/vh);
  target.set(0,portrait?.05:.3,0);
  var dir=new T.Vector3(0,portrait?.62:.5,1).normalize();
  camera.position.copy(target).addScaledVector(dir,d);camera.lookAt(target);
}
window.addEventListener("resize",frame);window.addEventListener("hashchange",function(){frame();picker.scrollLeft=cur*itemW()});frame();

/* ============ audio: synthesized live, no recordings ============ */
var ctx,master,noiseBuf,singOsc=[],singGain;
function initAudio(){
  if(ctx){if(ctx.state==="suspended")ctx.resume();return}
  try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(e){}
  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();
  master=ctx.createGain();master.gain.value=.9;
  var comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.4;
  var dry=ctx.createGain();dry.gain.value=.82;var wet=ctx.createGain();wet.gain.value=.34;
  var rev=ctx.createConvolver();rev.buffer=impulse(4.8);revNode=rev;
  var lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=7000;
  master.connect(dry);dry.connect(comp);master.connect(rev);rev.connect(wet);wet.connect(comp);comp.connect(lp);lp.connect(ctx.destination);
  var n=Math.floor(ctx.sampleRate*.12);noiseBuf=ctx.createBuffer(1,n,ctx.sampleRate);var d=noiseBuf.getChannelData(0);
  for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,4);
  singGain=ctx.createGain();singGain.gain.value=0;singGain.connect(master);
  for(var k=0;k<4;k++){var o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";g.gain.value=k<2?.5:.12;o.connect(g);g.connect(singGain);o.start();singOsc.push(o)}
  tuneSing();initRain();
}
var rainGain=null,rainLvl=0,rainVis=0,revNode=null;
function initRain(){
  var sr=ctx.sampleRate,len=sr*8,fade=Math.floor(sr*.5),b=ctx.createBuffer(2,len,sr);
  for(var c=0;c<2;c++){
    var d=b.getChannelData(c),tA=new Float32Array(len+fade),b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(var i=0;i<len+fade;i++){var w=Math.random()*2-1;
      b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;
      b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;tA[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}
    for(i=0;i<len;i++)d[i]=tA[i];
    for(i=0;i<fade;i++){var f=i/fade;d[i]=tA[i]*f+tA[len+i]*(1-f)}
  }
  rainGain=ctx.createGain();rainGain.gain.value=0;rainGain.connect(ctx.destination);
  /* warm, steady rain like ASMR recordings: full mids, rolled-off highs, no rumble */
  var src=ctx.createBufferSource();src.buffer=b;src.loop=true;
  var hp=ctx.createBiquadFilter();hp.type="highpass";hp.frequency.value=220;hp.Q.value=.5;
  var lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=3200;lp.Q.value=.5;
  var lp2=ctx.createBiquadFilter();lp2.type="lowpass";lp2.frequency.value=5200;lp2.Q.value=.4;
  var body=ctx.createBiquadFilter();body.type="peaking";body.frequency.value=900;body.Q.value=.7;body.gain.value=3;
  var bed=ctx.createGain();bed.gain.value=.04;
  src.connect(hp);hp.connect(body);body.connect(lp);lp.connect(lp2);lp2.connect(bed);bed.connect(rainGain);src.start();
  /* fine patter: many tiny raindrops on leaves and the window sill */
  var tl=Math.floor(sr*.012),tick=ctx.createBuffer(1,tl,sr),td=tick.getChannelData(0);
  for(i=0;i<tl;i++)td[i]=(Math.random()*2-1)*Math.exp(-i/(sr*.0045))*(1-Math.exp(-i/(sr*.0004)));
  var patLp=ctx.createBiquadFilter();patLp.type="lowpass";patLp.frequency.value=6500;patLp.connect(rainGain);
  var pat=ctx.createGain();pat.gain.value=.8;pat.connect(patLp);
  /* clear, glassy drops: a soft tick rung through a narrow resonance, plus a tiny bell-like ping */
  var dripRev=ctx.createGain();dripRev.gain.value=.5;rainGain.connect(dripRev);if(revNode)dripRev.connect(revNode);
  function drip(t,heavy){
    var fq=heavy?rnd(1100,1700):rnd(1900,3600);
    var s2=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    s2.buffer=tick;f.type="bandpass";f.frequency.value=fq;f.Q.value=heavy?9:14;
    g.gain.value=(heavy?rnd(.5,.75):rnd(.3,.6));s2.connect(f);f.connect(g);
    var o=ctx.createOscillator(),og=ctx.createGain(),dk=heavy?.06:.035;
    o.type="sine";o.frequency.setValueAtTime(fq*1.02,t);o.frequency.exponentialRampToValueAtTime(fq,t+dk);
    og.gain.setValueAtTime(.0001,t);og.gain.exponentialRampToValueAtTime(heavy?.05:.035,t+.002);og.gain.exponentialRampToValueAtTime(.0001,t+dk);
    o.connect(og);
    var out=ctx.createGain();g.connect(out);og.connect(out);
    if(ctx.createStereoPanner){var pn=ctx.createStereoPanner();pn.pan.value=rnd(-.8,.8);out.connect(pn);pn.connect(pat)}else out.connect(pat);
    s2.start(t);o.start(t);o.stop(t+dk+.02);
  }
  setInterval(function(){
    if(rainLvl<.05||document.hidden)return;
    /* light, unhurried rain: a few distinct drops, sometimes a small "to-dok" pair */
    var now=ctx.currentTime,r=Math.random(),n=r<.6?0:(r<.95?1:2);
    for(var k=0;k<n;k++){var t=now+Math.random()*.2,hv=Math.random()<.1;drip(t,hv);if(Math.random()<.25)drip(t+rnd(.05,.09),false)}
  },220);
}
function tuneSing(){
  if(!ctx)return;var b=BOWLS[cur],t=ctx.currentTime;
  var f=[b.f0-.6,b.f0+.6,b.f0*b.partials[1][0]-1,b.f0*b.partials[1][0]+1];
  singOsc.forEach(function(o,i){o.frequency.setTargetAtTime(f[i],t,.05)});
}
function impulse(sec){
  var len=Math.floor(ctx.sampleRate*sec),b=ctx.createBuffer(2,len,ctx.sampleRate);
  for(var c=0;c<2;c++){var d=b.getChannelData(c);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.4)*.6}
  return b;
}
function playStrike(b,vel,delay){
  if(!ctx)return;var t=ctx.currentTime+.015+(delay||0);
  b.partials.forEach(function(p){[-1,1].forEach(function(s){
    var o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";o.frequency.value=b.f0*p[0]+s*p[3]/2;
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002,p[1]*vel*.16*(1+.15*vel*(p[0]>2?1:0))),t+b.attack+(s>0?.004:0));
    g.gain.exponentialRampToValueAtTime(.0001,t+p[2]*(.6+.4*vel));
    o.connect(g);g.connect(master);o.start(t);o.stop(t+p[2]+.2);
  })});
  if(b.noise>0){var ns=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),ng=ctx.createGain();
    ns.buffer=noiseBuf;bp.type="bandpass";bp.frequency.value=b.f0*b.knock;bp.Q.value=1.4;ng.gain.value=b.noise*vel;
    ns.connect(bp);bp.connect(ng);ng.connect(master);ns.start(t)}
}

/* ============ state ============ */
var cur=0;try{var sv=parseInt(localStorage.getItem("bowl.index"),10);if(sv>=0&&sv<3)cur=sv}catch(e){}
var bowl=bowlObjs[cur];bowl.visible=true;styleMallet(BOWLS[cur]);dressCushion(BOWLS[cur]);
setRest(BOWLS[cur]);m.pos.copy(REST.pos);m.tPos.copy(REST.pos);m.tDir.copy(REST.dir);m.q.setFromUnitVectors(UP,REST.dir);
var rainOn=false;try{rainOn=localStorage.getItem("bowl.rain")==="1"}catch(e){}
var L={out:new T.Color(),backI:.7,sun:new T.Color(),sky:new T.Color(),ground:new T.Color(),fill:new T.Color(),room:new T.Color(),at:new T.Vector3(),sunI:2.3,hemiI:.55,fillI:.35,exp:1.05};
function lightTarget(){var l=BOWLS[cur].light;L.sun.set(l.sun);L.sky.set(l.sky);L.ground.set(l.ground);L.fill.set(l.fill);L.room.set(l.room);
  L.at.set(l.at[0],l.at[1],l.at[2]);L.out.set(l.out);L.backI=l.backI;L.sunI=l.sunI;L.hemiI=l.hemiI;L.fillI=l.fillI;L.exp=l.exp;
  var r=L.room,c=function(a){return "rgba("+Math.round(Math.min(1,r.r*1.03)*255)+","+Math.round(Math.min(1,r.g*1.03)*255)+","+Math.round(Math.min(1,r.b*1.03)*255)+","+a+")"};
  var st=document.documentElement.style;st.setProperty("--room",l.room);st.setProperty("--haze",c(.88));st.setProperty("--haze0",c(0));}
function applyLight(k){
  sun.color.lerp(L.sun,k);hemi.color.lerp(L.sky,k);hemi.groundColor.lerp(L.ground,k);fill.color.lerp(L.fill,k);
  ROOM.lerp(L.room,k);sun.position.lerp(L.at,k);hemi.intensity+=(L.hemiI-hemi.intensity)*k;fill.intensity+=(L.fillI-fill.intensity)*k;
  renderer.toneMappingExposure+=(L.exp-renderer.toneMappingExposure)*k;
}
lightTarget();applyLight(1);sun.intensity=L.sunI;
var wobble=0,wobPhase=0,sing=0,rubbing=false,switchAnim=null,bowlScale=1;
function strike(vel,delay){
  playStrike(BOWLS[cur],vel,delay);
  setTimeout(function(){wobble=Math.max(wobble,.012*vel)},(delay||0)*1000);
  if(!session&&!delay)startSession();
}

/* ============ pointer: grab the mallet, strike or rub the rim ============ */
var ray=new T.Raycaster(),ndc=new T.Vector2(),plane=new T.Plane(),tmp=new T.Vector3(),nrm=new T.Vector3();
var holding=false,onBowl=false,armed=true,lastStrike=0,hist=[];
function setRay(e){var r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera)}
function speed(){if(hist.length<2)return 0;var a=hist[0],b=hist[hist.length-1],dt=b.t-a.t;if(dt<=0)return 0;return Math.hypot(b.x-a.x,b.y-a.y)/dt}
function track(e){var now=performance.now();hist.push({x:e.clientX,y:e.clientY,t:now});while(hist.length>2&&now-hist[0].t>70)hist.shift()}
function aim(e){
  setRay(e);var hit=ray.intersectObject(bowl.userData.mesh,false)[0];
  var r=BOWLS[cur].mallet.r;
  if(hit){
    nrm.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
    if(nrm.dot(ray.ray.direction)>0)nrm.negate();
    m.tPos.copy(hit.point).addScaledVector(nrm,r+.01);
    var local=bowl.worldToLocal(hit.point.clone());
    var nearRim=local.y>bowl.userData.rimY-.12;
    var sp=speed();
    if(!onBowl&&armed&&sp>.22&&performance.now()-lastStrike>180){
      try{initAudio()}catch(err){}strike(Math.min(1,Math.max(.22,(sp-.15)/1.5)));lastStrike=performance.now();armed=false;
    }
    rubbing=nearRim&&sp>.06;onBowl=true;
    /* tilt mallet so the head leans into the surface */
    m.tDir.copy(HOLD_DIR).addScaledVector(nrm,.35).normalize();
  }else{
    plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(tmp).negate(),new T.Vector3(0,.5,0));
    var p=new T.Vector3();if(ray.ray.intersectPlane(plane,p)){p.y=Math.max(p.y,.42);m.tPos.copy(p)}
    m.tDir.copy(HOLD_DIR);onBowl=false;armed=true;rubbing=false;
  }
}
canvas.addEventListener("pointerdown",function(e){
  try{initAudio()}catch(err){}holding=true;canvas.classList.add("holding");try{canvas.setPointerCapture(e.pointerId)}catch(err){}hist=[];track(e);
  setRay(e);var hit=ray.intersectObject(bowl.userData.mesh,false)[0];
  onBowl=false;armed=true;aim(e);
  if(hit&&performance.now()-lastStrike>180){strike(.62);lastStrike=performance.now();armed=false}
});
canvas.addEventListener("pointermove",function(e){if(!holding)return;track(e);aim(e)});
function release(){holding=false;rubbing=false;onBowl=false;canvas.classList.remove("holding");m.tPos.copy(REST.pos);m.tDir.copy(REST.dir)}
canvas.addEventListener("pointerup",release);canvas.addEventListener("pointercancel",release);

/* ============ phones: unlock sound on the first real tap ============ */
var silentEl=null;
function silentWav(){var n=8000,b=new ArrayBuffer(44+n),v=new DataView(b),w=function(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,"RIFF");v.setUint32(4,36+n,true);w(8,"WAVE");w(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,"data");v.setUint32(40,n,true);
  for(var i=0;i<n;i++)v.setUint8(44+i,128);return URL.createObjectURL(new Blob([b],{type:"audio/wav"}))}
function unlock(){
  try{initAudio();if(ctx&&ctx.state!=="running")ctx.resume();
    if(ctx){var sb=ctx.createBufferSource();sb.buffer=ctx.createBuffer(1,1,22050);sb.connect(ctx.destination);sb.start(0)}}catch(err){}
  try{if(!silentEl){silentEl=document.createElement("audio");silentEl.setAttribute("playsinline","");silentEl.loop=true;silentEl.src=silentWav()}
    if(silentEl.paused&&!document.hidden){var pr=silentEl.play();if(pr&&pr.catch)pr.catch(function(){})}}catch(err){}
}
["touchend","pointerup","click","keydown"].forEach(function(t){document.addEventListener(t,unlock,{passive:true})});
document.addEventListener("visibilitychange",function(){try{if(document.hidden&&silentEl)silentEl.pause()}catch(err){}});

/* ============ picker (swipe) ============ */
var picker=$("picker"),pbtn=picker.querySelectorAll("button"),pst;
function itemW(){return pbtn[0].offsetWidth}
function choose(i,smooth){
  i=Math.max(0,Math.min(2,i));
  picker.scrollTo({left:i*itemW(),behavior:smooth?"smooth":"auto"});
  if(i===cur)return;
  if(switchAnim){switchAnim.from.visible=false;switchAnim.from.scale.setScalar(1);bowl=switchAnim.to;bowl.visible=true;bowl.scale.setScalar(1);switchAnim=null;dressCushion(BOWLS[cur])}
  var next=bowlObjs[i];switchAnim={from:bowl,to:next,t:0};cur=i;
  $("spec").textContent=BOWLS[i].spec;
  pbtn.forEach(function(b,k){b.setAttribute("aria-current",k===i)});
  $("dots").querySelectorAll("i").forEach(function(d,k){d.className=k===i?"on":""});
  styleMallet(BOWLS[i]);tuneSing();lightTarget();setRest(BOWLS[i]);if(!holding){m.tPos.copy(REST.pos);m.tDir.copy(REST.dir)}
  try{localStorage.setItem("bowl.index",i)}catch(e){}
}
picker.addEventListener("scroll",function(){if(session)return;clearTimeout(pst);pst=setTimeout(function(){choose(Math.round(picker.scrollLeft/itemW()),false)},80)},{passive:true});
pbtn.forEach(function(b){b.addEventListener("click",function(){if(!session)choose(+b.dataset.i,true)})});
document.addEventListener("keydown",function(e){
  if(e.key==="ArrowRight"&&!session)choose(cur+1,true);
  else if(e.key==="ArrowLeft"&&!session)choose(cur-1,true);
  else if(e.key===" "&&(document.activeElement===document.body||document.activeElement===canvas)){e.preventDefault();initAudio();strike(.65)}
  else if(e.key==="Escape"&&session)$("stop").click();
});
window.addEventListener("resize",function(){picker.scrollLeft=cur*itemW()});

/* ============ 30-second session ============ */
var session=null,wake=null;
var guide=$("guide"),sub=$("sub"),band=$("band");
function say(el,txt){if(el.textContent===txt)return;el.classList.add("fade");setTimeout(function(){el.textContent=txt;el.classList.remove("fade")},420)}
function startSession(){
  THINK=thinkFor(TOTAL);
  session={t0:performance.now(),timers:[],rest:false};
  band.classList.add("in-session");picker.classList.add("locked");$("stop").hidden=false;
  say(guide,TEXT.think);
  try{if(navigator.wakeLock)navigator.wakeLock.request("screen").then(function(w){wake=w}).catch(function(){})}catch(e){}
  session.timers.push(setTimeout(function(){strike(.4,.001);session.rest=true;say(guide,TEXT.rest)},THINK*1000));
  session.timers.push(setTimeout(function(){strike(.7,.001);strike(.5,1.7);endSession();say(guide,TEXT.done);say(sub,TEXT.doneSub)},TOTAL*1000));
}
function endSession(){
  if(!session)return;session.timers.forEach(clearTimeout);session=null;
  band.classList.remove("in-session");picker.classList.remove("locked");$("stop").hidden=true;
  try{if(wake)wake.release()}catch(e){}wake=null;
}
var rainBtn=$("rain");
function setRain(on){rainOn=on;rainBtn.setAttribute("aria-pressed",on);try{localStorage.setItem("bowl.rain",on?"1":"0")}catch(e){}}
rainBtn.addEventListener("click",function(){initAudio();setRain(!rainOn)});setRain(rainOn);
var durBtns=$("dur").querySelectorAll("button");
function setDur(sec){TOTAL=sec;durBtns.forEach(function(b){b.setAttribute("aria-checked",+b.dataset.s===sec)});try{localStorage.setItem("bowl.dur",sec)}catch(e){}}
durBtns.forEach(function(b){b.addEventListener("click",function(){if(!session)setDur(+b.dataset.s)})});
try{var sd=parseInt(localStorage.getItem("bowl.dur"),10);if(DURS.indexOf(sd)>=0)setDur(sd)}catch(e){}
function fmt(sec){return sec>=60?Math.floor(sec/60)+":"+("0"+sec%60).slice(-2):sec+"초"}
$("stop").addEventListener("click",function(){endSession();say(guide,TEXT.idle);say(sub,TEXT.idleSub)});
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"&&session&&navigator.wakeLock)navigator.wakeLock.request("screen").then(function(w){wake=w}).catch(function(){})});

/* ============ loop ============ */
var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var clock=new T.Clock(),qT=new T.Quaternion();
function loop(){
  var dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
  /* mallet follows with a little weight */
  var k=holding?1-Math.pow(.0005,dt):1-Math.pow(.02,dt);
  m.pos.lerp(m.tPos,k);qT.setFromUnitVectors(UP,m.tDir);m.q.slerp(qT,k);
  mallet.position.copy(m.pos);mallet.quaternion.copy(m.q);
  /* rim singing */
  sing+= rubbing ? dt*.45 : -dt*.3; sing=Math.max(0,Math.min(1,sing));
  if(ctx&&singGain)singGain.gain.setTargetAtTime(Math.pow(sing,1.6)*.11*BOWLS[cur].sing,ctx.currentTime,.08);
  /* vibration */
  wobble*=Math.exp(-dt*1.4);var w=reduce?0:wobble+sing*.0035;wobPhase+=dt*38;
  /* bowl switching */
  if(switchAnim){switchAnim.t+=dt/.55;var s=switchAnim.t;
    if(s<.5){switchAnim.from.scale.setScalar(Math.max(.001,1-s*2*1))}
    else{if(bowl!==switchAnim.to)dressCushion(BOWLS[cur]);switchAnim.from.visible=false;switchAnim.from.scale.setScalar(1);bowl=switchAnim.to;bowl.visible=true;
      var u=(s-.5)*2,c1=1.4,eb=1+(c1+1)*Math.pow(u-1,3)+c1*Math.pow(u-1,2);bowl.scale.setScalar(Math.max(.001,Math.min(1.08,eb)))}
    if(s>=1){bowl.scale.setScalar(1);switchAnim=null}}
  if(!switchAnim)bowl.scale.set(1+w*Math.sin(wobPhase),1,1-w*Math.sin(wobPhase));
  /* the room breathes during the eyes-closed phase */
  applyLight(Math.min(1,dt*2.2));
  var rT=rainOn?1:0;rainVis+=(rT-rainVis)*Math.min(1,dt*1.2);
  if(ctx&&rainGain){rainLvl+=(rT-rainLvl)*Math.min(1,dt*.5);rainGain.gain.setTargetAtTime(rainLvl*.11,ctx.currentTime,.25)}
  var sunT=L.sunI*(1-.22*rainVis);
  if(session&&session.rest&&!reduce){var cyc=((performance.now()-session.t0)/1000-THINK)%10,bph=cyc<4?Math.sin(cyc/4*Math.PI/2):Math.cos((cyc-4)/6*Math.PI/2);sunT=L.sunI*(.86+bph*.24)}
  sun.intensity+=(sunT-sun.intensity)*Math.min(1,dt*2);
  if(session){var left=Math.max(0,Math.ceil(TOTAL-(performance.now()-session.t0)/1000));
    var txt=session.rest?((((performance.now()-session.t0)/1000-THINK)%10)<4?"들이쉬고":"내쉬고")+" · "+fmt(left):fmt(left);
    if(sub.textContent!==txt&&!sub.classList.contains("fade"))sub.textContent=txt}
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
}
picker.scrollLeft=cur*itemW();pbtn.forEach(function(b,k){b.setAttribute("aria-current",k===cur)});
$("dots").querySelectorAll("i").forEach(function(d,k){d.className=k===cur?"on":""});$("spec").textContent=BOWLS[cur].spec;
requestAnimationFrame(loop);
})();

/* offline install + auto-refresh when a new version is published */
if("serviceWorker" in navigator && location.protocol==="https:"){
  var hadController=!!navigator.serviceWorker.controller,reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",function(){if(hadController&&!reloaded){reloaded=true;location.reload()}});
  window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(function(r){r.update()}).catch(function(){})});
}
