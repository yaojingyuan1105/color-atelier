/* Move existing controls without replacing their identities or state. */
(()=>{
 const $=s=>document.querySelector(s),nav=$('.nav'),head=$('.reviewhead');
 const trigger=document.createElement('button');trigger.type='button';trigger.id='openSettings';trigger.textContent='设置';trigger.setAttribute('aria-haspopup','dialog');
 nav.insertBefore(trigger,$('.return'));
 const settings=document.createElement('dialog');settings.className='settingsDialog';settings.setAttribute('aria-labelledby','settingsTitle');
 settings.innerHTML='<header><h2 id="settingsTitle">工作室设置</h2><button type="button" class="closeSettings" aria-label="关闭设置">关闭 ×</button></header><div class="settingsControls"></div><details><summary>使用帮助</summary><p>图片在本地处理，不上传。自动提色占比为可见像素的抽样估计，点击色块可复制色值。</p><p>放大图中，吸色时按住空格可临时拖动，松开继续取色。方向键微调，Enter 确认，Esc 退出吸色。</p><p>刷新后原图恢复默认地图；收藏保留在当前浏览器、当前网址。重要配色请导出色板备份。</p></details><details><summary>关于工作室</summary><p>Color Atelier · 在线版 v25</p><p>浏览器交互原型，图片在本机处理，尚未接入正式桌宠程序。</p></details>';
 document.body.append(settings);
 const controls=settings.querySelector('.settingsControls');
 const poseLabel=document.createElement('label'),pose=$('.posePreview');poseLabel.textContent='人物姿势';pose.setAttribute('aria-label','人物姿势');poseLabel.append(pose);controls.append(poseLabel);
 const motionLabel=document.createElement('div');motionLabel.className='settingRow';motionLabel.append($('.motionToggle'));controls.append(motionLabel);
 const viewLabel=document.createElement('div');viewLabel.className='settingRow';viewLabel.append($('.viewmode'));controls.append(viewLabel);
 head.remove();$('.foot')?.remove();
 trigger.onclick=()=>settings.showModal();
 settings.querySelector('.closeSettings').onclick=()=>settings.close();
 settings.addEventListener('close',()=>trigger.focus({preventScroll:true}));
 settings.addEventListener('click',e=>{if(e.target!==settings)return;const r=settings.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)settings.close();});
 // The collapsed state uses exactly the same wordmark, not a second identity.
 const mark=$('.wordmark').cloneNode(true);mark.setAttribute('role','heading');mark.setAttribute('aria-level','2');$('.launcher h2').replaceWith(mark);
 $('.launcher p').textContent='展开可继续操作；刷新后原图恢复默认地图。';
})();
