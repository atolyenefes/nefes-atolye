// Atölye Ziyaretçi Defteri - Dinamik Sayfa Kırılımlı Gelişmiş Motor
const ADMIN_PASSWORD = "1234"; // 🔑 Atölye Giriş Şifren

// 🚀 SUPABASE BAĞLANTISI (YENİ)
const supabaseUrl = 'https://mwrawwxqqdkqkurbpnod.supabase.co';
const supabaseKey = 'sb_publishable_MNMl2Ifg6j-_2LltNpPk7g_OXMWGFCf';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let allNotes = [];
let bookPages = [[]];
const notesPerPage = 4; 
let currentSpread = 1;  
let maxSpread = 1;
let currentUserIP = "Yükleniyor..."; 

// DOM Elemanları
const flippablePage = document.getElementById("flippablePage");
const guestbookForm = document.getElementById("guestbookForm");
const guestbookModal = document.getElementById("guestbookModal");
const adminModal = document.getElementById("adminModal");

// 🌐 ARKA PLANDA IP ADRESİNİ YAKALAMA MOTORU
function fetchUserIP() {
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => { currentUserIP = data.ip; })
        .catch(err => { currentUserIP = "127.0.0.1"; });
}

// 📦 BULUT ARŞİV DEPOLAMA SİSTEMİ (Supabase) - GÜNCELLENDİ
async function loadArchivedNotes() {
    const { data, error } = await supabase
        .from('ziyaretci_defteri')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Buluttan veriler çekilirken hata oluştu:", error);
        allNotes = [];
    } else if (data && data.length > 0) {
        allNotes = data.map(row => {
            const dateObj = new Date(row.created_at);
            const tarihMuhu = `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${dateObj.getFullYear()}`;
            
            return {
                id: row.id, 
                nickname: row.nickname,
                note: row.note,
                date: tarihMuhu,
                ip: row.ip_address,
                forceNewPage: row.yeni_sayfa // <-- BURASI DÜZELTİLDİ
            };
        });
    } else {
        allNotes = [];
    }

    calculateBookLayout();
    currentSpread = maxSpread; 
    renderCurrentSpread();
}

// 📐 DİNAMİK SAYFA KIRILIM HESAPLAMA MOTORU (Orijinal)
function calculateBookLayout() {
    bookPages = [[]];
    let currentPageIndex = 0;

    allNotes.forEach((note) => {
        if (bookPages[currentPageIndex].length >= notesPerPage || (note.forceNewPage && bookPages[currentPageIndex].length > 0)) {
            bookPages.push([]);
            currentPageIndex++;
        }
        bookPages[currentPageIndex].push(note);
    });

    const totalHistoryPages = bookPages.length;
    maxSpread = Math.ceil((totalHistoryPages + 1) / 2);
    if (maxSpread < 1) maxSpread = 1;
}

// 📖 ÖNLÜ ARKALI SAYFA YAZDIRMA MOTORU (Orijinal)
function renderCurrentSpread() {
    calculateBookLayout();

    const leftPageNum = (currentSpread - 1) * 2 + 1;
    const rightPageNum = (currentSpread - 1) * 2 + 2;
    const lastPageNum = maxSpread * 2;

    const getPageNotesHTML = (pageNum) => {
        if (pageNum === lastPageNum) return ''; 
        const pageNotes = bookPages[pageNum - 1] || [];
        
        return pageNotes.map(note => `
            <div class="museum-note-row" style="margin-bottom: 8px; line-height: 1.4; padding-bottom: 4px; font-family: 'Caveat', 'Dancing Script', 'Brush Script MT', cursive;">
                <span class="museum-date" style="font-size: 0.85rem; color: #9c786c; margin-right: 6px; font-family: 'Georgia', serif;">[${note.date || ''}]</span>
                
                <span class="museum-user-name" style="font-size: 1.6rem; color: #5d4037; margin-right: 5px; font-weight: bold;">
                    ✒️ ${note.nickname || 'Gizemli Misafir'}:
                </span>
                
                <span style="font-size: 1.15rem; color: #2d1a15; font-weight: normal; letter-spacing: 0.2px;">${note.note || ''}</span>
            </div>
        `).join('');
    };

    const formContainer = document.getElementById("formPageContainer");
    const staticRightLines = document.getElementById("staticRightLines");

    if (currentSpread === maxSpread) {
        if (flippablePage) flippablePage.classList.add("turned");

        document.getElementById("flipBackLines").innerHTML = getPageNotesHTML(leftPageNum);
        document.getElementById("pageNumberBackLeft").innerText = `Sayfa: ${leftPageNum}`;

        if (formContainer) formContainer.classList.remove("hidden");
        if (staticRightLines) staticRightLines.classList.add("hidden");
        document.getElementById("pageNumberRight").innerText = `Sayfa: ${rightPageNum} (Mühür)`;
    } 
    else {
        if (flippablePage) flippablePage.classList.remove("turned");

        document.getElementById("staticLeftLines").innerHTML = getPageNotesHTML(leftPageNum);
        document.getElementById("pageNumberLeft").innerText = `Sayfa: ${leftPageNum}`;

        document.getElementById("flipFrontLines").innerHTML = getPageNotesHTML(rightPageNum);
        document.getElementById("pageNumberFrontRight").innerText = `Sayfa: ${rightPageNum}`;

        if (formContainer) formContainer.classList.add("hidden");
        if (staticRightLines) {
            staticRightLines.classList.remove("hidden");
            staticRightLines.innerHTML = getPageNotesHTML(rightPageNum);
        }
    }
}

