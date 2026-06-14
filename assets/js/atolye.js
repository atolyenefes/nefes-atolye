// ==========================================
// 1. KEDİ ARŞİVİ VE SES OYNATICISI
// ==========================================
const kediDosyaDizini = {
    efekan: { resimler: ["efekankapak.jpg", "efekan1.jpg"] },
    bedri: { resimler: ["bedrikapak.jpg", "bedri1.jpg", "bedri2.jpg", "bedri3.jpg"] },
    bahri: { resimler: ["bahrikapak.jpg", "bahri1.jpg", "bahri2.jpg", "bedri3.jpg"] },
    Zerdal: { resimler: ["zerdokapak.jpg", "zerdo1.jpg"] },
    tahin: { resimler: ["tahinkapak.jpg"] },
    pekmez: { resimler: ["pekmezkapak.jpg"] }
};

var aktifKediButon = null;
var kediLightboxMedyalari = [];
var kediMevcutMedyaIndeksi = 0;

function kediSesTetikle(buton) {
    var kediGlobalPlayer = document.getElementById("globalKediOynatici");
    if (!kediGlobalPlayer) return;

    var kart = buton.closest('.kedi-profil-karti');
    var klasor = kart.getAttribute('data-klasor');
    
    if (aktifKediButon === buton) { 
        kediGlobalPlayer.pause(); 
        kediSesSifirla(); 
        return; 
    }
    if (aktifKediButon) { 
        aktifKediButon.innerText = "▶"; 
        aktifKediButon.style.backgroundColor = "#fffdf9"; 
        aktifKediButon.style.color = "#3b2f2f"; 
    }
    
    var sesYolu = "/sesler/cats/" + klasor + "/ses1.mp3";
    kediGlobalPlayer.src = sesYolu;
    kediGlobalPlayer.play().then(function() {
        aktifKediButon = buton; 
        buton.innerText = "■"; 
        buton.style.backgroundColor = "#8c2d19"; 
        buton.style.color = "#fffdf9";
    }).catch(function(err) { 
        aktifKediButon = buton;
        buton.innerText = "🐾";
        buton.style.backgroundColor = "#d97d41";
        buton.style.color = "#fffdf9";
        setTimeout(kediSesSifirla, 1800);
    });
}

function kediSesSifirla() { 
    if (aktifKediButon) { 
        aktifKediButon.innerText = "▶"; 
        aktifKediButon.style.backgroundColor = "#fffdf9"; 
        aktifKediButon.style.color = "#3b2f2f"; 
    } 
    aktifKediButon = null; 
}

function kediHoverBaslat(kart) {
    // Mobilde hover yükünü hafifletmek için cihaz genişliğini kontrol et
    if (window.innerWidth <= 768) return; 

    var klasor = kart.getAttribute('data-klasor');
    var medyaKapsayici = kart.querySelector('.kedi-hover-medya');
    if(medyaKapsayici) medyaKapsayici.innerHTML = "";
    
    var kediData = kediDosyaDizini[klasor];
    if (!kediData) return;

    var secilenResim = kediData.resimler.length > 1 ? kediData.resimler[1] : kediData.resimler[0];
    var imgElement = document.createElement('img');
    imgElement.src = "/gorseller/cats/" + klasor + "/" + secilenResim;
    imgElement.style.width = "100%"; 
    imgElement.style.height = "100%"; 
    imgElement.style.objectFit = "cover";
    
    if(medyaKapsayici) medyaKapsayici.appendChild(imgElement);
}

function kediHoverDurdur(kart) { 
    var medya = kart.querySelector('.kedi-hover-medya');
    if(medya) medya.innerHTML = ""; 
}

