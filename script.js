const $=id=>document.getElementById(id), form=$("searchForm"), input=$("cityInput"), message=$("message"), weatherCard=$("weather"), forecastSection=$("forecastSection");
const codes={0:["Ochiq osmon","☀️"],1:["Asosan ochiq","🌤️"],2:["Qisman bulutli","⛅"],3:["Bulutli","☁️"],45:["Tuman","🌫️"],48:["Qirovli tuman","🌫️"],51:["Mayin yomg‘ir","🌦️"],53:["Yomg‘ir","🌦️"],55:["Kuchli yomg‘ir","🌧️"],61:["Yomg‘ir","🌧️"],63:["Yomg‘irli","🌧️"],65:["Kuchli yomg‘ir","🌧️"],71:["Qor","🌨️"],73:["Qorli","🌨️"],75:["Kuchli qor","❄️"],80:["Yomg‘ir yog‘ishi","🌦️"],81:["Yomg‘ir yog‘ishi","🌧️"],82:["Kuchli yomg‘ir","⛈️"],95:["Momaqaldiroq","⛈️"],96:["Do‘l bilan momaqaldiroq","⛈️"],99:["Kuchli momaqaldiroq","⛈️"]};
async function geocode(name){const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=5&language=uz&format=json`);if(!r.ok)throw Error("Qidiruvda xatolik");const d=await r.json();if(!d.results?.length)throw Error("Bu joy topilmadi. Nomini tekshirib ko‘ring.");return d.results.find(x=>x.country_code==='UZ')||d.results[0]}
async function getWeather(p){const q=new URLSearchParams({latitude:p.latitude,longitude:p.longitude,timezone:'auto',forecast_days:7,current:'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m,visibility',daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'});const r=await fetch(`https://api.open-meteo.com/v1/forecast?${q}`);if(!r.ok)throw Error('Ob-havo ma’lumotini olishda xatolik');return r.json()}
function effects(code){const box=$("weatherEffects");box.innerHTML='';let type=codes[code]?.[1]||'';if(type.includes('🌧')||type.includes('🌦')||type.includes('⛈'))for(let i=0;i<75;i++){const e=document.createElement('i');e.className='drop';e.style.left=Math.random()*100+'%';e.style.animationDuration=(.35+Math.random()*.55)+'s';e.style.animationDelay=Math.random()*1+'s';box.appendChild(e)}else if(type.includes('❄')||type.includes('🌨'))for(let i=0;i<45;i++){const e=document.createElement('i');e.className='snow';e.textContent='•';e.style.left=Math.random()*100+'%';e.style.fontSize=(7+Math.random()*12)+'px';e.style.animationDuration=(4+Math.random()*6)+'s';e.style.animationDelay=Math.random()*4+'s';box.appendChild(e)}}
function showWeather(p,d){const c=d.current,day=d.daily,info=codes[c.weather_code]||['Noma’lum','🌤️'];$("placeName").textContent=`${p.name}${p.admin1?', '+p.admin1:''}`;$("updated").textContent='Yangilangan: '+new Date(c.time).toLocaleString('uz-UZ');$("weatherIcon").textContent=info[1];$("temperature").textContent=Math.round(c.temperature_2m);$("condition").textContent=info[0];$("feels").textContent=Math.round(c.apparent_temperature);$("humidity").textContent=c.relative_humidity_2m+'%';$("wind").textContent=Math.round(c.wind_speed_10m)+' km/soat';$("pressure").textContent=Math.round(c.surface_pressure)+' hPa';$("visibility").textContent=(c.visibility/1000).toFixed(1)+' km';
$("forecast").innerHTML=day.time.map((date,i)=>{const dt=new Date(date+'T12:00:00'),name=i===0?'Bugun':dt.toLocaleDateString('uz-UZ',{weekday:'short'}),inf=codes[day.weather_code[i]]||['','🌤️'];return `<div class="day"><div class="date">${name}</div><div class="icon">${inf[1]}</div><div class="temp">${Math.round(day.temperature_2m_max[i])}° / ${Math.round(day.temperature_2m_min[i])}°</div><div class="rain">💧 ${day.precipitation_probability_max[i]??0}%</div></div>`}).join('');weatherCard.classList.remove('hidden');forecastSection.classList.remove('hidden');effects(c.weather_code)}
async function searchCity(name){message.textContent='Qidirilmoqda...';try{const p=await geocode(name),d=await getWeather(p);showWeather(p,d);message.textContent=''}catch(e){message.textContent=e.message}}
form.addEventListener('submit',e=>{e.preventDefault();if(input.value.trim())searchCity(input.value.trim())});document.querySelectorAll('.city-buttons button').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.city;searchCity(b.dataset.city)}));
$("locationBtn").addEventListener('click',()=>{message.textContent='Joylashuvingiz aniqlanmoqda...';if(!navigator.geolocation){message.textContent='Brauzeringiz geolokatsiyani qo‘llab-quvvatlamaydi.';return}navigator.geolocation.getCurrentPosition(async pos=>{try{const p={name:'Sizning joylashuvingiz',latitude:pos.coords.latitude,longitude:pos.coords.longitude,admin1:''};showWeather(p,await getWeather(p));message.textContent=''}catch(e){message.textContent=e.message}},()=>message.textContent='Joylashuvga ruxsat berilmadi.')});
async function shareSite(){
  const shareUrl=location.href;
  const data={title:'Ob-Havo Uz',text:'🌤️ Ob-Havo Uz — O‘zbekiston ob-havosini tez bilib oling!',url:shareUrl};
  try{
    if(navigator.share){
      await navigator.share(data);
      message.textContent='';
      return;
    }
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(shareUrl);
      message.textContent='Havola nusxalandi! Do‘stlaringizga yuborishingiz mumkin.';
      return;
    }
    const ta=document.createElement('textarea');
    ta.value=shareUrl;ta.style.position='fixed';ta.style.opacity='0';
    document.body.appendChild(ta);ta.select();
    const ok=document.execCommand('copy');
    ta.remove();
    if(ok) message.textContent='Havola nusxalandi! Do‘stlaringizga yuborishingiz mumkin.';
    else window.prompt('Havolani nusxalang:',shareUrl);
  }catch(e){
    if(e.name==='AbortError') return;
    window.prompt('Ulashish ishlamadi. Havolani nusxalang:',shareUrl);
  }
}
$("shareBtn").addEventListener('click',shareSite);$("shareBtn2").addEventListener('click',shareSite);searchCity('Qarshi');


function shareToTelegram(){
  const url = location.href;
  const text = '🌤️ Ob-Havo Uz — O‘zbekiston ob-havosini tez bilib oling!';
  const tg = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);
  window.open(tg, '_blank', 'noopener,noreferrer');
}

const telegramBtn = document.getElementById('telegramBtn');
const telegramBtn2 = document.getElementById('telegramBtn2');
if (telegramBtn) telegramBtn.addEventListener('click', shareToTelegram);
if (telegramBtn2) telegramBtn2.addEventListener('click', shareToTelegram);
