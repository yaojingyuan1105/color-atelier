(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AtelierPresentation=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function imageCaption(name){
  const title=String(name||'导入图片'),match=title.match(/^(.*?)(\.[a-z0-9]{1,6})$/i),stem=match?match[1]:title,extension=match?match[2]:'';
  let label=title;
  if(/^[a-f0-9-]{20,}$/i.test(stem))label='导入图片'+(extension?' · '+extension.slice(1).toUpperCase():'');
  else if([...stem].length>16)label=[...stem].slice(0,12).join('')+'…'+extension;
  return {label,title};
 }
 return {imageCaption};
});
