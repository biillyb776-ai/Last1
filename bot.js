const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;

// KENDİ BİLGİLERİNİ GİR
const config = {
  host: '6b6t.org',
  port: 25565,
  username: 'VuadasTpaBot1',
  password: 'Ewdry3NgAF6h9',
  owner: 'Vuadas',
};

let loggedIn = false;

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  version: '1.20.1', // Sunucu sürümüne göre değiştir
});

// Pathfinder yükle (Baritone alternatifi)
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

bot.on('login', () => {
  console.log('✅ Sunucuya bağlanıldı!');
});

bot.on('message', (jsonMsg) => {
  const msg = jsonMsg.toString();
  console.log(`[CHAT] ${msg}`);

  if (!loggedIn) {
    if (msg.includes('/register')) {
      console.log('📝 Kayıt yapılıyor...');
      bot.chat(`/register ${config.password} ${config.password}`);
    } else if (msg.includes('/login')) {
      console.log('🔐 Giriş yapılıyor...');
      bot.chat(`/login ${config.password}`);
    } else if (
      msg.toLowerCase().includes('successfully') ||
      msg.toLowerCase().includes('başarılı') ||
      msg.toLowerCase().includes('logged in')
    ) {
      console.log('✅ Giriş başarılı!');
      loggedIn = true;
      setTimeout(enterPortal, 2000);
    }
  }
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

// ============ KENDİ BİLGİLERİNİ BURAYA GİR ============
const config = {
  host: '6b6t.org',           // Sunucu IP
  port: 25565,                // Port
  username: 'VuadasTpaBot1',       // Botun kullanıcı adı
  password: 'Ewdry3NgAF6h9',     // Botun şifresi (AuthMe)
  owner: 'SENIN_ADIN',        // Senin Minecraft adın (botu kontrol edecek kişi)
};
// =====================================================

let loggedIn = false;

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  version: '1.21.5,',          // Sunucu sürümüne göre değiştir
});

bot.loadPlugin(pathfinder);

// ============ LOGIN VE PORTAL ============
bot.on('login', () => {
  console.log('✅ Sunucuya bağlanıldı! Giriş ekranı bekleniyor...');
});

bot.on('message', (jsonMsg) => {
  const msg = jsonMsg.toString();
  console.log(`[CHAT] ${msg}`);

  if (!loggedIn) {
    if (msg.includes('/register')) {
      console.log('📝 Kayıt komutu alındı, kayıt yapılıyor...');
      bot.chat(`/register ${config.password} ${config.password}`);
    } else if (msg.includes('/login')) {
      console.log('🔐 Giriş komutu alındı, giriş yapılıyor...');
      bot.chat(`/login ${config.password}`);
    } else if (
      msg.toLowerCase().includes('successfully') ||
      msg.toLowerCase().includes('başarılı') ||
      msg.toLowerCase().includes('logged in')
    ) {
      console.log('✅ Giriş başarılı! Portala yönleniyor...');
      loggedIn = true;
      setTimeout(enterPortal, 3000);
    }
  }
});

// Yedek: 12 saniye sonra mesaj gelmezse manuel dene
setTimeout(() => {
  if (!loggedIn) {
    console.warn('⚠️ Giriş mesajı algılanamadı, manuel deneniyor...');
    loggedIn = true;
    setTimeout(enterPortal, 2000);
  }
}, 12000);

// ============ PORTAL FONKSİYONU (İleri-Geri Dans) ============
function enterPortal() {
  console.log('🚪 Portala doğru yürünüyor...');

  // İlk hamle: 6 saniye ileri + zıpla
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);

  setTimeout(() => {
    bot.setControlState('forward', false);
    bot.setControlState('jump', false);
    console.log('⏸️ Durdu, geri gidiliyor...');

    // 1.5 saniye geri git (portalın içinde kalma şansını artır)
    bot.setControlState('back', true);
    setTimeout(() => {
      bot.setControlState('back', false);
      console.log('⏸️ Durdu, tekrar ileri...');

      // 2 saniye bekle
      setTimeout(() => {
        bot.setControlState('forward', true);
        bot.setControlState('jump', true);

        setTimeout(() => {
          bot.clearControlStates();
          console.log('✅ Portal geçiş rutini tamamlandı!');
        }, 4000);
      }, 2000);

    }, 1500);

  }, 6000);
}

