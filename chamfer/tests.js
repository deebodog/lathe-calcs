const fs=require("fs"),src=fs.readFileSync(__dirname+"/index.html","utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
const m={exports:{}};new Function("module",src)(m);const {solve,fix,word,dpOf,exact,tipShift,parseNum}=m.exports,A=require("assert");
let n=0;const T=(name,f)=>{f();n++;console.log("ok  "+name)};

T("metric default: 80 mm stock, 1 mm × 45° chamfer, R 0.8",()=>{
 const q=solve({units:"mm",mode:"len",D:80,L:1,A:45,R:0.8});
 A.equal(q.dp,3);
 A.equal(q.tS,"0.331");
 A.equal(q.dzS,"0.234");
 A.equal(q.dxS,"0.469");
 A.equal(q.Zcs,"-1.000");
 A.ok(Math.abs(q.startX-78)<1e-12);
 A.equal(q.X1,"79.531");
 A.equal(q.Z1,"-0.766");
 A.equal(q.X3,"80.000");
 A.equal(q.Z3,"-1.331");
 A.equal(q.Rs,"0.800");
 A.equal(q.prog,"G01 X79.531 Z-0.766\nG03 X80. Z-1.331 R0.8\nG01 Z...");
 A.ok(q.placeholderZ);
 A.ok(Math.abs(q.t-0.8*Math.tan(22.5*Math.PI/180))<1e-12);
 A.ok(Math.abs(q.x1e-(80-q.dx))<1e-12);
 A.ok(Math.abs(q.z3e-(-1-q.t))<1e-12);
});

T("metric default also from corner Z −1",()=>{
 const a=solve({units:"mm",mode:"len",D:80,L:1,A:45,R:0.8});
 const b=solve({units:"mm",mode:"zc",D:80,Zc:-1,A:45,R:0.8});
 A.equal(a.prog,b.prog);
 A.equal(b.X1,"79.531");
 A.equal(b.Z1,"-0.766");
 A.equal(b.Z3,"-1.331");
});

T("inch manual example: end points rounded once, exact 1.19086 and −0.09066",()=>{
 const q=solve({units:"in",mode:"zc",D:1.2,Zc:-0.0842,A:45,R:0.0156});
 A.equal(q.dp,4);
 A.equal(q.tS,"0.0065");
 A.equal(q.dzS,"0.0046");
 A.equal(q.dxS,"0.0091");
 A.equal(q.X1,"1.1909");
 A.equal(q.Z1,"-0.0796");
 A.equal(q.Z3,"-0.0907");
 A.equal(q.X3,"1.2000");
 A.equal(q.Rs,"0.0156");
 A.equal(exact(q.x1e,4),"1.19086");
 A.equal(exact(q.z3e,4),"-0.09066");
 A.equal(q.prog,"G01 X1.1909 Z-0.0796\nG03 X1.2 Z-0.0907 R0.0156\nG01 Z...");
});

T("inch manual with final Z −1.125 has explicit G01 after G03",()=>{
 const q=solve({units:"in",mode:"zc",D:1.2,Zc:-0.0842,A:45,R:0.0156,Zend:-1.125});
 A.equal(q.zEndS,"-1.1250");
 A.equal(q.placeholderZ,false);
 A.equal(q.prog,"G01 X1.1909 Z-0.0796\nG03 X1.2 Z-0.0907 R0.0156\nG01 Z-1.125");
});

T("inch chamfer length 0.0842 equals corner Z −0.0842",()=>{
 const a=solve({units:"in",mode:"zc",D:1.2,Zc:-0.0842,A:45,R:0.0156});
 const b=solve({units:"in",mode:"len",D:1.2,L:0.0842,A:45,R:0.0156});
 A.equal(a.prog,b.prog);
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
 A.ok(Math.abs(Math.hypot(ce.z-cz,ce.x/2-cr)-R)<1e-12);
 A.ok(Math.abs(Math.hypot(ae.z-cz,ae.x/2-cr)-R)<1e-12);
 const ar=Math.PI/180*ang;
 const rz=ce.z-cz,rr=ce.x/2-cr;
 A.ok(Math.abs(rz*Math.cos(ar)+rr*(-Math.sin(ar)))<1e-12);
 A.ok(Math.abs(ae.z-cz)<1e-12);
});

T("another metric case: Ø30, Zc −2, 45°, R 1",()=>{
 const q=solve({units:"mm",mode:"zc",D:30,Zc:-2,A:45,R:1});
 A.equal(q.tS,"0.414");
 A.equal(q.dzS,"0.293");
 A.equal(q.dxS,"0.586");
 A.equal(q.X1,"29.414");
 A.equal(q.Z1,"-1.707");
 A.equal(q.Z3,"-2.414");
 A.ok(Math.abs(Math.hypot(q.chamferEnd.z-q.centre.z,q.chamferEnd.x/2-q.centre.r)-1)<1e-12);
});

T("90° square step at Z0: t = R, dz = 0, dx = 2R",()=>{
 const q=solve({units:"mm",mode:"zc",D:50,Zc:0,A:90,R:2});
 A.ok(q.square);
 A.ok(Math.abs(q.t-2)<1e-12);
 A.ok(Math.abs(q.dz)<1e-12);
 A.ok(Math.abs(q.dx-4)<1e-12);
 A.equal(q.X1,"46.000");
 A.equal(q.Z1,"0.000");
 A.equal(q.Z3,"-2.000");
 A.ok(q.prog.includes("G01 X46. Z0.\nG03 X50. Z-2. R2.\nG01 Z..."));
});

T("90° square step: Ø80, Zc −1, R 0.8",()=>{
 const q=solve({units:"mm",mode:"zc",D:80,Zc:-1,A:90,R:0.8});
 A.ok(q.square);
 A.ok(Math.abs(q.t-0.8)<1e-12);
 A.ok(Math.abs(q.dz)<1e-12);
 A.ok(Math.abs(q.dx-1.6)<1e-12);
 A.equal(q.X1,"78.400");
 A.equal(q.Z1,"-1.000");
 A.equal(q.Z3,"-1.800");
 A.equal(q.prog,"G01 X78.4 Z-1.\nG03 X80. Z-1.8 R0.8\nG01 Z...");
 const b=solve({units:"mm",mode:"len",D:80,L:1,A:90,R:0.8});
 A.equal(b.prog,q.prog);
});

T("word() trims trailing zeros; points and program can share it",()=>{
 A.equal(word(80,3),"80.");
 A.equal(word(79.531,3),"79.531");
 A.equal(word(0.8,3),"0.8");
 A.equal(word(-1,3),"-1.");
 A.equal(word(-1.8,3),"-1.8");
 A.equal(word(-1.125,4),"-1.125");
 A.equal(word(1.2,4),"1.2");
 A.equal(word(78.4,3),"78.4");
 A.equal(dpOf("mm"),3);
 A.equal(dpOf("in"),4);
 A.equal(exact(1.19086173,4),"1.19086");
 A.equal(exact(-0.09066173,4),"-0.09066");
});

T("tipShift: 45° is r(2−√2) ≈ 0.586r; book −0.075 shifts to −0.08414 and arc end −0.0906",()=>{
 A.ok(Math.abs(tipShift(1,45)-(2-Math.SQRT2))<1e-12);
 A.ok(Math.abs(tipShift(1,45)-0.586)<0.001);
 A.ok(Math.abs(tipShift(1,90))<1e-12);
 const r=0.0156,sh=tipShift(r,45);
 A.ok(Math.abs(sh-(r*(1-Math.tan(22.5*Math.PI/180))))<1e-12);
 const q=solve({units:"in",mode:"zc",D:1.2,Zc:-0.075,A:45,R:0.0156,shift:true});
 A.ok(Math.abs(q.Zc-(-0.075-sh))<1e-12);
 A.ok(Math.abs(q.z3e-(-0.0906))<1e-12);
 A.equal(q.Z3,"-0.0906");
 A.equal(q.X1,"1.1909");
});

T("parseNum accepts unicode minus",()=>{
 A.equal(parseNum("−0.0842"),-0.0842);
 A.equal(parseNum("-1.125"),-1.125);
 A.ok(!isFinite(parseNum("")));
 A.ok(!isFinite(parseNum("-")));
 A.ok(!isFinite(parseNum(null)));
});

T("input errors: blank or positive corner Z, short chamfer, bad inputs",()=>{
 for(const i of [
  {units:"mm",mode:"zc",D:0,Zc:-1,A:45,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:45,R:0},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:45,R:40},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:0,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:90.1,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:null,A:45,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:"",A:45,R:0.8},
  {units:"mm",mode:"zc",D:80,Zc:0.1,A:45,R:0.8},
  {units:"mm",mode:"len",D:80,L:0,A:45,R:0.8},
  {units:"mm",mode:"len",D:80,L:1,A:45,R:5},
  {units:"mm",mode:"zc",D:80,Zc:-1,A:45,R:0.8,Zend:0}
 ]) A.throws(()=>solve(i),`should throw ${JSON.stringify(i)}`);
 A.throws(()=>solve({units:"mm",mode:"len",D:80,L:1,A:45,R:5}));
});

console.log("\nall "+n+" test groups passed");
