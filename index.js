const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const GoalXYZ = goals.GoalXYZ;
const readline = require('readline');

// ================= AYARLAR =================
const AYARLAR = {
    host: '6b6t.org',             
    port: 25565,                  
    username: 'VuadasTpaBot1',   
    sifre: 'Ewdry3NgAF6h9',           
    sahip: 'SeninAdin'             
};
// ===========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function botOlustur() {
    console.log('[Sistem] Bot sunucuya bağlanıyor...');
    
    const bot = mineflayer.createBot({
        host: AYARLAR.host,
        port: AYARLAR.port,
        username: AYARLAR.username,
        checkTimeoutInterval: 60000
    });

    bot.loadPlugin(pathfinder);

    bot.once('spawn', () => {
        console.log('[Başarılı] Bot oyuna girdi!');
        
        // 1. Önce şifreyi girsin
        setTimeout(() => bot.chat(`/register ${AYARLAR.sifre} ${AYARLAR.sifre}`), 1000);
        setTimeout(() => bot.chat(`/login ${AYARLAR.sifre}`), 2000);
        
        // Pathfinder hareket ayarları
        const mcData = require('minecraft-data')(bot.version);
        const defaultMove = new Movements(bot, mcData);
        bot.pathfinder.setMovements(defaultMove);

        // 🔴 [YENİ] PORTALA OTOMATİK GİRİŞ SİSTEMİ
        // Şifre girildikten 4 saniye sonra bot önündeki portala doğru dümdüz koşmaya başlar
        setTimeout(() => {
            console.log('[Portal] Portala doğru ilerleniyor...');
            
            // Botun o anki konumunu alıp 15 blok önüne bir hedef koyuyoruz (Genelde portal tam önünde olur)
            const konum = bot.entity.position;
            const yaw = bot.entity.yaw;
            
            // Botun baktığı yöne göre düz ileri yürümesini sağlar
            const xHedef = konum.x - Math.sin(yaw) * 15;
            const zHedef = konum.z - Math.cos(yaw) * 15;

            bot.pathfinder.setGoal(new GoalXYZ(xHedef, konum.y, zHedef));
        }, 4000);
    });

    // Canlı Sohbet Takibi
    bot.on('message', (jsonMsg) => {
        const mesaj = jsonMsg.toString().trim();
        if (mesaj.length > 0) {
            console.log(`[CHATS] ${mesaj}`);
        }
    });

    // Oyun içi komutlar
    bot.on('chat', (username, message) => {
        if (username !== AYARLAR.sahip) return; 

        if (message.startsWith('git ')) {
            const args = message.split(' ');
            const x = parseInt(args[1]);
            const y = parseInt(args[2]);
            const z = parseInt(args[3]);
            bot.chat(`[Bot] ${x} ${y} ${z} yönüne gidiyorum.`);
            bot.pathfinder.setGoal(new GoalXYZ(x, y, z));
        }

        if (message === 'yanıma gel') {
            const target = bot.players[username]?.entity;
            if (!target) {
                bot.chat('[Bot] Uzaktasın, göremiyorum!');
                return;
            }
            bot.chat('[Bot] Geliyorum.');
            bot.pathfinder.setGoal(new GoalXYZ(target.position.x, target.position.y, target.position.z));
        }

        if (message === 'dur') {
            bot.chat('[Bot] Durdum.');
            bot.pathfinder.setGoal(null);
        }
    });

    // Termux'tan yazma
    rl.on('line', (line) => {
        const text = line.trim();
        if (text.length > 0) {
            bot.chat(text); 
        }
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
