(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WorkbenchLayout=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function imageFrameHeight(imageWidth,imageHeight,availableWidth,maxHeight=440){
 if(!Number.isFinite(imageWidth)||!Number.isFinite(imageHeight)||!Number.isFinite(availableWidth)||imageWidth<=0||imageHeight<=0||availableWidth<=0)return 240;
 return Math.max(130,Math.min(maxHeight,availableWidth*imageHeight/imageWidth));
}
function groupColors(colors){return colors.map((color,i)=>({...color,role:i===0?'primary':color.share<=8?'accent':'secondary'}));}
return{imageFrameHeight,groupColors};
});

