import { API_URL } from "./config.js";


// Günün Menüsü Verisini Çek ve Göster
async function loadTodayMenu() {
    try {
        const response = await fetch(`${API_URL}/api/gunun-menusu`);
        const data = await response.json();

        console.log(data); // Veri kontrolü

        if (data.success && data.menu) {
            const gununMenusu = document.getElementById("gunun-menusu");
            gununMenusu.innerHTML = ""; // Mevcut içeriği temizle

            const { corba, anaYemek, yardimciYemek, ekstra, corba_gramaj, corba_kalori, anaYemek_gramaj, anaYemek_kalori, yardimciYemek_gramaj, yardimciYemek_kalori, ekstra_gramaj, ekstra_kalori } = data.menu;

            // 2x2 Grid ve dinamik resimler
            const gridHTML = `
                <div class="menu-item">
                    <img src="images/corba.png" alt="Çorba Resmi">
                    <p>${corba}</p>
                    <p>${corba_gramaj}g - ${corba_kalori} kcal</p>
                </div>
                <div class="menu-item">
                    <img src="images/ana-yemek.png" alt="Ana Yemek Resmi">
                    <p>${anaYemek}</p>
                    <p>${anaYemek_gramaj}g - ${anaYemek_kalori} kcal</p>
                </div>
                <div class="menu-item">
                    <img src="images/yardimci-yemek.png" alt="Yardımcı Yemek Resmi">
                    <p>${yardimciYemek}</p>
                    <p>${yardimciYemek_gramaj}g - ${yardimciYemek_kalori} kcal</p>
                </div>
                <div class="menu-item">
                    <img src="images/ekstra.png" alt="Ekstra Resmi">
                    <p>${ekstra}</p>
                    <p>${ekstra_gramaj}g - ${ekstra_kalori} kcal</p>
                </div>
            `;

            gununMenusu.innerHTML = gridHTML;
        } else {
            document.getElementById("gunun-menusu").innerHTML = "<p>Günün menüsü bulunamadı.</p>";
        }
    } catch (error) {
        console.error("Günün menüsü yüklenirken hata:", error);
        document.getElementById("gunun-menusu").innerHTML = "<p>Menü yüklenirken bir hata oluştu.</p>";
    }
}


// İlerleyen Günler Verisini Çek ve Göster
async function loadUpcomingMenus() {
    try {
        const response = await fetch(`${API_URL}/api/ilerleyen-gunler`);
        const data = await response.json();

        if (data.success && Array.isArray(data.menu)) {
            const ilerleyenGunler = document.getElementById("ilerleyen-gunler");
            ilerleyenGunler.innerHTML = ""; // Mevcut içeriği temizle

            data.menu.forEach((menu) => {
                const tarih = new Date(menu.tarih);
                const gun = tarih.toLocaleDateString("tr-TR", { weekday: "long" }); // Günü al

                const dayCard = document.createElement("div");
                dayCard.className = "day-card";

                // Kart içeriği
                dayCard.innerHTML = `
                    <h3>${menu.tarih.split("T")[0]} (${gun})</h3>
                    <p><strong></strong> ${menu.corba}</p>
                    <p><strong></strong> ${menu.anaYemek}</p>
                    <p><strong></strong> ${menu.yardimciYemek}</p>
                    <p><strong></strong> ${menu.ekstra}</p>
                `;
                ilerleyenGunler.appendChild(dayCard);
            });
        } else {
            document.getElementById("ilerleyen-gunler").innerHTML = "<p>İlerleyen günler için menü bulunamadı.</p>";
        }
    } catch (error) {
        console.error("İlerleyen günler yüklenirken hata:", error);
        document.getElementById("ilerleyen-gunler").innerHTML = "<p>Menü yüklenirken bir hata oluştu.</p>";
    }
}




// Sayfa yüklendiğinde menüleri yükle
document.addEventListener("DOMContentLoaded", () => {
    // Günün Menüsü ve İlerleyen Günler Yükleniyor
    loadTodayMenu();
    loadUpcomingMenus();

    // Yetkili İşlemleri Butonu için Tıklama Olayı
    const yetkiliButton = document.getElementById("yetkiliButton");
    if (yetkiliButton) {
        yetkiliButton.addEventListener("click", () => {
            navigateTo("admin-giris.html"); // Admin giriş sayfasına yönlendirme
        });
    } else {
        console.error("Yetkili işlemleri butonu bulunamadı!");
    }
});