function kediGaleriModalAc(kart) {
    var klasor = kart.getAttribute('data-klasor');
    var kediAdi = kart.querySelector('.kedi-baslik').innerText.trim();
    
    var ismEl = document.getElementById('modalKediIsmi');
    if(ismEl) ismEl.innerText = "🗂️ " + kediAdi + " Fotoğraf Arşivi";
    
    var izgara = document.getElementById('kediModalGaleriIcerik');
    if(izgara) izgara.innerHTML = ""; 
    
    var dMod = document.getElementById('kediDetayModal');
    if(dMod) dMod.style.display = "flex";
    
    kediLightboxMedyalari = [];

    var kediData = kediDosyaDizini[klasor];
    if (!kediData) return;

    kediData.resimler.forEach(function(resimName, index) {
        var tamYol = "/gorseller/cats/" + klasor + "/" + resimName;
        kediLightboxMedyalari.push(tamYol);

        var kutu = document.createElement('div');
        kutu.className = "modal-medya-kutu";
        
        kutu.onclick = (function(currentIndex) {
            return function() { kediLightboxAc(currentIndex); };
        })(index);
        
        kutu.innerHTML = '<img src="' + tamYol + '" loading="lazy" style="width:100%; height:100%; object-fit:cover;">';
        if(izgara) izgara.appendChild(kutu);
    });
}

function kediGaleriModalDisKapat(e) {
    if (e.target.id === "kediDetayModal") {
        var m = document.getElementById('kediDetayModal');
        if(m) m.style.display = "none";
    }
}

function kediLightboxAc(indeks) {
    kediMevcutMedyaIndeksi = indeks;
    var m = document.getElementById("kediLightboxArkaPlan");
    if(m) m.style.display = "flex";
    kediLightboxMedyasiniGoster();
}

function kediLightboxKapat() {
    var m = document.getElementById("kediLightboxArkaPlan");
    if(m) m.style.display = "none";
}

function kediLightboxMedyasiniGoster() {
    var gorselElemani = document.getElementById("kediLightboxGorselElemani");
    if(gorselElemani) gorselElemani.src = kediLightboxMedyalari[kediMevcutMedyaIndeksi];
}

function kediLightboxMedyasiniDegistir(yon) {
    if (kediLightboxMedyalari.length <= 1) return;
    kediMevcutMedyaIndeksi += yon;
    if (kediMevcutMedyaIndeksi >= kediLightboxMedyalari.length) kediMevcutMedyaIndeksi = 0;
    if (kediMevcutMedyaIndeksi < 0) kediMevcutMedyaIndeksi = kediLightboxMedyalari.length - 1;
    kediLightboxMedyasiniGoster();
}

// ==========================================
// 2. SAZLAR VE MODALLAR
// ==========================================
function sazlarModalAc() {
    var m = document.getElementById("sazlarModal");
    if(m) { m.style.display = "block"; document.body.style.overflow = "hidden"; }
}

function sazlarModalKapat() {
    var m = document.getElementById("sazlarModal");
    if(m) { m.style.display = "none"; document.body.style.overflow = "auto"; }
}

function atolyeModalAc() {
    var m = document.getElementById("atolyeModal");
    if(m) { m.style.display = "block"; document.body.style.overflow = "hidden"; }
}

function atolyeModalKapat() {
    var m = document.getElementById("atolyeModal");
    if(m) { m.style.display = "none"; document.body.style.overflow = "auto"; }
}

function gizliModalAc() {
    var m = document.getElementById("gizliSazModal");
    if(m) m.style.display = "block";
}

function gizliModalKapat() {
    var m = document.getElementById("gizliSazModal");
    if(m) m.style.display = "none";
}

