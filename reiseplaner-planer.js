// Globaler Maps-Callback — muss VOR dem IIFE definiert sein
window.tsRpMapsLoaded = function(){
  if(window._tsRpSetMapsReady) window._tsRpSetMapsReady();
  else window._tsRpMapsPending = true;
};

(function(){

var GMAPS_KEY = 'AIzaSyBOeLeI6YQSrJeys0i6HwGaVa-mQmwsd0Y';
var gmapsReady = false;
// Interne Maps-Ready Funktion registrieren
window._tsRpSetMapsReady = function(){ gmapsReady = true; };
if(window._tsRpMapsPending){ gmapsReady = true; }

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
  // Freie Tage = alle Mo-Fr die noch nicht belegt sind
  // Wir nehmen ALLE verfügbaren Tage (nicht auf tripDays begrenzen)
  var freeDays = allDays.filter(function(d){ return usedDays.indexOf(d) < 0; });
  // Wenn nicht genug freie Tage: auch belegte Tage nutzen (falls maxD > 1)
  if(freeDays.length === 0 && usedDays.length > 0){
    freeDays = allDays.slice();
  }
  // Fallback
  if(freeDays.length === 0) freeDays = allDays.slice();

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
          getDriveDuration(ev.lastLat,ev.lastLng,ev.nextLat,ev.nextLng,function(dMin,dKm){
            var arrNext=ev.lastEndMin+30+dMin;
            var useNext=(arrNext<=19*60);
            var finalLat=useNext?ev.nextLat:ev.lastLat;
            var finalLng=useNext?ev.nextLng:ev.lastLng;
            var finalCity=useNext?(ev.nextCity||ev.nextName):(ev.lastCity||ev.lastName);
            hotelCache['d'+ev.dayIdx]={lat:finalLat,lng:finalLng,city:finalCity};

            // Hotel-Label updaten
            var labelEl=document.getElementById('ev-label-'+ev.hotelId);
            var subEl=document.getElementById('ev-sub-'+ev.hotelId);
            var timeEl=document.getElementById('ev-time-'+ev.hotelId);
            if(labelEl)labelEl.textContent='Hotel Check-in · '+finalCity;
            if(subEl)subEl.textContent='Hotels in '+finalCity+' werden gesucht ...';

            // Wenn Hotel bei NÄCHSTER Schule → Fahrt-Event VOR Hotel einfügen
            if(useNext && dMin > 0){
              var hotelParent=document.getElementById(ev.hotelId);
              var hotelTl=hotelParent?hotelParent.closest('.ts-rp-tl'):null;
              if(hotelTl){
                var depMin=ev.lastEndMin+30;
                var arrMin=depMin+dMin;
                // Fahrt-Div vor dem Hotel-Div einfügen
                var fahrtDiv=document.createElement('div');
                fahrtDiv.className='ts-rp-tl';
                fahrtDiv.innerHTML=''
                  +'<div class="ts-rp-dot travel"></div>'
                  +'<div class="ts-rp-ttime">'+m2t(depMin)+'</div>'
                  +'<div class="ts-rp-tmain"><span class="ts-rp-tlabel">Fahrt nach '+safe(finalCity)+'</span>'
                  +'<span class="ts-rp-badge travel">Fahrt</span></div>'
                  +'<div class="ts-rp-tsub">ca. '+dMin+' Min.'+(dKm?' / '+dKm+' km':'')+(trans==='car'?' · Mietwagen':' · Zug + Taxi')+'</div>';
                hotelTl.parentNode.insertBefore(fahrtDiv,hotelTl);
                // Hotel-Check-in Zeit = Ankunft
                if(timeEl)timeEl.textContent=m2t(arrMin);
              }
            }

            // Abfahrt nächster Tag updaten (kurze Fahrt vom Hotel)
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
    +'<div><div class="ts-label">Reiseplan für Familie</div><div class="ts-name">'+safe(family)+'</div>'
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
  window._tsRpLastPlan = plan;
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

  var logoHtml = '<img src="data:image/png;base64,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" style="height:44px;object-fit:contain" />';

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
      var fname = 'Reiseplan_Familie_' + (family.replace(/\s+/g,'_') || 'Familie') + '.pdf';
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

// ============================================================
// KALENDER EXPORT — ICS Datei für alle Schulbesuche
// ============================================================
window.tsRpExportCalendar = function(){
  var arrDate = document.getElementById('ts-arrivalDate').value;
  var family = document.getElementById('ts-familyName').value || 'Familie';

  // Plan-Events sammeln aus dem aktuellen Plan
  if(!window._tsRpLastPlan || !window._tsRpLastPlan.length){
    alert('Bitte zuerst einen Reiseplan erstellen.');
    return;
  }

  var dayNames = {Mo:1,Di:2,Mi:3,Do:4,Fr:5};
  var arrDt = arrDate ? new Date(arrDate+'T00:00:00') : new Date();
  var arrDow = arrDt.getDay(); // 0=So, 1=Mo...
  var dowMap = {Mo:1,Di:2,Mi:3,Do:4,Fr:5};

  function getDateForDay(dayCode, arrDt){
    var target = dowMap[dayCode];
    if(target === undefined) return null;
    var current = arrDt.getDay() || 7; // 7=So statt 0
    var arrMon = arrDt.getDay() === 0 ? 7 : arrDt.getDay();
    var diff = target - arrMon;
    if(diff < 0) diff += 7;
    var d = new Date(arrDt);
    d.setDate(d.getDate() + diff);
    return d;
  }

  function toICSDate(date, timeStr){
    // timeStr: "10:00 Uhr" oder "10:00"
    var t = timeStr ? timeStr.replace(' Uhr','').trim() : '09:00';
    var parts = t.split(':');
    var h = String(parts[0]||'9').padStart(2,'0');
    var m = String(parts[1]||'0').padStart(2,'0');
    var y = date.getFullYear();
    var mo = String(date.getMonth()+1).padStart(2,'0');
    var da = String(date.getDate()).padStart(2,'0');
    return y+''+mo+''+da+'T'+h+''+m+'00';
  }

  function toICSDateEnd(date, timeStr, durMin){
    var t = timeStr ? timeStr.replace(' Uhr','').trim() : '09:00';
    var parts = t.split(':');
    var totalMin = parseInt(parts[0]||'9')*60 + parseInt(parts[1]||'0') + (durMin||150);
    var h = String(Math.floor(totalMin/60)).padStart(2,'0');
    var m = String(totalMin%60).padStart(2,'0');
    var y = date.getFullYear();
    var mo = String(date.getMonth()+1).padStart(2,'0');
    var da = String(date.getDate()).padStart(2,'0');
    return y+''+mo+''+da+'T'+h+''+m+'00';
  }

  var icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Töchter & Söhne//Reiseplaner//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Reiseplan Familie '+family,
  ];

  var uid = 1;
  window._tsRpLastPlan.forEach(function(d){
    var date = getDateForDay(d.day, arrDt);
    if(!date) return;
    d.events.forEach(function(ev){
      if(ev.type !== 'visit') return;
      // Uhrzeit aus ev.time extrahieren
      var startTime = ev.time || '10:00 Uhr';
      var summary = ev.label + ' — Schulbesuch Familie ' + family;
      var desc = (ev.sub||'').replace(/,/g,'\,');
      if(ev.comment) desc += ' | Kommentar: ' + ev.comment.replace(/,/g,'\,');
      icsLines = icsLines.concat([
        'BEGIN:VEVENT',
        'UID:tsrp-'+(uid++)+'@internate.org',
        'DTSTAMP:'+toICSDate(new Date(),'00:00'),
        'DTSTART:'+toICSDate(date, startTime),
        'DTEND:'+toICSDateEnd(date, startTime, 150),
        'SUMMARY:'+summary,
        'DESCRIPTION:'+desc,
        'LOCATION:'+(ev.sub||'').split('—')[0].trim(),
        'END:VEVENT'
      ]);
    });
  });

  icsLines.push('END:VCALENDAR');
  var icsContent = icsLines.join('\r\n');
  var blob = new Blob([icsContent], {type:'text/calendar;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'Reiseplan_Familie_' + family.replace(/\s+/g,'_') + '.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

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

// Echte Funktionen registrieren nachdem JS geladen ist
window._tsRpSelectDays = window.tsRpSelectDays;
window._tsRpSelectAirport = window.tsRpSelectAirport;
window._tsRpGoStep = window.tsRpGoStep;
window._tsRpAddSchool = window.tsRpAddSchool;
window._tsRpRemoveSchool = window.tsRpRemoveSchool;
window._tsRpGenerate = window.tsRpGenerate;
window._tsRpReset = window.tsRpReset;
window._tsRpShareLink = window.tsRpShareLink;
window._tsRpExportPDF = window.tsRpExportPDF;
window._tsRpExportCalendar = window.tsRpExportCalendar;
window._tsRpMapsLoaded = function(){ gmapsReady=true; };
if(window._tsRpMapsLoadedPending){ gmapsReady=true; }
window._tsRpReady = true;

})();
