(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ColorCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function rgbLab(r,g,b){const lin=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};r=lin(r);g=lin(g);b=lin(b);const f=v=>v>.008856?Math.cbrt(v):7.787*v+16/116;const x=f((.4124564*r+.3575761*g+.1804375*b)/.95047),y=f(.2126729*r+.7151522*g+.072175*b),z=f((.0193339*r+.119192*g+.9503041*b)/1.08883);return[116*y-16,500*(x-y),200*(y-z)];}
const dist=(a,b)=>a.reduce((s,n,i)=>s+(n-b[i])**2,0);
const hex=rgb=>'#'+rgb.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
async function quantize(p,k,isCurrent=()=>true,yieldTask=()=>Promise.resolve()){
 if(!isCurrent())return null;
 k=Math.min(9,Math.max(3,Math.round(k)||6));
 const hist=new Map();
 for(let i=0;i<p.length;i+=4){if(p[i+3]<16)continue;const w=p[i+3]/255,key=(p[i]>>3)*1024+(p[i+1]>>3)*32+(p[i+2]>>3);
 let a=hist.get(key);if(!a){a={w:0,rgb:[p[i],p[i+1],p[i+2]],sum:[0,0,0]};hist.set(key,a);}a.w+=w;for(let n=0;n<3;n++)a.sum[n]+=p[i+n]*w;}
 if(!hist.size)throw new Error('图片没有可分析的可见像素。');
 const points=[...hist.values()].map(p=>({...p,lab:rgbLab(...p.sum.map(v=>v/p.w))})).sort((a,b)=>b.w-a.w);
 const centers=[points[0].lab.slice()],target=Math.min(k*3,points.length);
 while(centers.length<target){let best=null,score=0;for(const p of points){const d=Math.min(...centers.map(c=>dist(c,p.lab))),value=d*Math.sqrt(p.w);if(d>12&&value>score){score=value;best=p.lab;}}if(!best)break;centers.push(best.slice());}
 let groups;
 for(let iteration=0;iteration<9;iteration++){
  if(!isCurrent())return null;
  groups=centers.map(()=>({w:0,sum:[0,0,0],members:[]}));
  for(const p of points){let id=0,best=Infinity;centers.forEach((c,j)=>{const d=dist(c,p.lab);if(d<best){best=d;id=j;}});const g=groups[id];g.w+=p.w;g.members.push(p);p.lab.forEach((v,n)=>g.sum[n]+=v*p.w);}
  groups.forEach((g,i)=>{if(g.w)centers[i]=g.sum.map(v=>v/g.w);});
  if(iteration%3===0)await yieldTask();
 }
 groups=groups.filter(g=>g.w).map(g=>({...g,lab:g.sum.map(v=>v/g.w)}));
 while(groups.length>k){let ai=0,bi=1,best=Infinity;
  for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){const a=groups[i],b=groups[j],score=dist(a.lab,b.lab)*Math.sqrt(a.w*b.w/(a.w+b.w));if(score<best){best=score;ai=i;bi=j;}}
  const a=groups[ai],b=groups[bi],w=a.w+b.w;groups[ai]={w,lab:a.lab.map((v,i)=>(v*a.w+b.lab[i]*b.w)/w),members:a.members.concat(b.members)};groups.splice(bi,1);
 }
 const colors=groups.map(g=>{const representative=g.members.reduce((best,p)=>dist(p.lab,g.lab)<dist(best.lab,g.lab)?p:best,g.members[0]);return{rgb:representative.rgb,hex:hex(representative.rgb),lab:rgbLab(...representative.rgb),w:0};});
 // Reassign areas against the exact displayed RGB, not the intermediate cluster average.
 for(const p of points){let id=0,best=Infinity;colors.forEach((c,i)=>{const d=dist(c.lab,p.lab);if(d<best){best=d;id=i;}});colors[id].w+=p.w;}
 if(!isCurrent())return null;
 const result=colors.filter(c=>c.w).sort((a,b)=>b.w-a.w),total=result.reduce((n,c)=>n+c.w,0);
 result.forEach(c=>{delete c.lab;c.share=c.w/total*100;c.percent=Math.floor(c.share);});
 let left=100-result.reduce((n,c)=>n+c.percent,0);[...result].sort((a,b)=>(b.share-b.percent)-(a.share-a.percent)).forEach(c=>{if(left-->0)c.percent++;});
 return result;
}
function selectPose({analysis,hover,motion,preview}){return analysis||preview||(motion&&hover)||'normal';}
return{quantize,rgbLab,selectPose};
});

