var AT_TOKEN = window.AT_TOKEN || '';
var AT_BASE  = 'app0B1xkoUbdYCvf0';
var AT_TABLE = 'tblvwE7HqdENGBa98';
var EDIT_RECORD_ID = new URLSearchParams(window.location.search).get('editId') || null;

var COUNTRY_NAMES={
  'GB':'Gro\u00dfbritannien','UK':'Gro\u00dfbritannien','England':'Gro\u00dfbritannien',
  'USA':'USA','US':'USA','United States':'USA',
  'CA':'Kanada','CAN':'Kanada','Canada':'Kanada',
  'CH':'Schweiz','Switzerland':'Schweiz',
  'DE':'Deutschland','Germany':'Deutschland',
  'AT':'\u00d6sterreich','Austria':'\u00d6sterreich',
  'FR':'Frankreich','France':'Frankreich',
  'ES':'Spanien','Spain':'Spanien',
  'IT':'Italien','Italy':'Italien',
  'NZ':'Neuseeland','New Zealand':'Neuseeland',
  'AU':'Australien','Australia':'Australien'
};
function normC(c){
  var n=COUNTRY_NAMES[(c||'').trim()]||(c||'').trim();
  return n;
}
function esc(v){return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function linkify(text){
  // URLs in Text automatisch als klickbare Links darstellen
  var escaped = esc(text);
  return escaped.replace(/(https?:\/\/[^\s<"]+)/g, '<a href="$1" target="_blank" style="color:var(--green);word-break:break-all;">$1</a>');
}

var cmsSchools=[];
var ADVISOR_DATA={};

function loadAdvisors(){
  Array.from(document.querySelectorAll('.ts-advisor')).forEach(function(el){
    var name=(el.getAttribute('data-name')||'').trim();
    if(!name)return;
    ADVISOR_DATA[name]={
      photo:(function(){
        var div=el.querySelector('.ts-advisor-img');
        if(div){
          var bg=div.style.backgroundImage||'';
          if(bg){var m=bg.match(/url\(["']?([^"'\)]+)["']?\)/);if(m&&m[1]&&m[1].indexOf('data:')<0)return m[1];}
          if(div.tagName==='IMG'&&div.src&&div.src.indexOf('data:')<0)return div.src;
        }
        return(el.getAttribute('data-photo')||'').trim();
      })(),
      email:(el.getAttribute('data-email')||'').trim(),
      phone:(el.getAttribute('data-phone')||'').trim(),
      role:(el.getAttribute('data-role')||'Beraterin').trim()
    };
  });
}

function loadCms(){
  loadAdvisors();
  cmsSchools=Array.from(document.querySelectorAll('.rp-cms-school')).map(function(el){
    var gps=(el.getAttribute('data-gps')||'').split(',');
    var apKm=(el.getAttribute('data-airport-km')||'').trim().replace(/ca\.?\s*/i,'').trim();
    var photo=(function(){
      var img=el.querySelector('.rp-school-img');
      if(img){
        var ds=img.getAttribute('data-src')||'';
        if(ds&&ds.indexOf('data:')<0&&ds.indexOf('http')===0)return ds.split(' ')[0];
        if(img.src&&img.src.indexOf('data:')<0&&img.src.indexOf('http')===0)return img.src;
        var ss=img.getAttribute('srcset')||'';
        if(ss)return ss.split(',')[0].trim().split(' ')[0];
      }
      return(el.getAttribute('data-photo')||'').trim();
    })();
    var profileUrl=(function(){
      var u=(el.getAttribute('data-profile-url')||'').trim();
      if(!u)return'';
      if(u.indexOf('http')===0)return u;
      if(u.indexOf('/')!==0)u='/internat/'+u;
      return'https://www.internate.org'+u;
    })();
    return{
      name:(el.getAttribute('data-name')||'').trim(),
      photo:photo,
      address:(el.getAttribute('data-address')||'').trim(),
      country:normC(el.getAttribute('data-country')||''),
      airport:(el.getAttribute('data-airport')||'').trim(),
      airportKm:apKm,
      profileUrl:profileUrl,
      lat:parseFloat((gps[0]||'').trim())||null,
      lng:parseFloat((gps[1]||'').trim())||null
    };
  }).filter(function(s){return s.name;});
  cmsSchools.sort(function(a,b){return a.name.localeCompare(b.name,'de');});
}

function cmsOpts(sel){
  var h='<option value="">Internat ausw\u00e4hlen ...</option>';
  var byC={};
  cmsSchools.forEach(function(s){var c=s.country||'Weitere';if(!byC[c])byC[c]=[];byC[c].push(s);});
  Object.keys(byC).sort().forEach(function(c){
    h+='<optgroup label="'+esc(c)+'">';
    byC[c].forEach(function(s){h+='<option value="'+esc(s.name)+'"'+(s.name===sel?' selected':'')+'>'+esc(s.name)+'</option>';});
    h+='</optgroup>';
  });
  return h;
}

var schools=[],sc=0;
function addSchool(){sc++;schools.push({id:sc,name:'',feedback:'',note:'',duration:'',einstieg:''});renderSchools();}
function removeSchool(id){schools=schools.filter(function(s){return s.id!==id;});renderSchools();}
function moveSchool(id,dir){
  var idx=schools.findIndex(function(s){return s.id===id;});
  if(idx===-1)return;
  var newIdx=idx+dir;
  if(newIdx<0||newIdx>=schools.length)return;
  var tmp=schools[idx];schools[idx]=schools[newIdx];schools[newIdx]=tmp;
  renderSchools();
}
function upd(id,f,v){
  var s=schools.find(function(s){return s.id===id;});
  if(!s)return;s[f]=v;
  if(f==='name'){s.cms=cmsSchools.find(function(x){return x.name===v;})||null;renderSchools();}
}

function renderSchools(){
  var c=document.getElementById('sc-list');c.innerHTML='';
  schools.forEach(function(s,si){
    var cs=s.cms||cmsSchools.find(function(x){return x.name===s.name;})||{};
    var div=document.createElement('div');div.className='sc-card';
    div.innerHTML=''
      +'<div class="sc-top">'
      +'<div class="sc-num"><div class="sc-badge">'+(si+1)+'</div>Internat '+(si+1)
      +(cs.country?' <span style="font-size:12px;color:var(--text3);font-weight:400">('+esc(cs.country)+')</span>':'')
      +'</div>'
      +'<div style="display:flex;gap:6px;align-items:center">'
      +(si>0?'<button class="btn-rm" onclick="moveSchool('+s.id+',-1)" title="Nach oben">&#8593;</button>':'')
      +(si<schools.length-1?'<button class="btn-rm" onclick="moveSchool('+s.id+',1)" title="Nach unten">&#8595;</button>':'')
      +(schools.length>1?'<button class="btn-rm" onclick="removeSchool('+s.id+')">Entfernen</button>':'')
      +'</div>'
      +'</div>'
      +'<div class="g2" style="margin-bottom:12px">'
      +'<div class="field"><label>Internat <span class="req">*</span></label>'
      +'<select onchange="upd('+s.id+',\'name\',this.value)">'+cmsOpts(s.name)+'</select></div>'
      +'<div class="field"><label>Klasse / Einstieg</label>'
      +'<input type="text" placeholder="z.B. Year 10 / Klasse 9" value="'+esc(s.einstieg||'')+'" onchange="upd('+s.id+',\'einstieg\',this.value)"></div>'
      +'</div>'
      +'<div class="field" style="margin-bottom:12px"><label>Aufenthaltsdauer</label>'
      +'<input type="text" placeholder="z.B. 1 Jahr / 2 Jahre" value="'+esc(s.duration||'')+'" onchange="upd('+s.id+',\'duration\',this.value)"></div>'
      +(cs.airport?'<div style="font-size:12px;color:#166534;margin-bottom:10px;padding:6px 10px;background:#f0fdf4;border-radius:8px;display:inline-block">Flughafen '+esc(cs.airport)+(cs.airportKm?' \u00b7 ca. '+esc(cs.airportKm)+' km':'')+'</div><br>':'')
      +'<div class="field" style="margin-bottom:10px"><label>R\u00fcckmeldung der Schule (optional)</label>'
      +'<textarea placeholder="R\u00fcckmeldung aus der Schul-E-Mail ..." onchange="upd('+s.id+',\'feedback\',this.value)">'+esc(s.feedback||'')+'</textarea></div>'
      +'<div class="field"><label>Anmerkung der Beraterin (optional)</label>'
      +'<textarea placeholder="Eigene Erg\u00e4nzung ..." onchange="upd('+s.id+',\'note\',this.value)" style="min-height:60px">'+esc(s.note||'')+'</textarea></div>';
    c.appendChild(div);
  });
}

function validate(){
  var e=[];
  if(!document.getElementById('f-role').value)e.push('Bitte ausw\u00e4hlen wer ausf\u00fcllt');
  if(!document.getElementById('f-student').value.trim())e.push('Vorname fehlt');
  if(!document.getElementById('f-family').value.trim())e.push('Familienname fehlt');
  if(!document.getElementById('f-year').value.trim())e.push('Start fehlt');

  if(!document.getElementById('f-advisor').value)e.push('Beraterin ausw\u00e4hlen');
  if(!schools.length)e.push('Mindestens ein Internat hinzuf\u00fcgen');
  schools.forEach(function(s,i){if(!s.name)e.push('Internat '+(i+1)+': Name fehlt');});
  return e;
}

function buildState(){
  var role=document.getElementById('f-role').value;
  var advisorVal=document.getElementById('f-advisor').value;
  var advisorName=advisorVal.split('|')[0]||advisorVal;
  var advisorInfo=ADVISOR_DATA[advisorName]||{};
  return{
    role:role,
    lang:(function(){var el=document.getElementById('f-lang');return el?el.value:'de';})(),
student:document.getElementById('f-student').value.trim(),
    family:document.getElementById('f-family').value.trim(),
    year:document.getElementById('f-year').value.trim(),
    duration:(function(){var el=document.getElementById('f-duration');return el?el.value.trim():'';})(),
    einstieg:(function(){var el=document.getElementById('f-einstieg');return el?el.value.trim():'';})(),
    advisor:advisorName,
    advisorEmail:advisorVal.split('|')[1]||'',
    advisorPhone:advisorVal.split('|')[2]||advisorInfo.phone||'',
    advisorRole:advisorVal.split('|')[3]||advisorInfo.role||'Senior Consultant',
    advisorPhoto:advisorInfo.photo||'',
    intro:document.getElementById('f-intro').value.trim(),
    schools:schools.map(function(s){
      var cs=s.cms||cmsSchools.find(function(x){return x.name===s.name;})||{};
      return{name:s.name,duration:s.duration||'',einstieg:s.einstieg||'',feedback:s.feedback,note:s.note,
        country:normC(cs.country||''),address:cs.address||'',
        airport:cs.airport||'',airportKm:cs.airportKm||'',
        photo:cs.photo||'',profileUrl:cs.profileUrl||'',
        lat:cs.lat||null,lng:cs.lng||null};
    })
  };
}

function saveToAirtable(status, cb){
  var state=buildState();
  var encoded=btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  var longUrl=window.location.href.split('?')[0]+'?empfehlung='+encoded;
  var fields={
    'Name':state.family+' \u00b7 '+state.student,
    'Familie':state.family,
    'Sch\u00fclerin':state.student,
    'Start':state.year,
    'Beraterin':state.advisor,
    'Schulen':state.schools.map(function(s){return s.name;}).join(', '),
    'Datum':new Date().toLocaleDateString('de-DE')+' '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}),
    'Link':longUrl,
    'Status':status
  };
  var method=EDIT_RECORD_ID?'PATCH':'POST';
  var path=EDIT_RECORD_ID?'/'+EDIT_RECORD_ID:'';
  fetch('https://api.airtable.com/v0/'+AT_BASE+'/'+AT_TABLE+path,{
    method:method,
    headers:{'Authorization':'Bearer '+AT_TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify(EDIT_RECORD_ID?{fields:fields}:{records:[{fields:fields}]})
  }).then(function(r){return r.json();})
  .then(function(data){
    var id=EDIT_RECORD_ID||(data.records&&data.records[0]&&data.records[0].id);
    if(id&&!EDIT_RECORD_ID){
      EDIT_RECORD_ID=id;
      window.history.replaceState({},'',window.location.pathname+'?editId='+id);
    }
    if(cb)cb(id);
    // Status anzeigen
    document.getElementById('status-row').style.display='flex';
    document.getElementById('status-select').value=status;
  }).catch(function(){alert('Fehler beim Speichern.');});
}

function updateStatus(status){
  if(!EDIT_RECORD_ID){alert('Bitte zuerst speichern.');return;}
  fetch('https://api.airtable.com/v0/'+AT_BASE+'/'+AT_TABLE+'/'+EDIT_RECORD_ID,{
    method:'PATCH',
    headers:{'Authorization':'Bearer '+AT_TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({fields:{'Status':status}})
  }).then(function(){
    var ok=document.getElementById('status-save-ok');
    ok.style.display='inline';
    setTimeout(function(){ok.style.display='none';},2000);
  });
}

function saveDraft(){
  var e=validate();
  if(e.length){alert('Bitte ausf\u00fcllen:\n\n\u2022 '+e.join('\n\u2022 '));return;}
  saveToAirtable('Entwurf',function(){alert('Entwurf gespeichert!');});
}

function generateLink(){
  var e=validate();
  if(e.length){alert('Bitte ausf\u00fcllen:\n\n\u2022 '+e.join('\n\u2022 '));return;}
  document.getElementById('share-url').value='Link wird erstellt ...';
  var box=document.getElementById('share-box');
  box.style.display='block';
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
  saveToAirtable('Entwurf',function(id){
    if(id){
      var shortUrl='https://www.internate.org/www?id='+id;
      document.getElementById('share-url').value=shortUrl;
    }
  });
}

function sendEmail(){
  var familyEmail=document.getElementById('f-family-email').value.trim();
  if(!familyEmail){alert('Bitte E-Mail-Adresse der Familie eingeben.');return;}
  var url=document.getElementById('share-url').value;
  if(!url||url==='Link wird erstellt ...'){alert('Bitte zuerst den Link generieren.');return;}
  var advisorVal=document.getElementById('f-advisor').value;
  var advisorName=advisorVal.split('|')[0]||'';
  var advisorEmail=advisorVal.split('|')[1]||'';
  var familyName=document.getElementById('f-family').value.trim();
  var studentName=document.getElementById('f-student').value.trim();
  var year=document.getElementById('f-year').value.trim();
  var role=document.getElementById('f-role').value;
  var einstieg=(document.getElementById('f-einstieg')||{value:''}).value.trim();
  var duration2=(document.getElementById('f-duration')||{value:''}).value.trim();
  var zeitraum=duration2?duration2+' ab '+year:year;
  var subject=encodeURIComponent('Internatsauswahl f\u00fcr '+studentName+' \u2014 T\u00f6chter & S\u00f6hne');
  var nl='%0D%0A';
  var body;
  var eLang=document.getElementById('f-lang')?document.getElementById('f-lang').value:'de';
  if(role==='beraterin'){
    if(eLang==='en'){
      subject=encodeURIComponent('Boarding School Selection for '+studentName+' - Toechter und Soehne');
      body=encodeURIComponent('Dear '+familyName+' family,')+nl+nl
        +encodeURIComponent('I am pleased to share with you today the first suggestions for boarding schools for '+studentName+'.')+nl+nl
        +encodeURIComponent('As discussed, I have introduced '+studentName+' to a selection of boarding schools for '+zeitraum+'.')+nl+nl
        +encodeURIComponent('You can access '+studentName+'s personalised selection via the following link:')+nl
        +encodeURIComponent(url)+nl+nl
        +encodeURIComponent('Please could you let me know when you would be available for a phone call, so that I can talk you through the schools in more detail and explain why I have selected these particular schools for '+studentName+'?')+nl+nl
        +encodeURIComponent('Please note that the schools have currently indicated that places should be available in principle. However, this does not yet constitute a binding offer or guarantee of a place.')+nl+nl
        +encodeURIComponent('During the next conversation, we will first compile a shortlist of your preferred schools. As each school has its own admissions process, I will then guide you through the next steps for each school individually.')+nl+nl
        +encodeURIComponent('I will, of course, continue to support you throughout all further stages of the application process.')+nl+nl
        +encodeURIComponent('I look forward to receiving your suggested times for a call.')+nl+nl
        +encodeURIComponent('With kind regards,')+nl
        +encodeURIComponent(advisorName);
    } else {
    body='Liebe Familie '+encodeURIComponent(familyName)+','+nl+nl
      +encodeURIComponent('es freut mich, Ihnen heute die ersten Internatsvorschl\u00e4ge f\u00fcr ')
      +encodeURIComponent(studentName)+encodeURIComponent('s geplanten Aufenthalt unterbreiten zu k\u00f6nnen.')+nl
      +encodeURIComponent('Wie besprochen, habe ich '+studentName+' bei ausgew\u00e4hlten Internaten f\u00fcr '+zeitraum+' vorgestellt.')+nl+nl
      +encodeURIComponent('Unter diesem Link finden Sie die pers\u00f6nliche Internatsauswahl f\u00fcr '+studentName+':')+nl
      +encodeURIComponent(url)+nl+nl
      +encodeURIComponent('Bitte lassen Sie mich wissen, wann Sie ein Telefonat gut einrichten k\u00f6nnen, damit ich ausf\u00fchrlicher mit Ihnen \u00fcber die Internate sprechen und erl\u00e4utern kann, weshalb ich gerade diese Internate f\u00fcr '+studentName+' in die engere Auswahl genommen habe.')+nl+nl
      +encodeURIComponent('Bitte beachten Sie, dass die vorgestellten Internate derzeit grunds\u00e4tzlich Verf\u00fcgbarkeiten signalisiert haben. Eine verbindliche Zusage oder Platzgarantie ergibt sich daraus jedoch noch nicht. Im n\u00e4chsten Gespr\u00e4ch werden wir zun\u00e4chst gemeinsam eine Shortlist der favorisierten Internate festlegen. Da jede Schule ihren Aufnahmeprozess individuell handhabt, werde ich Sie anschlie\u00dfend gezielt \u00fcber die n\u00e4chsten Schritte f\u00fcr jedes einzelne Internat informieren.')+nl
      +encodeURIComponent('Selbstverst\u00e4ndlich begleite ich Sie anschlie\u00dfend durch alle weiteren Schritte des Bewerbungsprozesses.')+nl+nl
      +encodeURIComponent('Ich freue mich \u00fcber Ihre Terminvorschl\u00e4ge.')+nl+nl
      +encodeURIComponent('Mit herzlichen Gr\u00fc\u00dfen')+nl
      +encodeURIComponent(advisorName);
    }
  } else {
    if(eLang==='en'){
      subject=encodeURIComponent('Boarding School Selection for '+studentName+' - Toechter und Soehne');
      body=encodeURIComponent('Dear '+familyName+' family,')+nl+nl
        +encodeURIComponent('We are pleased to share with you today the first suggestions for boarding schools for '+studentName+'.')+nl+nl
        +encodeURIComponent('As discussed, we have introduced '+studentName+' to a selection of boarding schools for '+zeitraum+'.')+nl+nl
        +encodeURIComponent('You can access '+studentName+'s personalised selection via the following link:')+nl
        +encodeURIComponent(url)+nl+nl
        +encodeURIComponent('Please could you let us know when you would be available for a phone call, so that '+advisorName+' can talk you through the schools in more detail and explain why we have selected these particular schools for '+studentName+'?')+nl+nl
        +encodeURIComponent('Please note that the schools have currently indicated that places should be available in principle. However, this does not yet constitute a binding offer or guarantee of a place.')+nl+nl
        +encodeURIComponent('During the next conversation, you will first compile a shortlist of your preferred schools. As each school has its own admissions process, your consultant will then guide you through the next steps for each school individually.')+nl+nl
        +encodeURIComponent('We will, of course, continue to support you throughout all further stages of the application process.')+nl+nl
        +encodeURIComponent('We look forward to receiving your suggested times for a call.')+nl+nl
        +encodeURIComponent('Warm regards,');
    } else {
    body='Liebe Familie '+encodeURIComponent(familyName)+','+nl+nl
      +encodeURIComponent('es freut uns, Ihnen heute die ersten Internatsvorschl\u00e4ge f\u00fcr ')
      +encodeURIComponent(studentName)+encodeURIComponent('s geplanten Aufenthalt unterbreiten zu k\u00f6nnen.')+nl
      +encodeURIComponent('Wie besprochen, haben wir '+studentName+' bei ausgew\u00e4hlten Internaten f\u00fcr '+zeitraum+' vorgestellt.')+nl+nl
      +encodeURIComponent('Unter diesem Link finden Sie die pers\u00f6nliche Internatsauswahl f\u00fcr '+studentName+':')+nl
      +encodeURIComponent(url)+nl+nl
      +encodeURIComponent('Bitte lassen Sie uns wissen, wann Sie ein Telefonat gut einrichten k\u00f6nnen, damit Frau '+advisorName.split(' ').pop()+' ausf\u00fchrlicher mit Ihnen \u00fcber die Internate sprechen und erl\u00e4utern kann, weshalb wir gerade diese Internate f\u00fcr '+studentName+' in die engere Auswahl genommen haben.')+nl+nl
      +encodeURIComponent('Bitte beachten Sie, dass die vorgestellten Internate derzeit grunds\u00e4tzlich Verf\u00fcgbarkeiten signalisiert haben. Eine verbindliche Zusage oder Platzgarantie ergibt sich daraus jedoch noch nicht. Im n\u00e4chsten Gespr\u00e4ch werden Sie zun\u00e4chst gemeinsam eine Shortlist der favorisierten Internate festlegen. Da jede Schule ihren Aufnahmeprozess individuell handhabt, informiert Ihre Beraterin Sie anschlie\u00dfend gezielt \u00fcber die n\u00e4chsten Schritte f\u00fcr jedes einzelne Internat.')+nl
      +encodeURIComponent('Selbstverst\u00e4ndlich begleiten wir Sie anschlie\u00dfend durch alle weiteren Schritte des Bewerbungsprozesses.')+nl+nl
      +encodeURIComponent('Wir freuen uns \u00fcber Ihre Terminvorschl\u00e4ge.')+nl+nl
      +encodeURIComponent('Mit herzlichen Gr\u00fc\u00dfen');
    }
  }
  var cc=(role!=='beraterin'&&advisorEmail)?'?cc='+encodeURIComponent(advisorEmail):'?';
  var mailto='mailto:'+encodeURIComponent(familyEmail)+cc+'&subject='+subject+'&body='+body;
  window.location.href=mailto;
}

function copyLink(){
  var inp=document.getElementById('share-url');inp.select();
  try{if(navigator.clipboard)navigator.clipboard.writeText(inp.value);else document.execCommand('copy');}catch(e){}
  var ok=document.getElementById('copy-ok');ok.style.display='block';
  setTimeout(function(){ok.style.display='none';},2500);
}

function renderView(state,isReadOnly){
  var fn=state.student;
  var en=(state.lang||'de')==='en';
  var byC={};var cOrder=[];
  state.schools.forEach(function(s){
    var c=normC(s.country);
    if(!c){
      var addr=(s.address||'').toLowerCase();
      if(addr.indexOf('united kingdom')>-1||addr.indexOf('england')>-1)c='Gro\u00dfbritannien';
      else if(addr.indexOf('schweiz')>-1||addr.indexOf('switzerland')>-1)c='Schweiz';
      else if(addr.indexOf('deutschland')>-1||addr.indexOf('germany')>-1)c='Deutschland';
      else c='Weitere Internate';
    }
    if(!byC[c]){byC[c]=[];cOrder.push(c);}
    byC[c].push(s);
  });

  // Länder für EN übersetzen
  var DE_TO_EN={'Gro\u00dfbritannien':'United Kingdom','Deutschland':'Germany','\u00d6sterreich':'Austria','Schweiz':'Switzerland','Frankreich':'France','Spanien':'Spain','Italien':'Italy','Vereinigte Staaten':'United States','USA':'USA','Kanada':'Canada','Neuseeland':'New Zealand','Australien':'Australia','Niederlande':'Netherlands','Belgien':'Belgium','Portugal':'Portugal'};
  var cOrderDisplay = en ? cOrder.map(function(c){ return DE_TO_EN[c]||c; }) : cOrder;

  var html='';
  if(!isReadOnly){
    html+='<div class="back-bar"><button onclick="backToTool()">\u2190 Zur\u00fcck</button><span class="preview-tag">Vorschau \u2014 so sehen es die Eltern</span></div>';
  }

  // Hero
  html+='<div class="vh">'
    +'<div class="vh-logo">T\u00d6CHTER und S\u00d6HNE</div>'
    +'<div class="vh-name">'+(en?'Boarding School Selection<br>for ':'Internatsauswahl<br>f\u00fcr ')+esc(fn)+' '+esc(state.family)+'</div>'
    +'<div class="vh-meta">'
    +'<div class="vh-mi"><strong>'+esc(state.year)+'</strong><span>Start</span></div>'

    +(state.einstieg?'<div class="vh-mi"><strong>'+esc(state.einstieg)+'</strong><span>'+(en?'Entry Year':'Einstieg')+'</span></div>':'')
    +(state.duration?'<div class="vh-mi"><strong>'+esc(state.duration)+'</strong><span>'+(en?'Duration of Stay':'Aufenthaltsdauer')+'</span></div>':'')
    +'<div class="vh-mi"><strong>'+cOrderDisplay.join(', ')+'</strong><span>'+(en?(cOrder.length===1?'Country':'Countries'):(cOrder.length===1?'Land':'L\u00e4nder'))+'</span></div>'
    +'</div></div>';

  // Intro
  if(state.intro){
    html+='<div class="v-intro">'+esc(state.intro).replace(/\n/g,'<br>')+'</div>';
  }

  // Internate
  html+='<div class="v-section">'
    +'<div class="v-sec-title">'+(en?'Selected Boarding Schools':'Ausgew\u00e4hlte Internate')+'</div>'
    +'<div class="v-sec-sub">'+state.schools.length+' '+(en?'boarding school'+(state.schools.length===1?'':'s'):'Internat'+(state.schools.length===1?'':'e'))+' \u00b7 '+esc(state.year)+'</div>';

  cOrder.forEach(function(country,ci){
    var list=byC[country];
    var groupId='cg'+ci;
    html+='<div class="country-group">'
      +'<div class="country-toggle" onclick="toggleCountry(\''+groupId+'\')">'
      +'<div class="country-toggle-left">'
      +'<span class="country-name">'+(en&&DE_TO_EN[country]?esc(DE_TO_EN[country]):esc(country))+'</span>'
      +'<span class="country-count">'+list.length+' Internat'+(list.length>1?'e':'')+'</span>'
      +'</div>'
      +'<span class="country-arrow'+(cOrder.length===1?' open':'') +'" id="arr-'+groupId+'">&#9660;</span>'
      +'</div>'
      +'<div class="country-content'+(cOrder.length===1?' open':'')+'" id="'+groupId+'">';

    list.forEach(function(s){
      html+='<div class="sc-view">';
      if(s.photo){
        html+='<img class="sc-view-img" src="'+esc(s.photo)+'" alt="'+esc(s.name)+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
          +'<div class="sc-view-ph" style="display:none">'+esc(s.name)+'</div>';
      }else{
        html+='<div class="sc-view-ph">'+esc(s.name)+'</div>';
      }
      html+='<div class="sc-view-body">';
      html+='<div class="sc-name">'+esc(s.name)+'</div>';
      // Pills: Einstieg + Aufenthaltsdauer
      html+='<div class="sc-pills">';
      if(s.einstieg)html+='<span class="pill yr">'+esc(s.einstieg)+'</span>';
      if(s.duration)html+='<span class="pill dur">'+esc(s.duration)+'</span>';
      html+='</div>';
      // R\u00fcckmeldung
      if(s.feedback){
        html+='<div class="fb-label">'+(en?'School Feedback':'R\u00fcckmeldung der Schule')+'</div>'
          +'<div class="fb-box">'+linkify(s.feedback).replace(/\n/g,'<br>')+'</div>';
      }
      // Freitext
      if(s.note){
        html+='<div class="sc-note">'+linkify(s.note).replace(/\n/g,'<br>')+'</div>';
      }
      // Button
      if(s.profileUrl){
        html+='<a href="'+esc(s.profileUrl)+'" target="_blank" class="btn-discover">'+(en?'Discover this Boarding School':'Entdecken Sie dieses Internat')+'</a>';
      }
      // Reihenfolge: Flughafen \u2192 Karte \u2192 Adresse
      if(s.airport){
        html+='<div class="sc-pills" style="margin-bottom:.75rem"><span class="pill ap">Flughafen '+esc(s.airport)+(s.airportKm?' \u00b7 ca. '+esc(s.airportKm)+' km':'')+'</span></div>';
      }
      if(s.lat&&s.lng){
        html+='<div class="sc-map"><iframe loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox='
          +(s.lng-1.5)+'%2C'+(s.lat-1.0)+'%2C'+(s.lng+1.5)+'%2C'+(s.lat+1.0)
          +'&layer=mapnik&marker='+s.lat+'%2C'+s.lng+'" title="'+esc(s.name)+'"></iframe></div>';
      }
      if(s.address)html+='<div class="sc-addr" style="margin-top:.75rem">'+esc(s.address)+'</div>';
      html+='</div></div>';
    });
    html+='</div></div>';
  });
  html+='</div>';

  // Beraterin
  var advisorInfo=ADVISOR_DATA[state.advisor]||{};
  var advisorPhoto=advisorInfo.photo||state.advisorPhoto||'';
  var advisorPhone=advisorInfo.phone||state.advisorPhone||'';
  var advisorEmail=advisorInfo.email||state.advisorEmail||'';
  var ADVISOR_ROLES={'Janka Z\u00f6ller':'Gesellschafterin','Johanna Lingenthal':'Operative Gesch\u00e4ftsf\u00fchrung','Ann-Kathrin Schiefer':'Senior Consultant','Mirjam Auweiler':'Senior Consultant','Gesine Meyer':'Senior Consultant'};
  var advisorRole=ADVISOR_ROLES[state.advisor]||advisorInfo.role||state.advisorRole||'Senior Consultant';
  var initials=state.advisor?state.advisor.split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase():'TS';
  var photoHtml=advisorPhoto
    ?'<img class="av-photo" src="'+esc(advisorPhoto)+'" alt="'+esc(state.advisor)+'">'
    :'<div class="av-photo-initials">'+esc(initials)+'</div>';

  html+='<div class="v-contact"><div class="advisor-box">'
    +'<div class="av-photo-wrap">'+photoHtml+'</div>'
    +'<div class="av-text">'
    +'<div class="av-greeting">'+(en?'With kind regards,':'Mit herzlichen Gr\u00fc\u00dfen,')+'</div>'
    +'<div class="av-name">'+esc(state.advisor)+'</div>'
    +'<div class="av-role">'+esc(advisorRole)+'</div>'
    +'<div class="av-contacts">'
    +(advisorEmail?'<a href="mailto:'+esc(advisorEmail)+'" class="av-contact-link">'+'<svg width="18px" height="18px" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path d="M63.5,52.3958 L47,35.4028 L55.3,27.7028 L55.278,27.6808 L63.5,20.1028 L63.5,34.5968 L63.5,52.3958 Z M11.199,54.3018 L27.904,37.2008 L32.797,41.7038 C33.797,42.6028 35.097,43.1028 36.398,43.1028 C36.432,43.1028 36.466,43.0938 36.5,43.0928 C36.534,43.0938 36.567,43.1028 36.601,43.1028 C37.902,43.1028 39.203,42.6028 40.203,41.7038 L45.096,37.2008 L61.801,54.3018 L11.199,54.3018 Z M9.5,20.1028 L26,35.4028 L9.5,52.3958 L9.5,34.5968 L9.5,20.1028 Z M61.602,18.4998 L38.301,39.8008 C37.816,40.2858 37.166,40.5308 36.5,40.5448 C35.834,40.5308 35.184,40.2858 34.699,39.8008 L11.398,18.4998 L61.602,18.4998 Z M64.801,15.9998 L8.199,15.9998 C7.5,15.9998 7,16.6008 7,17.1988 L7,55.4998 C7,55.6538 7.035,55.8068 7.096,55.9508 C7.131,56.0338 7.187,56.0998 7.239,56.1718 C7.279,56.2288 7.31,56.2898 7.359,56.3398 C7.409,56.3888 7.47,56.4198 7.527,56.4598 C7.599,56.5108 7.664,56.5668 7.747,56.6028 C7.892,56.6638 8.045,56.6988 8.199,56.6988 L64.801,56.6988 C64.955,56.6988 65.108,56.6638 65.252,56.6028 C65.335,56.5668 65.401,56.5108 65.472,56.4598 C65.53,56.4198 65.59,56.3888 65.64,56.3398 C65.69,56.2898 65.721,56.2288 65.761,56.1718 C65.812,56.0998 65.868,56.0338 65.903,55.9508 C65.965,55.8068 66,55.6538 66,55.4998 L66,17.1988 C66,16.6008 65.5,15.9998 64.801,15.9998 Z" fill="#84332f"></path></svg>'+esc(advisorEmail)+'</a>':'')
    +(advisorPhone?'<a href="tel:'+esc(advisorPhone)+'" class="av-contact-link">'+'<svg width="18px" height="18px" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg"><path d="M59.9745157,45.1315142 L49.8633453,39.8760772 C47.4413819,38.6158234 44.4918518,39.2433226 42.9123104,41.4527083 L40.3860974,44.7131814 C37.964134,43.2427101 35.6474734,41.666079 33.0149046,39.0383605 C30.2759799,36.3044822 28.6964386,34.0993008 27.2232531,31.5745889 L30.3823357,29.0530302 C32.4883908,27.3702393 33.1223134,24.4303478 31.961877,22.1148023 L26.8041481,12.022261 C26.0680819,10.6547963 24.8055018,9.60370892 23.2259605,9.18537613 C21.6464192,8.76599226 20.0668779,9.07816521 18.696889,9.92008622 L12.271315,14.2316467 C10.1652599,15.7010669 8.90267985,18.119619 9.00587655,20.7473375 C9.11223233,22.533135 9.32178481,25.057847 9.84829859,26.946651 C11.8479979,34.5134292 16.5866218,42.2946293 23.1185517,48.9122756 C29.7536783,55.5351773 37.543976,60.1578597 45.1247213,62.158079 C46.9148681,62.6836227 49.547437,62.8927891 51.3365308,63 L51.7556358,63 C54.2818488,63 56.4942597,61.7397462 57.8642486,59.6375714 L62.0763587,53.1218806 C62.9198338,51.7544159 63.2367951,50.1777848 62.812425,48.7073135 C62.3975321,47.1264781 61.4508604,45.8662243 59.9745157,45.1315142 Z" fill="#84332f"></path></svg>'+esc(advisorPhone)+'</a>':'')
    +'</div></div></div></div></div>';

  document.getElementById('view').innerHTML=html;
}

window.toggleCountry=function(id){
  var content=document.getElementById(id);
  var arrow=document.getElementById('arr-'+id);
  if(content){content.classList.toggle('open');arrow.classList.toggle('open');}
};

function showPreview(){
  var e=validate();
  if(e.length){alert('Bitte ausf\u00fcllen:\n\n\u2022 '+e.join('\n\u2022 '));return;}
  renderView(buildState(),false);
  document.getElementById('tool-view').style.display='none';
  document.getElementById('view').style.display='block';
  window.scrollTo(0,0);
}
function backToTool(){
  document.getElementById('tool-view').style.display='block';
  document.getElementById('view').style.display='none';
  window.scrollTo(0,0);
}

window.addSchool=addSchool;
window.removeSchool=removeSchool;
window.moveSchool=moveSchool;
window.upd=upd;
window.showPreview=showPreview;
window.backToTool=backToTool;
window.generateLink=generateLink;
window.saveDraft=saveDraft;
window.saveToAirtable=saveToAirtable;
window.copyLink=copyLink;
window.sendEmail=sendEmail;
window.updateStatus=updateStatus;

function __wwwInit(){
  var shortId=new URLSearchParams(window.location.search).get('id');
  var encoded=new URLSearchParams(window.location.search).get('empfehlung');

  // Eltern-Ansicht: Tool sofort verstecken, BEVOR irgendwas gerendert wird
  if(shortId||encoded){
    document.getElementById('tool-view').style.display='none';
    document.getElementById('view').style.display='block';
  } else {
    loadCms();addSchool();
  }

  // Kurzer Link ?id=
  if(shortId){
    fetch('https://api.airtable.com/v0/'+AT_BASE+'/'+AT_TABLE+'/'+shortId,{
      headers:{'Authorization':'Bearer '+AT_TOKEN}
    }).then(function(r){return r.json();})
    .then(function(data){
      if(data.fields&&data.fields.Link){
        var match=data.fields.Link.match(/[?&]empfehlung=([^&]+)/);
        if(match){
          try{
            var state=JSON.parse(decodeURIComponent(escape(atob(match[1]))));
            renderView(state,true);
          }catch(e){}
        }
      }
    });
    return;
  }

  // Langer Link ?empfehlung=
  if(encoded){
    try{
      var state=JSON.parse(decodeURIComponent(escape(atob(encoded))));
      renderView(state,true);
    }catch(e){}
    return;
  }

  // Bearbeiten ?editId=
  if(EDIT_RECORD_ID){
    document.getElementById('status-row').style.display='flex';
    fetch('https://api.airtable.com/v0/'+AT_BASE+'/'+AT_TABLE+'/'+EDIT_RECORD_ID,{
      headers:{'Authorization':'Bearer '+AT_TOKEN}
    }).then(function(r){return r.json();})
    .then(function(data){
      if(!data.fields)return;
      var f=data.fields;
      if(f['Sch\u00fclerin'])document.getElementById('f-student').value=f['Sch\u00fclerin'];
      if(f.Familie)document.getElementById('f-family').value=f.Familie;
      if(f.Start)document.getElementById('f-year').value=f.Start;
      if(f.Status)document.getElementById('status-select').value=f.Status;
      var sel=document.getElementById('f-advisor');
      for(var i=0;i<sel.options.length;i++){
        if(sel.options[i].value.split('|')[0]===f.Beraterin){sel.selectedIndex=i;break;}
      }
      if(f.Link){
        var match=f.Link.match(/[?&]empfehlung=([^&]+)/);
        if(match){
          try{
            var state=JSON.parse(decodeURIComponent(escape(atob(match[1]))));
            if(state.intro)document.getElementById('f-intro').value=state.intro;

            if(state.duration){var dEl=document.getElementById('f-duration');if(dEl)dEl.value=state.duration;}
            if(state.lang){var lEl=document.getElementById('f-lang');if(lEl)lEl.value=state.lang;}
            if(state.einstieg){var eEl=document.getElementById('f-einstieg');if(eEl)eEl.value=state.einstieg;}
            if(state.role)document.getElementById('f-role').value=state.role;
            schools=[];
            state.schools.forEach(function(s){
              sc++;
              schools.push({id:sc,name:s.name,feedback:s.feedback||'',note:s.note||'',duration:s.duration||'',einstieg:s.einstieg||''});
            });
            renderSchools();
          }catch(e){}
        }
      }
      var banner=document.createElement('div');
      banner.style.cssText='background:var(--brd-l);border:1px solid var(--brd-m);border-radius:10px;padding:10px 14px;margin-bottom:1rem;font-size:12px;color:var(--brd);font-weight:600';
      banner.textContent='Internatsauswahl wird bearbeitet \u2014 Familie '+f.Familie;
      document.querySelector('.tool').insertBefore(banner,document.querySelector('.card'));
    });
  }
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',__wwwInit);}else{__wwwInit();}
