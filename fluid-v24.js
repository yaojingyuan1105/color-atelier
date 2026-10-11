(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AtelierFluid=api;})(typeof globalThis==='object'?globalThis:this,function(){
 function frame(windowWidth,windowHeight,gutter){
  const width=windowWidth-2*gutter,height=windowHeight-2*gutter;
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return null;
  const scale=Math.min(1.25,width/1150,height/760);
  return {width,height,scale,artWidth:width/scale,artHeight:height/scale};
 }
 return {frame};
});
