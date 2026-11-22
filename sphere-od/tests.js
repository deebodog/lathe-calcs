const fs=require("fs"),src=fs.readFileSync(__dirname+"/index.html","utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
const m={exports:{}};new Function("module",src)(m);const {solve,W}=m.exports,assert=require("assert");
const PB={D:169.89,zc:-30,zs:-7,ze:-53,ro:1};
const P=o=>solve(o).prog;

assert.equal(P(PB),"G00 X162.968 Z-6.\nG03 X162.968 Z-54. R84.945");
assert.equal(+solve(PB).edgeS.toFixed(3),163.544);
assert.equal(P({...PB,ro:0.5}),"G00 X163.259 Z-6.5\nG03 X163.259 Z-53.5 R84.945");
assert.equal(P({...PB,ro:0.25}),"G00 X163.402 Z-6.75\nG03 X163.402 Z-53.25 R84.945");
assert.equal(P({...PB,ro:0}),"G00 X163.544 Z-7.\nG03 X163.544 Z-53. R84.945");
assert.equal(P({...PB,ro:""}),P(PB));
assert.equal(P({...PB,ro:null}),P(PB));
assert.equal(P({D:169.89,zc:30,zs:7,ze:53,ro:1}),P(PB));
assert.throws(()=>solve({...PB,ro:-0.1}),/0 or more/);
assert.throws(()=>solve({...PB,D:0}),/Sphere/);
assert.throws(()=>solve({...PB,zs:-53,ze:-7}),/in front/);
assert.throws(()=>solve({...PB,ro:80}),/outside the sphere/);

assert.equal(W(-6),"-6.");
assert.equal(W(-6.5),"-6.5");
assert.equal(W(163.25934000846627),"163.259");
assert.equal(W(84.945),"84.945");

const html=fs.readFileSync(__dirname+"/index.html","utf8");
assert(html.includes('id="ro"') && html.includes('step="0.1"') && html.includes('min="0"'));
assert(!html.includes("<form")); // no form, so step cannot block typed values such as 0.25
assert.equal(P(PB).split("\n").length,2);

assert(fs.readFileSync(__dirname+"/../sphere/sw.js","utf8").includes("sphere-v6"));
assert(fs.readFileSync(__dirname+"/sw.js","utf8").includes("od-sphere-v2"));
assert(fs.readFileSync(__dirname+"/../sphere/tests.js","utf8").includes('G01 X120.05 Z0.914\\nG03 X120.05 Z-33.914 R62.5'));

console.log("all tests passed\n"+P(PB)+"\n"+P({...PB,ro:0.5}));
