const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const readline = require('readline');

// Manuel yüklenen Baritone modül kontrolü
let baritonePlugin;
try {
    baritonePlugin = require('./node_modules/mineflayer-baritone');
} catch (e) {
    try {
        baritonePlugin = require('./node_modules/mineflayer-baritone-master');
    } catch (err) {
        console.log("[Hata] Baritone klasörü bulunamadı! Lütfen node_modules içine manuel attığından emin ol.");
        process.exit(1);
    }
}

// ================= AYARLAR =================
const AYARLAR = {
    host: '6b6t.org',             
    port: 25565,                  
    username: 'VuadasTpaBot1', // Botunun adı
    sifre: 'Ewdry3NgAF6h9',           // Botunun şifresi
    sahip: 'Vuadas'             // Oyundaki adın
};
// ===========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function botOlustur() {
    console.log('[Sistem] İnternet hazır şablonu yüklendi. 1.21.5 sürümü başlatılıyor...');
    
    const bot = mineflayer.createBot({
        host: AYARLAR.host,
        port: AYARLAR.port,
        username: AYARLAR.username,
        version: "1.21.5", 
        checkTimeoutInterval: 60000
    });

    // Baritone eklentisini bota enjekte ediyoruz
    bot.loadPlugin(baritonePlugin);

    // Bot doğduğunda tetiklenen ana döngü
    bot.once('spawn', () => {
        console.log('[Hazır Kod] Bot başarıyla doğdu. Komutlar sırayla gönderiliyor...');
        
        // Kimlik doğrulama komutları (Lobi korumaları için)
        setTimeout(() => bot.chat(`/register ${AYARLAR.sifre} ${AYARLAR.sifre}`), 1500);
        setTimeout(() => bot.chat(`/login ${AYARLAR.sifre}`), 3000);
        
        // Otomatik Portal Algılayıcı ve Baritone Koşucusu
        setTimeout(() => {
            console.log('[Baritone] Tarayıcı başlatıldı: Lobi portalı aranıyor...');
            
            const mcData = require('minecraft-data')(bot.version);
            
            // İnternetteki hazır şablon mantığı: ID karmaşasını önlemek için portalı iki isimle de arar
            const portalKimligi = mcData.blocksByName.nether_portal ? mcData.blocksByName.nether_portal.id : mcData.blocksByName.portal.id;
            
            const yakindakiPortallar = bot.findBlocks({
                matching: portalKimligi,
                maxDistance: 64, // 64 blok genişliğinde devasa bir alanı tarar
                count: 1
            });

            if (yakindakiPortallar.length > 0) {
                const anaPortal = yakindakiPortallar[0];
                console.log(`[Baritone] Portal hedefi kilitlendi! Koordinatlar: X: ${anaPortal.x}, Y: ${anaPortal.y}, Z: ${anaPortal.z}`);
                
                // Baritone'a doğrudan portalın merkezine gitme emri verilir
                bot.baritone.goTo(anaPortal);
            } else {
                console.log('[Baritone] Yakında nether portalı tespit edilemedi! Kör yürüyüş şablonu aktif ediliyor...');
                
                // Eğer portalı göremiyorsa, lobi düzlüğünde Baritone ile otomatik ileri sızma yapar
                const anlikKonum = bot.entity.position;
                const bakiYonu = bot.entity.yaw;
                
                const xIleri = Math.floor(anlikKonum.x - Math.sin(bakiYonu) * 15);
                const zIleri = Math.floor(anlikKonum.z - Math.cos(bakiYonu) * 15);
                
                bot.baritone.goTo(new vec3(xIleri, anlikKonum.y, zIleri));
            }
        }, 5000); // Sunucu gecikmelerine karşı 5. saniyede tetiklenir
    });

    // Canlı Sunucu Sohbet Akışı
    bot.on('message', (jsonMsg) => {
        const mesaj = jsonMsg.toString().trim();
        if (mesaj.length > 0) console.log(`[CHATS] ${mesaj}`);
    });

    // Oyundan Kontrol Komutları (Sadece sahip için)
    bot.on('chat', (username, message) => {
        if (username !== AYARLAR.sahip) return; 

        if (message.startsWith('git ')) {
            const args = message.split(' ');
            const x = parseInt(args[1]);
            const y = parseInt(args[2]);
            const z = parseInt(args[3]);
            bot.chat(`[Baritone] Hedefe yönlendiriliyor: ${x} ${y} ${z}`);
            bot.baritone.goTo(new vec3(x, y, z));
        }

        if (message.startsWith('kaz ')) {
            const blokAdi = message.replace('kaz ', '').trim();
            bot.chat(`[Baritone] ${blokAdi} aranıyor...`);
            bot.baritone.mine(blokAdi);
        }

        if (message === 'dur') {
            bot.chat('[Baritone] İşlemler iptal edildi.');
            bot.baritone.stop();
        }
    });

    // Termux Ekranından Canlı Konsol Girişi
    rl.on('line', (line) => {
        if (line.trim().length > 0) bot.chat(line.trim());
    });

    // Ölüm durumunda bekletmeden canlanma (Anti-Lobi Ölümü)
    bot.on('death', () => {
        console.log('[Sistem] Bot öldü, otomatik yeniden doğuluyor...');
        bot.respawn();
    });

    // Bağlantı Kesilmesi Durumunda Sonsuz Döngü
    bot.on('end', (reason) => {
        console.log(`[Bağlantı Kesildi] Durum: ${reason}. 5 saniye sonra sistem kendini yeniden başlatacak...`);
        setTimeout(botOlustur, 5000);
    });

    bot.on('error', (err) => console.log('[Sistem Hatası]', err));
}

// Hazır sistemi ateşle
botOlustur();