var sazVerileri = {
    ruzba: { baslik: "🪕 Ruzba (Kadim Cep Sazı)", tekne: "Tekne: Ardıç / Dut", kapak: "Kapak: Yerli Ladin", frekans: "Yüksek Frekans / Tiz", hikaye: "Bağlama ailesinin bilinen en küçük ve en eski parmak vurumu üyelerinden biridir." },
    cura: { baslik: "🪕 Cura (Atölyenin Haylazı)", tekne: "Tekne: Dut Ağacı", kapak: "Kapak: Kanada Ladini", frekans: "432 Hz", hikaye: "Atölyede artan minik parçalardan üretildi." },
    kisasap: { baslik: "🪕 Kısa Sap Bağlama", tekne: "Yaprak Dut", kapak: "Yerli Çam", frekans: "432 Hz", hikaye: "Sabah çayı eşliğinde tıngırdatılır." },
    dede: { baslik: "🪕 Dede Sazı", tekne: "Oyma Ceviz", kapak: "Yaşlı Ladin", frekans: "Pençe Düzeni", hikaye: "Perdesiz, kadim saz." },
    uzunsap: { baslik: "🪕 Uzun Sap Bağlama", tekne: "Yaprak Ardıç", kapak: "Artvin Ladini", frekans: "Kara Düzen", hikaye: "İnanılmaz bir bas derinliği var." },
    divan: { baslik: "🪕 Divan Sazı", tekne: "Maun & Kelebek", kapak: "Sedir", frekans: "Kalın Re", hikaye: "Atölyenin en büyük sazı." },
    meydan: { baslik: "🪕 Meydan Sazı (Atölyenin Reisi)", tekne: "Tekne: Ağır Kestane / Oyma Ceviz", kapak: "Kapak: Kalın Lifli Ladin", frekans: "Kaba Düzen / Davudi", hikaye: "Meydanlarda sesi en arkaya kadar gür çıksın diye devasa üretilen, en uzun saplı baş saz." }
};