// ============ CHAT KONTROL (SAHİP KOMUTLARI) ============
bot.on('chat', (username, message) => {
  // Sadece sahip kontrol edebilir
  if (username !== config.owner) return;
  // Prefix: !
  if (!message.startsWith('!')) return;

  const command = message.slice(1).trim();
  const args = command.split(' ');
  const cmd = args[0].toLowerCase();

  console.log(`📢 ${username}: ${command}`);

  // === GOTO ===
  if (cmd === 'goto' && args.length >= 3) {
    const x = parseInt(args[1]);
    const y = parseInt(args[2]);
    const z = parseInt(args[3] || '0');

    const mcData = require('minecraft-data')(bot.version);
    bot.pathfinder.setMovements(new Movements(bot, mcData));
    bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
    bot.chat(`> 📍 Gidiliyor: ${x} ${y} ${z}`);
  }

  // === FOLLOW ===
  else if (cmd === 'follow' && args[1]) {
    const target = bot.players[args[1]]?.entity;
    if (target) {
      bot.pathfinder.setGoal(new goals.GoalFollow(target, 2));
      bot.chat(`> 👤 Takip: ${args[1]}`);
    } else {
      bot.chat(`> ❌ Oyuncu bulunamadı: ${args[1]}`);
    }
  }

  // === COME (sana gel) ===
  else if (cmd === 'come') {
    const owner = bot.players[config.owner]?.entity;
    if (owner) {
      bot.pathfinder.setGoal(new goals.GoalFollow(owner, 1));
      bot.chat('> 🏃 Geliyorum!');
    } else {
      bot.chat('> ❌ Seni göremiyorum!');
    }
  }

  // === STOP ===
  else if (cmd === 'stop') {
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();
    bot.chat('> 🛑 Durduruldu!');
  }

  // === POS (konum) ===
  else if (cmd === 'pos') {
    const pos = bot.entity.position;
    bot.chat(`> 📍 Konum: ${Math.floor(pos.x)} ${Math.floor(pos.y)} ${Math.floor(pos.z)}`);
  }

  // === PORTAL (tekrar portal dene) ===
  else if (cmd === 'portal') {
    bot.chat('> 🚪 Portal rutini başlatılıyor...');
    enterPortal();
  }

  // === İLERİ (manuel yürüme) ===
  else if (cmd === 'ileri') {
    bot.setControlState('forward', true);
    setTimeout(() => bot.setControlState('forward', false), 1000);
    bot.chat('> ⏩ 1 saniye ileri');
  }

  // === GERİ ===
  else if (cmd === 'geri') {
    bot.setControlState('back', true);
    setTimeout(() => bot.setControlState('back', false), 1000);
    bot.chat('> ⏪ 1 saniye geri');
  }

  // === ZIPLA ===
  else if (cmd === 'zıpla') {
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 500);
    bot.chat('> 🦘 Zıpladı!');
  }

  // === HELP ===
  else if (cmd === 'help') {
    bot.chat('§6=== BOT KOMUTLARI ===');
    bot.chat('§e!goto x y z §7- Koordinata git');
    bot.chat('§e!follow oyuncu §7- Oyuncu takip et');
    bot.chat('§e!come §7- Sana gel');
    bot.chat('§e!stop §7- Durdur');
    bot.chat('§e!pos §7- Konum söyle');
    bot.chat('§e!portal §7- Portal rutini tekrar');
    bot.chat('§e!ileri / !geri / !zıpla §7- Manuel hareket');
  }
});

// ============ HATA VE KOPMA ============
bot.on('end', (reason) => {
  console.log(`🔌 Bağlantı koptu: ${reason}`);
  setTimeout(() => process.exit(1), 3000);
});

bot.on('error', (err) => {
  console.error(`❌ Hata: ${err.message}`);
});

console.log('🤖 Bot başlatıldı! Komutlar: !help');
