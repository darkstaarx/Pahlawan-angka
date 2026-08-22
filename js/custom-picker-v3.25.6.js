// Pahlawan Angka v3.25.6 — replace public native selects with an in-app themed sheet.
(()=>{
  let activeLayer=null;
  const eligible=select=>select instanceof HTMLSelectElement&&!select.closest('.devOverlay')&&!select.id.startsWith('dev');
  const selectedLabel=select=>select.options[select.selectedIndex]?.textContent?.trim()||'Pilih';
  function closePicker(){
    activeLayer?.remove();activeLayer=null;document.body.classList.remove('paPickerOpen');
  }
  function openPicker(select,trigger){
    closePicker();
    const layer=document.createElement('div');layer.className='paPickerLayer';layer.setAttribute('role','presentation');
    const sheet=document.createElement('section');sheet.className='paPickerSheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label',select.closest('label')?.querySelector('span')?.textContent?.trim()||'Pilih pilihan');
    const head=document.createElement('header');head.className='paPickerHead';
    const title=document.createElement('b');title.textContent=sheet.getAttribute('aria-label');
    const close=document.createElement('button');close.type='button';close.className='paPickerClose';close.setAttribute('aria-label','Tutup');close.textContent='×';close.onclick=closePicker;
    const options=document.createElement('div');options.className='paPickerOptions';
    [...select.options].forEach(option=>{
      const button=document.createElement('button');button.type='button';button.className='paPickerOption'+(option.selected?' selected':'');button.disabled=option.disabled;
      const label=document.createElement('span');label.textContent=option.textContent;
      const mark=document.createElement('i');mark.setAttribute('aria-hidden','true');
      button.append(label,mark);button.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));trigger.querySelector('span').textContent=selectedLabel(select);closePicker();trigger.focus();};
      options.appendChild(button);
    });
    head.append(title,close);sheet.append(head,options);layer.appendChild(sheet);
    layer.onclick=event=>{if(event.target===layer)closePicker();};document.body.appendChild(layer);document.body.classList.add('paPickerOpen');activeLayer=layer;
    options.querySelector('.selected')?.scrollIntoView({block:'center'});close.focus();
  }
  function enhance(select){
    if(!eligible(select)||select.dataset.paPicker==='true')return;
    select.dataset.paPicker='true';select.classList.add('paNativeSelect');
    const wrap=document.createElement('div');wrap.className='paSelectEnhanced';select.parentNode.insertBefore(wrap,select);wrap.appendChild(select);
    const trigger=document.createElement('button');trigger.type='button';trigger.className='paSelectTrigger';trigger.innerHTML='<span></span><i class="paSelectChevron" aria-hidden="true">⌄</i>';trigger.querySelector('span').textContent=selectedLabel(select);
    trigger.setAttribute('aria-label',select.getAttribute('aria-label')||select.closest('label')?.querySelector('span')?.textContent?.trim()||'Pilih');trigger.onclick=()=>openPicker(select,trigger);
    select.addEventListener('change',()=>{trigger.querySelector('span').textContent=selectedLabel(select);});wrap.appendChild(trigger);
  }
  function scan(root=document){root.querySelectorAll?.('select').forEach(enhance);}
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closePicker();});
  const start=()=>{scan();new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1){if(node.matches?.('select'))enhance(node);scan(node);}}))).observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
