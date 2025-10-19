const mineflayer = require('mineflayer');
const readline = require('readline');

let bot;

function createBot() {
  bot = mineflayer.createBot({
    host: 'articraft.uz',       // server IP
    port: 25565,             // server port
    username: 'itzRellixsMF',   // sizning nick
  });

  bot.on('spawn', () => {
    console.log('Bot serverga ulandi va AFK holatda turadi!');

    // Har 5 daqiqada kichik harakat qilish
    if (!bot.afkInterval) {
      bot.afkInterval = setInterval(() => {
        if (bot && bot.entity) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500); // 0.5 soniya sakrash
          console.log('Bot kichik harakat qildi.');
        }
      }, 300000); // 5 daqiqa = 300000 ms
    }
  });

  bot.on('end', () => {
    console.log('Bot serverdan uzildi, 5 soniyadan keyin qayta ulanadi...');
    clearInterval(bot.afkInterval);
    bot.afkInterval = null;
    setTimeout(createBot, 5000); // 5 soniyadan keyin qayta ulanadi
  });

  bot.on('error', (err) => {
    console.log('Xato:', err);
  });
}

// Konsol buyruqlari
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  const args = input.split(' ');

  switch(args[0]) {
    case 'connect':
      if (!bot || bot._client.socket.destroyed) createBot();
      else console.log('Bot allaqachon ulangan!');
      break;
    case 'disconnect':
      if (bot) {
        bot.quit();
        console.log('Bot serverdan uzildi.');
      } else {
        console.log('Bot ulanmagan.');
      }
      break;
    case 'say':
      if (bot && args[1]) {
        bot.chat(args.slice(1).join(' '));
      }
      break;
    default:
      console.log('Buyruqlar: connect, disconnect, say <xabar>');
  }
});
