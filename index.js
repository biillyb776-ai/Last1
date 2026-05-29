const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalXYZ = goals.GoalXYZ;

// ================= AYARLAR =================
const AYARLAR = {
    host: '6b6t.org',             
    port: 25565,                  
    username: 'VuadasTpaBot1',   // Botun ismi
    sifre: 'Ewdry3NgAF6h9',           // Botun şifresi
    sahip: 'Vuadas'             // Oyundaki adın
};
// ===========================================

function botOlustur() {
    console.log('[Sistem] Bot sunucuya bağlanıyor...');
    
    const bot = mineflayer.createBot({
        host: AYARLAR.host,
        port: AYARLAR.port,
        username: AYARLAR.username,
        checkTimeoutInterval: 60000 // Zaman aşımı hatasını önler
    });

    // Gelişmiş hareket motorunu yüklüyoruz (Baritone çakması)
    bot.loadPlugin(pathfinder);

    // Sunucuya girince otomatik login yapma ve hareket yeteneği açma
    bot.once('spawn', () => {
        console.log('[Başarılı] Bot oyuna girdi!');
        
        // 6b6t kuyruk ve giriş sistemi için komutlar
        setTimeout(() => bot.chat(`/register ${AYARLAR.sifre} ${AYARLAR.sifre}`), 1000);
        setTimeout(() => bot.chat(`/login ${AYARLAR.sifre}`), 2000);
        
        // Botun blokların üzerinden atlayabilmesi için ayar
        const mcData = require('minecraft-data')(bot.version);
        const defaultMove = new Movements(bot, mcData);
        bot.pathfinder.setMovements(defaultMove);
    });

    // Sohbet Komutları
    bot.on('chat', (username, message) => {
        if (username !== AYARLAR.sahip) return; // Sadece seni dinler

        // Örnek: git 100 64 -200 (Yoldaki engelleri aşarak gider)
        if (message.startsWith('git ')) {
            const args = message.split(' ');
            const x = parseInt(args[1]);
            const y = parseInt(args[2]);
            const z = parseInt(args[3]);

            bot.chat(`[Bot] ${x} ${y} ${z} koordinatına koşuyorum...`);
            bot.pathfinder.setGoal(new GoalXYZ(x, y, z));
        }

        // Örnek: yanıma gel (Seni bulur ve yanına koşar)
        if (message === 'yanıma gel') {
            const target = bot.players[username]?.entity;
            if (!target) {
                bot.chat('[Bot] Seni göremiyorum, çok uzaktasın!');
                return;
            }
            bot.chat('[Bot] Yanına geliyorum.');
            bot.pathfinder.setGoal(new GoalXYZ(target.position.x, target.position.y, target.position.z));
        }

        // Örnek: dur
        if (message === 'dur') {
            bot.chat('[Bot] Durdum.');
            bot.pathfinder.setGoal(null);
        }
    });

    // Öldüğünde otomatik doğma
    bot.on('death', () => {
        console.log('[Uyarı] Bot öldü! Yeniden doğuluyor...');
        bot.respawn();
    });

    // Sunucudan atılırsa 5 saniye sonra otomatik geri girme
    bot.on('end', (reason) => {
        console.log(`[Bağlantı Koptu] Sebep: ${reason}. 5 saniye sonra tekrar denenecek...`);
        setTimeout(botOlustur, 5000);
    });

    bot.on('error', (err) => console.log('[Hata]', err));
}

// Sistemi Başlat
botOlustur();
