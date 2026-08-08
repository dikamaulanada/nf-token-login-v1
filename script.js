const API_URL="https://script.google.com/macros/s/AKfycbypmZJzIUMsP7GvljlT4cBdQpq-uoEu0ShhnxadOCEBh0btQUEDiCLqSMlUD2S5qAxhgg/exec";
const icons={
  pc:'<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="11" rx="1.5" stroke="currentColor" stroke-width="1.8"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  android:'<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="7" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M8 7 6.5 4.5M16 7l1.5-2.5M9 11h.01M15 11h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  iphone:'<svg viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M10 6h4M11 18h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};
const guides={
  pc:{title:"Laptop / PC",description:"Panduan akses melalui browser di laptop atau komputer.",video:"assets/pc.mp4",linkKey:"pc"},
  android:{title:"HP Android",description:"Panduan akses untuk perangkat Android.",video:"android.mp4",linkKey:"hp"},
  iphone:{title:"iPhone / iPad",description:"Panduan akses untuk iPhone atau iPad.",video:"assets/iphone.mp4",linkKey:"hp"}
};

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const homeView=$("#homeView"),guideView=$("#guideView"),guideTitle=$("#guideTitle"),guideDescription=$("#guideDescription");
const guideVideo=$("#guideVideo"),continueButton=$("#continueButton"),guideNote=$("#guideNote"),statusText=$("#status");
const clearBtn=$("#clearCookiesButton"),lockLabel=$("#lockLabel"),lockText=$("#lockText"),progress2=$("#progress2");
const guideMiniIcon=$("#guideMiniIcon"),guideDeviceLabel=$("#guideDeviceLabel");
let links={},activeGuide=null;

function setUnlocked(unlocked){
  $$(".device").forEach(b=>b.disabled=!unlocked);
  if(unlocked){
    clearBtn.classList.add("done");
    clearBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Sesi dibersihkan — lanjut pilih perangkat';
    lockLabel.classList.add("ready");lockText.textContent="Siap dipilih";progress2.classList.add("active");
  }
}

// Ingat status selama tab ini masih terbuka.
if(sessionStorage.getItem("nfClearClicked")==="1") setUnlocked(true);

clearBtn.addEventListener("click",()=>{
  sessionStorage.setItem("nfClearClicked","1");
  setUnlocked(true);
  window.open("https://www.netflix.com/clearcookies","_blank","noopener,noreferrer");
});

async function loadLinks(){
  try{
    const r=await fetch(API_URL,{cache:"no-store"});
    if(!r.ok) throw new Error("Server error");
    const data=await r.json();
    if(!data.success||!data.links) throw new Error(data.message||"Format tidak sesuai");
    links=data.links;statusText.textContent="Link akses siap.";statusText.classList.remove("error");updateContinueState();
  }catch(e){
    console.error(e);statusText.textContent="Link belum dapat dimuat. Coba muat ulang halaman.";statusText.classList.add("error");updateContinueState();
  }
}

function openGuide(key){
  if(sessionStorage.getItem("nfClearClicked")!=="1") return;
  const g=guides[key];if(!g)return;activeGuide=key;
  guideTitle.textContent=g.title;guideDeviceLabel.textContent=g.title;guideDescription.textContent=g.description;guideMiniIcon.innerHTML=icons[key];
  guideVideo.src=g.video;guideVideo.load();homeView.classList.add("hidden");guideView.classList.add("active");updateContinueState();window.scrollTo({top:0,behavior:"smooth"});
}
function closeGuide(){guideVideo.pause();guideVideo.removeAttribute("src");guideVideo.load();activeGuide=null;guideView.classList.remove("active");homeView.classList.remove("hidden")}
function updateContinueState(){if(!activeGuide)return;const g=guides[activeGuide],ok=Boolean(links[g.linkKey]);continueButton.disabled=!ok;guideNote.textContent=ok?"Sudah siap. Tekan tombol untuk melanjutkan.":"Link belum tersedia atau masih dimuat."}
function openDeviceLink(){
  if(!activeGuide)return;const dest=links[guides[activeGuide].linkKey];if(!dest){alert("Link perangkat belum tersedia.");return}
  try{const u=new URL(dest);if(!["https:","http:"].includes(u.protocol))throw new Error();window.location.href=u.href}catch{alert("Link perangkat tidak valid.")}
}

$$('[data-guide]').forEach(b=>b.addEventListener('click',()=>openGuide(b.dataset.guide)));
$("#backButton").addEventListener("click",closeGuide);continueButton.addEventListener("click",openDeviceLink);loadLinks();