function turnPage(direction) {
    if (!flippablePage) return;
    if (direction === "prev" && currentSpread > 1) {
        currentSpread--;
        renderCurrentSpread();
    } else if (direction === "next" && currentSpread < maxSpread) {
        currentSpread++;
        renderCurrentSpread();
    }
}

// ZİYARETÇİ NOT KAYDETME SİSTEMİ - GÜNCELLENDİ (async)
if (guestbookForm) {
    guestbookForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const nicknameInput = document.getElementById("nickname");
        const noteInput = document.getElementById("note");
        const forceNewPageCheckbox = document.getElementById("forceNewPage");

        if (!nicknameInput.value.trim() || !noteInput.value.trim()) return;

        const isForceNewPage = forceNewPageCheckbox ? forceNewPageCheckbox.checked : false;

        // Form gönderilirken butonu kilitleyebiliriz (opsiyonel ama sağlıklı)
        const submitBtn = guestbookForm.querySelector("button[type='submit']");
        if(submitBtn) submitBtn.disabled = true;

        // Supabase'e gönder
        const { data, error } = await supabase
            .from('ziyaretci_defteri')
            .insert([
                {
                    nickname: nicknameInput.value.trim(),
                    note: noteInput.value.trim(),
                    ip_address: currentUserIP,
                    yeni_sayfa: isForceNewPage // <-- BURASI DÜZELTİLDİ
                }
            ])
            .select();

        if (error) {
            alert("Atölye kayıt defterine yazarken bir hata oluştu. Lütfen tekrar dene.");
            console.error("Insert Error:", error);
            if(submitBtn) submitBtn.disabled = false;
            return;
        }

        // Başarılıysa alanları temizle
        nicknameInput.value = "";
        noteInput.value = "";
        if (forceNewPageCheckbox) forceNewPageCheckbox.checked = false;
        if(submitBtn) submitBtn.disabled = false;

        // Yeni veriyi ekranda göstermek için buluttan listeyi tazele
        await loadArchivedNotes();
    });
}

// 🛠 TEMİZLİKÇİ PANELİ MOTORU - GÜNCELLENDİ (Silme işlemi)
function renderAdminPanelNotes() {
    if (!adminModal) return;
    
    const adminContainer = document.getElementById("adminNotesContainer") || 
                           adminModal.querySelector(".admin-notes-list") || 
                           adminModal.querySelector(".museum-lines-container") ||
                           document.querySelector("[id*='notes']");
    
    if (!adminContainer) return;
    adminContainer.innerHTML = "";

    if (allNotes.length === 0) {
        adminContainer.innerHTML = "<p style='text-align:center; padding:20px; color:#888;'>Defterde henüz hiç anı birikmemiş...</p>";
        return;
    }

    allNotes.slice().reverse().forEach((note, index) => {
        const originalIndex = allNotes.length - 1 - index; 

        const row = document.createElement("div");
        row.className = "admin-note-item";
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px dashed rgba(0,0,0,0.1); gap:10px; color:#333;";
        
        const pageBadge = note.forceNewPage ? "📖 [Yeni Sayfa]" : "✒️ [Satır içi]";

        row.innerHTML = `
            <div style="flex-grow:1; text-align:left; font-size:0.9rem;">
                <span style="color:#777; font-size:0.8rem;">[${note.date}]</span> 
                <span style="color:#cc4444; font-size:0.8rem; font-weight:bold; margin-right:5px; background:rgba(204,68,68,0.1); padding:1px 5px; border-radius:3px;">🖥️ ${note.ip || 'Bilinmiyor'}</span>
                <span style="color:#55af55; font-size:0.75rem; margin-right:5px;">${pageBadge}</span>
                <strong>${note.nickname}:</strong> ${note.note}
            </div>
            <button class="admin-del-btn" data-id="${note.id}" style="background:#b93a3a; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px; font-size:0.8rem; flex-shrink:0;">Sil</button>
        `;
        adminContainer.appendChild(row);
    });

    // Supabase'den Silme İşlemi
    adminContainer.querySelectorAll(".admin-del-btn").forEach(btn => {
        btn.onclick = async function() {
            const dbId = this.getAttribute("data-id");
            if (confirm("Bu fısıltıyı defterden kalıcı olarak silmek istediğine emin misin?")) {
                
                const { error } = await supabase
                    .from('ziyaretci_defteri')
                    .delete()
                    .eq('id', dbId);

                if (error) {
                    alert("Silme işlemi başarısız oldu.");
                    console.error("Delete Error:", error);
                } else {
                    // Başarılıysa listeyi tazele
                    await loadArchivedNotes();
                    renderAdminPanelNotes(); 
                }
            }
        };
    });
}