function sazModalAc(sazAnahtari) {
    var saz = sazVerileri[sazAnahtari];
    var modal = document.getElementById("sazModal");
    var icerik = document.getElementById("sazModalIcerik");
    if(!saz || !modal || !icerik) return;
    
    icerik.innerHTML = `
        <span class="kapat-butonu" onclick="sazModalKapat()">&times;</span>
        <h2 style="color: #8c2d19; text-align: center; font-size: 2.2rem; margin-bottom: 20px;">${saz.baslik}</h2>
        <div class="saz-kimlik">
            <div class="kimlik-satir"><strong>Ağaç ve Tekne Yapısı:</strong> ${saz.tekne}</div>
            <div class="kimlik-satir"><strong>Ses Tahtası (Kapak):</strong> ${saz.kapak}</div>
            <div class="kimlik-satir"><strong>Akort ve Frekans Standardı:</strong> ${saz.frekans}</div>
            <div class="kimlik-satir" style="border-bottom:none; margin-top:20px; line-height:1.6;">
                <strong>Atölye Hikayesi & Karakteri:</strong><br>${saz.hikaye}
            </div>
        </div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// Ortak Modal Kapatma (Kuş Kitapçıkları ve Sazlar için) - İÇ İÇE MODAL DÜZELTMESİ EKLENDİ
function sazModalKapat() { 
    var modal = document.getElementById("sazModal");
    if(modal) modal.style.display = "none"; 
    
    // Eğer arkada Sazlar Modalı veya Gizli Modal hala açıksa sayfa scrollunu açma!
    var sazlarM = document.getElementById("sazlarModal");
    var gizliM = document.getElementById("gizliSazModal");
    
    var isParentOpen = (sazlarM && sazlarM.style.display === "block") || 
                       (gizliM && gizliM.style.display === "block");
                       
    if (!isParentOpen) {
        document.body.style.overflow = "auto"; 
    }
}

// ==========================================
// 3. US REİS DÜŞÜNCE BALONU
// ==========================================
const usReplikleri = [
    "Alaplı esnafı 'Us Reis sabah şeriflerin hayrolsun' diyor... Dükkanı erken açmasak enikler aç kalacak.",
    "Şimdiki nesil hep hazır mama peşinde. Biz gençken Us derlerdi bana, Akçakoca'ya otostop çekerdik be!",
    "Yaz gelse de Us Reis derecede bi çimse... Tüylerim sıcaktan keçeleşti iyice.",
    "Dün karşı mahallenin çomarı bana hırladı. Us Reis'i unutanlara sol kroşeyi hatırlattım.",
    "Eve 4 ekmek götürmek kolay değil. Çarşıda siftah yok daha, Us dükkanın başında bekliyor.",
    "Yine kulaklarım kaşınıyor... Kesin çarşıda yeni bir kavga patlayacak, Us hissettiyse doğrudur.",
    "Gençken bir otostop maceram var, kamyoncu abi 'Vay Us oğlum gel' deyip bisküvi vermişti... Hey gidi günler.",
    "Deredeki o serin sular... Şöyle bir cup diye atasım var kendimi ama yavrular evde ekmek bekler.",
    "Sabah çarşıda dükkanı açarken bizim kasap 'Us yine erkencisin' dedi. Kemik atsa bari..."
];

function usDusunceUret() {
    const balon = document.getElementById("usBalon");
    if(balon) {
        const rastgeleReplik = usReplikleri[Math.floor(Math.random() * usReplikleri.length)];
        balon.innerText = rastgeleReplik;
    }
}

// ==========================================
// 4. KUŞ KİTAPÇIKLARI
// ==========================================
const kitapcikVerileri = {
    "alauveyik": ["33.png", "34.png", "35.png", "36.png", "37.png", "38.png", "39.png"],
    "baykus": ["61.png", "62.png", "63.png", "64.png", "65.png", "66.png", "67.png"],
    "bulbul": ["47.png", "48.png", "49.png", "50.png", "51.png", "52.png", "53.png"],
    "dogan": ["40.png", "41.png", "42.png", "43.png", "44.png", "45.png", "46.png"],
    "hudhud": ["54.png", "55.png", "56.png", "57.png", "58.png", "59.png", "60.png"],
    "huma": ["68.png", "69.png", "70.png", "71.png", "72.png", "73.png", "74.png"],
    "keklik": ["26.png", "27.png", "28.png", "29.png", "30.png", "31.png", "32.png"],
    "kumru": ["100.png", "101.png", "102.png", "96.png", "97.png", "98.png", "99.png"],
    "kuslarana": ["10.png", "11.png", "1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png"],
    "kuyruksallayan": ["12.png", "13.png", "14.png", "15.png", "16.png", "17.png", "18.png"],
    "leylek": ["82.png", "83.png", "84.png", "85.png", "86.png", "87.png", "88.png"],
    "papagan": ["19.png", "20.png", "21.png", "22.png", "23.png", "24.png", "25.png"],
    "tavus": ["75.png", "76.png", "77.png", "78.png", "79.png", "80.png", "81.png"],
    "turna": ["89.png", "90.png", "91.png", "92.png", "93.png", "94.png", "95.png"]
};

function kitapcikAc(kusKodu) {
    const modalIcerik = document.getElementById('sazModalIcerik');
    const modal = document.getElementById('sazModal');
    
    if(!modalIcerik || !modal || !kitapcikVerileri[kusKodu]) return;
    
    modalIcerik.innerHTML = `<span class="kapat-butonu" onclick="sazModalKapat()" style="position: sticky; top: 0; display: block; text-align: right; cursor: pointer;">&times;</span>`;

    kitapcikVerileri[kusKodu].forEach(dosya => {
        const img = document.createElement('img');
        img.src = `/gorseller/kitapcik/${kusKodu}/${dosya}`;
        img.style.width = '100%';
        img.style.display = 'block';
        modalIcerik.appendChild(img);
    });

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// ==========================================
// 5. EVENT LISTENERS (TIKLAMALAR VE YÜKLEMELER)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    
    // Kediler Modal Dinleyicileri
    var kediModal = document.getElementById("kediModal");
    var kediButon = document.getElementById("kediButon");
    var kediKapat = document.getElementById("modalKapat");
    
    if (kediButon && kediModal) {
        kediButon.onclick = function() { kediModal.style.display = "block"; document.body.style.overflow = "hidden"; }
    }
    if (kediKapat && kediModal) {
        kediKapat.onclick = function() { kediModal.style.display = "none"; document.body.style.overflow = "auto"; }
    }

    // Hikaye (Story) Modülü Dinleyicileri
    var hikayeDosyalari = window.dinamikHikayeDosyalari || []; 
    var aktifMedyaIndex = 0;
    var dizinYolu = "/gorseller/hikaye/yayin/";

    var storyModal = document.getElementById("storyModal");
    var storyButon = document.getElementById("storyButon");
    var storyKapat = document.getElementById("storyKapat");
    var storyHalka = document.getElementById("storyHalka");
    var medyaAlani = document.getElementById("dinamikMedyaAlani");
    var oncekiBtn = document.getElementById("storyOnceki");
    var sonrakiBtn = document.getElementById("storySonraki");

    function medyayiGoster(index) {
        if (hikayeDosyalari.length === 0 || !medyaAlani) return;
        
        var dosyaAdi = hikayeDosyalari[index];
        var dosyaUzantisi = dosyaAdi.split('.').pop().toLowerCase();
        var tamYol = dizinYolu + dosyaAdi;
        
        medyaAlani.innerHTML = ""; 
        
        if (dosyaUzantisi === 'mp4' || dosyaUzantisi === 'webm' || dosyaUzantisi === 'ogg') {
            medyaAlani.innerHTML = '<video src="' + tamYol + '" autoplay playsinline style="max-width: 100%; max-height: 60vh; border-radius: 8px;"></video>';
        } else {
            medyaAlani.innerHTML = '<img src="' + tamYol + '" style="max-width: 100%; max-height: 60vh; border-radius: 8px; object-fit: contain;">';
        }
        
        if (oncekiBtn) oncekiBtn.style.display = (index === 0) ? "none" : "block";
        if (sonrakiBtn) sonrakiBtn.style.display = (index === hikayeDosyalari.length - 1) ? "none" : "block";
    }

    if (storyButon) {
    // 1. ZAMAN KONTROLÜNÜ TAMAMEN SİLİYORUZ
    // Artık 24 saat kuralı veya yayinTarihiString kontrolü yok.
    
    // 2. İZLENME DURUMUNU YEREL DOSYA LİSTESİNE GÖRE YÖNETİYORUZ
    // Eğer klasördeki dosya sayısı değişmişse kullanıcıya bildirim göstermeliyiz
    var dosyaSayisi = window.dinamikHikayeDosyalari.length;
    var eskiDosyaSayisi = localStorage.getItem("story_dosya_sayisi");

    if (eskiDosyaSayisi && parseInt(eskiDosyaSayisi) < dosyaSayisi && storyHalka) {
        // Yeni dosya gelmiş, halkayı aktif yap
        storyHalka.classList.remove("story-pasif");
    }

    storyButon.onclick = function() { 
        if(storyModal) {
            storyModal.style.display = "block"; 
            document.body.style.overflow = "hidden"; 
        }
        
        // İzlendi olarak işaretle (dosya sayısını saklıyoruz)
        if (storyHalka) storyHalka.classList.add("story-pasif"); 
        localStorage.setItem("story_dosya_sayisi", dosyaSayisi); 
        
        aktifMedyaIndex = 0;
        medyayiGoster(aktifMedyaIndex);
    };
}

    if (oncekiBtn) oncekiBtn.onclick = function() { if (aktifMedyaIndex > 0) medyayiGoster(--aktifMedyaIndex); };
    if (sonrakiBtn) sonrakiBtn.onclick = function() { if (aktifMedyaIndex < hikayeDosyalari.length - 1) medyayiGoster(++aktifMedyaIndex); };

    if (storyKapat && storyModal) {
        storyKapat.onclick = function() { 
            storyModal.style.display = "none"; 
            document.body.style.overflow = "auto"; 
            if(medyaAlani) medyaAlani.innerHTML = ""; 
        };
    }

    // Modal Dışına Tıklanınca Kapanma Kontrolü
    window.onclick = function(event) {
        var sazlarM = document.getElementById("sazlarModal");
        var gizliM = document.getElementById("gizliSazModal");
        var tekilM = document.getElementById("sazModal");
        var atolyeM = document.getElementById("atolyeModal");
        var guestbookM = document.getElementById("guestbookModal");
        var adminM = document.getElementById("adminModal");
        
        if (event.target == kediModal) { kediModal.style.display = "none"; document.body.style.overflow = "auto"; }
        if (event.target == storyModal) { storyModal.style.display = "none"; document.body.style.overflow = "auto"; }
        if (event.target == sazlarM) { sazlarM.style.display = "none"; document.body.style.overflow = "auto"; }
        if (event.target == gizliM) { gizliM.style.display = "none"; document.body.style.overflow = "auto"; }
        if (event.target == tekilM) { sazModalKapat(); } // İç içe modal kapama fonksiyonunu çağırıyoruz
        if (event.target == atolyeM) { atolyeM.style.display = "none"; document.body.style.overflow = "auto"; }
        if (event.target == guestbookM) { guestbookM.style.display = "none"; document.body.style.overflow = "auto"; }
        if (event.target == adminM) { adminM.style.display = "none"; }
    }

    // ==========================================
    // EKLENEN YENİ ÖZELLİK: MOBİL SWIPE (KAYDIRMA) DESTEĞİ
    // ==========================================
    var touchStartX = 0;
    var touchEndX = 0;

    function handleSwipeGesture(yonFonksiyonuSol, yonFonksiyonuSag) {
        if (touchEndX < touchStartX - 40) yonFonksiyonuSag(); // Sola kaydırma (Sonraki)
        if (touchEndX > touchStartX + 40) yonFonksiyonuSol(); // Sağa kaydırma (Önceki)
    }

    // Kedi Lightbox Swipe
    var kediLightbox = document.getElementById("kediLightboxArkaPlan");
    if (kediLightbox) {
        kediLightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
        kediLightbox.addEventListener('touchend', e => { 
            touchEndX = e.changedTouches[0].screenX; 
            handleSwipeGesture(
                () => kediLightboxMedyasiniDegistir(-1),
                () => kediLightboxMedyasiniDegistir(1)
            );
        }, {passive: true});
    }

    // Hikaye Modal Swipe
    if (storyModal) {
        storyModal.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
        storyModal.addEventListener('touchend', e => { 
            touchEndX = e.changedTouches[0].screenX; 
            handleSwipeGesture(
                () => { if (oncekiBtn && oncekiBtn.style.display !== "none") oncekiBtn.click(); },
                () => { if (sonrakiBtn && sonrakiBtn.style.display !== "none") sonrakiBtn.click(); }
            );
        }, {passive: true});
    }
});

// ==========================================
// 6. KLAVYE KONTROLLERİ (ESC, SAĞ, SOL OKLAR)
// ==========================================
document.addEventListener("keydown", function(e) {
    // Kedi Lightbox Kontrolleri
    var lb = document.getElementById("kediLightboxArkaPlan");
    if (lb && lb.style.display === "flex") {
        if (e.key === "ArrowRight") kediLightboxMedyasiniDegistir(1);
        else if (e.key === "ArrowLeft") kediLightboxMedyasiniDegistir(-1);
        else if (e.key === "Escape") kediLightboxKapat();
    }

    // Story Modal Kontrolleri
    var storyM = document.getElementById("storyModal");
    if (storyM && storyM.style.display === "block") {
        if (e.key === "ArrowLeft") {
            var btnO = document.getElementById("storyOnceki");
            if(btnO && btnO.style.display !== "none") btnO.click();
        }
        if (e.key === "ArrowRight") {
            var btnS = document.getElementById("storySonraki");
            if(btnS && btnS.style.display !== "none") btnS.click();
        }
    }
});