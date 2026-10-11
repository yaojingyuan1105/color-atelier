/* Three measured zero-size anchors preserve CSS rotate, scale, zoom and ancestor transforms. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PickerGeometry=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function fit(q,w,h){const s=Math.min(q.width/w,q.height/h);return {s,left:(q.width-w*s)/2,top:(q.height-h*s)/2};}
 function toPixel(x,y,q,w,h){const bx=q.b.x-q.a.x,by=q.b.y-q.a.y,cx=q.c.x-q.a.x,cy=q.c.y-q.a.y,d=bx*cy-by*cx;if(!d||!w||!h)return null;
  const dx=x-q.a.x,dy=y-q.a.y,u=(dx*cy-dy*cx)/d,v=(dy*bx-dx*by)/d,f=fit(q,w,h),px=(u*q.width-f.left)/f.s,py=(v*q.height-f.top)/f.s;
  return px>=0&&py>=0&&px<w&&py<h?{x:Math.floor(px),y:Math.floor(py)}:null;
 }
 function toScreen(p,q,w,h){const f=fit(q,w,h),u=(f.left+(p.x+.5)*f.s)/q.width,v=(f.top+(p.y+.5)*f.s)/q.height;return {x:q.a.x+(q.b.x-q.a.x)*u+(q.c.x-q.a.x)*v,y:q.a.y+(q.b.y-q.a.y)*u+(q.c.y-q.a.y)*v};}
 function fromViewport(x,y,r,clip,w,h){
  if(x<clip.left||y<clip.top||x>=clip.right||y>=clip.bottom||r.width<=0||r.height<=0)return null;
  const px=(x-r.left)*w/r.width,py=(y-r.top)*h/r.height;
  return px>=0&&py>=0&&px<w&&py<h?{x:Math.floor(px),y:Math.floor(py)}:null;
 }
 return {toPixel,toScreen,fromViewport};
});
