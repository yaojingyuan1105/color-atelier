/* Original character-inspired UI lines, not official dialogue. Local only. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AtelierComments=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const pools={
 light:['整图近白浅色约占 {share}%。彩色部分反而更显眼。','近白浅色占了约 {share}%。这份留白感很清爽。','这次近白浅色约 {share}%。小面积颜色也很有存在感。','整图里近白浅色约 {share}%。搭配的重点可以另选。'],
 dark:['整图深色约占 {share}%。亮处就格外醒目。','深色占了约 {share}%。这组很有分量。','这次深色约 {share}%。一点亮色就能提起精神。','整图深色约 {share}%。嗯，明亮的细节很值得留意。'],
 general:['这组有点意思。你最先注意到哪一抹？','颜色整理好了，放在一起更容易比较。','嗯，可以把这组留作搭配参考。','色样有了。接下来，轮到你的眼光。'],
 dominant:['主色很明确。其他颜色，配合它就好。','大面积的颜色定了，细节可以再讲究些。','重点已经够醒目，别再处处加重。','主色站得住。这一点不错。'],
 balanced:['几种颜色占比接近。想强调谁，要你来定。','比例挺接近，搭配时记得留出层次。','颜色分量相近，不代表每种都要同样抢眼。','先挑一个重点，其余的慢慢安排。'],
 muted:['颜色收得挺克制。细节反而更重要。','嗯，这种低饱和的搭配不必太用力。','不刺眼。留一点明暗变化会更有意思。','颜色安静下来，比例就更藏不住了。'],
 vivid:['这组颜色很鲜明，第一眼就很有精神。','够醒目。我倒想看看你会先选哪一抹。','这种鲜亮的颜色，少量用也很有存在感。','嗯，颜色很大胆。搭配起来应该有意思。'],
 warm:['这组偏暖。想更清爽，可以试一点冷色点缀。','暖色占了上风，搭配时注意轻重。','温暖的底子有了，细节别太闷。','偏暖的颜色很显眼，留点喘息的位置。'],
 cool:['这组偏冷。少量暖色会很显眼。','冷色的底子不错，层次再拉开一点。','偏冷的搭配，明暗尤其值得留意。','清冷一些也好。别把细节全部压暗。'],
 contrast:['明暗反差很清楚，重点比较容易突出。','亮色和暗色都有，层次很分明。','这组反差不错。最亮的那一抹很抓眼。','明暗分得开，嗯，这一点挺好。'],
 loading:['……让我看看这组颜色。','等一下，先把比例理清楚。','颜色还在整理，别急。'],
 import:['换了一张？好，让我重新看看。','新图收到了。这次从颜色开始。','嗯，换个参照，也许会有新想法。'],
 reanalyze:['再看一次。细节值得多留意。','还想比较？那就重新理一遍。','好，再检查一下颜色的分量。'],
 copy:['这抹颜色先记下来，别急着铺满。','选好了？用在哪里也同样重要。','色值记下了，搭配时再看整体。','嗯，留着和其他颜色比一比。'],
 export:['色卡整理好了，之后也方便比较。','收好。下次搭配别只凭印象。','已经排好了，仔细看看比例。','这组留下来，灵感也需要整理。'],
 error:['这张图没读清楚。换一张让我看看。','暂时没能读出颜色，看看下方的提示。','先检查图片，整理好了再试一次。']
 };
 function describe(colors){
  if(!colors.length)return ['general'];
  const tags=[],total=colors.reduce((s,c)=>s+c.share,0)||100;let sat=0,warm=0,cool=0,lo=255,hi=0;
  colors.forEach(c=>{const [r,g,b]=c.rgb,max=Math.max(r,g,b),min=Math.min(r,g,b),weight=c.share/total;const chroma=max? (max-min)/max:0;sat+=chroma*weight;if(chroma>.18){if(r-b>25)warm+=weight;else if(b-r>25)cool+=weight;}if(weight>=.08){const lum=.2126*r+.7152*g+.0722*b;lo=Math.min(lo,lum);hi=Math.max(hi,lum);}});
  if(colors[0].share>=60)tags.push('dominant');
  if(colors.length>1&&Math.abs(colors[0].share-colors[1].share)<=5)tags.push('balanced');
  if(sat<.18)tags.push('muted');else if(sat>.55)tags.push('vivid');
  if(warm>.6)tags.push('warm');else if(cool>.6)tags.push('cool');
  if(hi-lo>140)tags.push('contrast');
  return tags.length?tags:['general'];
 }
 function observation(colors){
  if(!colors.length)return {topic:'general'};
  const total=colors.reduce((n,c)=>n+c.share,0)||100;
  const light=colors.reduce((n,c)=>n+(Math.min(...c.rgb)>=232&&Math.max(...c.rgb)-Math.min(...c.rgb)<=20?c.share:0),0)/total*100;
  const dark=colors.reduce((n,c)=>n+(Math.max(...c.rgb)<=48?c.share:0),0)/total*100;
  if(light>=60)return {topic:'light',share:Math.round(light)};
  if(dark>=60)return {topic:'dark',share:Math.round(dark)};
  const tags=describe(colors);
  const topic=['dominant','balanced','contrast','vivid','warm','cool','muted'].find(k=>tags.includes(k))||'general';
  return {topic};
 }
 function create(random=Math.random){
  let recent=[],lastAt=-Infinity;
  function choose(keys,now){const candidates=keys.flatMap(k=>pools[k]||pools.general);let available=candidates.filter(s=>!recent.includes(s));if(!available.length)available=candidates.filter(s=>s!==recent[recent.length-1]);const line=available[Math.min(available.length-1,Math.floor(random()*available.length))];recent=[...recent,line].slice(-3);lastAt=now;return line;}
  return {result(colors,now=Date.now()){const note=observation(colors);return choose([note.topic],now).replaceAll("{share}",note.share??"");},event(kind,now=Date.now(),force=false){if(!force&&now-lastAt<4500)return null;return choose([kind],now);}};
 }
 return {describe,observation,create};
});
