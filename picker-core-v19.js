(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PickerCore=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 function mapPoint(clientX,clientY,rect,width,height){
  if(!(rect.width>0&&rect.height>0&&width>0&&height>0))return null;
  const scale=Math.min(rect.width/width,rect.height/height),left=rect.left+(rect.width-width*scale)/2,top=rect.top+(rect.height-height*scale)/2;
  const x=(clientX-left)/scale,y=(clientY-top)/scale;
  return x>=0&&y>=0&&x<width&&y<height?{x:Math.floor(x),y:Math.floor(y)}:null;
 }
 function pixelColor(rgba){if(!rgba[3])return null;const rgb=Array.from(rgba).slice(0,3);return {hex:'#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase(),rgb,alpha:rgba[3]};}
 function codeBackground(rgb){const lin=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return lin[0]*.2126+lin[1]*.7152+lin[2]*.0722>.179?'#17131f':'#fff9ee';}
 function normalizeColors(input,limit=24){
  if(!Array.isArray(input)||input.length>limit)return null;
  const colors=[],seen=new Set();
  for(const c of input){if(!c||!Array.isArray(c.rgb)||c.rgb.length!==3||c.rgb.some(v=>!Number.isInteger(v)||v<0||v>255))return null;
   const alpha=c.alpha??255;if(!Number.isInteger(alpha)||alpha<1||alpha>255)return null;
   const color=pixelColor([...c.rgb,alpha]),key=color.hex+':'+alpha;if(!seen.has(key)){seen.add(key);colors.push(color);}
  }return colors;
 }
 function createCollection(limit=24){
  let current=null,colors=[],history=[];const clone=v=>JSON.parse(JSON.stringify(v));
  function remember(kind,color){history.push(clone({current,colors,action:{kind,hex:color?.hex??null}}));if(history.length>50)history.shift();}
  return {
   pick(color){remember('pick',color);current=clone(color);return true;},
   add(color){
    if(!color||!Array.isArray(color.rgb)||color.rgb.length!==3||color.rgb.some(v=>!Number.isInteger(v)||v<0||v>255))return 'invalid';
    const alpha=color.alpha??255;if(!Number.isInteger(alpha)||alpha<1||alpha>255)return 'invalid';
    const normalized=pixelColor([...color.rgb,alpha]);
    if(colors.some(c=>c.hex===normalized.hex&&c.alpha===normalized.alpha))return 'duplicate';
    if(colors.length>=limit)return 'full';
    remember('save',normalized);colors.push(normalized);return 'saved';
   },
   save(){if(!current)return 'empty';if(colors.some(c=>c.hex===current.hex&&c.alpha===current.alpha))return 'duplicate';if(colors.length>=limit)return 'full';remember('save',current);colors.push(clone(current));return 'saved';},
   remove(index){if(!Number.isInteger(index)||index<0||index>=colors.length)return false;remember('remove',colors[index]);colors.splice(index,1);return true;},
   undo(){if(!history.length)return false;({current,colors}=history.pop());return true;},
   clear(){if(!colors.length)return false;remember('clear',null);colors=[];return true;},
   restore(saved){const normalized=normalizeColors(saved,limit);if(!normalized)return false;colors=normalized;history=[];return true;},
   resetSelection(){current=null;history=[];},
   snapshot(){return clone({current,colors,canUndo:!!history.length,undoAction:history.at(-1)?.action??null});}
  };
 }
 return {mapPoint,pixelColor,codeBackground,createCollection,normalizeColors};
});
