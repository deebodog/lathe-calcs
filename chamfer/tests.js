const fs=require("fs"),src=fs.readFileSync(__dirname+"/index.html","utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
const m={exports:{}};new Function("module",src)(m);const {solve,fix,word,dpOf}=m.exports,A=require("assert");
let n=0;const T=(name,f)=>{f();n++;console.log("ok  "+name)};

T("metric default: 80 mm stock, 1 mm × 45° chamfer, R 0.8",()=>{
 const q=solve({units:"mm",mode:"len",D:80,L:1,A:45,R:0.8});
 A.equal(q.dp,3);
 A.equal(q.tS,"0.331");
 A.equal(q.dzS,"0.234");
 A.equal(q.dxS,"0.469");
 A.equal(q.Zcs,"-1.000");
 A.equal(q.startXs,"78.000");
 A.ok(Math.abs(q.startX-78)<1e-12);
 A.equal(q.X1,"79.531");
 A.equal(q.Z1,"-0.766");
 A.equal(q.X3,"80.000");
 A.equal(q.Z3,"-1.331");
 A.equal(q.Rs,"0.800");
 A.equal(q.prog,"G01 X79.531 Z-0.766\nG03 X80. Z-1.331 R0.8");
 A.ok(Math.abs(q.t-0.8*Math.tan(22.5*Math.PI/180))<1e-12);
 A.equal(q.warn.length,0);
});

T("metric default also from corner Z −1",()=>{
 const a=solve({units:"mm",mode:"len",D:80,L:1,A:45,R:0.8});
 const b=solve({units:"mm",mode:"zc",D:80,Zc:-1,A:45,R:0.8});
 A.equal(a.prog,b.prog);
 A.equal(b.Zcs,"-1.000");
 A.equal(b.X1,"79.531");
 A.equal(b.Z1,"-0.766");
 A.equal(b.Z3,"-1.331");
});

T("inch manual example: Ø1.200, Zc −0.0842, 45°, R 0.0156",()=>{
 const q=solve({units:"in",mode:"zc",D:1.2,Zc:-0.0842,A:45,R:0.0156});
 A.equal(q.dp,4);
 A.equal(q.tS,"0.0065");
 A.equal(q.dzS,"0.0046");
 // X change is rounded independently from 0.009138… → 0.0091
 // (the book doubled already-rounded 0.0046 to 0.0092, giving X1.1908)
 A.equal(q.dxS,"0.0091");
 A.equal(q.X1,"1.1909");
 A.equal(q.Z1,"-0.0796"); // matches the book
 // −0.0842 − 0.0065 = −0.0907 (the book prints Z−0.0906)
 A.equal(q.Z3,"-0.0907");
 A.equal(q.X3,"1.2000");
 A.equal(q.Rs,"0.0156");
 A.equal(q.prog,"G01 X1.1909 Z-0.0796\nG03 X1.2 Z-0.0907 R0.0156");
});

T("inch manual with optional final Z −1.125",()=>{
 const q=solve({units:"in",mode:"zc",D:1.2,Zc:-0.0842,A:45,R:0.0156,Zend:-1.125});
 A.equal(q.zEndS,"-1.1250");
 A.equal(q.prog,"G01 X1.1909 Z-0.0796\nG03 X1.2 Z-0.0907 R0.0156\nG01 Z-1.125");
});

T("inch chamfer length 0.0842 equals corner Z −0.0842",()=>{
 const a=solve({units:"in",mode:"zc",D:1.2,Zc:-0.0842,A:45,R:0.0156});
 const b=solve({units:"in",mode:"len",D:1.2,L:0.0842,A:45,R:0.0156});
 A.equal(a.prog,b.prog);
 A.equal(b.Zcs,"-0.0842");
});

T("30° chamfer: both tangent lengths equal t, arc tangent to both lines, centre at D/2 − R",()=>{
 const D=40,Zc=-5,ang=30,R=2;
 const q=solve({units:"mm",mode:"zc",D,Zc,A:ang,R});
 const hyp=(a,b)=>Math.hypot(a.z-b.z,(a.x-b.x)/2);
 const corner={x:D,z:Zc},ce={x:q.chamferEnd.x,z:q.chamferEnd.z},ae={x:q.arcEnd.x,z:q.arcEnd.z};
 A.ok(Math.abs(hyp(corner,ce)-q.t)<1e-12,"chamfer tangent length");
 A.ok(Math.abs(hyp(corner,ae)-q.t)<1e-12,"diameter tangent length");
 A.ok(Math.abs(q.centre.r-(D/2-R))<1e-12);
 A.ok(Math.abs(q.centre.z-(Zc-q.t))<1e-12);
 const cr=q.centre.r,cz=q.centre.z;
 A.ok(Math.abs(Math.hypot(ce.z-cz,ce.x/2-cr)-R)<1e-12,"centre to chamfer end = R");
 A.ok(Math.abs(Math.hypot(ae.z-cz,ae.x/2-cr)-R)<1e-12,"centre to arc end = R");
 const ar=Math.PI/180*ang;
 // chamfer direction toward +Z: (dz, dr) = (cos A, −sin A); radius from centre to G01 should be perpendicular
 const rz=ce.z-cz,rr=ce.x/2-cr;
 A.ok(Math.abs(rz*Math.cos(ar)+rr*(-Math.sin(ar)))<1e-12,"perpendicular to chamfer");
 // diameter is along Z; radius to arc end is purely radial
 A.ok(Math.abs(ae.z-cz)<1e-12);
 A.ok(Math.abs((ae.x/2-cr)*0+(ae.z-cz)*1)<1e-12,"perpendicular to OD");
 A.equal(q.tS,fix(R*Math.tan(ar/2),3));
});

T("another metric case: Ø30, Zc −2, 45°, R 1",()=>{
 const q=solve({units:"mm",mode:"zc",D:30,Zc:-2,A:45,R:1});
 A.equal(q.tS,"0.414");
 A.equal(q.dzS,"0.293");
 A.equal(q.dxS,"0.586");
 A.equal(q.X1,"29.414");
 A.equal(q.Z1,"-1.707");
 A.equal(q.Z3,"-2.414");
 A.ok(Math.abs(q.centre.r-(15-1))<1e-12);
 A.ok(Math.abs(Math.hypot(q.chamferEnd.z-q.centre.z,q.chamferEnd.x/2-q.centre.r)-1)<1e-12);
});

T("90° chamfer is a face-to-OD corner radius: t = R, dz = 0, dx = 2R",()=>{
 const q=solve({units:"mm",mode:"zc",D:50,Zc:0,A:90,R:2});
 A.ok(Math.abs(q.t-2)<1e-12);
 A.ok(Math.abs(q.dz)<1e-12);
 A.ok(Math.abs(q.dx-4)<1e-12);
 A.equal(q.tS,"2.000");
 A.equal(q.dzS,"0.000");
 A.equal(q.dxS,"4.000");
 A.equal(q.X1,"46.000");
 A.equal(q.Z1,"0.000");
 A.equal(q.Z3,"-2.000");
});

T("word() trims trailing zeros but keeps a decimal on whole numbers",()=>{
 A.equal(word(80,3),"80.");
 A.equal(word(79.531,3),"79.531");
 A.equal(word(0.8,3),"0.8");
 A.equal(word(-1.331,3),"-1.331");
 A.equal(word(-1.125,4),"-1.125");
 A.equal(word(1.2,4),"1.2");
 A.equal(dpOf("mm"),3);
 A.equal(dpOf("in"),4);
});

T("input errors",()=>{
 for(const i of [
  {units:"mm",mode:"zc",D:0,Zc:-1,A:45,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:45,R:0},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:45,R:40},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:0,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:90.1,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:NaN,A:45,R:0.8},
  {units:"mm",mode:"len",D:80,L:0,A:45,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:45,R:0.8,Zend:0}
 ]) A.throws(()=>solve(i));
});

T("warning when the blend needs a longer chamfer than Z0 to the corner",()=>{
 const q=solve({units:"mm",mode:"len",D:80,L:1,A:45,R:5});
 A.ok(q.warn.length>0);
 A.ok(+q.Z1>0);
});

console.log("\nall "+n+" test groups passed");
