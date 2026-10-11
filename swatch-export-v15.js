/* RGB swatches, Adobe ACO v1+v2 and ASE 1.0. Neither stores per-swatch alpha or an ICC profile. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SwatchExport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function normalize(colors){
  if(!Array.isArray(colors)||!colors.length||colors.length>65535)throw new Error('请选择 1–65535 个颜色');
  return colors.map(c=>{if(!Array.isArray(c.rgb)||c.rgb.length!==3||c.rgb.some(v=>!Number.isInteger(v)||v<0||v>255)||c.alpha===0)throw new Error('无效 RGB 或完全透明颜色');
   const hex='#'+c.rgb.map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
   return {rgb:c.rgb,name:hex+(c.alpha!=null&&c.alpha<255?' (alpha '+Math.round(c.alpha/255*100)+'%)':'')};});
 }
 function writer(){const bytes=[];return {u16(n){bytes.push(n>>>8&255,n&255);},u32(n){bytes.push(n>>>24&255,n>>>16&255,n>>>8&255,n&255);},ascii(s){for(const c of s)bytes.push(c.charCodeAt(0));},float(n){const a=new ArrayBuffer(4);new DataView(a).setFloat32(0,n,false);bytes.push(...new Uint8Array(a));},utf(s){for(let i=0;i<s.length;i++)this.u16(s.charCodeAt(i));this.u16(0);},append(b){bytes.push(...b);},result(){return new Uint8Array(bytes);}};}
 function aco(input){const colors=normalize(input),w=writer();for(const version of [1,2]){w.u16(version);w.u16(colors.length);for(const c of colors){w.u16(0);c.rgb.forEach(v=>w.u16(v*257));w.u16(0);if(version===2){w.u32(c.name.length+1);w.utf(c.name);}}}return w.result();}
 function ase(input){const colors=normalize(input),w=writer();w.ascii('ASEF');w.u16(1);w.u16(0);w.u32(colors.length);for(const c of colors){const b=writer();b.u16(c.name.length+1);b.utf(c.name);b.ascii('RGB ');c.rgb.forEach(v=>b.float(v/255));b.u16(2);const bytes=b.result();w.u16(1);w.u32(bytes.length);w.append(bytes);}return w.result();}
 return {aco,ase};
});
