(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AtelierStage=api;})(typeof globalThis==='object'?globalThis:this,function(){
 'use strict';
 function fitStage(width,height,artWidth,artHeight,gutter){
  if(!(artWidth>0&&artHeight>0))return null;
  const scale=Math.max(0,Math.min(1,(width-2*gutter)/artWidth,(height-2*gutter)/artHeight));
  return {scale,width:artWidth*scale,height:artHeight*scale};
 }
 function createReveal({motion,button,open,character,schedule=setTimeout,cancel=clearTimeout}){
  let pending=false,timer;
  function finish(){if(!pending)return;pending=false;cancel(timer);open();if(motion())character();}
  function start(){if(pending)return;pending=true;if(!motion()){finish();return;}button();timer=schedule(finish,280);}
  return {start,finish};
 }
 return {fitStage,createReveal};
});
