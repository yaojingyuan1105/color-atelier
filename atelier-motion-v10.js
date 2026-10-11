(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AtelierMotion=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function poseMarkup({key,src,width,height,box}){const [x,y,w,h]=box;return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+box.join(' ')+'" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs><clipPath id="pose-'+key+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/></clipPath></defs><image href="'+src+'" width="'+width+'" height="'+height+'" clip-path="url(#pose-'+key+')"/></svg>';}
 function createBurstGate(delay=1200){let last=-Infinity;return function(now,motion){if(!motion||now-last<delay)return false;last=now;return true;};}
 return {poseMarkup,createBurstGate};
});

