/* Interactive fraction answers share the existing answer/attempt pipeline. */
(function(){
 'use strict';
 function render(container,q,submit){
   const task=q.fractionTask;if(!task)return false;
   container.replaceChildren();
   const panel=document.createElement('div');panel.className='d1-fraction-answer';
   panel.style.cssText='grid-column:1/-1;width:100%;max-width:420px;margin:4px auto;text-align:center';
   const status=document.createElement('p');status.setAttribute('aria-live','polite');
   const check=document.createElement('button');check.type='button';check.className='ans';check.textContent='Semak';check.dataset.questionToken=String(q.token||'');
   let selected=new Set(),top,bottom,cells=[];
   if(task.type==='shade'){
     const instruction=document.createElement('p');instruction.textContent='Tekan bahagian untuk melorek. Tekan sekali lagi untuk memadam.';panel.append(instruction);
     const scene=window.PAFractionVisuals.scene(task),picture=scene.outer,row=scene.row;
     for(let i=0;i<task.d;i++){
       const cell=document.createElement('button');cell.type='button';cell.setAttribute('aria-label',`Bahagian ${i+1}`);cell.setAttribute('aria-pressed','false');
       cell.className='fraction-piece-marker';
       cell.onclick=()=>{if(check.disabled)return;if(selected.has(i))selected.delete(i);else selected.add(i);cell.setAttribute('aria-pressed',String(selected.has(i)));cell.classList.toggle('selected',selected.has(i));cell.innerHTML=selected.has(i)?'<span class="fraction-piece-tick">✓</span>':'';status.textContent=`${selected.size} bahagian dipilih.`;};
       cells.push(cell);row.append(cell);
     }
     panel.append(picture);status.textContent='Belum ada bahagian dipilih.';
   }else{
     const label=document.createElement('p');label.textContent='Tulis nombor atas dan nombor bawah.';panel.append(label);
     const fraction=document.createElement('div');fraction.style.cssText='display:grid;gap:6px;justify-content:center;margin:12px auto';
     for(const [position,title] of [['top','Nombor atas'],['bottom','Nombor bawah']]){
       const input=document.createElement('input');input.type='text';input.inputMode='numeric';input.maxLength=2;input.autocomplete='off';input.setAttribute('aria-label',title);input.style.cssText='width:82px;padding:10px;text-align:center;font-size:24px;border:2px solid #527ba0;border-radius:8px';
       if(position==='top')top=input;else bottom=input;
       fraction.append(input);if(position==='top'){const line=document.createElement('div');line.style.cssText='height:3px;background:#35476b';fraction.append(line);}
       input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();check.click();}};
     }
     panel.append(fraction);
   }
   check.onclick=()=>{
     if(check.disabled)return;
     if(typeof sess!=='undefined'&&sess.q===q&&(typeof db!=='undefined'&&db?.restuLock?.active||document.getElementById('restu')?.classList.contains('show')))return;
     let value;
     if(task.type==='shade'){
       if(!selected.size){status.textContent='Pilih sekurang-kurangnya satu bahagian dahulu.';return;}
       value=`${selected.size}/${task.d}`;
     }else{
       if(!/^\d{1,2}$/.test(top.value.trim())||!/^\d{1,2}$/.test(bottom.value.trim())||Number(bottom.value)<=0){status.textContent='Isi kedua-dua kotak dengan nombor. Nombor bawah mesti lebih daripada sifar.';return;}
       value=`${Number(top.value)}/${Number(bottom.value)}`;
     }
     check.disabled=true;cells.forEach(cell=>cell.disabled=true);if(top){top.disabled=true;bottom.disabled=true;}
     const battleQuestion=typeof sess!=='undefined'&&sess.q===q,hadRetry=battleQuestion&&!!sess.retryState;
     // Keep the four runtime choices; the visual interaction selects one of them.
     const options=[{v:q.answer,label:q.answer,tag:'correct'},...q.wrong];
     const equivalent=(a,b)=>{const x=String(a).split('/').map(Number),y=String(b).split('/').map(Number);return x.length===2&&y.length===2&&x[1]>0&&y[1]>0&&x[0]*y[1]===y[0]*x[1];};
     const index=options.findIndex(o=>String(o.v)===value||equivalent(o.v,value));
     const option=index>=0?{...options[index],choiceKey:'ABCD'[index]}:{v:value,label:value,tag:'fraction',choiceKey:null};
     submit(option,check,q);
     if(battleQuestion&&sess.q===q&&!hadRetry&&sess.retryState){
       check.disabled=false;check.classList.remove('no');cells.forEach(cell=>cell.disabled=false);if(top){top.disabled=false;bottom.disabled=false;}
     }
   };
   panel.append(status,check);container.append(panel);return true;
 }
 window.PAFractionAnswers={render};
})();
