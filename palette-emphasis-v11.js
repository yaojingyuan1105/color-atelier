(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PaletteEmphasis=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function primaryHeight(colors){if(colors.length<2)return 108;return colors[0].share-colors[1].share<=5?86:108;}
 return {primaryHeight};
});

