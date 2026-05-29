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
});

// Yedek portal
setTimeout(() => {
  if (!loggedIn) {
    console.warn('⚠️ Manuel giriş yapılıyor...');
    loggedIn = true;
    setTimeout(enterPortal, 2000);
  }
}, 10000);

function enterPortal() {
  console.log('🚪 Portala yürünüyor...');
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  setTimeout(() => {
    bot.clearControlStates();
    console.log('✅ Portal geçişi tamamlandı!');
    enableBaritoneMode();
  }, 3000);
}

function enableBaritoneMode() {
  console.log('🎮 Baritone modu aktif! Chat komutları hazır.');
}

// ========== BARİTONE KOMUTLARI (Pathfinder ile) ==========
bot.on('chat', (username, message) => {
  if (username !== config.owner) return;
  if (!message.startsWith('!')) return;

  const command = message.slice(1).trim();
  const args = command.split(' ');
  const cmd = args[0].toLowerCase();

  console.log(`📢 Komut: ${command}`);

  // BARITONE BENZERİ KOMUTLAR
  if (cmd === 'goto' && args.length >= 3) {
    const x = parseInt(args[1]);
    const y = parseInt(args[2]);
    const z = parseInt(args[3] || '0');
    console.log(`📍 Goto: ${x}, ${y}, ${z}`);
    
    const mcData = require('minecraft-data')(bot.version);
    bot.pathfinder.setMovements(new Movements(bot, mcData));
    bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
    bot.chat(`> Gidiliyor: ${x} ${y} ${z}`);

  } else if (cmd === 'follow' && args[1]) {
    const target = bot.players[args[1]]?.entity;
    if (target) {
      bot.pathfinder.setGoal(new goals.GoalFollow(target, 2));
      bot.chat(`> Takip ediliyor: ${args[1]}`);
    } else {
      bot.chat(`> Oyuncu bulunamadı: ${args[1]}`);
    }

  } else if (cmd === 'stop') {
    bot.pathfinder.setGoal(null);
    bot.clearControlStates();
    bot.chat('> Durduruldu!');

  } else if (cmd === 'come') {
    const owner = bot.players[config.owner]?.entity;
    if (owner) {
      bot.pathfinder.setGoal(new goals.GoalFollow(owner, 1));
      bot.chat('> Geliyorum!');
    }

  } else if (cmd === 'mine' && args[1]) {
    // Belirli bloğu kaz
    const blockName = args[1];
    console.log(`⛏️ Mining: ${blockName}`);
    bot.chat(`> Hedef blok: ${blockName} - Yakındakini bulup kazacağım`);
    
    const targetBlock = bot.findBlock({
      matching: (block) => block.name === blockName,
      maxDistance: 32
    });
    
    if (targetBlock) {
      bot.pathfinder.setGoal(new goals.GoalBlock(
        targetBlock.position.x,
        targetBlock.position.y,
        targetBlock.position.z
      ));
    }

  } else if (cmd === 'pos') {
    const pos = bot.entity.position;
    bot.chat(`> Konum: ${Math.floor(pos.x)} ${Math.floor(pos.y)} ${Math.floor(pos.z)}`);

  } else if (cmd === 'help') {
    bot.chat('§6Komutlar: !goto x y z | !follow oyuncu | !come | !stop | !mine blok | !pos');
  }
});

// Hata ve kopma yönetimi
bot.on('end', (reason) => {
  console.log(`🔌 Koptu: ${reason}`);
  setTimeout(() => process.exit(1), 3000);
});

bot.on('error', (err) => console.error(`❌ ${err.message}`));

console.log('🎯 Bot hazır! Komutlar:');
console.log('  !goto 100 70 200');
console.log('  !follow OyuncuAdı');
console.log('  !come');
console.log('  !mine diamond_ore');
console.log('  !stop');
console.log('  !pos');
