const mineflayer = require('mineflayer');
const baritonePlugin = require('mineflayer-baritone');
const vec3 = require('vec3');

// ================= AYARLAR =================
const AYARLAR = {
    host: '6b6t.org',             // Sunucu IP'si
    port: 25565,                  // Sunucu Portu
    username: 'AnarsiBotu',       // Botun Oyundaki Adı
    sifre: 'GuvonliSifre123',     // Sunucu Giriş Şifresi
    sahip: 'SeninOyundakiAdin'    // Botu kontrol edecek kişinin (senin) adın
};
// ===========================================

function botuBaslat() {
    console.log(`[Sistem] ${AYARLAR.username} botu başlatılıyor...`);

    const bot = mineflayer.createBot({
        host: AYARLAR.host,
        port: AYARLAR.port,
        username: AYARLAR.username
    });

    // Baritone eklentisini yüklüyoruz
    bot.loadPlugin(baritonePlugin);

    // Bot sunucuya ilk bağlandığında (Giriş/Kayıt)
    bot.once('spawn', () => {
        console.log('[Sistem] Sunucuya bağlanıldı. Giriş yapılıyor...');
        bot.chat(`/register ${AYARLAR.sifre} ${AYARLAR.sifre}`);
        bot.chat(`/login ${AYARLAR.sifre}`);
    });

    // Sohbet komutlarını dinleme
    bot.on('chat', (username, message) => {
        if (username !== AYARLAR.sahip) return; // Sadece sahibini dinler

        console.log(`[Komut] ${username}: ${message}`);

        // Koordinata gitme komutu (Örn: git 100 70 -200)
        if (message.startsWith('git ')) {
            const kordinat = message.replace('git ', '').split(' ');
            if (kordinat.length === 3) {
                const x = parseInt(kordinat[0]);
                const y = parseInt(kordinat[1]);
                const z = parseInt(kordinat[2]);
                
                bot.chat(`[Bot] ${x}, ${y}, ${z} yönüne ilerliyorum.`);
                bot.baritone.goTo(new vec3(x, y, z));
            } else {
                bot.chat('[Bot] Hata! Kullanım: git X Y Z');
            }
        }

        // Blok kazma komutu (Örn: kaz diamond_ore)
        if (message.startsWith('kaz ')) {
            const blokAdi = message.replace('kaz ', '').trim();
            bot.chat(`[Bot] ${blokAdi} aranıyor ve kazılıyor...`);
            bot.baritone.mine(blokAdi);
        }

        // Durdurma komutu (Örn: dur)
        if (message === 'dur') {
            bot.chat('[Bot] İşlem durduruldu.');
            bot.baritone.stop();
        }
    });

    // Otomatik Yeniden Bağlanma (Anti-Disconnect)
    bot.on('end', (reason) => {
        console.log(`[Bağlantı Kesildi] Sebep: ${reason}`);
        console.log('[Sistem] 10 saniye sonra otomatik olarak yeniden bağlanılacak...');
        setTimeout(botuBaslat, 10000);
    });

    bot.on('error', (err) => console.error('[Hata]', err));
}

// Botu tetikle
botuBaslat();
