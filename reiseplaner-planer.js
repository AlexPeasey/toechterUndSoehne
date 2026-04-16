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
    return{cmsId:i+1,name:(el.getAttribute('data-name')||'').trim(),address:(el.getAttribute('data-address')||'').trim(),lat:gps.lat,lng:gps.lng};
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
  rpSchools.push({id:rpSC,name:'',address:'',lat:null,lng:null,flexible:false,slots:[{day:'',start:'',end:''}]});
  tsRpRenderSchools();
};
window.tsRpRemoveSchool=function(id){rpSchools=rpSchools.filter(function(s){return s.id!==id;});tsRpRenderSchools();};
window.tsRpAddSlot=function(id){var s=rpSchools.find(function(s){return s.id===id;});if(s){s.slots.push({day:'',start:'',end:''});tsRpRenderSchools();}};
window.tsRpRemoveSlot=function(id,idx){var s=rpSchools.find(function(s){return s.id===id;});if(s&&s.slots.length>1){s.slots.splice(idx,1);tsRpRenderSchools();}};
window.tsRpUpdSlot=function(id,idx,f,v){var s=rpSchools.find(function(s){return s.id===id;});if(s&&s.slots[idx])s.slots[idx][f]=v;};

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
      +(isFlex?'<div class="ts-rp-help" style="margin-top:4px">System wählt optimale Zeit und Reihenfolge automatisch.</div>':'');
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
function tsRpAutoSchedule(flexSchools, fixedDayMap, tripDays, vd, buf, maxD, ac){
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
// PLAN GENERIEREN
// ============================================================
window.tsRpGenerate=function(){
  var family=document.getElementById('ts-familyName').value||'Familie';
  var arrDate=document.getElementById('ts-arrivalDate').value;
  var vd=parseInt(document.getElementById('ts-visitDur').value,10);
  var buf=parseInt(document.getElementById('ts-buffer').value,10);
  var maxD=parseInt(document.getElementById('ts-maxDay').value,10);
  var trans=document.getElementById('ts-transport').value;

  // Ankunftstag berechnen — Reise startet ab diesem Wochentag
  var arrivalDayCode = null; // z.B. 'Do'
  var arrivalDayOrder = 0;
  if(arrDate){
    var dayNames = ['So','Mo','Di','Mi','Do','Fr','Sa'];
    var dayJS = new Date(arrDate+'T12:00:00').getDay(); // 0=So, 1=Mo...
    arrivalDayCode = dayNames[dayJS];
    arrivalDayOrder = DO[arrivalDayCode] !== undefined ? DO[arrivalDayCode] : 0;
  }

  var valid=rpSchools.filter(function(s){return s.name&&s.lat&&(s.flexible===true||s.slots.some(function(sl){return sl.day&&sl.start;}));});
  if(!valid.length){alert('Bitte mindestens eine Schule mit Termin auswählen.');return;}

  var ac=AIRPORT_COORDS[rpAirport]||AIRPORT_COORDS.LHR;

  // Schulen aufteilen: feste Zeitfenster vs. flexibel
  var fixedSchools = valid.filter(function(s){ return !s.flexible; });
  var flexSchools  = valid.filter(function(s){ return s.flexible===true; });

  // Feste Schulen: optimales Zeitfenster wählen
  var fixedWithSlot = fixedSchools.map(function(s){
    return{school:s, slot:bestSlot(s.slots)};
  }).filter(function(x){return x.slot;});

  // Feste dayMap für Auto-Scheduler (damit er freie Tage kennt)
  var fixedDayMapPreview={};
  fixedWithSlot.forEach(function(item){
    var d=item.slot.day;
    if(!fixedDayMapPreview[d])fixedDayMapPreview[d]=[];
    fixedDayMapPreview[d].push(item);
  });

  // Flexible Schulen: automatisch Tage + Zeiten zuweisen
  var flexWithSlot = flexSchools.length
    ? tsRpAutoSchedule(flexSchools, fixedDayMapPreview, rpTripDays, vd, buf, maxD, ac)
    : [];

  // Alle Schulen zusammenführen
  var schoolsWithSlot = fixedWithSlot.concat(flexWithSlot);

  // Machbarkeits-Check
  var errors=feasibilityCheck(schoolsWithSlot,rpTripDays,maxD,vd,buf,ac,trans);
  if(errors.length){
    var html='<div class="ts-rp-error">'
      +'<strong>Der Reiseplan ist so nicht umsetzbar:</strong>'
      +'<ul>'+errors.map(function(e){return'<li>'+e+'</li>';}).join('')+'</ul>'
      +'<div style="margin-top:10px;font-size:13px;color:#666">Bitte gehen Sie zurück und entfernen Sie eine Schule, wählen Sie ein anderes Zeitfenster oder erhöhen Sie die Anzahl der Reisetage.</div>'
      +'</div>';
    document.getElementById('ts-rp-planOutput').innerHTML=html;
    tsRpGoStep(4);
    return;
  }

  var warnings=[];

  // Tage vor dem Ankunftstag entfernen (Reise startet ab Ankunftstag)
  if(arrivalDayCode && DO[arrivalDayCode] !== undefined){
    var tooEarly = schoolsWithSlot.filter(function(x){
      return DO[x.slot.day] !== undefined && DO[x.slot.day] < DO[arrivalDayCode];
    });
    if(tooEarly.length){
      var earlyNames = tooEarly.map(function(x){return safe(x.school.name)+' ('+DF[x.slot.day]+')';}).join(', ');
      warnings.push('Folgende Schultermine liegen vor dem Ankunftstag ('+DF[arrivalDayCode]+'): '+earlyNames+'. Bitte andere Zeitfenster wählen.');
    }
    schoolsWithSlot = schoolsWithSlot.filter(function(x){
      return DO[x.slot.day] === undefined || DO[x.slot.day] >= DO[arrivalDayCode];
    });
  }

  // Nach Tag + Zeit sortieren
  schoolsWithSlot.sort(function(a,b){return(DO[a.slot.day]-DO[b.slot.day])||(t2m(a.slot.start)-t2m(b.slot.start));});

  var dayMap={};
  schoolsWithSlot.forEach(function(item){
    var d=item.slot.day;
    if(!dayMap[d])dayMap[d]=[];
    dayMap[d].push(item);
  });

  var days=Object.keys(dayMap).sort(function(a,b){return DO[a]-DO[b];});
  var plan=[];

  // ============================================================
  // HOTEL-STADT ENTSCHEIDUNG (19-Uhr-Regel)
  // Prüft per Directions API: wenn Ankunft bei nächster Schule <= 19:00 Uhr
  // → Hotel bei letzter Schule. Sonst → Hotel bei nächster Schule.
  // Ergebnis asynchron via callback({lat, lng, city, reason})
  // ============================================================
  function hotelCityAsync(lastSchool, nextSchool, lastEndMin, callback){
    // Kein nächster Tag → Hotel bei letzter Schule
    if(!nextSchool){
      callback({lat:lastSchool.lat, lng:lastSchool.lng, city:lastSchool.city||lastSchool.name, reason:'Letzter Tag'});
      return;
    }
    // Abfahrt von letzter Schule = Ende + 30 Min
    var departureMin = lastEndMin + 30;
    getRoadDuration(lastSchool.lat, lastSchool.lng, nextSchool.lat, nextSchool.lng, function(durationMin, distKm){
      var arrivalAtNextMin = departureMin + durationMin;
      // Regel: Ankunft bei nächster Schule <= 19:00 Uhr (1140 Min) → Hotel bei letzter Schule
      if(arrivalAtNextMin <= 19 * 60){
        // Ankunft bei nächster Schule vor 19:00 → Hotel bei nächster Schule (morgen kurze Fahrt)
        callback({
          lat: nextSchool.lat,
          lng: nextSchool.lng,
          city: nextSchool.city || nextSchool.name,
          reason: 'Ankunft bei ' + (nextSchool.city||nextSchool.name) + ' um ' + m2t(arrivalAtNextMin) + ' — noch möglich → Hotel bei nächster Schule',
          driveToNextMin: durationMin,
          driveToNextKm: distKm
        });
      } else {
        // Ankunft nach 19:00 → zu spät, Hotel bei letzter Schule bleiben
        callback({
          lat: lastSchool.lat,
          lng: lastSchool.lng,
          city: lastSchool.city || lastSchool.name,
          reason: 'Ankunft bei ' + (nextSchool.city||nextSchool.name) + ' wäre ' + m2t(arrivalAtNextMin) + ' (nach 19:00) → Hotel bei letzter Schule',
          driveToNextMin: durationMin,
          driveToNextKm: distKm
        });
      }
    });
  }

  // Zeige Ladeindikator während API-Anfragen laufen
  document.getElementById('ts-rp-planOutput').innerHTML='<div style="text-align:center;padding:2rem;color:#844332;font-size:14px">Fahrtzeiten werden berechnet ...</div>';

  // Async Plan-Builder: verarbeitet Tage sequenziell wegen API-Limits
  var pendingDays = days.slice();
  var hotelCityCache = {}; // Cache: "lat,lng->lat,lng" => {city, lat, lng}

  function buildNextDay(){
    if(!pendingDays.length){
      renderPlan();
      return;
    }
    var day = pendingDays.shift();
    var di = days.indexOf(day);
    var items = dayMap[day].slice(0,maxD);
    var nextDayFirst = di<days.length-1 ? dayMap[days[di+1]][0].school : null;
    var lastItem = items[items.length-1];
    var lastEndMin = lastItem.slot.end ? t2m(lastItem.slot.end) : t2m(lastItem.slot.start)+vd;
    var isLastDay = (di === days.length-1);

    // Schritt 1: Fahrtzeiten für diesen Tag berechnen
    var travelTasks = [];

    // Abfahrt vom Hotel/Flughafen zur ersten Schule
    if(di === 0){
      travelTasks.push({from:{lat:ac.lat,lng:ac.lng}, to:items[0].school, type:'first', puffer:30});
    } else {
      var prevLastSchool = dayMap[days[di-1]][dayMap[days[di-1]].length-1].school;
      var prevHc = hotelCityCache['day'+(di-1)] || {lat:prevLastSchool.lat, lng:prevLastSchool.lng, city:prevLastSchool.city||prevLastSchool.name};
      travelTasks.push({from:{lat:prevHc.lat,lng:prevHc.lng,city:prevHc.city}, to:items[0].school, type:'hotel_to_first', puffer:20});
    }

    // Fahrten zwischen Schulen
    for(var ix=1;ix<items.length;ix++){
      travelTasks.push({from:items[ix-1].school, to:items[ix].school, type:'between', idx:ix});
    }

    // Alle Fahrtzeiten parallel abrufen
    var results = new Array(travelTasks.length);
    var done = 0;
    travelTasks.forEach(function(task, ti){
      getRoadDuration(task.from.lat, task.from.lng, task.to.lat, task.to.lng, function(dMin, dKm){
        results[ti] = {dMin:dMin, dKm:dKm, task:task};
        done++;
        if(done === travelTasks.length) continueDay();
      });
    });

    function continueDay(){
      var events = [];

      // Ankunft-Event aufbauen
      var r0 = results[0];
      if(di === 0){
        var dep = t2m(items[0].slot.start) - r0.dMin - 30;
        events.push({type:'travel', time:dep>0?m2t(dep):'Morgens früh',
          label:'Abfahrt '+AIRPORTS[rpAirport]+' ('+rpAirport+')',
          sub:(trans==='car'?'Mietwagen':'Zug + Taxi')+(r0.dKm?' — ca. '+r0.dMin+' Min. / '+r0.dKm+' km':'')});
      } else {
        var prevHc2 = hotelCityCache['day'+(di-1)];
        var dep2 = t2m(items[0].slot.start) - r0.dMin - 20;
        events.push({type:'travel', time:dep2>0?m2t(dep2):'Morgens früh',
          label:'Abfahrt Hotel in '+(prevHc2?prevHc2.city:'Hotel'),
          sub:(trans==='car'?'Mietwagen':'Zug + Taxi')+(r0.dKm?' — ca. '+r0.dMin+' Min. / '+r0.dKm+' km bis '+items[0].school.name:'')});
      }

      // Schulbesuche
      items.forEach(function(item, idx){
        var sl=item.slot, s=item.school, sm=t2m(sl.start);
        if(idx > 0){
          var ri = results[idx]; // results[0] = Ankunft, results[1..] = zwischen Schulen
          var pe = items[idx-1].slot.end ? t2m(items[idx-1].slot.end) : t2m(items[idx-1].slot.start)+vd;
          events.push({type:'travel', time:m2t(pe),
            label:'Fahrt nach '+s.name,
            sub:ri?(ri.dKm?'ca. '+ri.dKm+' km · '+ri.dMin+' Min. Fahrzeit':'Fahrtzeit berechnet'):'Fahrtzeit wird ermittelt'});
        }
        events.push({type:'visit', time:m2t(sm), label:s.name,
          sub:(s.address||'Schulbesuch')+(sl.end?' — bis '+m2t(t2m(sl.end)):'  — ca. '+(vd/60).toFixed(1).replace('.',',')+' Std.')});
      });

      // Hotel-Entscheidung oder Abflug
      var ci = lastEndMin + 30;

      if(isLastDay && lastEndMin < 17*60){
        // Letzter Tag, vor 17 Uhr → Abflughafen per Directions API
        var nearest = nearestAirport(lastItem.school.lat, lastItem.school.lng);
        getRoadDuration(lastItem.school.lat, lastItem.school.lng, AIRPORT_COORDS[nearest.code].lat, AIRPORT_COORDS[nearest.code].lng, function(apMin, apKm){
          events.push({type:'travel', time:m2t(lastEndMin+30),
            label:'Fahrt zum Flughafen '+AIRPORTS[nearest.code]+' ('+nearest.code+')',
            sub:'ca. '+apMin+' Min. / '+(apKm||nearest.km)+' km'});
          events.push({type:'departure', time:'',
            label:'Abflug ab '+AIRPORTS[nearest.code]+' ('+nearest.code+')',
            sub:'Direktflüge nach Deutschland:', departureAirport:nearest.code});
          plan.push({day:day, dayNum:di+1, events:events});
          buildNextDay();
        });
      } else if(!isLastDay){
        // Nicht letzter Tag → Hotel per 19-Uhr-Regel bestimmen
        hotelCityAsync(lastItem.school, nextDayFirst, lastEndMin, function(hc){
          hotelCityCache['day'+di] = hc;
          // Fahrt zum Hotel wenn nötig
          if(hc.lat !== lastItem.school.lat || hc.lng !== lastItem.school.lng){
            getRoadDuration(lastItem.school.lat, lastItem.school.lng, hc.lat, hc.lng, function(htMin, htKm){
              if(htKm && htKm > 3){
                events.push({type:'travel', time:m2t(ci),
                  label:'Fahrt nach '+hc.city,
                  sub:'ca. '+htMin+' Min. / '+htKm+' km'});
                ci = ci + htMin;
              }
              pushHotelEvent(hc, ci, di, events);
              plan.push({day:day, dayNum:di+1, events:events});
              buildNextDay();
            });
          } else {
            pushHotelEvent(hc, ci, di, events);
            plan.push({day:day, dayNum:di+1, events:events});
            buildNextDay();
          }
        });
      } else {
        // Letzter Tag, nach 17 Uhr → Hotel
        hotelCityAsync(lastItem.school, null, lastEndMin, function(hc){
          hotelCityCache['day'+di] = hc;
          pushHotelEvent(hc, ci, di, events);
          plan.push({day:day, dayNum:di+1, events:events});
          buildNextDay();
        });
      }
    }
  }

  function pushHotelEvent(hc, ci, di, events){
    var hotelId = 'ts-hotels-day'+di;
    events.push({type:'hotel', time:m2t(ci),
      label:'Hotel Check-in · '+hc.city,
      sub:'Hotels in '+hc.city+' werden gesucht ...'+(hc.reason?' · '+hc.reason:''),
      hotelId:hotelId, hotelLat:hc.lat, hotelLng:hc.lng, hotelCity:hc.city});
  }

  buildNextDay();
  tsRpGoStep(4);

  // Kein Abreisetag — Familie entscheidet selbst wann sie abreist

  function renderPlan(){
    var html='';
    html+='<div class="ts-rp-plan-header"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">'
      +'<div><div class="ts-label">Reiseplan für</div><div class="ts-name">'+safe(family)+'</div><div class="ts-sub">'+AIRPORTS[rpAirport]+' ('+rpAirport+') · '+rpTripDays+' Reisetage</div></div>'
      +'<div><div class="ts-label">Ankunft</div><div class="ts-date-val">'+(arrDate?new Date(arrDate+'T12:00').toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'}):'—')+'</div></div>'
      +'</div></div>';
    html+='<div class="ts-rp-summary">'
      +'<div class="ts-rp-metric"><div class="ts-rp-ml">Schulen</div><div class="ts-rp-mv">'+valid.length+'</div></div>'
      +'<div class="ts-rp-metric"><div class="ts-rp-ml">Reisetage</div><div class="ts-rp-mv">'+rpTripDays+'</div></div>'
      +'<div class="ts-rp-metric"><div class="ts-rp-ml">Flughafen</div><div class="ts-rp-mv">'+rpAirport+'</div></div>'
      +'<div class="ts-rp-metric"><div class="ts-rp-ml">Transport</div><div class="ts-rp-mv" style="font-size:15px">'+(trans==='car'?'Mietwagen':'Zug')+'</div></div>'
      +'</div>';
    if(warnings.length)html+='<div class="ts-rp-warn"><strong>Hinweis:</strong> '+warnings.map(safe).join(' &nbsp;&middot;&nbsp; ')+'</div>';
    plan.forEach(function(d){
      var lbl=DF[d.day]||d.day;
      html+='<div class="ts-rp-day"><div class="ts-rp-day-header"><span class="ts-rp-day-pill">TAG '+d.dayNum+'</span><span class="ts-rp-day-title">'+safe(lbl)+'</span></div><div class="ts-rp-timeline">';
      d.events.forEach(function(ev){
        var bl=ev.type==='visit'?'Besuch':ev.type==='hotel'?'Hotel':ev.type==='departure'?'Abflug':'Fahrt';
        html+='<div class="ts-rp-tl"><div class="ts-rp-dot '+ev.type+'"></div>'
          +'<div class="ts-rp-ttime">'+safe(ev.time)+'</div>'
          +'<div class="ts-rp-tmain"><span class="ts-rp-tlabel">'+safe(ev.label)+'</span><span class="ts-rp-badge '+ev.type+'">'+bl+'</span></div>'
          +(ev.sub?'<div class="ts-rp-tsub">'+safe(ev.sub)+'</div>':'')
          +(ev.hotelId?'<div class="ts-rp-hotels-wrap" id="'+ev.hotelId+'"><div class="ts-rp-hotel-loading">Hotels in '+safe(ev.hotelCity||'der Nähe')+' werden gesucht ...</div></div>':'')
          +(ev.departureAirport?(function(){
              var flights=FLIGHTS_DE[ev.departureAirport]||[];
              if(!flights.length)return '';
              return '<div class="ts-rp-flights"><div class="ts-rp-flights-title">Direktflüge nach Deutschland ab '+safe(AIRPORTS[ev.departureAirport])+'</div>'
                +flights.map(function(city){return '<div class="ts-rp-flight-row"><span class="ts-rp-flight-city">'+safe(city)+'</span></div>';}).join('')
                +'</div>';
            })():'')
          +'</div>';
      });
      html+='</div></div>';
    });
    document.getElementById('ts-rp-planOutput').innerHTML=html;
    tsRpGoStep(4);
    setTimeout(function(){
      plan.forEach(function(d){
        d.events.forEach(function(ev){
          if(ev.hotelId){var el=document.getElementById(ev.hotelId);if(el)tsRpLoadHotels(ev.hotelLat,ev.hotelLng,el);}
        });
      });
    },400);
  }
};

// ============================================================
// GOOGLE MAPS HOTELS LADEN
// Sucht Hotels mit min. 4.0 Sterne in 12km Umkreis
// ============================================================
function tsRpLoadHotels(lat,lng,container){
  if(!gmapsReady||typeof google==='undefined'||!google.maps){
    container.innerHTML='<div class="ts-rp-hotel-loading">Google Maps nicht geladen — API Key prüfen.</div>';
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
