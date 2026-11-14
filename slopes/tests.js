const fs=require("fs"),src=fs.readFileSync(__dirname+"/index.html","utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
const m={exports:{}};new Function("module",src)(m);const {F,G,fix3,slope,table}=m.exports,A=require("assert");
let n=0;const T=(name,f)=>{f();n++;console.log("ok  "+name)};
const sheet=[[0.4,1,"0.007","0.397"],[0.4,46,"0.238","0.230"],[0.5,1,"0.009","0.496"],[0.5,46,"0.298","0.288"],[0.762,45,"0.446","0.446"]];
T("printed sheet checks",()=>{for(const [r,t,f,g] of sheet){A.equal(fix3(F(r,t)),f,`F r${r} ${t}°`);A.equal(fix3(G(r,t)),g,`G r${r} ${t}°`);const row=table(r)[t-1];A.deepStrictEqual(row,[t,f,g])}});
T("90°: F = r, G = 0 (all presets)",()=>{for(const r of [0.2,0.4,0.5,0.762,0.8,1.2,1.6]){A.ok(Math.abs(F(r,90)-r)<1e-12);A.ok(Math.abs(G(r,90))<1e-12);A.deepStrictEqual(table(r)[89],[90,r.toFixed(3),"0.000"])}});
T("0°: F = 0, G = r, no -0.000",()=>{for(const r of [0.4,0.8]){A.equal(fix3(F(r,0)),"0.000");A.equal(fix3(G(r,0)),r.toFixed(3))}});
T("symmetry F(θ) = G(90−θ), incl. decimals",()=>{for(const r of [0.2,0.4,0.5,0.762,0.8,1.2,1.6,2.345])for(let t=0;t<=90;t+=0.25){A.ok(Math.abs(F(r,t)-G(r,90-t))<1e-12,`r${r} ${t}`)}
 for(const r of [0.4,0.5,0.762]){const tb=table(r);for(let t=1;t<90;t++)A.equal(tb[t-1][1],tb[89-t][2])}});
T("45°: F = G = r(2−√2)",()=>{for(const r of [0.4,0.762,0.8])A.ok(Math.abs(F(r,45)-r*(2-Math.SQRT2))<1e-12&&Math.abs(G(r,45)-F(r,45))<1e-12)});
T("every table value for r 0.4/0.5/0.762 = formula rounded to 3 dp (independent check)",()=>{
 let c=0;for(const r of [0.4,0.5,0.762]){const tb=table(r);A.equal(tb.length,90);
 tb.forEach(([t,f,g],i)=>{A.equal(t,i+1);
  for(const [s,v] of [[f,r-r*Math.tan((90-t)*Math.PI/360)],[g,r-r*Math.tan(t*Math.PI/360)]]){
   A.match(s,/^\d\.\d{3}$/);const k=v*1000;A.ok(Math.abs(k-Math.floor(k)-0.5)>1e-6,`r${r} ${t}° too close to a rounding boundary: ${v}`);
   A.equal(Number(s),Math.round(k)/1000,`r${r} ${t}°`);A.ok(Math.abs(Number(s)-v)<=0.0005+1e-12);c++}})}
 console.log("    ("+c+" values checked)")});
T("F rises and G falls with θ",()=>{for(let t=0;t<90;t++){A.ok(F(0.8,t+1)>F(0.8,t));A.ok(G(0.8,t+1)<G(0.8,t))}});
T("decimal angle works",()=>{const q=slope(0.8,30.5);A.ok(Math.abs(q.F-(0.8-0.8*Math.tan((59.5/2)*Math.PI/180)))<1e-12)});
T("input errors",()=>{for(const [r,t] of [[0,45],[-1,45],[NaN,45],[0.8,-1],[0.8,90.1],[0.8,NaN]])A.throws(()=>slope(r,t))});
console.log("\nall "+n+" test groups passed");
