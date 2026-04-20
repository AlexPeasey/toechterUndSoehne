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

  var src = document.getElementById('ts-rp-planOutput');
  if(!src){ alert('Bitte zuerst einen Plan erstellen.'); return; }

  var family = document.getElementById('ts-familyName').value || 'Familie';
  var arrDate = document.getElementById('ts-arrivalDate').value;
  var dateStr = arrDate ? new Date(arrDate+'T12:00').toLocaleDateString('de-DE',{day:'2-digit',month:'long',year:'numeric'}) : '';

  // PDF Container
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;background:#fff;font-family:Arial,sans-serif;padding:0;margin:0;box-sizing:border-box';
  wrap.id = 'ts-pdf-wrap';

  // Logo als inline SVG (funktioniert zuverlässig in html2canvas)
  var logoSvg = ''; // nicht verwendet

  // Kopfzeile
  var header = document.createElement('div');
  header.style.cssText = 'background:#844332;padding:24px 36px;display:flex;justify-content:space-between;align-items:center;box-sizing:border-box;width:100%';
  header.innerHTML = '<img src="data:image/svg+xml,%3Csvg%20width%3D%22280%22%20height%3D%2244%22%20viewBox%3D%220%200%20697%2055%22%20version%3D%221.1%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20xmlns%3Axlink%3D%22http%3A//www.w3.org/1999/xlink%22%3E%0A%20%20%20%20%3Ctitle%3ET%C3%B6chter%20%26amp%3B%20S%C3%B6hne%20-%20Logo%20Weiss%3C/title%3E%0A%20%20%20%20%3Cg%20id%3D%22T%C3%B6chter-%26amp%3B-S%C3%B6hne---Logo-Weiss%22%20stroke%3D%22none%22%20stroke-width%3D%22280%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%0A%20%20%20%20%20%20%20%20%3Cg%20id%3D%22Group-Copy%22%20transform%3D%22translate%28-0.000512%2C%200.000000%29%22%20fill%3D%22%23FFFFFF%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M23.6658917%2C44.098688%20C23.6658917%2C50.9885953%2023.7970104%2C51.9730142%2027.5994512%2C52.3011539%20L29.6973495%2C52.4980377%20C30.0896811%2C52.7605494%2029.9595868%2C53.9418522%2029.5662309%2C54.138736%20C25.828325%2C54.0074801%2023.6003324%2C53.9418522%2020.9779594%2C53.9418522%20C18.3555864%2C53.9418522%2016.0610101%2C54.0074801%2011.8652133%2C54.138736%20C11.4728818%2C53.9418522%2011.3417631%2C52.8261773%2011.8652133%2C52.4980377%20L14.225349%2C52.3011539%20C17.9632549%2C51.9730142%2018.2900271%2C50.9885953%2018.2900271%2C44.098688%20L18.2900271%2C14.7650539%20C18.2900271%2C12.730588%2018.2900271%2C12.6649601%2016.3232474%2C12.6649601%20L12.7174845%2C12.6649601%20C9.89945797%2C12.6649601%206.29369513%2C12.796216%204.65471202%2C14.3046329%20C3.08128824%2C15.7494728%202.42671936%2C17.1932873%201.7055668%2C18.8329601%20C1.1810922%2C19.2267277%200.262237297%2C18.8996135%200%2C18.3735646%20C1.04894919%2C15.4203077%202.03233905%2C11.2201202%202.49125432%2C8.59602839%20C2.6879323%2C8.46477253%203.54122788%2C8.40017004%203.73688148%2C8.59602839%20C4.13023743%2C10.6961222%206.29369513%2C10.6304942%209.30839969%2C10.6304942%20L35.8589017%2C10.6304942%20C39.3980808%2C10.6304942%2039.9891391%2C10.4992384%2040.972529%2C8.79291218%20C41.3003256%2C8.66165632%2042.0204538%2C8.72728425%2042.1525968%2C8.98979598%20C41.4314442%2C11.6805411%2040.972529%2C16.9953781%2041.1692069%2C18.964216%20C40.9059453%2C19.4892394%2039.7914368%2C19.4892394%2039.4646645%2C19.0954719%20C39.2669622%2C17.455799%2038.8080469%2C15.0265402%2037.824657%2C14.3046329%20C36.3178169%2C13.1889581%2033.8265626%2C12.6649601%2030.2207998%2C12.6649601%20L25.5660877%2C12.6649601%20C23.6003324%2C12.6649601%2023.6658917%2C12.730588%2023.6658917%2C14.8952843%20L23.6658917%2C44.098688%20Z%22%20id%3D%22Fill-1%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M74.131923%2C3.67413868%20C74.131923%2C1.77195413%2075.5086688%2C0%2077.5410079%2C0%20C79.5733469%2C0%2080.6868311%2C1.83655662%2080.6868311%2C3.54288282%20C80.6868311%2C5.44711824%2079.5733469%2C7.02116314%2077.5410079%2C7.02116314%20C75.5742281%2C7.02116314%2074.1974823%2C5.90548832%2074.131923%2C3.67413868%20M61.8077944%2C3.67413868%20C61.6111164%2C1.77195413%2062.9878622%2C0%2065.0191769%2C0%20C67.0525403%2C0%2068.3627025%2C1.83655662%2068.3627025%2C3.54288282%20C68.3627025%2C5.44711824%2067.0525403%2C7.02116314%2065.0191769%2C7.02116314%20C62.9878622%2C7.02116314%2061.8077944%2C5.90548832%2061.8077944%2C3.67413868%20M87.5705601%2C34.1234476%20C87.5705601%2C23.2958645%2082.7847294%2C11.6151183%2070.2649472%2C11.6151183%20C63.4467775%2C11.6151183%2054.5972931%2C16.2736759%2054.5972931%2C30.6461927%20C54.5972931%2C40.3570756%2059.3165401%2C52.9576383%2072.231727%2C52.9576383%20C80.0967971%2C52.9576383%2087.5705601%2C47.0511245%2087.5705601%2C34.1234476%20M48.0413607%2C32.7462865%20C48.0413607%2C19.6207004%2057.8742349%2C9.58065244%2071.3784314%2C9.58065244%20C86.5226353%2C9.58065244%2094.1264925%2C20.5394914%2094.1264925%2C32.0889818%20C94.1264925%2C45.3458238%2084.0303566%2C54.9921041%2071.3784314%2C54.9921041%20C56.8252858%2C54.9921041%2048.0413607%2C44.5572632%2048.0413607%2C32.7462865%22%20id%3D%22Fill-4%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M111.790326%2C15.1582062%20C116.576156%2C11.4184396%20122.672149%2C9.58085753%20129.489295%2C9.58085753%20C133.029498%2C9.58085753%20138.013031%2C10.3027648%20141.093295%2C11.1559279%20C141.880007%2C11.3517862%20142.338922%2C11.4840675%20142.927932%2C11.4184396%20C142.994515%2C12.9268566%20143.322312%2C17.0614162%20143.846787%2C21.06472%20C143.51899%2C21.5241155%20142.5356%2C21.588718%20142.07566%2C21.1959758%20C141.093295%2C16.7332765%20138.14415%2C11.6153234%20128.638048%2C11.6153234%20C118.607471%2C11.6153234%20110.085783%2C17.9802072%20110.085783%2C31.5641634%20C110.085783%2C45.3450034%20118.805173%2C52.9568179%20129.555878%2C52.9568179%20C138.013031%2C52.9568179%20141.748888%2C47.4450972%20143.256753%2C43.5730493%20C143.715668%2C43.2459351%20144.699058%2C43.3771909%20144.961295%2C43.835561%20C144.50238%2C47.2482134%20142.797837%2C51.5796568%20141.814447%2C52.8255621%20C141.027736%2C52.9568179%20140.241024%2C53.2193297%20139.519871%2C53.4828668%20C138.077566%2C54.0078903%20133.358319%2C54.9923092%20129.162522%2C54.9923092%20C123.262183%2C54.9923092%20117.624081%2C53.809981%20112.839275%2C50.5952379%20C107.594529%2C46.9857017%20103.530875%2C41.0145854%20103.530875%2C32.5485824%20C103.530875%2C25.2638821%20106.808841%2C19.0302541%20111.790326%2C15.1582062%22%20id%3D%22Fill-6%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M166.813857%2C32.7458763%20C163.668034%2C32.7458763%20163.536915%2C32.8771322%20163.536915%2C34.8459701%20L163.536915%2C44.0984829%20C163.536915%2C50.9883902%20163.863687%2C51.9082067%20167.535009%2C52.3009488%20L169.437254%2C52.498858%20C169.829586%2C52.7613698%20169.698467%2C53.9416471%20169.306136%2C54.1385309%20C165.765932%2C54.007275%20163.536915%2C53.9416471%20160.980101%2C53.9416471%20C158.16105%2C53.9416471%20155.932033%2C54.0729029%20153.37522%2C54.1385309%20C152.981864%2C53.9416471%20152.850745%2C52.8916002%20153.244101%2C52.498858%20L154.35861%2C52.3009488%20C158.029932%2C51.6456949%20158.16105%2C50.9883902%20158.16105%2C44.0984829%20L158.16105%2C20.4734533%20C158.16105%2C13.583546%20157.702135%2C12.4688966%20154.29305%2C12.2053595%20L152.588508%2C12.0741036%20C152.195152%2C11.8115919%20152.326271%2C10.6313146%20152.719626%2C10.4334054%20C155.932033%2C10.5000587%20158.16105%2C10.6313146%20160.980101%2C10.6313146%20C163.536915%2C10.6313146%20165.765932%2C10.5646612%20168.584983%2C10.4334054%20C168.977315%2C10.6313146%20169.108433%2C11.8115919%20168.715077%2C12.0741036%20L167.470474%2C12.2053595%20C163.668034%2C12.6001525%20163.536915%2C13.583546%20163.536915%2C20.4734533%20L163.536915%2C28.0206653%20C163.536915%2C30.0551312%20163.668034%2C30.1197337%20166.813857%2C30.1197337%20L185.562799%2C30.1197337%20C188.709647%2C30.1197337%20188.840765%2C30.0551312%20188.840765%2C28.0206653%20L188.840765%2C20.4734533%20C188.840765%2C13.583546%20188.709647%2C12.6001525%20184.841647%2C12.2053595%20L183.596019%2C12.0741036%20C183.202664%2C11.8115919%20183.333782%2C10.6313146%20183.727138%2C10.4334054%20C186.742867%2C10.5646612%20188.971884%2C10.6313146%20191.659816%2C10.6313146%20C194.215606%2C10.6313146%20196.444623%2C10.5646612%20199.394792%2C10.4334054%20C199.788148%2C10.6313146%20199.919267%2C11.8115919%20199.525911%2C12.0741036%20L198.149165%2C12.2053595%20C194.346724%2C12.6001525%20194.215606%2C13.583546%20194.215606%2C20.4734533%20L194.215606%2C44.0984829%20C194.215606%2C50.9883902%20194.346724%2C51.8415533%20198.149165%2C52.3009488%20L199.722589%2C52.498858%20C200.115945%2C52.7613698%20199.984826%2C53.9416471%20199.59147%2C54.1385309%20C196.444623%2C54.007275%20194.215606%2C53.9416471%20191.659816%2C53.9416471%20C188.971884%2C53.9416471%20186.611748%2C54.007275%20183.727138%2C54.1385309%20C183.333782%2C53.9416471%20183.202664%2C52.8916002%20183.596019%2C52.498858%20L184.841647%2C52.3009488%20C188.840765%2C51.6456949%20188.840765%2C50.9883902%20188.840765%2C44.0984829%20L188.840765%2C34.8459701%20C188.840765%2C32.8771322%20188.709647%2C32.7458763%20185.562799%2C32.7458763%20L166.813857%2C32.7458763%20Z%22%20id%3D%22Fill-8%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M230.766568%2C44.098688%20C230.766568%2C50.9885953%20230.897687%2C51.9730142%20234.700127%2C52.3011539%20L236.798026%2C52.4980377%20C237.190357%2C52.7605494%20237.060263%2C53.9418522%20236.666907%2C54.138736%20C232.930026%2C54.0074801%20230.702033%2C53.9418522%20228.078636%2C53.9418522%20C225.456263%2C53.9418522%20223.162711%2C54.0074801%20218.966914%2C54.138736%20C218.573558%2C53.9418522%20218.442439%2C52.8261773%20218.966914%2C52.4980377%20L221.32705%2C52.3011539%20C225.063931%2C51.9730142%20225.391728%2C50.9885953%20225.391728%2C44.098688%20L225.391728%2C14.7650539%20C225.391728%2C12.730588%20225.391728%2C12.6649601%20223.424948%2C12.6649601%20L219.819185%2C12.6649601%20C217.001159%2C12.6649601%20213.394371%2C12.796216%20211.755388%2C14.3046329%20C210.181964%2C15.7494728%20209.527396%2C17.1932873%20208.806243%2C18.8329601%20C208.281768%2C19.2267277%20207.363938%2C18.8996135%20207.100676%2C18.3735646%20C208.15065%2C15.4203077%20209.13404%2C11.2201202%20209.592955%2C8.59602839%20C209.788609%2C8.46477253%20210.641904%2C8.40017004%20210.838582%2C8.59602839%20C211.231938%2C10.6961222%20213.394371%2C10.6304942%20216.4101%2C10.6304942%20L242.959578%2C10.6304942%20C246.499781%2C10.6304942%20247.09084%2C10.4992384%20248.073205%2C8.79291218%20C248.401002%2C8.66165632%20249.122154%2C8.72728425%20249.253273%2C8.98979598%20C248.53212%2C11.6805411%20248.073205%2C16.9953781%20248.269883%2C18.964216%20C248.007646%2C19.4892394%20246.893137%2C19.4892394%20246.565341%2C19.0954719%20C246.368663%2C17.455799%20245.909747%2C15.0265402%20244.926358%2C14.3046329%20C243.419518%2C13.1889581%20240.928263%2C12.6649601%20237.321476%2C12.6649601%20L232.667788%2C12.6649601%20C230.702033%2C12.6649601%20230.766568%2C12.730588%20230.766568%2C14.8952843%20L230.766568%2C44.098688%20Z%22%20id%3D%22Fill-10%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M261.05139%2C20.4736584%20C261.05139%2C13.6493791%20260.888517%2C12.6649601%20256.092442%2C12.2055646%20L254.791499%2C12.0743087%20C254.303902%2C11.811797%20254.465751%2C10.6304942%20254.954373%2C10.4336104%20C258.449505%2C10.5648663%20261.21324%2C10.6304942%20264.546522%2C10.6304942%20L279.830039%2C10.6304942%20C285.032786%2C10.6304942%20289.829885%2C10.6304942%20290.80508%2C10.4336104%20C291.291653%2C11.5492853%20291.780275%2C16.2734708%20292.104999%2C19.1621252%20C291.780275%2C19.5548674%20290.480357%2C19.6861232%20290.072659%2C19.2933811%20C288.853666%2C16.2088683%20288.12227%2C13.9118908%20283.894718%2C13.0587277%20C282.188126%2C12.730588%20279.586241%2C12.6649601%20276.00916%2C12.6649601%20L270.155942%2C12.6649601%20C267.71693%2C12.6649601%20267.71693%2C12.796216%20267.71693%2C15.2890519%20L267.71693%2C28.414638%20C267.71693%2C30.2511946%20267.960729%2C30.2511946%20270.39974%2C30.2511946%20L275.11489%2C30.2511946%20C278.529097%2C30.2511946%20281.049033%2C30.1199388%20282.025252%2C29.857427%20C283.000447%2C29.5959408%20283.56897%2C29.2021732%20283.975642%2C27.5614749%20L284.627138%2C24.8707298%20C285.032786%2C24.4769622%20286.414654%2C24.4769622%20286.739378%2C24.9363577%20C286.739378%2C26.511428%20286.414654%2C29.0709173%20286.414654%2C31.5637532%20C286.414654%2C33.9263587%20286.739378%2C36.4202201%20286.739378%2C37.8640346%20C286.414654%2C38.3234301%20285.032786%2C38.3234301%20284.627138%2C37.9296625%20L283.894718%2C35.3701732%20C283.56897%2C34.1888705%20283.000447%2C33.2044515%20281.374781%2C32.8773373%20C280.236712%2C32.6148256%20278.285298%2C32.5481722%20275.11489%2C32.5481722%20L270.39974%2C32.5481722%20C267.960729%2C32.5481722%20267.71693%2C32.6148256%20267.71693%2C34.3201263%20L267.71693%2C43.5726391%20C267.71693%2C47.0509194%20267.960729%2C49.2832945%20269.261671%2C50.3989693%20C270.237891%2C51.1854791%20271.944482%2C51.9073863%20279.097619%2C51.9073863%20C285.358534%2C51.9073863%20287.715597%2C51.6448746%20289.503113%2C50.9229674%20C290.96693%2C50.2677135%20293.162143%2C47.9697105%20295.275406%2C44.5570581%20C295.844953%2C44.2299439%20296.983022%2C44.4258022%20297.30877%2C45.017479%20C296.739223%2C47.3144566%20294.70586%2C52.3678073%20293.64974%2C54.138736%20C286.333729%2C54.0074801%20279.097619%2C53.9418522%20271.863557%2C53.9418522%20L264.546522%2C53.9418522%20C261.05139%2C53.9418522%20258.287655%2C54.0074801%20253.490557%2C54.138736%20C253.002959%2C53.9418522%20252.840085%2C52.8918053%20253.328707%2C52.4980377%20L256.010493%2C52.3011539%20C260.644718%2C51.9730142%20261.05139%2C50.9885953%20261.05139%2C44.098688%20L261.05139%2C20.4736584%20Z%22%20id%3D%22Fill-12%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M314.944535%2C29.9238753%20C314.944535%2C31.1041526%20314.944535%2C31.8260599%20315.140189%2C32.0885716%20C315.337891%2C32.2864808%20316.321281%2C32.4177367%20319.663782%2C32.4177367%20C322.023918%2C32.4177367%20324.515172%2C32.155225%20326.416393%2C30.7114105%20C328.186495%2C29.333224%20329.693335%2C27.0362464%20329.693335%2C22.5735471%20C329.693335%2C17.3889406%20326.481952%2C12.4688966%20319.204867%2C12.4688966%20C315.140189%2C12.4688966%20314.944535%2C12.7303829%20314.944535%2C14.567965%20L314.944535%2C29.9238753%20Z%20M309.568671%2C20.5401067%20C309.568671%2C14.3054533%20309.371993%2C13.1897784%20306.685085%2C12.8616388%20L304.587187%2C12.5991271%20C304.127247%2C12.2709874%20304.127247%2C11.2209405%20304.651722%2C10.9584288%20C308.323044%2C10.6313146%20312.846637%2C10.4334054%20319.271451%2C10.4334054%20C323.335105%2C10.4334054%20327.203105%2C10.761545%20330.217809%2C12.4022433%20C333.364657%2C14.0429415%20335.659233%2C16.9961984%20335.659233%2C21.5891281%20C335.659233%2C27.8237815%20330.743308%2C31.2354085%20327.465342%2C32.5489926%20C327.136521%2C32.9417347%20327.465342%2C33.5990394%20327.793139%2C34.1240629%20C333.03686%2C42.5890405%20336.511504%2C47.839275%20340.968514%2C51.5790416%20C342.083023%2C52.5634605%20343.72303%2C53.2853678%20345.492107%2C53.4166236%20C345.820928%2C53.5478795%20345.885463%2C54.0729029%20345.558691%2C54.3354147%20C344.968657%2C54.5322985%20343.918684%2C54.6635543%20342.673057%2C54.6635543%20C337.101538%2C54.6635543%20333.758013%2C53.022856%20329.103301%2C46.394435%20C327.399783%2C43.9672271%20324.71185%2C39.4388998%20322.679511%2C36.485643%20C321.696121%2C35.0418285%20320.647172%2C34.3865746%20318.025824%2C34.3865746%20C315.075654%2C34.3865746%20314.944535%2C34.4511771%20314.944535%2C35.8303891%20L314.944535%2C44.0984829%20C314.944535%2C50.9883902%20315.075654%2C51.7769508%20318.877071%2C52.3009488%20L320.254841%2C52.498858%20C320.647172%2C52.8259723%20320.516054%2C53.9416471%20320.123722%2C54.1385309%20C317.173552%2C54.007275%20314.944535%2C53.9416471%20312.321138%2C53.9416471%20C309.568671%2C53.9416471%20307.208535%2C54.007275%20304.127247%2C54.1385309%20C303.734915%2C53.9416471%20303.603797%2C52.9572281%20303.996128%2C52.498858%20L305.635111%2C52.3009488%20C309.437552%2C51.8415533%20309.568671%2C50.9883902%20309.568671%2C44.0984829%20L309.568671%2C20.5401067%20Z%22%20id%3D%22Fill-14%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M365.831683%2C47.4604787%20C365.831683%2C50.5029486%20366.579469%2C52.5302364%20369.928116%2C52.5302364%20C371.117403%2C52.5302364%20372.526929%2C52.0462304%20373.494953%2C51.2074234%20C374.068597%2C50.6793237%20374.376931%2C50.0168917%20374.376931%2C48.6510104%20L374.376931%2C41.4186074%20C374.376931%2C38.5525126%20374.068597%2C38.4653505%20372.747167%2C37.9362253%20L372.173523%2C37.7157565%20C371.866214%2C37.5393814%20371.866214%2C36.9220687%20372.217571%2C36.7456936%20C373.980502%2C36.7015999%20376.4021%2C36.3929435%20377.372173%2C35.9520058%20C377.591387%2C35.9960996%20377.72353%2C36.0842871%20377.767577%2C36.2606622%20C377.679482%2C37.0984438%20377.635434%2C38.4653505%20377.635434%2C40.0957944%20L377.635434%2C47.5045725%20C377.635434%2C50.9869546%20377.767577%2C52.3097676%20379.000912%2C52.3097676%20C379.530509%2C52.3097676%20380.103128%2C52.2226055%20380.719796%2C52.0903242%20C380.984082%2C52.3097676%20381.028129%2C53.1926683%20380.674724%2C53.3690434%20C378.956865%2C53.7207681%20376.4021%2C54.1617057%20374.904479%2C55.0005127%20C374.685265%2C55.0005127%20374.465026%2C54.8682314%20374.376931%2C54.6918564%20L374.376931%2C52.884012%20C374.376931%2C52.4861426%20374.244788%2C52.2666992%20373.980502%2C52.2666992%20C372.659072%2C53.1044808%20370.500736%2C54.5595751%20367.901923%2C54.5595751%20C364.025728%2C54.5595751%20362.572155%2C52.6184239%20362.572155%2C49.0478543%20L362.572155%2C41.6841954%20C362.572155%2C38.9062882%20362.572155%2C38.5094443%20361.250725%2C37.9362253%20L360.722153%2C37.7157565%20C360.457867%2C37.4952877%20360.501915%2C36.8779749%20360.810248%2C36.7456936%20C362.836441%2C36.7015999%20364.554301%2C36.304756%20365.523349%2C35.9520058%20C365.787635%2C35.9960996%20365.919778%2C36.0842871%20365.963826%2C36.2606622%20C365.875731%2C37.0102562%20365.831683%2C37.9362253%20365.831683%2C40.0957944%20L365.831683%2C47.4604787%20Z%22%20id%3D%22Fill-16%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M388.123595%2C41.2868388%20C388.123595%2C39.5671819%20388.123595%2C39.3467131%20386.934308%2C38.5530253%20L386.537878%2C38.2884627%20C386.361688%2C38.1120877%20386.361688%2C37.6280817%20386.581926%2C37.4958004%20C387.595023%2C37.1420248%20390.10574%2C35.9966123%20390.986693%2C35.3341804%20C391.162884%2C35.3341804%20391.383122%2C35.4223679%20391.471218%2C35.6428368%20C391.383122%2C36.6569934%20391.383122%2C37.3183999%20391.383122%2C37.7162692%20C391.383122%2C37.9798064%20391.559313%2C38.2002752%20391.867647%2C38.2002752%20C393.717649%2C37.0538373%20395.787889%2C35.9525186%20398.034321%2C35.9525186%20C401.690277%2C35.9525186%20403.187898%2C38.4648378%20403.187898%2C41.4191201%20L403.187898%2C49.0032478%20C403.187898%2C52.177999%20403.275993%2C52.6189366%20404.86171%2C52.8394055%20L405.830758%2C52.9727122%20C406.139092%2C53.1921556%20406.050997%2C53.9417496%20405.742663%2C54.0740309%20C404.421233%2C53.9858434%20403.14385%2C53.9417496%20401.602182%2C53.9417496%20C400.015441%2C53.9417496%20398.695036%2C53.9858434%20397.505749%2C54.0740309%20C397.196391%2C53.9417496%20397.108295%2C53.1921556%20397.417653%2C52.9727122%20L398.254559%2C52.8394055%20C399.883298%2C52.5748429%20399.927346%2C52.177999%20399.927346%2C49.0032478%20L399.927346%2C42.4332767%20C399.927346%2C39.9199321%20398.783131%2C38.0679939%20395.787889%2C38.0679939%20C394.114078%2C38.0679939%20392.660505%2C38.7745196%20392.043837%2C39.6112757%20C391.471218%2C40.3618952%20391.383122%2C40.9781824%20391.383122%2C42.2569017%20L391.383122%2C49.0032478%20C391.383122%2C52.177999%20391.471218%2C52.5748429%20393.056934%2C52.8394055%20L393.849792%2C52.9727122%20C394.158126%2C53.1921556%20394.07003%2C53.9417496%20393.761697%2C54.0740309%20C392.572409%2C53.9858434%20391.295027%2C53.9417496%20389.753358%2C53.9417496%20C388.167642%2C53.9417496%20386.846212%2C53.9858434%20385.612877%2C54.0740309%20C385.304544%2C53.9417496%20385.216448%2C53.1921556%20385.524782%2C52.9727122%20L386.449783%2C52.8394055%20C388.079547%2C52.6189366%20388.123595%2C52.177999%20388.123595%2C49.0032478%20L388.123595%2C41.2868388%20Z%22%20id%3D%22Fill-19%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M425.704965%2C40.8902%20C425.704965%2C40.0083247%20425.528774%2C39.6114808%20425.220441%2C39.1705431%20C424.559726%2C38.244574%20423.238296%2C37.318605%20421.520436%2C37.318605%20C417.512098%2C37.318605%20415.441858%2C40.8020125%20415.441858%2C44.6381701%20C415.441858%2C48.6507028%20417.688289%2C52.4427667%20422.004961%2C52.4427667%20C423.194248%2C52.4427667%20424.691869%2C51.9136415%20425.396631%2C51.2081412%20C425.660917%2C50.9435786%20425.704965%2C50.2821721%20425.704965%2C49.5766719%20L425.704965%2C40.8902%20Z%20M428.964493%2C47.5042649%20C428.964493%2C50.9876724%20429.00854%2C52.6191417%20430.241875%2C52.6191417%20C430.7264%2C52.6191417%20431.47521%2C52.3986729%20432.134901%2C52.1782041%20C432.444259%2C52.2663916%20432.488306%2C53.3687357%20432.090853%2C53.5892046%20C430.241875%2C53.8537672%20427.51092%2C54.5151737%20426.277585%2C55.0002051%20C426.013299%2C55.0002051%20425.79306%2C54.8679238%20425.79306%2C54.647455%20L425.79306%2C53.8978609%20C425.79306%2C53.2364545%20425.79306%2C52.7063038%20425.704965%2C52.5309542%20L425.528774%2C52.5309542%20C423.590677%2C53.8537672%20422.093056%2C54.5592674%20419.978768%2C54.5592674%20C415.089476%2C54.5592674%20411.829949%2C50.7231098%20411.829949%2C46.0932644%20C411.829949%2C39.9201371%20416.499002%2C35.9527237%20422.489485%2C35.9527237%20C423.987106%2C35.9527237%20424.956155%2C36.172167%20425.440679%2C36.3485421%20C425.660917%2C36.3485421%20425.704965%2C36.0839795%20425.704965%2C35.7312294%20L425.704965%2C29.0740962%20C425.704965%2C26.4715385%20425.660917%2C26.2080014%20424.339487%2C25.4132882%20L423.899011%2C25.1487256%20C423.677748%2C25.0174697%20423.677748%2C24.3991315%20423.899011%2C24.2668503%20C425.000202%2C23.9141001%20427.070443%2C23.2537191%20428.656159%2C22.4149121%20C428.83235%2C22.4149121%20429.00854%2C22.5030996%20429.096636%2C22.6794747%20C429.052588%2C24.0022877%20428.964493%2C26.2080014%20428.964493%2C28.1471017%20L428.964493%2C47.5042649%20Z%22%20id%3D%22Fill-21%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M462.758173%2C54.9920016%20C457.25119%2C54.9920016%20453.776546%2C53.2856754%20452.531943%2C52.5637682%20C451.745231%2C51.1199537%20450.89296%2C46.461396%20450.761841%2C43.3768833%20C451.088614%2C42.9174878%20452.072003%2C42.7862319%20452.335265%2C43.1789741%20C453.318655%2C46.5259985%20456.005563%2C52.9575357%20463.610444%2C52.9575357%20C469.117428%2C52.9575357%20471.804336%2C49.3479996%20471.804336%2C45.4103237%20C471.804336%2C42.5237202%20471.215326%2C39.3079516%20466.429495%2C36.2234389%20L460.20136%2C32.1545072%20C456.924418%2C29.9887855%20453.121977%2C26.2490188%20453.121977%2C20.868554%20C453.121977%2C14.6339006%20457.972343%2C9.58054989%20466.49403%2C9.58054989%20C468.527394%2C9.58054989%20470.887529%2C9.97431748%20472.592072%2C10.433713%20C473.444343%2C10.6962247%20474.361149%2C10.8274806%20474.885624%2C10.8274806%20C475.475658%2C12.4025509%20476.065692%2C16.077715%20476.065692%2C18.8330627%20C475.803454%2C19.2268303%20474.754505%2C19.4237141%20474.427733%2C19.0309719%20C473.575462%2C15.8798058%20471.804336%2C11.6150157%20465.511665%2C11.6150157%20C459.086851%2C11.6150157%20457.710105%2C15.8798058%20457.710105%2C18.899716%20C457.710105%2C22.7051106%20460.857977%2C25.4614837%20463.282648%2C26.9709261%20L468.527394%2C30.2512972%20C472.656607%2C32.8107865%20476.721285%2C36.6172065%20476.721285%2C42.8508344%20C476.721285%2C50.0699068%20471.279861%2C54.9920016%20462.758173%2C54.9920016%22%20id%3D%22Fill-24%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M514.070432%2C3.67413868%20C514.070432%2C1.77195413%20515.447178%2C0%20517.479517%2C0%20C519.511856%2C0%20520.62534%2C1.83655662%20520.62534%2C3.54288282%20C520.62534%2C5.44711824%20519.511856%2C7.02116314%20517.479517%2C7.02116314%20C515.512737%2C7.02116314%20514.134967%2C5.90548832%20514.070432%2C3.67413868%20M501.746303%2C3.67413868%20C501.548601%2C1.77195413%20502.926371%2C0%20504.957686%2C0%20C506.990025%2C0%20508.301211%2C1.83655662%20508.301211%2C3.54288282%20C508.301211%2C5.44711824%20506.990025%2C7.02116314%20504.957686%2C7.02116314%20C502.926371%2C7.02116314%20501.746303%2C5.90548832%20501.746303%2C3.67413868%20M527.509069%2C34.1234476%20C527.509069%2C23.2958645%20522.723238%2C11.6151183%20510.203456%2C11.6151183%20C503.384262%2C11.6151183%20494.535802%2C16.2736759%20494.535802%2C30.6461927%20C494.535802%2C40.3570756%20499.255049%2C52.9576383%20512.169212%2C52.9576383%20C520.035306%2C52.9576383%20527.509069%2C47.0511245%20527.509069%2C34.1234476%20M487.978845%2C32.7462865%20C487.978845%2C19.6207004%20497.812744%2C9.58065244%20511.31694%2C9.58065244%20C526.46012%2C9.58065244%20534.065002%2C20.5394914%20534.065002%2C32.0889818%20C534.065002%2C45.3458238%20523.968866%2C54.9921041%20511.31694%2C54.9921041%20C496.763795%2C54.9921041%20487.978845%2C44.5572632%20487.978845%2C32.7462865%22%20id%3D%22Fill-26%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M556.966615%2C32.7458763%20C553.820792%2C32.7458763%20553.689673%2C32.8771322%20553.689673%2C34.8459701%20L553.689673%2C44.0984829%20C553.689673%2C50.9883902%20554.016445%2C51.9082067%20557.687768%2C52.3009488%20L559.588988%2C52.498858%20C559.982344%2C52.7613698%20559.850201%2C53.9416471%20559.457869%2C54.1385309%20C555.91869%2C54.007275%20553.689673%2C53.9416471%20551.132859%2C53.9416471%20C548.313809%2C53.9416471%20546.084792%2C54.0729029%20543.527978%2C54.1385309%20C543.134622%2C53.9416471%20543.003503%2C52.8916002%20543.396859%2C52.498858%20L544.511368%2C52.3009488%20C548.18269%2C51.6456949%20548.313809%2C50.9883902%20548.313809%2C44.0984829%20L548.313809%2C20.4734533%20C548.313809%2C13.583546%20547.853869%2C12.4688966%20544.445808%2C12.2053595%20L542.741266%2C12.0741036%20C542.34791%2C11.8115919%20542.479029%2C10.6313146%20542.872385%2C10.4334054%20C546.084792%2C10.5000587%20548.313809%2C10.6313146%20551.132859%2C10.6313146%20C553.689673%2C10.6313146%20555.91869%2C10.5646612%20558.736717%2C10.4334054%20C559.130073%2C10.6313146%20559.261191%2C11.8115919%20558.867835%2C12.0741036%20L557.622208%2C12.2053595%20C553.820792%2C12.6001525%20553.689673%2C13.583546%20553.689673%2C20.4734533%20L553.689673%2C28.0206653%20C553.689673%2C30.0551312%20553.820792%2C30.1197337%20556.966615%2C30.1197337%20L575.715557%2C30.1197337%20C578.862405%2C30.1197337%20578.993524%2C30.0551312%20578.993524%2C28.0206653%20L578.993524%2C20.4734533%20C578.993524%2C13.583546%20578.862405%2C12.6001525%20574.994405%2C12.2053595%20L573.748778%2C12.0741036%20C573.355422%2C11.8115919%20573.48654%2C10.6313146%20573.879896%2C10.4334054%20C576.895625%2C10.5646612%20579.124642%2C10.6313146%20581.81155%2C10.6313146%20C584.368364%2C10.6313146%20586.597381%2C10.5646612%20589.54755%2C10.4334054%20C589.939882%2C10.6313146%20590.071001%2C11.8115919%20589.678669%2C12.0741036%20L588.301923%2C12.2053595%20C584.499482%2C12.6001525%20584.368364%2C13.583546%20584.368364%2C20.4734533%20L584.368364%2C44.0984829%20C584.368364%2C50.9883902%20584.499482%2C51.8415533%20588.301923%2C52.3009488%20L589.875347%2C52.498858%20C590.268703%2C52.7613698%20590.137584%2C53.9416471%20589.744228%2C54.1385309%20C586.597381%2C54.007275%20584.368364%2C53.9416471%20581.81155%2C53.9416471%20C579.124642%2C53.9416471%20576.764507%2C54.007275%20573.879896%2C54.1385309%20C573.48654%2C53.9416471%20573.355422%2C52.8916002%20573.748778%2C52.498858%20L574.994405%2C52.3009488%20C578.993524%2C51.6456949%20578.993524%2C50.9883902%20578.993524%2C44.0984829%20L578.993524%2C34.8459701%20C578.993524%2C32.8771322%20578.862405%2C32.7458763%20575.715557%2C32.7458763%20L556.966615%2C32.7458763%20Z%22%20id%3D%22Fill-28%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M639.701151%2C42.7859243%20C639.701151%2C44.7547622%20639.701151%2C52.5634605%20639.896804%2C54.2697867%20C639.765686%2C54.6635543%20639.373354%2C54.991694%20638.652201%2C54.991694%20C637.865489%2C53.8760191%20635.965293%2C51.5790416%20630.260608%2C45.0829019%20L615.052893%2C27.7581536%20C613.282792%2C25.7236878%20608.824758%2C20.3421975%20607.448012%2C18.8994084%20L607.316893%2C18.8994084%20C607.054656%2C19.6869436%20606.989096%2C21.1953606%20606.989096%2C23.1641985%20L606.989096%2C37.4700619%20C606.989096%2C40.5545747%20607.054656%2C49.0862056%20608.169164%2C51.0540181%20C608.56252%2C51.7769508%20609.873707%2C52.1696929%20611.511665%2C52.3009488%20L613.545029%2C52.498858%20C613.938385%2C53.022856%20613.871801%2C53.8103912%20613.41391%2C54.1385309%20C610.463741%2C54.007275%20608.169164%2C53.9416471%20605.744494%2C53.9416471%20C602.989978%2C53.9416471%20601.2209%2C54.007275%20598.9253%2C54.1385309%20C598.467409%2C53.8103912%20598.401849%2C52.8916002%20598.794181%2C52.498858%20L600.565307%2C52.3009488%20C602.073172%2C52.104065%20603.121096%2C51.7102974%20603.448893%2C50.9883902%20C604.366723%2C48.6257847%20604.301164%2C40.6202026%20604.301164%2C37.4700619%20L604.301164%2C18.5046154%20C604.301164%2C16.6680588%20604.235605%2C15.2898722%20602.858859%2C13.7804298%20C601.942053%2C12.8616388%20600.368629%2C12.4022433%20598.794181%2C12.2053595%20L597.680697%2C12.0741036%20C597.287341%2C11.680336%20597.287341%2C10.6959171%20597.810791%2C10.4334054%20C600.565307%2C10.6313146%20604.039951%2C10.6313146%20605.218995%2C10.6313146%20C606.267944%2C10.6313146%20607.382452%2C10.5646612%20608.234724%2C10.4334054%20C609.54591%2C13.7804298%20617.280886%2C22.4422912%20619.445368%2C24.8705247%20L625.803598%2C32.0239691%20C630.327192%2C37.0773198%20633.538574%2C40.7514585%20636.619862%2C43.9015991%20L636.750981%2C43.9015991%20C637.013218%2C43.5734595%20637.013218%2C42.5234126%20637.013218%2C41.145226%20L637.013218%2C27.1018743%20C637.013218%2C24.0173616%20636.947659%2C15.486756%20635.702032%2C13.5179181%20C635.308676%2C12.9272667%20634.259727%2C12.5334991%20631.637354%2C12.2053595%20L630.522845%2C12.0741036%20C630.064954%2C11.680336%20630.129489%2C10.6313146%20630.653964%2C10.4334054%20C633.669693%2C10.5646612%20635.89871%2C10.6313146%20638.389964%2C10.6313146%20C641.209015%2C10.6313146%20642.913557%2C10.5646612%20645.142574%2C10.4334054%20C645.666025%2C10.7625705%20645.666025%2C11.680336%20645.272669%2C12.0741036%20L644.355863%2C12.2053595%20C642.257964%2C12.5334991%20640.946778%2C13.0585226%20640.68454%2C13.583546%20C639.570032%2C15.9461515%20639.701151%2C24.0840149%20639.701151%2C27.1018743%20L639.701151%2C42.7859243%20Z%22%20id%3D%22Fill-30%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M661.913981%2C20.4736584%20C661.913981%2C13.6493791%20661.757254%2C12.6649601%20657.114834%2C12.2055646%20L655.856914%2C12.0743087%20C655.384682%2C11.811797%20655.54141%2C10.6304942%20656.013642%2C10.4336104%20C659.396094%2C10.5648663%20662.070709%2C10.6304942%20665.297457%2C10.6304942%20L680.086207%2C10.6304942%20C685.120958%2C10.6304942%20689.763377%2C10.6304942%20690.705793%2C10.4336104%20C691.178025%2C11.5492853%20691.650257%2C16.2734708%20691.965761%2C19.1621252%20C691.650257%2C19.5548674%20690.392337%2C19.6861232%20689.998981%2C19.2933811%20C688.818913%2C16.2088683%20688.110053%2C13.9118908%20684.019766%2C13.0587277%20C682.36849%2C12.730588%20679.850603%2C12.6649601%20676.389275%2C12.6649601%20L670.725564%2C12.6649601%20C668.365429%2C12.6649601%20668.365429%2C12.796216%20668.365429%2C15.2890519%20L668.365429%2C28.414638%20C668.365429%2C30.2511946%20668.600008%2C30.2511946%20670.961168%2C30.2511946%20L675.523687%2C30.2511946%20C678.828287%2C30.2511946%20681.267299%2C30.1199388%20682.209714%2C29.857427%20C683.154178%2C29.5959408%20683.704262%2C29.2021732%20684.098642%2C27.5614749%20L684.727602%2C24.8707298%20C685.120958%2C24.4769622%20686.458778%2C24.4769622%20686.773258%2C24.9363577%20C686.773258%2C26.511428%20686.458778%2C29.0709173%20686.458778%2C31.5637532%20C686.458778%2C33.9263587%20686.773258%2C36.4202201%20686.773258%2C37.8640346%20C686.458778%2C38.3234301%20685.120958%2C38.3234301%20684.727602%2C37.9296625%20L684.019766%2C35.3701732%20C683.704262%2C34.1888705%20683.154178%2C33.2044515%20681.580754%2C32.8773373%20C680.479562%2C32.6148256%20678.591659%2C32.5481722%20675.523687%2C32.5481722%20L670.961168%2C32.5481722%20C668.600008%2C32.5481722%20668.365429%2C32.6148256%20668.365429%2C34.3201263%20L668.365429%2C43.5726391%20C668.365429%2C47.0509194%20668.600008%2C49.2832945%20669.859976%2C50.3989693%20C670.803416%2C51.1854791%20672.455716%2C51.9073863%20679.378371%2C51.9073863%20C685.436462%2C51.9073863%20687.716697%2C51.6448746%20689.447873%2C50.9229674%20C690.864569%2C50.2677135%20692.988077%2C47.9697105%20695.033732%2C44.5570581%20C695.583816%2C44.2299439%20696.685008%2C44.4258022%20697.000512%2C45.017479%20C696.449404%2C47.3144566%20694.482624%2C52.3678073%20693.460309%2C54.138736%20C686.379902%2C54.0074801%20679.378371%2C53.9418522%20672.37684%2C53.9418522%20L665.297457%2C53.9418522%20C661.913981%2C53.9418522%20659.239366%2C54.0074801%20654.596946%2C54.138736%20C654.125738%2C53.9418522%20653.967986%2C52.8918053%20654.440218%2C52.4980377%20L657.035958%2C52.3011539%20C661.520625%2C51.9730142%20661.913981%2C50.9885953%20661.913981%2C44.098688%20L661.913981%2C20.4736584%20Z%22%20id%3D%22Fill-32%22%3E%3C/path%3E%0A%20%20%20%20%20%20%20%20%3C/g%3E%0A%20%20%20%20%3C/g%3E%0A%3C/svg%3E" style="height:42px;width:auto;display:block" />'
    + '<div style="text-align:right;color:#fff">'
    + '<div style="font-size:17px;font-weight:800;margin-bottom:3px">Reiseplan ' + escHtml(family) + '</div>'
    + (dateStr ? '<div style="font-size:12px;opacity:.85">Ankunft: ' + escHtml(dateStr) + '</div>' : '')
    + '</div>';

  // Inhalt
  var body = document.createElement('div');
  body.style.cssText = 'padding:24px 36px;box-sizing:border-box;width:100%';
  body.innerHTML = src.innerHTML;

  // Fusszeile
  var footer = document.createElement('div');
  footer.style.cssText = 'background:#f7f0ee;padding:12px 36px;display:flex;justify-content:space-between;align-items:center;border-top:3px solid #844332;box-sizing:border-box;width:100%';
  footer.innerHTML = '<span style="font-size:11px;color:#844332;font-weight:600">Töchter & Söhne — Individuelle Internatsberatung</span>'
    + '<span style="font-size:11px;color:#999">internate.org</span>';

  wrap.appendChild(header);
  wrap.appendChild(body);
  wrap.appendChild(footer);
  document.body.appendChild(wrap);

  // Buttons verstecken
  wrap.querySelectorAll('.ts-rp-print-row, #ts-rp-share-box').forEach(function(el){ el.style.display='none'; });

  setTimeout(function(){
    html2canvas(wrap, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794
    }).then(function(canvas){
      document.body.removeChild(wrap);

      var pdf = new window.jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      var pageW = 210;
      var pageH = 297;
      var imgW = pageW;
      var totalH = (canvas.height * imgW) / canvas.width; // Gesamthöhe in mm

      var pagesCount = Math.ceil(totalH / pageH);
      var imgData = canvas.toDataURL('image/jpeg', 0.92);

      for(var p = 0; p < pagesCount; p++){
        if(p > 0) pdf.addPage();
        // Jede Seite zeigt einen anderen Ausschnitt des Gesamtbilds
        pdf.addImage(imgData, 'JPEG', 0, -(p * pageH), imgW, totalH);
      }

      var fname = 'Reiseplan_Familie_' + (family.replace(/\s+/g,'_') || 'Familie') + '.pdf';
      pdf.save(fname);
      if(btn){ btn.textContent='PDF herunterladen'; btn.disabled=false; }
    }).catch(function(err){
      document.body.removeChild(wrap);
      console.error(err);
      alert('PDF Fehler: ' + err.message);
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
