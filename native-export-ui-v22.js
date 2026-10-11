window.AtelierNativeExport={mount({toast}){
 const dialog=document.createElement('dialog');dialog.className='swatchDialog';dialog.setAttribute('aria-labelledby','nativeExportTitle');
 dialog.innerHTML='<h2 id="nativeExportTitle">Export Swatches</h2><p class="exportSummary"></p><div class="nativeLinks"><a class="acoLink">下载 ACO<small>Photoshop 优先</small></a><a class="aseLink">下载 ASE<small>Adobe 交换色板</small></a></div><p>PS：窗口 → 色板 → 面板菜单 → 导入色板，选择下载的 ACO 文件。导入后，点击色样即可设为前景色。</p><p class="exportNote">导出 RGB 数值；建议在 sRGB 工作流使用。色板不含透明度与 ICC 配置，半透明颜色只导出其 RGB，并在色名注明原透明度。不同文档色彩配置可能导致观感差异。</p><div class="exportFoot"><button type="button" class="previewPng">另存预览 PNG</button><button type="button" class="closeNative">返回</button></div>';
 document.body.append(dialog);let urls=[],trigger=null,preview=null;
 function revoke(){urls.forEach(URL.revokeObjectURL);urls=[];}
 dialog.querySelector('.closeNative').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{revoke();trigger?.focus({preventScroll:true});});
 dialog.querySelector('.previewPng').onclick=()=>{dialog.close();preview?.();};
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 return {open(colors,label,png,source){
  if(!colors.length){toast('先提取或收藏颜色。');return;}
  try{revoke();for(const type of ['aco','ase']){const data=SwatchExport[type](colors),url=URL.createObjectURL(new Blob([data],{type:'application/octet-stream'}));urls.push(url);const a=dialog.querySelector('.'+type+'Link');a.href=url;a.download='Color-Atelier-'+label+'.'+type;}
   dialog.querySelector('.exportSummary').textContent=label+' · '+colors.length+' 色 · 可导入的原生色板';trigger=source;preview=png;dialog.showModal();
  }catch{revoke();toast('色板生成失败，请重新选色。');}
 }};
}};
