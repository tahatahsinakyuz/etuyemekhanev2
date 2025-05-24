import { API_URL } from "./config.js";

// Kullanıcı Bilgilerini Yükleme
async function loadUserInfo() {
    const email = localStorage.getItem("email");

    if (!email) {
        alert("Yetkisiz giriş! Lütfen giriş yapın.");
        window.location.href = "kullanici-dogrulama.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/kullanici-bilgileri`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.success) {
            document.querySelector(".user-info").innerHTML = `
                <p><strong>Ad Soyad:</strong> ${data.kullanici.ad} ${data.kullanici.soyad}</p>
                <p><strong>Okul No:</strong> ${data.kullanici.okul_no || data.kullanici.id}</p>
            `;
            document.querySelector(".balance-info").innerHTML = `
                <p><strong>Bakiye:</strong> ${parseFloat(data.kullanici.bakiye).toFixed(2)} TL</p>
            `;
        } else {
            alert("Kullanıcı bilgileri alınamadı! Lütfen tekrar giriş yapın.");
            window.location.href = "kullanici-dogrulama.html";
        }
    } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata:", error);
    }
}

// Bakiye Yükleme Fonksiyonu (İSİM DEĞİŞTİRİLDİ!)
async function handleBalanceTopUp() {
    const email = localStorage.getItem("email");
    const cardNumber = document.getElementById("card-number").value.trim();
    const expiryDate = document.getElementById("expiry-date").value.trim();
    const cvc = document.getElementById("cvc").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);

    if (!email || !cardNumber || !expiryDate || !cvc || isNaN(amount)) {
        alert("Lütfen tüm bilgileri eksiksiz doldurun!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/bakiye-yukle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                kart_numarasi: cardNumber,
                son_kullanma_tarihi: expiryDate,
                cvc,
                yuklenecek_tutar: amount
            }),
        });

        const data = await response.json();

        if (data.success) {
            alert("Bakiye başarıyla yüklendi!");
            closeTopUpForm();
        } else {
            alert(data.message || "Bakiye yükleme başarısız oldu!");
        }
    } catch (error) {
        console.error("Bakiye yükleme hatası:", error);
        alert("Sunucu hatası! Daha sonra tekrar deneyin.");
    }
}

// Bakiye Geçmişini Yükle
async function loadBalanceHistory() {
    const email = localStorage.getItem("email");

    if (!email) {
        alert("Yetkisiz giriş! Lütfen giriş yapın.");
        window.location.href = "kullanici-dogrulama.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/bakiye-gecmisi?email=${email}`);
        const data = await response.json();

        if (data.success) {
            const transactionContainer = document.querySelector(".transaction-cards");
            transactionContainer.innerHTML = ""; // Önceki içeriği temizle

            data.gecmis.forEach(item => {
                const formattedDate = formatDate(item.tarih);

                const card = document.createElement("div");
                card.className = `card ${item.islem_tipi && item.islem_tipi.includes("Harcama") ? "red" : "green"}`;
                card.innerHTML = `
                    <p><strong>Tarih:</strong> ${formattedDate}</p>
                    <p><strong>Saat:</strong> ${item.saat || "Bilinmiyor"}</p>
                    <p><strong>İşlem:</strong> ${item.islem_tipi}</p>
                    <p><strong>Tutar:</strong> ${item.tutar} TL</p>
                `;
                transactionContainer.appendChild(card);
            });
        } else {
            document.querySelector(".transaction-cards").innerHTML = `<p>Bakiye geçmişi bulunamadı!</p>`;
        }
    } catch (error) {
        console.error("Bakiye geçmişi yüklenirken hata:", error);
        alert("Sunucu hatası! Daha sonra tekrar deneyin.");
    }
}

// Tarih Formatlama
function formatDate(tarih) {
    const date = new Date(tarih);
    if (isNaN(date.getTime())) return "Geçersiz Tarih";
    return date.toLocaleString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

// Bakiye Yükleme Formunu Açma
function openTopUpForm() {
    document.getElementById("top-up-form").style.display = "block";
}

// Bakiye Yükleme Formunu Kapatma
function closeTopUpForm() {
    document.getElementById("top-up-form").style.display = "none";
}

// DOM Yükleme
document.addEventListener("DOMContentLoaded", async () => {
    await loadUserInfo();
    await loadBalanceHistory();

    const topUpForm = document.getElementById("top-up-form");
    if (topUpForm) {
        topUpForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await handleBalanceTopUp();
            await loadUserInfo();
            await loadBalanceHistory();
        });
    }
});
