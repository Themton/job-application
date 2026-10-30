/* Load after the main application's scripts. Selection is temporary, never saved. */
(function () {
  var month = '';
  function visible(e) {
    var q = ($('paydb2-srch').value || '').toLowerCase();
    return (!PAYDB2_FILTER || e.status === PAYDB2_FILTER) &&
      (!q || (e.name + ' ' + e.nickname + ' ' + e.position).toLowerCase().includes(q));
  }
  function selected() {
    if (month !== $('paydb2-month').value) return [];
    return PAYDB2.filter(function(e) { return visible(e) && e._transferSelected === true && Number(e.net) > 0; });
  }
  function update() {
    var el = $('transfer-selection-summary');
    if (!el) return;
    var rows = selected(), cents = rows.reduce(function(s,e) { return s + Math.round(Number(e.net)*100); },0);
    el.textContent = 'เลือกโอน ' + rows.length + ' คน · ยอดสุทธิ ' + (cents/100).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' บาท';
    document.querySelectorAll('[data-transfer-index]').forEach(function(box) {
      var e = PAYDB2[Number(box.dataset.transferIndex)];
      box.disabled = !(Number(e.net)>0);
      box.checked = e._transferSelected === true && !box.disabled;
    });
  }
  var render = payDBRender;
  payDBRender = function() {
    var current = $('paydb2-month').value;
    if (month !== current) { PAYDB2.forEach(function(e){delete e._transferSelected;}); month = current; }
    render.apply(this, arguments);
    var host = $('paydb2-table');
    var bar = document.createElement('div');
    bar.style.cssText = 'padding:12px;background:#eef6ff;border:1px solid #abc;border-radius:8px;margin-bottom:10px;display:flex;gap:12px;flex-wrap:wrap;align-items:center';
    var summary = document.createElement('strong'); summary.id='transfer-selection-summary'; bar.appendChild(summary);
    [['เลือกทั้งหมดที่แสดง',true],['ยกเลิกที่แสดง',false]].forEach(function(item){
      var button=document.createElement('button');button.type='button';button.textContent=item[0];
      button.onclick=function(){PAYDB2.forEach(function(e){if(visible(e))e._transferSelected=item[1] && Number(e.net)>0;});update();};bar.appendChild(button);
    });
    var hint=document.createElement('span');hint.textContent='ไฟล์ธนาคารใช้เฉพาะคนที่ติ๊กและตรงกับตัวกรองปัจจุบัน · เปลี่ยนเดือนหรือดึงข้อมูลใหม่ให้เลือกใหม่';bar.appendChild(hint);
    host.prepend(bar);
    var rows=PAYDB2.map(function(e,i){return {e:e,i:i};}).filter(function(f){return visible(f.e);});
    host.querySelectorAll('td.xname').forEach(function(cell,n){
      var f=rows[n];if(!f)return;
      var box=document.createElement('input');box.type='checkbox';box.dataset.transferIndex=f.i;
      box.setAttribute('aria-label','เลือกโอน '+f.e.name);box.style.cssText='width:18px;height:18px;margin-right:8px;vertical-align:middle';
      box.onchange=function(){f.e._transferSelected=box.checked;update();};cell.prepend(box);
    });update();
  };
  var footer=payDBUpdateFooter;
  payDBUpdateFooter=function(){var result=footer.apply(this,arguments);update();return result;};
  function exportRows(kind) {
    var rows=selected();
    if(!rows.length){toast('กรุณาติ๊กเลือกรายชื่อที่มียอดสุทธิมากกว่า 0 ก่อนสร้างไฟล์','terr');return;}
    if(kind==='txt')return scbShowTxtExport(rows,$('paydb2-month').value,'_เลือกโอน');
    return scbExportPayroll(rows,$('paydb2-month').value,'_เลือกโอน');
  }
  $('paydb2-month').addEventListener('change',function(){
    PAYDB2.forEach(function(e){delete e._transferSelected;});
    month=$('paydb2-month').value;update();
  });
  payDBExportTxt=function(){return exportRows('txt');};
  payDBExportSCB=function(){return exportRows('xlsm');};
})();
