const fs=require("fs"),src=fs.readFileSync(__dirname+"/index.html","utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
const m={exports:{}};new Function("module",src)(m);const {solve}=m.exports,assert=require("assert");
const P=o=>solve(o).prog,show=(n,o)=>{try{const r=solve(o);console.log(n+"\n"+r.prog+(r.warn?"\n  WARN "+r.warn:""))}catch(e){console.log(n+"\n  ERROR "+e)}};
const A={shape:"bore",SR:42.5,D:82.1,L:40,zc:-18};
assert.equal(P({...A,xs:81.1}),"G01 X81.1 Z-5.274\nG03 X81.1 Z-30.726 R42.5");
for(const L of [40,60])for(const zc of [-18,18])assert.equal(P({...A,L,zc,xs:82.1}),"G01 X82.1 Z-6.993\nG03 X82.1 Z-29.007 R42.5");
assert.equal(P({...A}),"G01 X82.1 Z-6.993\nG03 X82.1 Z-29.007 R42.5");
for(const xs of [78,null])assert.equal(P({shape:"bore",SR:40,D:78,L:20,xs}),"G01 X78. Z-1.112\nG03 X78. Z-18.888 R40.");
// X start below the bore: arc meets Z0 in front of the face (Z+) and ends symmetrically behind the back face, in air
assert.equal(P({shape:"bore",SR:40,D:78,L:20,xs:77}),"G01 X77. Z0.851\nG03 X77. Z-20.851 R40.");
assert.equal(solve({shape:"bore",SR:40,D:78,L:20,xs:77}).zback,true);
// arc starting inside the part but running off the back is still refused
assert.throws(()=>solve({shape:"bore",SR:40,D:78,L:20,zc:-12,xs:77}),/runs off the part/);
// Adam: SR62.5 in 33 wide part, bore 121.05
{const B={shape:"bore",SR:62.5,D:121.05,L:33};
 assert.equal(P({...B,xs:120.05}),"G01 X120.05 Z0.914\nG03 X120.05 Z-33.914 R62.5");
 assert.equal(P({...B,xs:120.65}),"G01 X120.65 Z-0.155\nG03 X120.65 Z-32.845 R62.5");
 assert.equal(P({...B,xs:120.05,zst:2}),"G00 X120.05 Z2.000\nG01 X120.05 Z0.914\nG03 X120.05 Z-33.914 R62.5");
 assert.equal(solve({...B,xs:120.05}).warn,"");
 assert.equal(solve({...B,xs:120.05}).zfront,true);}
assert.throws(()=>solve({shape:"bore",SR:40,D:78,L:20,xs:-1}),/positive/);
assert.throws(()=>solve({shape:"bore",SR:40,D:78,L:20,xs:81}),/at least D\/2/);
// Z+ approach starts: arc and existing lines unchanged, G00 start line prepended
for(const z of [1,2,5]){assert.equal(P({...A,xs:81.1,zst:z}),"G00 X81.1 Z"+z+".000\nG01 X81.1 Z-5.274\nG03 X81.1 Z-30.726 R42.5");}
assert.equal(P({shape:"bore",SR:40,D:78,L:20,zst:2}),"G00 X78. Z2.000\nG01 X78. Z-1.112\nG03 X78. Z-18.888 R40.");
assert.equal(P({shape:"bore",SR:40,D:78,L:20,zst:0}),"G00 X78. Z0.000\nG01 X78. Z-1.112\nG03 X78. Z-18.888 R40.");
assert.equal(P({shape:"bore",SR:40,D:78,L:20,zst:-1}),"G00 X78. Z-1.000\nG01 X78. Z-1.112\nG03 X78. Z-18.888 R40.");
assert.equal(P({...A,xs:81.1,zst:null}),P({...A,xs:81.1}));
assert.equal(solve({...A,xs:81.1,zst:2}).zplus,true);
assert.throws(()=>solve({shape:"bore",SR:40,D:78,L:20,zst:-5}),/past the arc start/);
assert.equal(P({shape:"convex",SR:40,D:78,L:20,xs:80,zst:3}),"G00 X80. Z3.000\nG01 X80. Z-"+(P({shape:"convex",SR:40,D:78,L:20,xs:80}).match(/Z-([\d.]+)/)[1])+"\nG03 X80. Z-"+P({shape:"convex",SR:40,D:78,L:20,xs:80}).split("G03")[1].match(/Z-([\d.]+)/)[1]+" R40.");
// arc start itself in front of Z0 (Z+): accepted, still ends inside the part
{const r=solve({shape:"bore",SR:40,D:78,L:30,zc:-5});assert.equal(r.prog,"G01 X78. Z3.888\nG03 X78. Z-13.888 R40.");assert.equal(r.zfront,true);
 assert.equal(P({shape:"bore",SR:40,D:78,L:30,zc:-5,zst:6}),"G00 X78. Z6.000\nG01 X78. Z3.888\nG03 X78. Z-13.888 R40.");
 assert.throws(()=>solve({shape:"bore",SR:40,D:78,L:30,zc:-5,zst:2}),/past the arc start/);
 assert.equal(solve({...A,xs:81.1}).zfront,false);}
console.log("all tests passed\n");
show("SR42.5 D82.1 c-18 X81.1",{...A,xs:81.1});show("X82.1",{...A,xs:82.1});show("D78 SR40 L20 X77",{shape:"bore",SR:40,D:78,L:20,xs:77});
show("D78 SR40 L30 X77",{shape:"bore",SR:40,D:78,L:30,zc:-15,xs:77});show("X79",{shape:"bore",SR:40,D:78,L:20,xs:79});
show("OD convex X79",{shape:"convex",SR:40,D:78,L:20,xs:79});show("groove X49",{shape:"groove",SR:5,D:50,L:20,w:8,xs:49});
show("Z+2 start",{...A,xs:81.1,zst:2});