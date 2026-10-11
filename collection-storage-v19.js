/* Only RGB/alpha favorites are persisted. Never image data, filenames or pixel coordinates. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./picker-core-v19.js'));else root.PickerStorage=factory(root.PickerCore);})(typeof globalThis!=='undefined'?globalThis:this,function(core){
 const KEY='color-atelier.favorites.v1';
 function createStore(getStorage){
  let base,blocked=false;
  function load(){
   try{const raw=getStorage().getItem(KEY),changed=raw!==base;base=raw;blocked=false;
    if(raw===null)return {status:'empty',colors:[],changed};
    let data;try{data=JSON.parse(raw);}catch{blocked=true;return {status:'invalid',colors:[],changed};}
    const colors=data?.version===1?core.normalizeColors(data.colors):null;
    if(!colors){blocked=true;return {status:'invalid',colors:[],changed};}
    return {status:'ok',colors,changed};
   }catch{return {status:'unavailable',colors:[],changed:false};}
  }
  function save(input){
   const colors=core.normalizeColors(input);if(!colors||blocked)return {status:'invalid'};
   try{const disk=getStorage();if(disk.getItem(KEY)!==base)return {status:'conflict'};
    const raw=JSON.stringify({version:1,colors});disk.setItem(KEY,raw);base=raw;return {status:'ok'};
   }catch{return {status:'unavailable'};}
  }
  return {load,save};
 }
 return {KEY,createStore};
});