// 🔐 ÇEKİRDEK OLAYLAR VE MODAL GEÇİTLERİ (Orijinal)
function setupCoreEvents() {
    const openBookBtn = document.querySelector(".museum-book-btn");
    const closeBookBtn = document.querySelector(".gb-close");
    const closeAdminBtn = document.querySelector(".gb-admin-close");
    const cleanerLoginBtn = document.getElementById("cleanerLoginBtn");

    if (openBookBtn && guestbookModal) {
        openBookBtn.onclick = () => {
            guestbookModal.style.display = "block";
            document.body.style.overflow = "hidden";
            // Modal açıldığında verileri her ihtimale karşı yeniden yükleyebiliriz
            loadArchivedNotes();
        };
    }

    if (closeBookBtn && guestbookModal) {
        closeBookBtn.onclick = () => {
            guestbookModal.style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    if (cleanerLoginBtn && adminModal) {
        cleanerLoginBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            adminModal.style.display = "block";
            adminModal.classList.remove("hidden");
            renderAdminPanelNotes();
        };
    }

    if (closeAdminBtn && adminModal) {
        closeAdminBtn.onclick = () => {
            adminModal.style.display = "none";
        };
    }

    if (adminModal) {
        const adminForm = adminModal.querySelector("form");
        const passwordInput = adminModal.querySelector("input[type='password']") || 
                              adminModal.querySelector("input[type='text']") || 
                              adminModal.querySelector("input");
        
        const loginBtn = adminModal.querySelector("[type='submit']") || 
                         adminModal.querySelector(".admin-login-btn") || 
                         Array.from(adminModal.querySelectorAll("button, a, input")).find(el => {
                             const text = (el.innerText || el.value || "").toLowerCase();
                             return text.includes("giriş") || text.includes("login");
                         });

        const verifyAndEnter = () => {
            if (passwordInput && passwordInput.value === ADMIN_PASSWORD) {
                const loginWrapper = adminModal.querySelector(".admin-login-area") || adminForm;
                if (loginWrapper) loginWrapper.style.display = "none";

                const contentWrapper = adminModal.querySelector(".admin-panel-content") || 
                                       document.getElementById("adminPanelContent") ||
                                       document.querySelector(".admin-notes-list");
                
                if (contentWrapper) {
                    contentWrapper.style.display = "block";
                    contentWrapper.classList.remove("hidden");
                }

                renderAdminPanelNotes();
                passwordInput.value = "";
            } else {
                alert("Hatalı Şifre! Atölye kapıları yabancılara kapalıdır. 🔑");
                if (passwordInput) passwordInput.value = "";
            }
        };

        if (adminForm) { adminForm.onsubmit = (e) => { e.preventDefault(); verifyAndEnter(); }; }
        if (loginBtn) { loginBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); verifyAndEnter(); }; }
    }

    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); turnPage("prev"); };
    if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); turnPage("next"); };

    // MOBİL SWIPE VE KLAVYE DESTEĞİ
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (guestbookModal) {
        guestbookModal.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        guestbookModal.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) turnPage("next");
            if (touchEndX > touchStartX + 50) turnPage("prev");
        }, { passive: true });
    }

    document.addEventListener("keydown", function(e) {
        if (guestbookModal && guestbookModal.style.display === "block") {
            if (e.key === "ArrowLeft") turnPage("prev");
            if (e.key === "ArrowRight") turnPage("next");
        }
    });
}

// Başlatıcı
document.addEventListener("DOMContentLoaded", () => {
    fetchUserIP(); 
    loadArchivedNotes(); // Sayfa yüklendiğinde verileri Supabase'den çek
    setupCoreEvents();
});