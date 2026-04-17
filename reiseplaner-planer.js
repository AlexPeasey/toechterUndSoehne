(function(){

var GMAPS_KEY = 'AIzaSyBOeLeI6YQSrJeys0i6HwGaVa-mQmwsd0Y';
var gmapsReady = false;
window.tsRpMapsLoaded = function(){ gmapsReady = true; };

var rpSchools=[], rpCmsSchools=[], rpAirport='LHR', rpSC=0, rpTripDays=0;

var AIRPORTS={LHR:'London Heathrow',LGW:'London Gatwick',MAN:'Manchester',EDI:'Edinburgh',BRS:'Bristol',BHX:'Birmingham'};
var AIRPORT_COORDS={
  LHR:{lat:51.470,lng:-0.4543},
  LGW:{lat:51.1537,lng:-0.1821},
  MAN:{lat:53.365,lng:-2.2728},
  EDI:{lat:55.950,lng:-3.3725},
  BRS:{lat:51.3827,lng:-2.7191},
  BHX:{lat:52.4539,lng:-1.7480}
};

// Direktflüge nach Deutschland pro Abflughafen
var FLIGHTS_DE={
  LHR:['Düsseldorf','Berlin','Hamburg','Stuttgart','Hannover','München','Frankfurt am Main'],
  LGW:['Düsseldorf','Berlin','Hamburg','Köln','München','Frankfurt am Main'],
  MAN:['Düsseldorf','Berlin','Hamburg','Köln','München','Stuttgart','Frankfurt am Main'],
  EDI:['Düsseldorf','Berlin','Köln','München','Stuttgart','Frankfurt am Main'],
  BRS:['Berlin','München'],
  BHX:['Düsseldorf','Berlin','München','Frankfurt am Main']
};

// Nächsten Flughafen zur letzten Schule finden
function tsRpExtractCity(school){
  if(school.city&&school.city.trim()) return school.city.trim();
  var addr=school.address||'';
  var parts=addr.split(',');
  for(var pi=parts.length-1;pi>=0;pi--){
    var p=parts[pi].trim().replace(/\s+[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}/,'').trim();
    if(p&&p!=='Vereinigtes Königreich'&&p!=='United Kingdom'&&p.length>2&&!/^[A-Z]{1,2}[0-9]/.test(p)){
      return p;
    }
  }
  return school.name;
}

function nearestAirport(lat,lng){
  var best=null,bestKm=Infinity;
  Object.keys(AIRPORT_COORDS).forEach(function(code){
    var ac=AIRPORT_COORDS[code];
    var km=haversineKm(lat,lng,ac.lat,ac.lng);
    if(km!==null&&km<bestKm){bestKm=km;best=code;}
  });
  return{code:best,km:Math.round(bestKm)};
}
var DO={Mo:0,Di:1,Mi:2,Do:3,Fr:4};
var DF={Mo:'Montag',Di:'Dienstag',Mi:'Mittwoch',Do:'Donnerstag',Fr:'Freitag',Sa:'Samstag',So:'Sonntag'};

function safe(v){return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function parseNum(v){if(v===null||v===undefined||v==='')return null;var n=parseFloat(String(v).replace(',','.'));return isNaN(n)?null:n;}
function parseGpsPair(raw){var s=String(raw||'').trim();if(!s)return{lat:null,lng:null};var p=s.split(',');if(p.length<2)return{lat:null,lng:null};return{lat:parseNum(p[0]),lng:parseNum(p[1])};}
function t2m(t){if(!t)return 0;var p=t.split(':').map(Number);return p[0]*60+p[1];}
function m2t(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+' Uhr';}
function haversineKm(a,b,c,d){if([a,b,c,d].some(function(v){return typeof v!=='number'||isNaN(v);}))return null;var R=6371,dL=(c-a)*Math.PI/180,dN=(d-b)*Math.PI/180,e=Math.sin(dL/2)*Math.sin(dL/2)+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dN/2)*Math.sin(dN/2);return R*2*Math.atan2(Math.sqrt(e),Math.sqrt(1-e));}
function driveMin(km){if(km===null)return 60;if(km<30)return 35;if(km<60)return 55;if(km<100)return 85;if(km<150)return 120;if(km<220)return 165;if(km<320)return 220;return 300;}

// ============================================================
// GOOGLE MAPS DIRECTIONS API — echte Fahrtzeit per Straße
// Asynchron: callback(durationMin, distanceKm)
// Fallback auf Luftlinie wenn API nicht verfügbar
// ============================================================
var getDriveDuration=function(a,b,c,d,cb){getRoadDuration(a,b,c,d,cb);};
function getRoadDuration(originLat, originLng, destLat, destLng, callback){
  if(!gmapsReady || typeof google==='undefined' || !google.maps || !google.maps.DirectionsService){
    var km = haversineKm(originLat, originLng, destLat, destLng);
    callback(driveMin(km), km ? Math.round(km) : null);
    return;
  }
  var svc = new google.maps.DirectionsService();
  svc.route({
    origin: new google.maps.LatLng(originLat, originLng),
    destination: new google.maps.LatLng(destLat, destLng),
    travelMode: google.maps.TravelMode.DRIVING
  }, function(result, status){
    if(status === google.maps.DirectionsStatus.OK && result.routes.length){
      var leg = result.routes[0].legs[0];
      var durationMin = Math.round(leg.duration.value / 60);
      var distanceKm = Math.round(leg.distance.value / 1000);
      callback(durationMin, distanceKm);
    } else {
      // Fallback auf Luftlinie
      var km = haversineKm(originLat, originLng, destLat, destLng);
      callback(driveMin(km), km ? Math.round(km) : null);
    }
  });
}

// Optimales Zeitfenster: nächstes zu 14:00 Uhr (Nachmittag bevorzugt)
function bestSlot(slots){
  var valid=slots.filter(function(sl){return sl.day&&sl.start;});
  if(!valid.length)return null;
  return valid.reduce(function(a,b){
    return Math.abs(t2m(a.start)-14*60)<=Math.abs(t2m(b.start)-14*60)?a:b;
  });
}

// CMS Schulen laden
function rpLoadCmsSchools(){
  rpCmsSchools=Array.from(document.querySelectorAll('.rp-cms-school')).map(function(el,i){
    var gps=parseGpsPair(el.getAttribute('data-gps'));
    return{cmsId:i+1,name:(el.getAttribute('data-name')||'').trim(),address:(el.getAttribute('data-address')||'').trim(),lat:gps.lat,lng:gps.lng,accommodationPdf:(el.getAttribute('data-accommodation-pdf')||'').trim()};
  }).filter(function(x){return x.name;});
  rpCmsSchools.sort(function(a,b){return a.name.localeCompare(b.name,'de');});
}

function schoolOptions(sel){
  var h='<option value="">Schule auswählen ...</option>';
  rpCmsSchools.forEach(function(s){h+='<option value="'+safe(s.name)+'"'+(s.name===sel?' selected':'')+'>'+safe(s.name)+'</option>';});
  return h;
}

function metaHtml(s){
  if(!s.name)return '';
  var p=[];
  if(s.address)p.push('<strong>Adresse:</strong> '+safe(s.address));
  if(s.lat!==null&&s.lng!==null)p.push('<strong>GPS:</strong> '+s.lat.toFixed(4)+', '+s.lng.toFixed(4));
  return p.length?'<div class="ts-rp-meta">'+p.join(' &nbsp;&middot;&nbsp; ')+'</div>':'';
}

// Tage auswählen
window.tsRpSelectDays = function(btn){
  document.querySelectorAll('.ts-rp-day-btn').forEach(function(b){b.classList.remove('selected');});
  btn.classList.add('selected');
  rpTripDays=parseInt(btn.dataset.val,10);
};

window.tsRpSelectAirport = function(btn){
  document.querySelectorAll('.ts-rp-ap').forEach(function(b){b.classList.remove('selected');});
  btn.classList.add('selected');
  rpAirport=btn.dataset.val;
};

window.tsRpGoStep = function(n){
  // Validierung Schritt 1
  if(n===2){
    if(!rpTripDays){alert('Bitte wählen Sie die Anzahl der Reisetage aus.');return;}
  }
  if(n===2&&rpSchools.length===0)tsRpAddSchool();
  document.querySelectorAll('.ts-rp-step').forEach(function(s,i){s.classList.toggle('active',i===n-1);});
  for(var i=1;i<=4;i++){
    var c=document.getElementById('ts-pc'+i),l=document.getElementById('ts-pl'+i);
    c.classList.toggle('active',i===n);c.classList.toggle('done',i<n);
    l.classList.toggle('active',i===n);l.classList.toggle('done',i<n);
    if(i<4)document.getElementById('ts-pline'+i).classList.toggle('done',i<n);
  }
  document.querySelector('.ts-rp').scrollIntoView({behavior:'smooth',block:'start'});
};

window.tsRpAddSchool=function(){
  rpSC++;
  rpSchools.push({id:rpSC,name:'',address:'',lat:null,lng:null,flexible:false,accommodationPdf:'',comment:'',slots:[{day:'',start:'',end:''}]});
  tsRpRenderSchools();
};
window.tsRpRemoveSchool=function(id){rpSchools=rpSchools.filter(function(s){return s.id!==id;});tsRpRenderSchools();};
window.tsRpAddSlot=function(id){var s=rpSchools.find(function(s){return s.id===id;});if(s){s.slots.push({day:'',start:'',end:''});tsRpRenderSchools();}};
window.tsRpRemoveSlot=function(id,idx){var s=rpSchools.find(function(s){return s.id===id;});if(s&&s.slots.length>1){s.slots.splice(idx,1);tsRpRenderSchools();}};
window.tsRpUpdSlot=function(id,idx,f,v){var s=rpSchools.find(function(s){return s.id===id;});if(s&&s.slots[idx])s.slots[idx][f]=v;};

window.tsRpUpdComment=function(id,val){
  var s=rpSchools.find(function(x){return x.id===id;});
  if(s)s.comment=val;
};

window.tsRpSetMode=function(id,flex){
  var s=rpSchools.find(function(x){return x.id===id;});
  if(s){s.flexible=flex;tsRpRenderSchools();}
};

window.tsRpSelectCmsSchool=function(id,name){
  var s=rpSchools.find(function(x){return x.id===id;});
  var cs=rpCmsSchools.find(function(x){return x.name===name;});
  if(!s)return;
  if(!cs){s.name='';s.address='';s.lat=null;s.lng=null;}
  else{s.name=cs.name;s.address=cs.address;s.lat=cs.lat;s.lng=cs.lng;}
  tsRpRenderSchools();
};

function tsRpRenderSchools(){
  var c=document.getElementById('ts-rp-schoolList');c.innerHTML='';
  rpSchools.forEach(function(s,si){
    var div=document.createElement('div');div.className='ts-rp-school-card';
    var optSlot=bestSlot(s.slots);
    var validSlots=s.slots.filter(function(sl){return sl.day&&sl.start;});
    var multipleValid=validSlots.length>1;

    var sH=s.slots.map(function(sl,idx){
      var isOpt=optSlot&&sl===optSlot&&multipleValid;
      return '<div class="ts-rp-slot-row'+(isOpt?' optimal-slot':'')+'">'
        +'<select onchange="tsRpUpdSlot('+s.id+','+idx+',\'day\',this.value)">'
        +'<option value=""'+(sl.day?'':' selected')+'>Wochentag</option>'
        +'<option value="Mo"'+(sl.day==='Mo'?' selected':'')+'>Montag</option>'
        +'<option value="Di"'+(sl.day==='Di'?' selected':'')+'>Dienstag</option>'
        +'<option value="Mi"'+(sl.day==='Mi'?' selected':'')+'>Mittwoch</option>'
        +'<option value="Do"'+(sl.day==='Do'?' selected':'')+'>Donnerstag</option>'
        +'<option value="Fr"'+(sl.day==='Fr'?' selected':'')+'>Freitag</option>'
        +'</select>'
        +'<input type="time" value="'+safe(sl.start)+'" onchange="tsRpUpdSlot('+s.id+','+idx+',\'start\',this.value)">'
        +'<span>bis</span>'
        +'<input type="time" value="'+safe(sl.end)+'" onchange="tsRpUpdSlot('+s.id+','+idx+',\'end\',this.value)">'
        +(isOpt?'<span class="ts-rp-optimal-tag">Optimal</span>':'')
        +(s.slots.length>1?'<button type="button" class="ts-rp-rm-slot" onclick="tsRpRemoveSlot('+s.id+','+idx+')">&times;</button>':'')
        +'</div>';
    }).join('');

    var isFlex=(s.flexible===true);
    div.innerHTML=''
      +'<div class="ts-rp-school-top">'
      +'<div class="ts-rp-school-num"><div class="ts-rp-snb">'+(si+1)+'</div>Schule '+(si+1)+'</div>'
      +(rpSchools.length>1?'<button type="button" class="ts-rp-btn-dsm" onclick="tsRpRemoveSchool('+s.id+')">Entfernen</button>':'')
      +'</div>'
      +'<div class="ts-rp-field">'
      +'<label class="ts-rp-lbl">Schule</label>'
      +'<select onchange="tsRpSelectCmsSchool('+s.id+',this.value)">'+schoolOptions(s.name)+'</select>'
      +'</div>'
      +'<label class="ts-rp-lbl" style="margin-top:.75rem;display:block">Zeitplanung</label>'
      +'<div class="ts-rp-mode-toggle">'
      +'<button type="button" class="ts-rp-mode-btn'+(isFlex?'':' active')+'" onclick="tsRpSetMode('+s.id+',false)">Festes Zeitfenster</button>'
      +'<button type="button" class="ts-rp-mode-btn'+(isFlex?' active':'')+'" onclick="tsRpSetMode('+s.id+',true)">Flexibel (08:00–17:00)</button>'
      +'</div>'
      +'<div class="ts-rp-slot-section" id="ts-slots-'+s.id+'" style="'+(isFlex?'display:none':'')+'">'
      +(multipleValid?'<div class="ts-rp-help" style="margin-bottom:6px">Das optimale Zeitfenster wird automatisch gewählt.</div>':'')
      +'<div>'+sH+'</div>'
      +'<button type="button" class="ts-rp-add-slot" onclick="tsRpAddSlot('+s.id+')">+ Weiteres Zeitfenster</button>'
      +'</div>'
      +(isFlex?'<div class="ts-rp-help" style="margin-top:4px">System wählt optimale Zeit und Reihenfolge automatisch.</div>':'')
      +'<div class="ts-rp-comment"><label class="ts-rp-lbl" style="margin-top:10px;display:block">Kommentar zur Schule (optional)</label>'
      +'<textarea placeholder="z.B. Ansprechpartner, Parkplatz, Besonderheiten ..." onchange="tsRpUpdComment('+s.id+',this.value)">'+safe(s.comment||'')+'</textarea></div>';
    c.appendChild(div);
  });
}

// ============================================================
// MACHBARKEITS-CHECK
// Prüft ob alle Schulen in die verfügbaren Reisetage passen
// ============================================================
function feasibilityCheck(schoolsWithSlot, tripDays, maxD, vd, buf, ac, trans){
  // Alle Reisetage sind potenzielle Besuchstage
  // Schulbesuche sind auch am Anreise- und Abreisetag möglich
  var visitDays = tripDays;

  // Schulen pro Tag nach Zeitfenster gruppieren
  var dayMap={};
  schoolsWithSlot.forEach(function(item){
    var d=item.slot.day;
    if(!dayMap[d])dayMap[d]=[];
    dayMap[d].push(item);
  });

  var errors=[];
  var usedDays=Object.keys(dayMap).length;

  // Zu viele Besuchstage?
  if(usedDays>visitDays){
    errors.push('Die Schultermine benötigen <strong>'+usedDays+' verschiedene Wochentage</strong>, aber nur <strong>'+visitDays+' Reisetage</strong> sind geplant. Bitte mehr Tage auswählen oder eine Schule entfernen.');
  }

  // Zeitliche Machbarkeit pro Tag prüfen
  Object.keys(dayMap).forEach(function(day){
    var items=dayMap[day].slice(0,maxD);
    for(var i=1;i<items.length;i++){
      var prev=items[i-1],curr=items[i];
      var prevEnd=prev.slot.end?t2m(prev.slot.end):t2m(prev.slot.start)+vd;
      var currStart=t2m(curr.slot.start);
      var km=haversineKm(prev.school.lat,prev.school.lng,curr.school.lat,curr.school.lng);
      var needed=(km?driveMin(km):60)+buf;
      var available=currStart-prevEnd;
      if(available<needed){
        errors.push('<strong>'+DF[day]+':</strong> Zwischen <em>'+safe(prev.school.name)+'</em> und <em>'+safe(curr.school.name)+'</em> fehlen ca. '+(needed-available)+' Min. (Fahrt + Puffer). Bitte ein anderes Zeitfenster wählen oder eine Schule entfernen.');
      }
    }
  });

  return errors;
}

// ============================================================
// AUTO-SCHEDULER für flexible Schulen
// Weist Tage + Zeiten zu, optimiert Route (nearest-neighbor)
// ============================================================
function tsRpAutoSchedule(flexSchools, fixedDayMap, tripDays, vd, buf, maxD, ac, arrivalDayCode){
  // Verfügbare Wochentage berechnen (Mo-Fr, so viele wie Reisetage)
  // Nur Tage ab Ankunftstag verwenden
  var allDaysAll = ['Mo','Di','Mi','Do','Fr'];
  var startDayIdx = (arrivalDayCode && DO[arrivalDayCode] !== undefined) ? DO[arrivalDayCode] : 0;
  var allDays = allDaysAll.filter(function(d){ return DO[d] >= startDayIdx; });
  if(!allDays.length) allDays = allDaysAll;
  // Bereits belegte Tage durch feste Zeitfenster
  var usedDays = Object.keys(fixedDayMap);
  // Freie Tage = alle Mo-Fr die noch nicht belegt sind, bis tripDays
  var freeDays = [];
  var dayIdx = 0;
  while(freeDays.length + usedDays.length < tripDays && dayIdx < allDays.length){
    var d = allDays[dayIdx];
    if(usedDays.indexOf(d) < 0) freeDays.push(d);
    dayIdx++;
  }
  // Wenn nicht genug freie Tage: auch belegte Tage nutzen (falls maxD > 1)
  if(freeDays.length === 0 && usedDays.length > 0){
    freeDays = usedDays.slice();
  }

  // Nearest-neighbor Routing: starte vom Flughafen, dann immer nächste Schule
  var remaining = flexSchools.slice();
  var ordered = [];
  var prevLat = ac.lat, prevLng = ac.lng;
  while(remaining.length){
    var nearest = remaining.reduce(function(best, s){
      var km = haversineKm(prevLat, prevLng, s.lat, s.lng);
      return (!best || km < best.km) ? {s:s, km:km} : best;
    }, null);
    ordered.push(nearest.s);
    prevLat = nearest.s.lat;
    prevLng = nearest.s.lng;
    remaining = remaining.filter(function(x){return x!==nearest.s;});
  }

  // Schulen auf Tage verteilen: 2 Schulen pro Tag wenn nah genug (<80km), sonst 1
  var assignments = []; // [{day, schools:[...], startMin}]
  var i = 0;
  var daySlot = 0;
  while(i < ordered.length){
    var day = freeDays[daySlot % freeDays.length];
    var schoolsToday = [ordered[i]];
    // Zweite Schule hinzufügen wenn maxD >= 2 und nah genug
    if(maxD >= 2 && i+1 < ordered.length){
      var km = haversineKm(ordered[i].lat, ordered[i].lng, ordered[i+1].lat, ordered[i+1].lng);
      var driveTime = km ? driveMin(km) : 999;
      // Passt alles in 08:00-17:00? Check: 2 Besuche + Fahrt + Puffer
      var totalNeeded = vd + driveTime + buf + vd;
      if(totalNeeded <= 9*60){ // 9 Stunden Fenster
        schoolsToday.push(ordered[i+1]);
        i++;
      }
    }
    // Startzeit berechnen: erste Schule möglichst um 10:00, zweite danach
    var startMin = 10 * 60; // 10:00 Uhr
    assignments.push({day:day, schools:schoolsToday, startMin:startMin});
    i++;
    daySlot++;
  }

  // Slots erstellen
  var result = [];
  assignments.forEach(function(a){
    var t = a.startMin;
    a.schools.forEach(function(s, idx){
      if(idx > 0){
        var km = haversineKm(a.schools[idx-1].lat, a.schools[idx-1].lng, s.lat, s.lng);
        t += vd + driveMin(km) + buf;
      }
      var endMin = t + vd;
      result.push({
        school: s,
        slot: {
          day: a.day,
          start: String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'),
          end: String(Math.floor(endMin/60)).padStart(2,'0')+':'+String(endMin%60).padStart(2,'0'),
          auto: true
        }
      });
    });
  });

  return result;
}

// ============================================================
// PLAN GENERIEREN — synchron + async Nachladen
// ============================================================
window.tsRpGenerate=function(){
  try{
    var family=document.getElementById('ts-familyName').value||'Familie';
    var arrDate=document.getElementById('ts-arrivalDate').value;
    var vd=parseInt(document.getElementById('ts-visitDur').value,10);
    var buf=parseInt(document.getElementById('ts-buffer').value,10);
    var maxD=parseInt(document.getElementById('ts-maxDay').value,10);
    var trans=document.getElementById('ts-transport').value;

    // Ankunftstag berechnen
    var arrivalDayCode=null, arrivalDayOrder=0;
    if(arrDate){
      var dayNames=['So','Mo','Di','Mi','Do','Fr','Sa'];
      var dayJS=new Date(arrDate+'T12:00:00').getDay();
      arrivalDayCode=dayNames[dayJS];
      arrivalDayOrder=DO[arrivalDayCode]!==undefined?DO[arrivalDayCode]:0;
    }

    // Gültige Schulen
    var valid=rpSchools.filter(function(s){
      return s.name&&s.lat&&(s.flexible===true||s.slots.some(function(sl){return sl.day&&sl.start;}));
    });
    if(!valid.length){alert('Bitte mindestens eine Schule auswählen.');return;}

    var ac=AIRPORT_COORDS[rpAirport]||AIRPORT_COORDS.LHR;

    // Feste vs. flexible Schulen
    var fixedSchools=valid.filter(function(s){return !s.flexible;});
    var flexSchools=valid.filter(function(s){return s.flexible===true;});

    var fixedWithSlot=fixedSchools.map(function(s){
      return{school:s,slot:bestSlot(s.slots)};
    }).filter(function(x){return x.slot;});

    var fixedDayMapPreview={};
    fixedWithSlot.forEach(function(item){
      var d=item.slot.day;
      if(!fixedDayMapPreview[d])fixedDayMapPreview[d]=[];
      fixedDayMapPreview[d].push(item);
    });

    var flexWithSlot=flexSchools.length
      ?tsRpAutoSchedule(flexSchools,fixedDayMapPreview,rpTripDays,vd,buf,maxD,ac,arrivalDayCode)
      :[];

    var schoolsWithSlot=fixedWithSlot.concat(flexWithSlot);

    // Ankunftstag-Filter
    var warnings=[];
    if(arrivalDayCode&&DO[arrivalDayCode]!==undefined){
      var tooEarly=schoolsWithSlot.filter(function(x){
        return DO[x.slot.day]!==undefined&&DO[x.slot.day]<DO[arrivalDayCode];
      });
      if(tooEarly.length){
        warnings.push('Schultermine vor Ankunftstag ('+DF[arrivalDayCode]+'): '+
          tooEarly.map(function(x){return safe(x.school.name);}).join(', '));
      }
      schoolsWithSlot=schoolsWithSlot.filter(function(x){
        return DO[x.slot.day]===undefined||DO[x.slot.day]>=DO[arrivalDayCode];
      });
    }

    if(!schoolsWithSlot.length){
      showError(['Keine gültigen Schultermine ab Ankunftstag gefunden. Bitte Zeitfenster prüfen.']);
      return;
    }

    // Machbarkeits-Check (Luftlinie)
    schoolsWithSlot.sort(function(a,b){return(DO[a.slot.day]-DO[b.slot.day])||(t2m(a.slot.start)-t2m(b.slot.start));});
    var dayMap={};
    schoolsWithSlot.forEach(function(item){
      var d=item.slot.day;
      if(!dayMap[d])dayMap[d]=[];
      dayMap[d].push(item);
    });
    var days=Object.keys(dayMap).sort(function(a,b){return DO[a]-DO[b];});

    if(days.length>rpTripDays){
      showError(['Die Schultermine benötigen <strong>'+days.length+' Tage</strong>, aber nur <strong>'+rpTripDays+' Reisetage</strong> geplant.']);
      return;
    }

    var feasErrors=[];
    days.forEach(function(day){
      var items=dayMap[day].slice(0,maxD);
      for(var i=1;i<items.length;i++){
        var prev=items[i-1],curr=items[i];
        var pe=prev.slot.end?t2m(prev.slot.end):t2m(prev.slot.start)+vd;
        var cs=t2m(curr.slot.start);
        var km=haversineKm(prev.school.lat,prev.school.lng,curr.school.lat,curr.school.lng);
        var needed=driveMin(km)+buf;
        if(cs-pe<needed){
          feasErrors.push('<strong>'+DF[day]+':</strong> Zwischen '+safe(prev.school.name)+
            ' und '+safe(curr.school.name)+' fehlen ca. '+(needed-(cs-pe))+' Min.');
        }
      }
    });
    if(feasErrors.length){showError(feasErrors);return;}

    // ---- Plan synchron aufbauen (Luftlinie als Platzhalter) ----
    var plan=[];
    var hotelCache={}; // dayIdx → {lat,lng,city}

    days.forEach(function(day,di){
      var items=dayMap[day].slice(0,maxD);
      var lastItem=items[items.length-1];
      var lastEndMin=lastItem.slot.end?t2m(lastItem.slot.end):t2m(lastItem.slot.start)+vd;
      var isLastDay=(di===days.length-1);
      var nextFirst=di<days.length-1?dayMap[days[di+1]][0].school:null;
      var events=[];

      // Abfahrt
      if(di===0){
        var km0=haversineKm(ac.lat,ac.lng,items[0].school.lat,items[0].school.lng);
        var dm0=driveMin(km0);
        var dep0=t2m(items[0].slot.start)-dm0-30;
        events.push({
          type:'travel',
          time:dep0>0?m2t(dep0):'Morgens früh',
          label:'Abfahrt '+AIRPORTS[rpAirport]+' ('+rpAirport+')',
          sub:(trans==='car'?'Mietwagen':'Zug + Taxi')+(km0?' — ca. '+dm0+' Min. / '+Math.round(km0)+' km':''),
          evId:'dep0',
          updateFrom:{lat:ac.lat,lng:ac.lng},
          updateTo:{lat:items[0].school.lat,lng:items[0].school.lng},
          targetStart:t2m(items[0].slot.start),puffer:30,trans:trans
        });
      } else {
        var prevLast=dayMap[days[di-1]][dayMap[days[di-1]].length-1].school;
        var prevHc=hotelCache['d'+(di-1)]||{lat:prevLast.lat,lng:prevLast.lng,city:prevLast.city||prevLast.name};
        var km1=haversineKm(prevHc.lat,prevHc.lng,items[0].school.lat,items[0].school.lng);
        var dm1=driveMin(km1);
        var dep1=t2m(items[0].slot.start)-dm1-20;
        events.push({
          type:'travel',
          time:dep1>0?m2t(dep1):'Morgens früh',
          label:'Abfahrt Hotel in '+prevHc.city,
          sub:(trans==='car'?'Mietwagen':'Zug + Taxi')+(km1?' — ca. '+dm1+' Min. / '+Math.round(km1)+' km':''),
          evId:'dep'+di,
          updateFrom:{lat:prevHc.lat,lng:prevHc.lng},
          updateTo:{lat:items[0].school.lat,lng:items[0].school.lng},
          targetStart:t2m(items[0].slot.start),puffer:20,trans:trans,
          isHotelDep:true,dayIdx:di
        });
      }

      // Schulbesuche
      items.forEach(function(item,idx){
        var sl=item.slot,s=item.school,sm=t2m(sl.start);
        if(idx>0){
          var pv=items[idx-1];
          var pe=pv.slot.end?t2m(pv.slot.end):t2m(pv.slot.start)+vd;
          var tkm=haversineKm(pv.school.lat,pv.school.lng,s.lat,s.lng);
          var tm=driveMin(tkm);
          events.push({
            type:'travel',time:m2t(pe),
            label:'Fahrt nach '+safe(s.name),
            sub:'ca. '+Math.round(tkm||0)+' km · '+tm+' Min.',
            evId:'between_'+di+'_'+idx,
            updateFrom:{lat:pv.school.lat,lng:pv.school.lng},
            updateTo:{lat:s.lat,lng:s.lng},fixedTime:pe
          });
        }
        events.push({
          type:'visit',time:m2t(sm),label:s.name,
          sub:(s.address||'Schulbesuch')+(sl.end?' — bis '+m2t(t2m(sl.end)):' — ca. '+(vd/60).toFixed(1).replace('.',',')+' Std.'),
          comment:s.comment||''
        });
      });

      // Hotel oder Abflug
      var ci=lastEndMin+30;
      if(isLastDay&&lastEndMin<17*60){
        // Abflug
        var nearest=nearestAirport(lastItem.school.lat,lastItem.school.lng);
        var dmAp=driveMin(nearest.km);
        events.push({
          type:'travel',time:m2t(lastEndMin+30),
          label:'Fahrt zum Flughafen '+AIRPORTS[nearest.code]+' ('+nearest.code+')',
          sub:'ca. '+dmAp+' Min. / '+nearest.km+' km',
          evId:'ap_dep',
          updateFrom:{lat:lastItem.school.lat,lng:lastItem.school.lng},
          updateTo:{lat:AIRPORT_COORDS[nearest.code].lat,lng:AIRPORT_COORDS[nearest.code].lng},
          fixedTime:lastEndMin+30
        });
        events.push({
          type:'departure',time:'',
          label:'Abflug ab '+AIRPORTS[nearest.code]+' ('+nearest.code+')',
          sub:'Direktflüge nach Deutschland:',
          departureAirport:nearest.code
        });
      } else {
        // Hotel: vorläufig bei letzter Schule, async korrigiert via 19-Uhr-Regel
        // Stadt aus Datenbank — Fallback: aus Adresse extrahieren
        var hCity=lastItem.school.city||(function(){
          var addr=lastItem.school.address||'';
          // Adressformat: "Straße, Stadt PLZ, Land" — zweites Komma-Segment
          var parts=addr.split(',');
          if(parts.length>=2){
            // Letztes nicht-UK-Segment nehmen
            for(var pi=parts.length-1;pi>=0;pi--){
              var p=parts[pi].trim();
              if(p&&p!=='Vereinigtes Königreich'&&p!=='United Kingdom'&&!/^[A-Z]{1,2}[0-9]/.test(p)){
                return p;
              }
            }
          }
          return lastItem.school.name;
        })();
        var hLat=lastItem.school.lat,hLng=lastItem.school.lng;
        hotelCache['d'+di]={lat:hLat,lng:hLng,city:hCity};
        var hotelId='ts-hotels-day'+di;
        events.push({
          type:'hotel',time:m2t(ci),
          label:'Hotel Check-in · '+safe(hCity),
          sub:'Hotels werden gesucht ...',
          hotelId:hotelId,hotelLat:hLat,hotelLng:hLng,hotelCity:hCity,
          accommodationPdf:lastItem.school.accommodationPdf||'',
          needsHotelDecision:!isLastDay,
          lastLat:lastItem.school.lat,lastLng:lastItem.school.lng,
          lastCity:tsRpExtractCity(lastItem.school),lastName:lastItem.school.name,
          nextLat:nextFirst?nextFirst.lat:null,
          nextLng:nextFirst?nextFirst.lng:null,
          nextCity:nextFirst?(nextFirst.city||tsRpExtractCity(nextFirst)):null,
          nextName:nextFirst?nextFirst.name:null,
          lastEndMin:lastEndMin,dayIdx:di
        });
      }
      plan.push({day:day,dayNum:di+1,events:events});
    });

    // Rendern + zu Schritt 4
    renderPlan(plan,family,arrDate,valid,trans,warnings);
    tsRpGoStep(4);

    // Async: Fahrtzeiten + Hotel-Entscheidung nachladen
    setTimeout(function(){ updateAsync(plan,trans,hotelCache,days,dayMap); },100);

  }catch(err){
    console.error('[Reiseplaner]',err);
    showError(['Fehler: '+err.message]);
  }
};

function updateAsync(plan,trans,hotelCache,days,dayMap){
  plan.forEach(function(d){
    d.events.forEach(function(ev){

      // Fahrtzeiten updaten
      if(ev.evId&&ev.updateFrom&&ev.updateTo){
        (function(ev){
          getDriveDuration(ev.updateFrom.lat,ev.updateFrom.lng,ev.updateTo.lat,ev.updateTo.lng,function(dMin,dKm){
            var subEl=document.getElementById('ev-sub-'+ev.evId);
            var timeEl=document.getElementById('ev-time-'+ev.evId);
            if(!subEl)return;
            if(ev.fixedTime!==undefined){
              subEl.textContent='ca. '+(dKm?dKm+' km · ':'')+dMin+' Min. Fahrzeit';
            } else {
              var dep=ev.targetStart-dMin-ev.puffer;
              if(timeEl)timeEl.textContent=dep>0?m2t(dep):'Morgens früh';
              subEl.textContent=(ev.trans==='car'?'Mietwagen':'Zug + Taxi')+(dKm?' — ca. '+dMin+' Min. / '+dKm+' km':'');
            }
          });
        })(ev);
      }

      // Hotel 19-Uhr-Entscheidung
      if(ev.type==='hotel'&&ev.needsHotelDecision&&ev.nextLat){
        (function(ev){
          getDriveDuration(ev.lastLat,ev.lastLng,ev.nextLat,ev.nextLng,function(dMin){
            var arrNext=ev.lastEndMin+30+dMin;
            var useNext=(arrNext<=19*60);
            var finalLat=useNext?ev.nextLat:ev.lastLat;
            var finalLng=useNext?ev.nextLng:ev.lastLng;
            // Stadtname bereinigen (kein Schulname)
          var finalCity=useNext?(ev.nextCity||ev.nextName):(ev.lastCity||ev.lastName);
            hotelCache['d'+ev.dayIdx]={lat:finalLat,lng:finalLng,city:finalCity};

            var labelEl=document.getElementById('ev-label-'+ev.hotelId);
            var subEl=document.getElementById('ev-sub-'+ev.hotelId);
            if(labelEl)labelEl.textContent='Hotel Check-in · '+finalCity;
            if(subEl)subEl.textContent='Hotels in '+finalCity+' werden gesucht ...';

            // Abfahrt nächster Tag updaten
            var nextPlan=plan.find(function(p){return p.dayNum===ev.dayIdx+2;});
            if(nextPlan){
              nextPlan.events.forEach(function(nev){
                if(nev.isHotelDep&&nev.dayIdx===ev.dayIdx+1){
                  getDriveDuration(finalLat,finalLng,nev.updateTo.lat,nev.updateTo.lng,function(dm2,dk2){
                    var dep2=nev.targetStart-dm2-20;
                    var tEl=document.getElementById('ev-time-'+nev.evId);
                    var sEl=document.getElementById('ev-sub-'+nev.evId);
                    var lEl=document.getElementById('ev-label-'+nev.evId);
                    if(tEl)tEl.textContent=dep2>0?m2t(dep2):'Morgens früh';
                    if(lEl)lEl.textContent='Abfahrt Hotel in '+finalCity;
                    if(sEl)sEl.textContent=(trans==='car'?'Mietwagen':'Zug + Taxi')+(dk2?' — ca. '+dm2+' Min. / '+dk2+' km':'');
                  });
                }
              });
            }
            // Hotels laden
            var hotelEl=document.getElementById(ev.hotelId);
            if(hotelEl)tsRpLoadHotels(finalLat,finalLng,hotelEl,ev.accommodationPdf||'');
          });
        })(ev);
      } else if(ev.type==='hotel'&&!ev.needsHotelDecision){
        var hotelEl=document.getElementById(ev.hotelId);
        if(hotelEl)tsRpLoadHotels(ev.hotelLat,ev.hotelLng,hotelEl,ev.accommodationPdf||'');
      }
    });
  });
}
function renderPlan(plan,family,arrDate,valid,trans,warnings){
  var html='';
  html+='<div class="ts-rp-plan-header"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">'
    +'<div><div class="ts-label">Reiseplan für</div><div class="ts-name">'+safe(family)+'</div>'
    +'<div class="ts-sub">'+AIRPORTS[rpAirport]+' ('+rpAirport+') · '+rpTripDays+' Reisetage</div></div>'
    +'<div><div class="ts-label">Ankunft</div><div class="ts-date-val">'+(arrDate?new Date(arrDate+'T12:00').toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'}):'—')+'</div></div>'
    +'</div></div>';
  html+='<div class="ts-rp-summary">'
    +'<div class="ts-rp-metric"><div class="ts-rp-ml">Schulen</div><div class="ts-rp-mv">'+valid.length+'</div></div>'
    +'<div class="ts-rp-metric"><div class="ts-rp-ml">Reisetage</div><div class="ts-rp-mv">'+rpTripDays+'</div></div>'
    +'<div class="ts-rp-metric"><div class="ts-rp-ml">Flughafen</div><div class="ts-rp-mv">'+rpAirport+'</div></div>'
    +'<div class="ts-rp-metric"><div class="ts-rp-ml">Transport</div><div class="ts-rp-mv" style="font-size:15px">'+(trans==='car'?'Mietwagen':'Zug')+'</div></div>'
    +'</div>';
  if(warnings&&warnings.length)html+='<div class="ts-rp-warn"><strong>Hinweis:</strong> '+warnings.map(safe).join(' · ')+'</div>';
  plan.forEach(function(d){
    var lbl=DF[d.day]||d.day;
    html+='<div class="ts-rp-day"><div class="ts-rp-day-header"><span class="ts-rp-day-pill">TAG '+d.dayNum+'</span><span class="ts-rp-day-title">'+safe(lbl)+'</span></div><div class="ts-rp-timeline">';
    d.events.forEach(function(ev){
      var bl=ev.type==='visit'?'Besuch':ev.type==='hotel'?'Hotel':ev.type==='departure'?'Abflug':'Fahrt';
      var eid=ev.evId||ev.hotelId||('e'+Math.random().toString(36).slice(2,7));
      html+='<div class="ts-rp-tl"><div class="ts-rp-dot '+ev.type+'"></div>'
        +'<div class="ts-rp-ttime" id="ev-time-'+eid+'">'+safe(ev.time)+'</div>'
        +'<div class="ts-rp-tmain"><span class="ts-rp-tlabel" id="ev-label-'+eid+'">'+safe(ev.label)+'</span><span class="ts-rp-badge '+ev.type+'">'+bl+'</span></div>'
        +(ev.sub?'<div class="ts-rp-tsub" id="ev-sub-'+eid+'">'+safe(ev.sub)+'</div>':'')
        +(ev.comment?'<div class="ts-rp-visit-comment">'+safe(ev.comment)+'</div>':'')
        +(ev.hotelId?'<div class="ts-rp-hotels-wrap" id="'+ev.hotelId+'"><div class="ts-rp-hotel-loading">Hotels werden gesucht ...</div></div>':'')
        +(ev.departureAirport?(function(){
            var fl=FLIGHTS_DE[ev.departureAirport]||[];
            return fl.length?'<div class="ts-rp-flights"><div class="ts-rp-flights-title">Direktflüge nach Deutschland ab '+safe(AIRPORTS[ev.departureAirport])+'</div>'
              +fl.map(function(c){return'<div class="ts-rp-flight-row"><span class="ts-rp-flight-city">'+safe(c)+'</span></div>';}).join('')+'</div>':'';
          })():'')
        +'</div>';
    });
    html+='</div></div>';
  });
  document.getElementById('ts-rp-planOutput').innerHTML=html;
}

function showError(errors){
  document.getElementById('ts-rp-planOutput').innerHTML='<div class="ts-rp-error"><strong>Nicht umsetzbar:</strong><ul>'+errors.map(function(e){return'<li>'+e+'</li>';}).join('')+'</ul><div style="margin-top:8px;font-size:13px;color:#666">Bitte zurück und anpassen.</div></div>';
  tsRpGoStep(4);
}

// ============================================================
// GOOGLE MAPS HOTELS LADEN
// Sucht Hotels mit min. 4.0 Sterne in 12km Umkreis
// ============================================================
function tsRpLoadHotels(lat,lng,container,pdfUrl){
  // Wenn Schule eigene Unterkunftsempfehlung hat → PDF-Button zeigen
  if(pdfUrl&&pdfUrl.trim()){
    container.innerHTML='<div style="padding:4px 0">'
      +'<a href="'+pdfUrl+'" target="_blank" rel="noopener" class="ts-rp-pdf-btn">'
      +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
      +'Unterkunftsempfehlung der Schule (PDF)'
      +'</a>'
      +'</div>';
    return;
  }
  // Kein PDF → Google Maps Hotels
  // Warten bis Google Maps geladen ist (max 10 Sekunden)
  if(!gmapsReady||typeof google==='undefined'||!google.maps||!google.maps.places){
    var attempts = parseInt(container.dataset.attempts||'0',10);
    if(attempts < 20){
      container.dataset.attempts = attempts + 1;
      container.innerHTML='<div class="ts-rp-hotel-loading">Hotels werden geladen ...</div>';
      setTimeout(function(){ tsRpLoadHotels(lat,lng,container); }, 500);
    } else {
      container.innerHTML='<div class="ts-rp-hotel-loading">Hotels konnten nicht geladen werden — bitte Seite neu laden.</div>';
    }
    return;
  }
  var svc=new google.maps.places.PlacesService(document.createElement('div'));
  // Filterbegriffe die keine echten Hotels sind
  var EXCLUDE_KEYWORDS = ['hostel','backpacker','wohnheim','student','youth','jugend','lodge','cabin','cottage','holiday inn express','premier inn','travelodge','ibis budget','motel'];
  function isRealHotel(name){
    var n = (name||'').toLowerCase();
    return !EXCLUDE_KEYWORDS.some(function(kw){ return n.indexOf(kw)>=0; });
  }

  svc.nearbySearch({
    location:new google.maps.LatLng(lat,lng),
    radius:15000,
    type:'lodging',
    keyword:'hotel'
  },function(results,status){
    if(status!==google.maps.places.PlacesServiceStatus.OK||!results||!results.length){
      container.innerHTML='<div class="ts-rp-hotel-loading">Keine Hotels in der Nähe gefunden.</div>';
      return;
    }
    var filtered=results
      .filter(function(h){ return h.rating && h.rating>=4.0 && isRealHotel(h.name); })
      .sort(function(a,b){return b.rating-a.rating;})
      .slice(0,3);
    if(!filtered.length){
      filtered=results
        .filter(function(h){ return isRealHotel(h.name); })
        .sort(function(a,b){return(b.rating||0)-(a.rating||0);})
        .slice(0,3);
    }
    container.innerHTML=filtered.map(function(h){
      var url='https://www.google.com/search?q='+encodeURIComponent(h.name+' '+h.vicinity);
      return '<div class="ts-rp-hotel-item">'
        +'<div><div class="ts-rp-hotel-name"><a href="'+url+'" target="_blank" rel="noopener" style="color:#1a6644;text-decoration:none">'+safe(h.name)+'</a></div>'
        +'<div class="ts-rp-hotel-addr">'+safe(h.vicinity||'')+'</div></div>'
        +'<div class="ts-rp-hotel-rating">&#9733; '+(h.rating?h.rating.toFixed(1):'—')+'</div>'
        +'</div>';
    }).join('');
  });
}

// ============================================================
// LINK TEILEN — Plan-Zustand in URL kodieren / wiederherstellen
// ============================================================
window.tsRpShareLink = function(){
  try{
    var state = {
      f: document.getElementById('ts-familyName').value||'',
      d: document.getElementById('ts-arrivalDate').value||'',
      ap: rpAirport,
      td: rpTripDays,
      vd: document.getElementById('ts-visitDur').value,
      buf: document.getElementById('ts-buffer').value,
      maxD: document.getElementById('ts-maxDay').value,
      trans: document.getElementById('ts-transport').value,
      schools: rpSchools.map(function(s){
        return{
          name: s.name,
          address: s.address,
          lat: s.lat,
          lng: s.lng,
          flexible: s.flexible,
          accommodationPdf: s.accommodationPdf,
          comment: s.comment||'',
          slots: s.slots
        };
      })
    };
    var json = JSON.stringify(state);
    var encoded = btoa(unescape(encodeURIComponent(json)));
    var url = window.location.href.split('?')[0].split('#')[0] + '?plan=' + encoded;
    var box = document.getElementById('ts-rp-share-box');
    var inp = document.getElementById('ts-rp-share-url');
    inp.value = url;
    box.style.display = 'block';
    inp.select();
    inp.setSelectionRange(0, 99999);
    box.scrollIntoView({behavior:'smooth', block:'nearest'});
  }catch(e){
    alert('Fehler beim Erstellen des Links: ' + e.message);
  }
};

window.tsRpCopyLink = function(){
  var inp = document.getElementById('ts-rp-share-url');
  inp.select();
  inp.setSelectionRange(0, 99999);
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(inp.value).then(function(){
        tsRpShowCopyMsg();
      });
    } else {
      document.execCommand('copy');
      tsRpShowCopyMsg();
    }
  }catch(e){
    document.execCommand('copy');
    tsRpShowCopyMsg();
  }
};

function tsRpShowCopyMsg(){
  var msg = document.getElementById('ts-rp-copy-msg');
  msg.style.display = 'block';
  setTimeout(function(){ msg.style.display = 'none'; }, 2500);
}

// Plan aus URL wiederherstellen (beim Seitenaufruf)
function tsRpRestoreFromUrl(){
  try{
    var params = new URLSearchParams(window.location.search);
    var encoded = params.get('plan');
    if(!encoded) return;

    var json = decodeURIComponent(escape(atob(encoded)));
    var state = JSON.parse(json);

    // Felder befüllen
    if(state.f) document.getElementById('ts-familyName').value = state.f;
    if(state.d) document.getElementById('ts-arrivalDate').value = state.d;

    // Reisetage
    if(state.td){
      rpTripDays = state.td;
      document.querySelectorAll('.ts-rp-day-btn').forEach(function(b){
        b.classList.toggle('selected', parseInt(b.dataset.val)===state.td);
      });
    }

    // Flughafen
    if(state.ap){
      rpAirport = state.ap;
      document.querySelectorAll('.ts-rp-ap').forEach(function(b){
        b.classList.toggle('selected', b.dataset.val===state.ap);
      });
    }

    // Einstellungen
    if(state.vd) document.getElementById('ts-visitDur').value = state.vd;
    if(state.buf) document.getElementById('ts-buffer').value = state.buf;
    if(state.maxD) document.getElementById('ts-maxDay').value = state.maxD;
    if(state.trans) document.getElementById('ts-transport').value = state.trans;

    // Schulen wiederherstellen
    if(state.schools && state.schools.length){
      rpSchools = state.schools.map(function(s, i){
        return{
          id: i+1,
          name: s.name||'',
          address: s.address||'',
          lat: s.lat||null,
          lng: s.lng||null,
          flexible: s.flexible||false,
          accommodationPdf: s.accommodationPdf||'',
          comment: s.comment||'',
          slots: s.slots||[{day:'',start:'',end:''}]
        };
      });
      rpSC = rpSchools.length;
    }

    // Plan direkt generieren
    setTimeout(function(){
      if(rpSchools.length && rpTripDays){
        tsRpGenerate();
      }
    }, 800); // Warten bis Maps API geladen ist

  }catch(e){
    console.warn('[Reiseplaner] Link konnte nicht gelesen werden:', e.message);
  }
}

// ============================================================
// PDF EXPORT — jsPDF + html2canvas
// ============================================================
window.tsRpExportPDF = function(){
  var btn = document.querySelector('[onclick="tsRpExportPDF()"]');
  if(btn){ btn.textContent='PDF wird erstellt ...'; btn.disabled=true; }

  // Temporäres Druck-Div erstellen
  var src = document.getElementById('ts-rp-planOutput');
  if(!src){ alert('Bitte zuerst einen Plan erstellen.'); return; }

  var family = document.getElementById('ts-familyName').value || 'Familie';
  var arrDate = document.getElementById('ts-arrivalDate').value;
  var dateStr = arrDate ? new Date(arrDate+'T12:00').toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'}) : '';

  // PDF-Container aufbauen
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;font-family:Arial,sans-serif;padding:0;margin:0';
  wrap.id = 'ts-pdf-wrap';

  var logoHtml = '<img src="data:image/png;base64,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" style="height:40px;object-fit:contain" />';

  wrap.innerHTML = ''
    + '<div style="background:#844332;padding:28px 36px;display:flex;justify-content:space-between;align-items:center">'
    +   '<div>' + logoHtml + '</div>'
    +   '<div style="text-align:right;color:#fff">'
    +     '<div style="font-size:18px;font-weight:800;margin-bottom:3px">Reiseplan ' + escHtml(family) + '</div>'
    +     (dateStr ? '<div style="font-size:13px;opacity:.85">Ankunft: ' + escHtml(dateStr) + '</div>' : '')
    +   '</div>'
    + '</div>'
    + '<div style="padding:28px 36px" id="ts-pdf-body">'
    + src.innerHTML
    + '</div>'
    + '<div style="background:#f7f0ee;padding:14px 36px;display:flex;justify-content:space-between;align-items:center;border-top:3px solid #844332">'
    +   '<span style="font-size:11px;color:#844332;font-weight:600">Töchter & Söhne — Individuelle Internatsberatung</span>'
    +   '<span style="font-size:11px;color:#999">internate.org</span>'
    + '</div>';

  document.body.appendChild(wrap);

  // Buttons + Share-Box im PDF verstecken
  wrap.querySelectorAll('.ts-rp-print-row, #ts-rp-share-box, .ts-rp-hotels-wrap button').forEach(function(el){ el.style.display='none'; });

  setTimeout(function(){
    html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      windowWidth: 794
    }).then(function(canvas){
      document.body.removeChild(wrap);
      var imgData = canvas.toDataURL('image/jpeg', 0.92);
      var pdf = new window.jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      var pageW = 210;
      var pageH = 297;
      var imgW = pageW;
      var imgH = (canvas.height * imgW) / canvas.width;
      var y = 0;
      var pageCount = 0;
      while(y < imgH){
        if(pageCount > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -y, imgW, imgH);
        y += pageH;
        pageCount++;
      }
      var fname = 'Reiseplan_' + (family.replace(/\s+/g,'_') || 'Familie') + '.pdf';
      pdf.save(fname);
      if(btn){ btn.textContent='PDF herunterladen'; btn.disabled=false; }
    }).catch(function(err){
      document.body.removeChild(wrap);
      console.error(err);
      alert('PDF konnte nicht erstellt werden: ' + err.message);
      if(btn){ btn.textContent='PDF herunterladen'; btn.disabled=false; }
    });
  }, 300);
};

function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

window.tsRpReset=function(){
  rpSchools=[];rpSC=0;rpTripDays=0;
  document.getElementById('ts-familyName').value='';
  document.getElementById('ts-arrivalDate').value=new Date().toISOString().split('T')[0];
  document.querySelectorAll('.ts-rp-day-btn').forEach(function(b){b.classList.remove('selected');});
  tsRpGoStep(1);
};

document.addEventListener('DOMContentLoaded',function(){
  var a=document.getElementById('ts-arrivalDate');
  if(a)a.value=new Date().toISOString().split('T')[0];
  rpLoadCmsSchools();
  if(!rpCmsSchools.length)console.warn('[Reiseplaner] Keine .rp-cms-school Elemente gefunden.');
  tsRpRestoreFromUrl();
});

})();
