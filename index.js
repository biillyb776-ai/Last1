const mineflayer = require('mineflayer');
const baritone = require('mineflayer-baritone');

// KENDİ BİLGİLERİNİ BURAYA GİR
const config = {
  host: '6b6t.org',         // Sunucu IP'si (örnek, doğru IP'yi yaz)
  port: 25565,
  username: 'VuadasTpaBot1',     // Botun Minecraft kullanıcı adı
  password: 'Ewdry3NgAF6h9',   // AuthMe şifresi (kayıt/giriş için aynı)
  owner: 'Vuadas',      // Botu chatten yönetecek kişinin adı
};

let loggedIn = false;

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
});

// Baritone eklentisini yükle
baritone(bot);

// Konsola bilgi yazdırma
bot.on('login', () => {
  console.log('✅ Sunucuya bağlanıldı, giriş ekranı bekleniyor...');
});

// Chat mesajlarını dinle ve login / register işlemlerini yap
bot.on('message', (jsonMsg) => {
  const msg = jsonMsg.toString();
  console.log(`[CHAT] ${msg}`);

  // AuthMe kayıt / giriş komutlarını yakala
  if (!loggedIn) {
    if (msg.includes('/register')) {
      console.log('📝 Kayıt komutu alındı, kayıt yapılıyor...');
      bot.chat(`/register ${config.password} ${config.password}`);
    } else if (msg.includes('/login')) {
      console.log('🔐 Giriş komutu alındı, giriş yapılıyor...');
      bot.chat(`/login ${config.password}`);
    } else if (
      msg.includes('successfully') ||  // "registered successfully" / "logged in successfully"
      msg.includes('başarıyla') ||     // Türkçe sunucular için
      msg.includes('giriş yaptı')
    ) {
      console.log('✅ Giriş başarılı!');
      loggedIn = true;
      // Portala yürüme işlemini başlat
      setTimeout(enterPortal, 2000);
    }
  }
});

// Eğer mesaj yakalanmazsa yedek olarak 10 saniye sonra portala yürümeyi dene
setTimeout(() => {
  if (!loggedIn) {
    console.warn('⚠️  Giriş mesajı algılanamadı, yine de portala yürümeyi dene.');
    loggedIn = true;
    setTimeout(enterPortal, 2000);
  }
}, 15000);

function enterPortal() {
  console.log('🚪 Portala doğru yürünüyor (5 saniye ileri)...');
  bot.setControlState('forward', true);
  // Portalın içine tam girebilmek için zıplamayı da aktif et
  bot.setControlState('jump', true);
  setTimeout(() => {
    bot.setControlState('forward', false);
    bot.setControlState('jump', false);
    console.log('🏁 Portal geçişi tamamlandı (umuyoruz).');
  }, 5000);
}

// ------- CHAT İLE BOT KONTROLÜ (SAHİP TARAFINDAN) -------
bot.on('chat', (username, message) => {
  // Sadece config.owner yazabilir
  if (username !== config.owner) return;

  // Prefix: "!" ile başlayan mesajlar Baritone komutu olarak işlenir
  if (message.startsWith('!')) {
    const command = message.slice(1).trim();
    console.log(`📢 Sahip komutu: ${command}`);
    // Eğer özel bir komut değilse direkt Baritone'a ilet
    if (command === 'stop') {
      // Baritone'u durdur ve tüm hareketleri iptal et
      bot.baritone.chat('stop');
      bot.clearControlStates();
      console.log('🛑 Baritone durduruldu ve hareketler temizlendi.');
    } else {
      // Diğer tüm komutları doğrudan Baritone sohbetine gönder
      // Örnek: "!goto 100 200", "!mine diamond_ore", "!follow oyuncu"
      bot.baritone.chat(command);
    }
  }
});

// Hata durumunda yeniden bağlanmayı dene
bot.on('end', (reason) => {
  console.log(`🔌 Bağlantı koptu: ${reason}. 5 saniye sonra tekrar bağlanılıyor...`);
  setTimeout(() => {
    process.exit(1); // veya bir process manager (pm2) ile yeniden başlatabilirsin
  }, 5000);
});

bot.on('error', (err) => {
  console.error(`❌ Hata: ${err.message}`);
});
