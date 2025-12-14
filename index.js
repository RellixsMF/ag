const mineflayer = require('mineflayer')
const readline = require('readline')
const express = require('express')

// ====== WEB SERVICE ======
const app = express()
const PORT = process.env.PORT || 3000
app.get('/', (req, res) => res.send('AFK Bot ishlayapti ✅'))
app.listen(PORT, () => console.log('🌐 Web server portda ishga tushdi:', PORT))

// ====== SOZLAMALAR ======
const HOST = 'articraft.uz'
const MC_PORT = 25565
const USERNAME = 'RellixsAFK'
const VERSION = '1.21'
const PASSWORD = '252356n1'
const ANTI_AFK_INTERVAL = 3 * 60 * 1000 // 3 minut
const RECONNECT_DELAY = 5000

let bot
let antiAfkTimer = null
let reconnecting = false
let loggedIn = false

// ====== KONSOL BOSHqarUV ======
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.on('line', input => { if (bot && input) bot.chat(input) })

// ====== BOT YARATISH ======
function startBot() {
  console.log('🔄 Bot ulanmoqda...')
  bot = mineflayer.createBot({ host: HOST, port: MC_PORT, username: USERNAME, version: VERSION })
  setupEvents()
}

// ====== EVENTLAR ======
function setupEvents() {
  bot.once('spawn', () => { console.log('✅ Serverga kirdi'); loggedIn = false })

  bot.on('message', msg => {
    const text = msg.toString()
    console.log('💬 CHAT:', text)

    // ✅ LOGIN SO‘RALSA (Unicode bilan ishlaydi)
    if (!loggedIn && /login|l/i.test(text)) {
      console.log('🔐 Login qilinyapti...')
      setTimeout(() => bot.chat(`/login ${PASSWORD}`), 1000)
      setTimeout(() => { loggedIn = true; console.log('✅ Login muvaffaqiyatli') }, 1500)

      // Login bo‘lganidan keyin ketma-ket buyruqlar
      setTimeout(() => bot.chat('/server smp'), 2000)
      setTimeout(() => bot.chat('/warp afk'), 4000)
      setTimeout(() => startAntiAfk(), 5000)
    }
  })

  bot.on('kicked', reason => { console.log('❌ Kick:', JSON.stringify(reason)); reconnect() })
  bot.on('end', () => { console.log('⚠️ Ulanish uzildi'); reconnect() })
  bot.on('error', err => { console.log('⚠️ Error:', err.message) })
}

// ====== QAYTA ULANISH ======
function reconnect() {
  stopAntiAfk()
  loggedIn = false
  if (reconnecting) return
  reconnecting = true
  setTimeout(() => { reconnecting = false; startBot() }, RECONNECT_DELAY)
}

// ====== ANTI AFK ======
function startAntiAfk() {
  stopAntiAfk()
  antiAfkTimer = setInterval(humanMove, ANTI_AFK_INTERVAL)
  console.log('🟢 Anti-AFK ishga tushdi (3 minut)')
}

function stopAntiAfk() { if (antiAfkTimer) { clearInterval(antiAfkTimer); antiAfkTimer = null } }

function humanMove() {
  const actions = ['forward', 'left', 'right']
  const action = actions[Math.floor(Math.random() * actions.length)]
  const time = 800 + Math.random() * 1500

  bot.setControlState(action, true)
  setTimeout(() => {
    bot.setControlState(action, false)
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 300)
  }, time)

  bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI / 4, true)
}

// ====== START ======
startBot()
