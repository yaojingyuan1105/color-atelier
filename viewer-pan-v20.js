/* Temporary Space-hand tool. It never changes eyedropper mode or color history. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ViewerPan=api;})(globalThis,()=>({
 mount({viewer,scroller,isPicking,canPan,onChange,eventRoot=window,documentRoot=document}){
  let held=false,pointerId=null,drag=null,suppressClick=false;
  function update(){viewer.classList.toggle('temporaryPan',held);scroller.classList.toggle('drag',!!drag);onChange();}
  function endPointer(){const id=pointerId;pointerId=null;drag=null;if(id!==null&&scroller.hasPointerCapture(id))scroller.releasePointerCapture(id);}
  function reset(){held=false;endPointer();update();}
  scroller.addEventListener('keydown',e=>{
   if(e.target!==scroller||!viewer.open||!isPicking()||e.key!==' '||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;
   e.preventDefault();e.stopImmediatePropagation();
   if(e.repeat||held)return;
   held=true;update();
  },true);
  eventRoot.addEventListener('keyup',e=>{if(e.key===' '&&held){held=false;drag=null;update();}});
  scroller.addEventListener('pointerdown',e=>{
   if(!viewer.open||e.button!==0||e.isPrimary===false||pointerId!==null)return;
   // A new physical click must work even if a cancelled gesture emitted no click.
   suppressClick=false;
   if(isPicking()&&!held)return;
   if(!held&&!canPan())return;
   suppressClick=true;pointerId=e.pointerId;
   if(canPan())drag={x:e.clientX,y:e.clientY,left:scroller.scrollLeft,top:scroller.scrollTop};
   scroller.setPointerCapture(pointerId);e.preventDefault();update();
  },true);
  scroller.addEventListener('pointermove',e=>{
   if(!drag||e.pointerId!==pointerId)return;
   scroller.scrollLeft=drag.left-(e.clientX-drag.x);scroller.scrollTop=drag.top-(e.clientY-drag.y);
  });
  scroller.addEventListener('pointerup',e=>{if(e.pointerId===pointerId){endPointer();update();}});
  scroller.addEventListener('pointercancel',e=>{if(e.pointerId===pointerId)reset();});
  scroller.addEventListener('lostpointercapture',e=>{if(e.pointerId===pointerId)reset();});
  scroller.addEventListener('click',e=>{
   if(held||suppressClick){suppressClick=false;e.preventDefault();e.stopImmediatePropagation();}
  },true);
  scroller.addEventListener('blur',reset);eventRoot.addEventListener('blur',reset);
  documentRoot.addEventListener('visibilitychange',()=>{if(documentRoot.hidden)reset();});
  viewer.addEventListener('close',reset);viewer.addEventListener('cancel',reset);
  return {reset,isBlocked:()=>held||pointerId!==null};
 }
}));
