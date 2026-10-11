/* Original-pixel sampling with local-only favorite colors. No image persistence or network requests. */
window.AtelierPicker={mount({getImage,isBusy,copyText,toast,respond,exportCanvas,getPalette,viewerPan}){
 const $=s=>document.querySelector(s),core=PickerCore,model=core.createCollection();
 const store=PickerStorage.createStore(()=>window.localStorage),loaded=store.load();
 if(loaded.status==='ok')model.restore(loaded.colors);
 let storageStatus=['ok','empty'].includes(loaded.status)?'ok':loaded.status;
 let renderedColors=JSON.stringify(core.normalizeColors(model.snapshot().colors)),savedColors=renderedColors;
 const photo=$('.imagePreview'),image=$('#sourceImage'),speech=$('.speechText');
 speech.setAttribute('aria-live','polite');
 let active=false,pinned=false,lastPoint=null,raf=0,pending=null,viewerPicking=false;
 const viewer=$('.imageDialog'),viewerImage=viewer.querySelector('.imageScroller img'),viewerScroll=viewer.querySelector('.imageScroller');
 const viewerBar=document.createElement('div');viewerBar.className='viewerPickerBar';
 viewerBar.innerHTML='<button type="button" id="viewerPicker" aria-label="开启放大图吸色" aria-pressed="false">⌖ 吸色</button><div class="viewerResult" aria-live="polite">开启吸色后，点击图片细节。</div><button type="button" id="viewerSave" disabled>♡ 收藏</button><button type="button" id="viewerUndo" disabled aria-label="撤销放大图取色操作">↶</button><span class="viewerFeedback" role="status"></span>';
 viewer.querySelector('footer').prepend(viewerBar);
 const viewerHint=document.createElement('div');viewerHint.id='viewerHint';viewerHint.textContent='滚轮缩放 · 放大后可拖动；吸色时按住空格拖动 · 不改变整图自动提色';
 // Keep the original footer footprint local to the modal, never to the main poster.
 [...viewer.querySelector('footer').childNodes].filter(n=>n.nodeType===3).forEach(n=>n.remove());viewer.querySelector('footer').append(viewerHint);
 viewerScroll.tabIndex=0;viewerScroll.setAttribute('aria-label','放大原图查看区域');viewerScroll.setAttribute('aria-describedby','viewerHint');
 const tools=document.createElement('div');tools.className='pickerTools';
 tools.innerHTML='<button id="togglePicker" type="button" aria-pressed="false" aria-label="开启精准吸色"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5m-3-7a2.8 2.8 0 0 1 4 4l-3 3 1 1-2 2-1-1-8 8-4 1 1-4 8-8-1-1 2-2 1 1Z"/></svg><span class="pickerLabel">吸色</span></button><button id="savePicked" type="button" disabled aria-label="收藏当前颜色">♡ 收藏</button><button id="undoPick" type="button" disabled aria-label="撤销上一步" title="撤销上一步">↶</button><button id="pickerHelp" type="button" aria-label="精准吸色帮助" title="操作说明">?</button>';
 const hint=document.createElement('p');hint.className='pickerHint';hint.id='pickerHint';hint.hidden=true;hint.textContent='点选原图像素 · 方向键微调，Enter 取色 · Esc 退出';
 $('.caption').prepend(tools);$('.source').append(hint);
 const help=document.createElement('dialog');help.className='swatchDialog pickerHelpDialog';help.setAttribute('aria-label','精准吸色说明');
 help.innerHTML='<h2>Pick a Color</h2><p>点击图片，读取该位置的原图像素。气泡中的同色色号可点击复制；喜欢的颜色点「♡ 收藏」。</p><p>方向键微调 1 像素，Shift + 方向键移动 10 像素；Enter 取色，Esc 退出。吸管关闭后，点击图片可放大查看。</p><div class="exportFoot"><button type="button">知道了</button></div>';
 document.body.append(help);help.querySelector('button').onclick=()=>help.close();help.addEventListener('close',()=>$('#pickerHelp').focus({preventScroll:true}));
 $('#pickerHelp').onclick=()=>{hideLens();help.showModal();};
 const panel=document.createElement('section');panel.className='pickPanel';panel.setAttribute('aria-label','本地收藏色');
 panel.innerHTML='<h3>Picked Colors</h3><p class="pickMeta">正在读取本地收藏…</p><div class="pickList"></div><div class="pickEmpty"><svg viewBox="0 0 160 108" aria-hidden="true"><g fill="none" stroke="#17131f" stroke-width="2.5" stroke-linejoin="round"><path fill="#fff9ee" d="M25 21 90 10 104 88 39 99Z"/><path fill="#fff02a" d="M32 27 84 18 93 61 40 71Z"/><path fill="#fff9ee" d="M62 7 129 19 115 101 48 89Z"/><path fill="#10cad5" d="M68 16 122 25 114 65 61 57Z"/><path fill="#f5008f" stroke="#fff9ee" d="M74 41Q73 24 85 29L90 38Q107 27 106 41Q103 52 83 60Z"/><path stroke="#f5008f" d="m138 24 5-10m-2 22 12-2M14 64l-8 7M22 77l-3 11"/></g></svg><strong>挑出你的第一颗颜色</strong><p>点自动色块上的 ♡，<br>或从图片细节里挑一颗。</p><div class="emptyActions"><button type="button" id="emptyAuto">去选自动色</button><button type="button" id="emptyPick">⌖ 从图片吸色</button></div></div><div class="pickActions"><button id="undoCollection" type="button" disabled aria-label="撤销收藏操作">↶ 撤销</button><button id="copyPicked" type="button" disabled>复制色值</button><button id="exportPicked" type="button" disabled>导出色板 ↗</button></div>';
 
 const book=$('.book'),meta=$('.bookMeta'),body=document.createElement('div'),automatic=document.createElement('div');
 body.className='bookBody';automatic.className='automaticPane';automatic.id='automaticPane';automatic.setAttribute('role','tabpanel');
 while(meta.nextSibling)automatic.append(meta.nextSibling);
 body.append(automatic,panel);book.append(body);panel.hidden=true;panel.id='manualPane';panel.setAttribute('role','tabpanel');
 const tabs=document.createElement('div');tabs.className='paletteTabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','色样册内容');
 tabs.innerHTML='<button type="button" role="tab" id="automaticTab" aria-controls="automaticPane" aria-selected="true">自动提色</button><button type="button" role="tab" id="manualTab" aria-controls="manualPane" aria-selected="false" tabindex="-1">我的收藏 <span class="pickCount">0</span></button>';
 meta.firstElementChild.replaceWith(tabs);automatic.setAttribute('aria-labelledby','automaticTab');panel.setAttribute('aria-labelledby','manualTab');
 function setTab(manual){automatic.style.visibility=manual?'hidden':'';automatic.inert=manual;panel.hidden=!manual;meta.querySelector('.chip').style.visibility=manual?'hidden':'';tabs.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-selected',String(!!i===manual));b.tabIndex=(!!i===manual)?0:-1;});}
 tabs.querySelectorAll('button').forEach((b,i)=>{b.onclick=()=>setTab(!!i);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?1:1-i;setTab(!!next);tabs.children[next].focus();}};});
 const anchors=[[0,0],[100,0],[0,100]].map(([left,top])=>{const a=document.createElement('span');a.className='pickAnchor';a.style.left=left+'%';a.style.top=top+'%';a.setAttribute('aria-hidden','true');photo.append(a);return a;});
 function quad(){const [a,b,c]=anchors.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y};});const style=getComputedStyle(image);return {a,b,c,width:parseFloat(style.width),height:parseFloat(style.height)};}
 const nativeExport=AtelierNativeExport.mount({toast});
 const originalAutoPng=$('#saveCard').onclick;$('#saveCard').textContent='导出色板 ↗';
 $('#saveCard').onclick=()=>nativeExport.open(getPalette(),'自动提色',()=>originalAutoPng(),$('#saveCard'));

 const lens=document.createElement('div');lens.className='pickLens';lens.hidden=true;lens.setAttribute('aria-hidden','true');lens.innerHTML='<div class="lensGrid"><canvas width="11" height="11"></canvas></div><output></output>';document.body.append(lens);
 const marker=document.createElement('div');marker.className='pickMarker';marker.hidden=true;marker.setAttribute('aria-hidden','true');document.body.append(marker);
 const tile=lens.querySelector('canvas'),ctx=tile.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
 const toggle=$('#togglePicker'),save=$('#savePicked'),undo=$('#undoPick'),copy=$('#copyPicked'),exportButton=$('#exportPicked');
 const alphaText=c=>c.alpha<255?' · α '+Math.round(c.alpha/255*100)+'%':'';
 function code(c){const b=document.createElement('button');b.type='button';b.className='pickCode';b.textContent=c.hex;b.style.color=c.hex;b.style.background=core.codeBackground(c.rgb);b.title='点击复制 '+c.hex+alphaText(c);b.setAttribute('aria-label','复制所选色号 '+c.hex);b.onclick=async()=>{const ok=await copyText(c.hex);if(viewer.open)viewerBar.querySelector('.viewerFeedback').textContent=ok?'已复制 '+c.hex:'无法访问剪贴板，请手动复制色号。';};return b;}
 function report(c){pinned=true;speech.classList.add('pickSpeech');speech.replaceChildren();if(c){speech.append('这里是 ',code(c),c.alpha<255?'。透明度 '+Math.round(c.alpha/255*100)+'%。':'。记好了。');}else speech.textContent='这里是透明像素，不当作黑色。';}
 const actionNames={pick:'选色',save:'加入收藏',remove:'移除收藏',clear:'清空收藏'};
 const actionDescription=a=>a?actionNames[a.kind]+(a.hex?' '+a.hex:a.kind==='pick'?'（透明像素）':''):'';
 function render(){
  const s=model.snapshot();tabs.querySelector('.pickCount').textContent=s.colors.length;save.disabled=!s.current;undo.disabled=$('#undoCollection').disabled=!s.canUndo;copy.disabled=exportButton.disabled=!s.colors.length;
  const signature=JSON.stringify(core.normalizeColors(s.colors));
  if(signature!==renderedColors){storageStatus=store.save(s.colors).status;renderedColors=signature;if(storageStatus==='ok')savedColors=signature;}
  const meta=panel.querySelector('.pickMeta');meta.textContent=storageStatus==='ok'?'自动保留在此浏览器 · 不保存原图':storageStatus==='conflict'?'其他窗口的收藏已更新；本页未保存，请先导出备份再刷新':storageStatus==='invalid'?'本地收藏数据异常，未覆盖原记录；请先导出备份':'无法保存到浏览器；当前收藏仅本次有效，请导出备份';
  meta.classList.toggle('storageWarning',storageStatus!=='ok');meta.title='收藏只保存在当前浏览器及此网址；清理网站数据或更换浏览器、端口后不会自动迁移。重要配色建议导出 ACO/ASE 备份。';
  $('#clearCollection').disabled=!s.colors.length;
  $('#viewerSave').disabled=!s.current;$('#viewerUndo').disabled=!s.canUndo;
  const undoLabel=s.undoAction?'撤销'+actionDescription(s.undoAction):'暂无可撤销操作';
  [undo,$('#undoCollection'),$('#viewerUndo')].forEach(b=>{b.title=undoLabel;b.setAttribute('aria-label',undoLabel);});
  $('#undoCollection').textContent='↶ '+(s.undoAction?'撤销'+actionNames[s.undoAction.kind]:'撤销');
  const result=viewerBar.querySelector('.viewerResult');result.replaceChildren();
  if(s.current)result.append(code(s.current),alphaText(s.current));else result.textContent=pinned?'透明像素 · 不可收藏':'开启吸色后，点击图片细节。';
  panel.classList.toggle('isEmpty',!s.colors.length);
  document.querySelectorAll('.swatchSave').forEach(b=>{const saved=s.colors.some(c=>c.hex===b.dataset.color&&c.alpha===255);b.setAttribute('aria-pressed',String(saved));b.textContent=saved?'♥':'♡';b.title=saved?'已在收藏中':'加入我的收藏';});
  const list=panel.querySelector('.pickList');list.replaceChildren();panel.querySelector('.pickEmpty').hidden=!!s.colors.length;
  s.colors.forEach((c,i)=>{const item=document.createElement('div');item.className='pickItem';
   const b=document.createElement('button');b.type='button';b.className='pickCopy';b.setAttribute('aria-label','复制收藏色 '+c.hex+alphaText(c));b.title='RGB '+c.rgb.join(' / ')+alphaText(c);
   const chip=document.createElement('span');chip.className='pickChip';chip.style.setProperty('--picked',c.hex);chip.setAttribute('aria-hidden','true');b.append(chip,c.hex+alphaText(c));b.onclick=()=>copyText(c.hex);
   const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','移除收藏色 '+c.hex+alphaText(c));remove.onclick=()=>{model.remove(i);render();$('#undoCollection').focus();toast('已移除，可撤销。');};item.append(b,remove);list.append(item);
  });
 }
 function sample(p){
  const im=getImage();if(!im||isBusy())return null;
  // Only an 11×11 tile is decoded into canvas memory; center uses one original pixel.
  ctx.clearRect(0,0,11,11);ctx.drawImage(im,p.x-5,p.y-5,11,11,0,0,11,11);
  return core.pixelColor(ctx.getImageData(5,5,1,1).data);
 }
 function screenPoint(p){const im=getImage();if(viewerPicking){const r=viewerImage.getBoundingClientRect();return {x:r.left+(p.x+.5)*r.width/im.naturalWidth,y:r.top+(p.y+.5)*r.height/im.naturalHeight};}return PickerGeometry.toScreen(p,quad(),im.naturalWidth,im.naturalHeight);}
 function preview(p){
  if((!active&&!viewerPicking)||(viewerPicking&&viewerPan.isBlocked())||!getImage()||isBusy()){hideLens();return;}
  lastPoint=p;
  try{const c=sample(p),screen=screenPoint(p);lens.hidden=false;lens.querySelector('output').textContent=c?c.hex+alphaText(c):'透明像素';
   const w=lens.offsetWidth,h=lens.offsetHeight,bounds=viewerPicking?viewerScroll.getBoundingClientRect():{left:0,top:0,right:innerWidth,bottom:innerHeight};let left=screen.x+22;if(left+w>bounds.right-8)left=screen.x-w-22;
   lens.style.left=Math.max(bounds.left+8,Math.min(bounds.right-w-8,left))+'px';lens.style.top=Math.max(bounds.top+8,Math.min(bounds.bottom-h-8,screen.y-h-18))+'px';
   marker.hidden=false;marker.style.left=screen.x+'px';marker.style.top=screen.y+'px';
  }catch{setActive(false);setViewerPicking(false);toast('这张图暂时无法读取像素，请重新导入。');}
 }
 function hideLens(){lens.hidden=marker.hidden=true;}
 function setActive(on){active=on;document.body.classList.toggle('picking',on);toggle.setAttribute('aria-pressed',on);toggle.querySelector('.pickerLabel').textContent=on?'退出':'吸色';toggle.setAttribute('aria-label',on?'退出精准吸色':'开启精准吸色');hint.hidden=!on;photo.setAttribute('aria-label',on?'在原图上精准吸色':'放大查看原图');if(on)photo.setAttribute('aria-describedby','pickerHint');else{photo.removeAttribute('aria-describedby');hideLens();}}
 toggle.onclick=()=>{if(!getImage()||isBusy()){toast('图片还在处理中，请稍候。');return;}setActive(!active);if(active){photo.focus({preventScroll:true});toast('吸管已开启，点击图片选色。');}};
 function point(e){const im=getImage();return im?PickerGeometry.toPixel(e.clientX,e.clientY,quad(),im.naturalWidth,im.naturalHeight):null;}
 photo.addEventListener('pointermove',e=>{if(!active)return;pending=point(e);if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(pending)preview(pending);else hideLens();});});
 photo.addEventListener('pointerleave',()=>{pending=null;hideLens();});
 function select(p){if(!p||isBusy())return;viewerBar.querySelector('.viewerFeedback').textContent='';try{const c=sample(p);if(!c){model.pick(null);report(null);render();toast('透明位置没有可收藏的可见颜色。');return;}model.pick({...c,x:p.x,y:p.y});report(c);render();respond();}catch{toast('取色失败，请重新导入图片。');}}
 photo.addEventListener('click',e=>{if(!active)return;e.preventDefault();e.stopImmediatePropagation();if(isBusy()){toast('图片处理中，请稍候。');return;}const p=e.detail===0?lastPoint:point(e);if(!p){toast('请点在图片内容内，不包含留白。');return;}preview(p);select(p);},true);
 function onPickerKey(e){
  if(!(e.currentTarget===photo?active:viewerPicking)||!getImage())return;
  if(e.currentTarget===viewerScroll){if(e.key===' '){e.preventDefault();return;}if(viewerPan.isBlocked()){e.preventDefault();return;}}
  const im=getImage();
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
   e.preventDefault();let p=lastPoint||{x:Math.floor(im.naturalWidth/2),y:Math.floor(im.naturalHeight/2)};const step=e.shiftKey?10:1;
   p={x:Math.max(0,Math.min(im.naturalWidth-1,p.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0))),y:Math.max(0,Math.min(im.naturalHeight-1,p.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)))};revealPoint(p);preview(p);
  }else if(e.key==='Enter'||e.key===' '){e.preventDefault();const p=lastPoint||{x:Math.floor(im.naturalWidth/2),y:Math.floor(im.naturalHeight/2)};revealPoint(p);preview(p);select(p);}
 }
 photo.addEventListener('keydown',onPickerKey);viewerScroll.addEventListener('keydown',onPickerKey);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active&&!document.querySelector('dialog[open]')){setActive(false);toggle.focus();}});
 window.addEventListener('scroll',hideLens,true);window.addEventListener('resize',hideLens);
 save.onclick=()=>{const result=model.save();render();const message={saved:storageStatus==='ok'?'已加入收藏并保存。':'已加入收藏，但尚未保存，请导出备份。',duplicate:'这个颜色已经留好了。',full:'最多收藏 24 色，请先移除不需要的颜色。',empty:'先在图片上选一个颜色。'}[result];viewerBar.querySelector('.viewerFeedback').textContent=message;toast(message);};
 undo.onclick=()=>{const action=model.snapshot().undoAction;if(!model.undo())return;const c=model.snapshot().current;lastPoint=c?{x:c.x,y:c.y}:null;if(c)report(c);else{pinned=false;speech.classList.remove('pickSpeech');speech.textContent='已撤回。重新选一个颜色吧。';}render();hideLens();const message='已撤销'+actionDescription(action)+'。';viewerBar.querySelector('.viewerFeedback').textContent=message;toast(message);};
 $('#undoCollection').onclick=()=>undo.onclick();
 function setViewerPicking(on){
  viewerPan.reset();viewerPicking=on;pending=null;hideLens();
  (on?viewer:document.body).append(lens,marker);
  viewer.classList.toggle('viewerPicking',on);$('#viewerPicker').setAttribute('aria-pressed',String(on));$('#viewerPicker').setAttribute('aria-label',on?'关闭放大图吸色':'开启放大图吸色');$('#viewerPicker').textContent=on?'× 结束吸色':'⌖ 吸色';
  viewerScroll.setAttribute('aria-label',on?'在放大原图上精准吸色':'放大原图查看区域');
  viewerHint.textContent=on?'点选取色 · 按住空格拖动，松开继续吸色 · 方向键微调 / Enter 取色 · Esc 退出 · 滚轮缩放':'滚轮缩放 · 放大后可拖动；吸色时按住空格拖动 · 不改变整图自动提色';
 }
 function viewerPoint(e){const im=getImage(),r=viewerScroll.getBoundingClientRect(),clip={left:r.left,top:r.top,right:r.left+viewerScroll.clientWidth,bottom:r.top+viewerScroll.clientHeight};return im?PickerGeometry.fromViewport(e.clientX,e.clientY,viewerImage.getBoundingClientRect(),clip,im.naturalWidth,im.naturalHeight):null;}
 function revealPoint(p){if(!viewerPicking)return;const s=screenPoint(p),r=viewerScroll.getBoundingClientRect();if(s.x<r.left+8)viewerScroll.scrollLeft-=r.left+8-s.x;else if(s.x>r.right-8)viewerScroll.scrollLeft+=s.x-r.right+8;if(s.y<r.top+8)viewerScroll.scrollTop-=r.top+8-s.y;else if(s.y>r.bottom-8)viewerScroll.scrollTop+=s.y-r.bottom+8;}
 $('#viewerPicker').onclick=()=>{if(!getImage()||isBusy())return;setActive(false);setViewerPicking(!viewerPicking);viewerScroll.focus({preventScroll:true});};
 $('#viewerSave').onclick=()=>save.onclick();$('#viewerUndo').onclick=()=>undo.onclick();
 viewerScroll.addEventListener('pointermove',e=>{if(!viewerPicking||viewerPan.isBlocked())return;const p=viewerPoint(e);if(p)preview(p);else hideLens();});
 viewerScroll.addEventListener('pointerleave',hideLens);
 viewerScroll.addEventListener('click',e=>{if(!viewerPicking||viewerPan.isBlocked())return;const p=viewerPoint(e);if(p){preview(p);select(p);viewerScroll.focus({preventScroll:true});}});
 viewer.addEventListener('cancel',e=>{if(viewerPicking){e.preventDefault();setViewerPicking(false);$('#viewerPicker').focus();}});
 viewer.addEventListener('close',()=>{setViewerPicking(false);viewerBar.querySelector('.viewerFeedback').textContent='';photo.focus({preventScroll:true});});
 new ResizeObserver(hideLens).observe(viewerImage);
 $('#emptyAuto').onclick=()=>{setTab(false);$('#automaticTab').focus();};
 $('#emptyPick').onclick=()=>{if(!active)toggle.onclick();if(active){photo.focus({preventScroll:true});photo.scrollIntoView({block:'center',behavior:'instant'});}};
 function addColor(color){const result=model.add(color);render();toast({saved:storageStatus==='ok'?'已加入收藏并保存，可与手选颜色一起导出。':'已加入收藏，但尚未保存，请导出备份。',duplicate:'这个颜色已经在收藏里了。',full:'最多收藏 24 色，请先移除不需要的颜色。',invalid:'这个颜色暂时不能收藏。'}[result]);return result;}
 copy.onclick=()=>copyText(model.snapshot().colors.map(c=>c.hex+'  RGB '+c.rgb.join(', ')+alphaText(c)).join('\n'));
 function exportPickedPng(){
  const colors=model.snapshot().colors;if(!colors.length)return;
  const c=document.createElement('canvas'),cols=3,rows=Math.ceil(colors.length/cols);c.width=1200;c.height=220+rows*180;
  const x=c.getContext('2d');x.fillStyle='#fff9ee';x.fillRect(0,0,c.width,c.height);x.fillStyle='#17131f';x.fillRect(0,0,1200,110);x.fillStyle='#fff02a';x.font='italic bold 48px Georgia';x.fillText('Picked Colors',40,72);x.fillStyle='#17131f';x.font='19px sans-serif';x.fillText('我的收藏 · HEX / RGB · 不表示整图占比',40,148);
  colors.forEach((color,i)=>{const left=40+(i%cols)*385,top=177+Math.floor(i/cols)*180;x.fillStyle='#f5008f';x.fillRect(left+5,top+5,355,154);x.fillStyle='#fff9ee';x.fillRect(left,top,355,154);x.fillStyle=color.hex;x.fillRect(left,top,355,80);x.strokeStyle='#17131f';x.lineWidth=2;x.strokeRect(left,top,355,154);x.fillStyle='#17131f';x.font='bold 23px monospace';x.fillText(color.hex,left+14,top+109);x.font='15px sans-serif';x.fillText('RGB '+color.rgb.join(' / ')+alphaText(color),left+14,top+137);});
  exportCanvas(c,'我的收藏-色卡.png',exportButton);
 };
 exportButton.onclick=()=>nativeExport.open(model.snapshot().colors,'我的收藏',exportPickedPng,exportButton);
 const pickHeading=document.createElement('div');pickHeading.className='pickHeading';const heading=panel.querySelector('h3');heading.before(pickHeading);pickHeading.append(heading);
 const clearButton=document.createElement('button');clearButton.type='button';clearButton.id='clearCollection';clearButton.textContent='清空';clearButton.setAttribute('aria-label','清空收藏');pickHeading.append(clearButton);
 const clearDialog=document.createElement('dialog');clearDialog.className='swatchDialog clearCollectionDialog';clearDialog.setAttribute('aria-labelledby','clearCollectionTitle');
 clearDialog.innerHTML='<h2 id="clearCollectionTitle">清空收藏？</h2><p class="clearSummary"></p><p>会同步清空此浏览器的收藏，不影响原图。当前页面可撤销；刷新后无法撤销。</p><div class="exportFoot"><button type="button" id="cancelClear" autofocus>取消</button><button type="button" id="confirmClear">确认清空</button></div>';
 document.body.append(clearDialog);let clearSignature='';
 clearButton.onclick=()=>{clearSignature=JSON.stringify(model.snapshot().colors);clearDialog.querySelector('.clearSummary').textContent='即将清空 '+model.snapshot().colors.length+' 个收藏色。';clearDialog.showModal();$('#cancelClear').focus();};
 $('#cancelClear').onclick=()=>clearDialog.close();clearDialog.addEventListener('close',()=>{if(!clearButton.disabled)clearButton.focus();else $('#manualTab').focus();});
 $('#confirmClear').onclick=()=>{if(clearSignature!==JSON.stringify(model.snapshot().colors)){clearDialog.close();toast('收藏已在其他窗口变化，请重新确认。');return;}model.clear();render();clearDialog.close();toast(storageStatus==='ok'?'已清空收藏，当前页面可撤销。':'已清空本页列表，但未保存成功；刷新可能恢复旧收藏。');};
 function syncCollection(){
  if(renderedColors!==savedColors)return; // Keep unsaved local work available for export instead of discarding it.
  const incoming=store.load();storageStatus=['ok','empty'].includes(incoming.status)?'ok':incoming.status;
  if(incoming.changed&&storageStatus==='ok'){model.restore(incoming.colors);renderedColors=savedColors=JSON.stringify(incoming.colors);}
  render();
 }
 window.addEventListener('storage',e=>{if(e.key===PickerStorage.KEY||e.key===null)syncCollection();});
 window.addEventListener('focus',syncCollection);
 render();
 return {addColor,refresh:render,viewerPanChanged(){pending=null;hideLens();},isViewerPicking:()=>viewerPicking,isPinned:()=>pinned,release(){pinned=false;speech.classList.remove('pickSpeech');hideLens();},imageChanged(){setActive(false);setViewerPicking(false);lastPoint=null;model.resetSelection();pinned=false;speech.classList.remove('pickSpeech');render();}};
}};
