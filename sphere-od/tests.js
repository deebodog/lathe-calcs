const fs=require("fs"),src=fs.readFileSync(__dirname+"/index.html","utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
const m={exports:{}};new Function("module",src)(m);const {solve,X,Z3}=m.exports,assert=require("assert");
const P=o=>solve(o).prog,D={SR:85,L:60,w:46,off:1,zc:-30};

assert.equal(P(D),"G00 X172. Z-5.290\nG01 X162.658 Z-5.290\nG03 X162.658 Z-54.710 R85.\nG01 X172.");
const r0=solve(D);
assert.equal(+r0.edge.toFixed(3),163.658);
assert.equal(+r0.xs.toFixed(3),162.658);
assert.equal(+r0.xe.toFixed(3),162.658);
assert.equal(Z3(r0.zs),"-5.290");
assert.equal(Z3(r0.ze),"-54.710");
assert.equal(Z3(r0.zef),"-7.000");
assert.equal(Z3(r0.zeb),"-53.000");
assert.equal(r0.peak,170);
assert.equal(r0.safe,172);
assert.equal(r0.cmd,"G03");

// blank / +30 centre Z same as -30; blank offset = 1
assert.equal(P({SR:85,L:60,w:46,off:1,zc:30}),P(D));
assert.equal(P({SR:85,L:60,w:46,off:1}),P(D));
assert.equal(P({SR:85,L:60,w:46,zc:-30}),P(D));
assert.equal(P({SR:85,L:60,w:46}),P(D));

assert.equal(P({...D,off:0.5}),"G00 X172. Z-6.128\nG01 X163.158 Z-6.128\nG03 X163.158 Z-53.872 R85.\nG01 X172.");
assert.equal(P({...D,off:0}),"G00 X172. Z-7.000\nG01 X163.658 Z-7.000\nG03 X163.658 Z-53.000 R85.\nG01 X172.");
assert.equal(P({...D,xs:162}),"G00 X172. Z-4.232\nG01 X162. Z-4.232\nG03 X162.658 Z-54.710 R85.\nG01 X172.");
assert.equal(P({...D,xs:162,xe:161.5}),"G00 X172. Z-4.232\nG01 X162. Z-4.232\nG03 X161.5 Z-56.541 R85.\nG01 X172.");

// Z3 always 3 dp; X strips trailing zeros but keeps a decimal point
assert.equal(X(85),"85.");
assert.equal(X(172),"172.");
assert.equal(X(162.65818036383027),"162.658");
assert.equal(X(161.5),"161.5");

assert.throws(()=>solve({...D,off:-0.2}),/0 or more/);
assert.throws(()=>solve({...D,xs:171}),/larger than the sphere/);
assert.throws(()=>solve({...D,xe:170.1}),/larger than the sphere/);
assert.throws(()=>solve({...D,xs:180}),/larger than the sphere/);
assert.throws(()=>solve({SR:85,L:60,w:46,off:5,zc:-30}),/outside the part/);
assert.throws(()=>solve({SR:85,L:40,w:46,off:1,zc:-20}),/longer than the part/);
assert.throws(()=>solve({SR:20,L:60,w:46,off:1,zc:-30}),/half the crown width/);
assert.throws(()=>solve({...D,xs:0}),/positive/);
assert.throws(()=>solve({...D,xe:-1}),/positive/);
assert.throws(()=>solve({SR:0,L:60,w:46}),/SR must be positive/);
assert.throws(()=>solve({SR:85,L:0,w:46}),/Part length/);

// existing bore calculator must stay unchanged (separate page, v6)
const boreSrc=fs.readFileSync(__dirname+"/../sphere/tests.js","utf8");
assert(boreSrc.includes('G01 X120.05 Z0.914\\nG03 X120.05 Z-33.914 R62.5'));
assert(fs.readFileSync(__dirname+"/../sphere/sw.js","utf8").includes("sphere-v6"));

console.log("all tests passed\n");
console.log("default program\n"+P(D));
console.log("edge Ø "+X(r0.edge)+"  start Z"+Z3(r0.zs)+"  end Z"+Z3(r0.ze));