function navigateTo(url) {
    window.location.href = url; // Belirtilen URL'ye yönlendirir
}
document.addEventListener("DOMContentLoaded", () => {
    const commentForm = document.getElementById("comment-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const commentInput = document.getElementById("comment");
    const commentList = document.getElementById("comment-list");

    const verifyStatus = document.createElement("p");
    verifyStatus.id = "verify-status";
    commentForm.insertBefore(verifyStatus, commentForm.firstChild);

    let isUserVerified = false; // Kullanıcının doğrulanıp doğrulanmadığını takip etmek için değişken

    // Kullanıcı doğrulama
    emailInput.addEventListener("blur", async () => {
        const email = emailInput.value.trim();
        if (email) {
            try {
                const response = await fetch(`${API_URL}/kullanicilar`);
                const data = await response.json();

                if (data.success) {
                    const userExists = data.users.some(user => user.email === email);
                    if (userExists) {
                        isUserVerified = true;
                        verifyStatus.textContent = "Kullanıcı doğrulandı ✅";
                        verifyStatus.style.color = "green";
                        nameInput.disabled = false;
                        commentInput.disabled = false;
                        commentForm.querySelector("button").disabled = false;

                        // Beğeni ve beğenmeme butonlarını etkinleştir
                        document.querySelectorAll(".like-button, .dislike-button").forEach(button => {
                            button.disabled = false;
                        });

                        // Yeşil efekt ekle
                        emailInput.classList.add("verified");
                        nameInput.classList.add("verified");
                        commentInput.classList.add("verified");
                    } else {
                        resetVerification();
                        verifyStatus.textContent = "Kullanıcı bulunamadı ❌";
                        verifyStatus.style.color = "red";
                    }
                }
            } catch (error) {
                console.error("Kullanıcı doğrulama hatası:", error);
                resetVerification();
                verifyStatus.textContent = "Doğrulama sırasında bir hata oluştu!";
                verifyStatus.style.color = "red";
            }
        }
    });

    function resetVerification() {
        isUserVerified = false;
        nameInput.disabled = true;
        commentInput.disabled = true;
        commentForm.querySelector("button").disabled = true;

        // Beğeni butonlarını devre dışı bırak
        document.querySelectorAll(".like-button, .dislike-button").forEach(button => {
            button.disabled = true;
        });

        // Yeşil efekti kaldır
        emailInput.classList.remove("verified");
        nameInput.classList.remove("verified");
        commentInput.classList.remove("verified");
    }

    // Yorum gönderme
    commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const isim = nameInput.value.trim();
        const eposta = emailInput.value.trim();
        const yorum = commentInput.value.trim();

        if (!isim || !eposta || !yorum) {
            alert("Lütfen tüm alanları doldurunuz!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/yorum-ekle`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isim, eposta, yorum })
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                alert("Yorumunuz başarıyla eklendi!");
                commentInput.value = ""; // Yorum alanını temizle
                loadComments(); // Yorumları yeniden yükle
            } else {
                alert("Yorum eklenemedi: " + data.message);
            }
        } catch (error) {
            console.error("Yorum gönderme hatası:", error);
            alert("Yorum gönderilirken bir hata oluştu!");
        }
    });

    // Yorumları yükle
    async function loadComments() {
        try {
            const response = await fetch(`${API_URL}/yorumlar`);
            const data = await response.json();
    
            if (data.success) {
                commentList.innerHTML = ""; // Mevcut yorumları temizle
                data.yorumlar.forEach(yorum => {
                    const commentItem = document.createElement("div");
                    commentItem.classList.add("comment-item");
                    commentItem.innerHTML = `
                        <p><strong>${yorum.isim}</strong> (${yorum.eposta}):</p>
                        <p>${yorum.yorum}</p>
                        <div class="comment-actions">
                            <button class="like-button" data-id="${yorum.id}" data-action="like">👍 ${yorum.begeni || 0}</button>
                            <button class="dislike-button" data-id="${yorum.id}" data-action="dislike">👎 ${yorum.begenmeme || 0}</button>
                        </div>
                    `;
                    commentList.appendChild(commentItem);
                });
    
                // Beğeni ve beğenmeme butonlarına olay dinleyiciler ekle
                document.querySelectorAll(".like-button, .dislike-button").forEach(button => {
                    button.addEventListener("click", async (e) => {
                        const yorumId = e.target.getAttribute("data-id");
                        const action = e.target.getAttribute("data-action");
                        await handleLikeDislike(yorumId, action);
                    });
                });
            } else {
                commentList.innerHTML = `<p>Henüz yorum bulunmamaktadır.</p>`;
            }
        } catch (error) {
            console.error("Yorumları yükleme hatası:", error);
            commentList.innerHTML = `<p>Yorumlar yüklenirken bir hata oluştu!</p>`;
        }
    }
    
    async function handleLikeDislike(yorumId, action) {
        try {
            const response = await fetch(`${API_URL}/yorum-begeni`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ yorumId, action })
            });
    
            const data = await response.json();
            if (data.success) {
                loadComments(); // Yorumları yeniden yükle
            } else {
                alert("İşlem başarısız: " + data.message);
            }
        } catch (error) {
            console.error("Beğeni/begenmeme hatası:", error);
            alert("Bir hata oluştu!");
        }
    }
    

    // Sayfa yüklendiğinde yorumları çek
    loadComments();
});
