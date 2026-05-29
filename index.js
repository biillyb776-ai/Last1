const mineflayer = require('mineflayer');
const baritonePlugin = require('mineflayer-baritone'); 
const vec3 = require('vec3');
const readline = require('readline');

// ================= AYARLAR =================
const AYARLAR = {
    host: '6b6t.org',             
    port: 25565,                  
    username: 'BaritoneAnarsi',   
    sifre: 'Sifre12345',           
    sahip: 'SeninAdin'             
};
// ===========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function botOlustur() {
    console.log('[Sistem] Baritone Botu 1.21.5 sürümüyle başlatılıyor...');
    
    const bot = mineflayer.createBot({
        host: AYARLAR.host,
        port: AYARLAR.port,
        username: AYARLAR.username,
        version: "1.21.5", // Sürüm buraya hatasız eklendi
        checkTimeoutInterval: 60000
    });

    // Baritone eklentisini bota yüklüyoruz
    bot.loadPlugin(baritonePlugin);

    bot.once('spawn', () => {
        console.log('[Başarılı] Baritone aktif ve oyuna girildi!');
        
        setTimeout(() => bot.chat(`/register ${AYARLAR.sifre} ${AYARLAR.sifre}`), 1000);
        setTimeout(() => bot.chat(`/login ${AYARLAR.sifre}`), 2000);
        
        // Otomatik portal girişi
        setTimeout(() => {
            console.log('[Portal] Baritone ile portala doğru ilerleniyor...');
            const konum = bot.entity.position;
            const yaw = bot.entity.yaw;
            
            const xHedef = Math.floor(konum.x - Math.sin(yaw) * 12);
            const zHedef = Math.floor(konum.z - Math.cos(yaw) * 12);

            bot.baritone.goTo(new vec3(xHedef, konum.y, zHedef));
        }, 4000);
    });

    // Canlı Sohbet Takibi
    bot.on('message', (jsonMsg) => {
        const mesaj = jsonMsg.toString().trim();
        if (mesaj.length > 0) console.log(`[CHATS] ${mesaj}`);
    });

    // Oyun içi Baritone Komutları
    bot.on('chat', (username, message) => {
        if (username !== AYARLAR.sahip) return; 

        if (message.startsWith('git ')) {
            const args = message.split(' ');
            const x = parseInt(args[1]);
            const y = parseInt(args[2]);
            const z = parseInt(args[3]);
            bot.chat(`[Baritone] ${x} ${y} ${z} hedefine gidiyorum.`);
            bot.baritone.goTo(new vec3(x, y, z));
        }

        if (message.startsWith('kaz ')) {
            const blok = message.replace('kaz ', '').trim();
            bot.chat(`[Baritone] ${blok} aranıyor ve kazılıyor...`);
            bot.baritone.mine(blok);
        }

        if (message === 'dur') {
            bot.chat('[Baritone] Durduruldu.');
            bot.baritone.stop();
        }
    });

    // Termux Konsol Girişi
    rl.on('line', (line) => {
        if (line.trim().length > 0) bot.chat(line.trim());
    });

    bot.on('death', () => {
        console.log('[Uyarı] Bot öldü! Yeniden doğuluyor...');
        bot.respawn();
    });

    bot.on('end', (reason) => {
        console.log(`[Bağlantı Koptu] Sebep: ${reason}. 5 saniye sonra tekrar denenecek...`);
        setTimeout(botOlustur, 5000);
    });

    bot.on('error', (err) => console.log('[Hata]', err));
}

botOlustur();
