const mineflayer = require('mineflayer')
const express = require('express')

// ====== WEB SERVICE ======
const app = express()
const PORT = process.env.PORT || 3000

let botStatus = '⏳ ulanmoqda...'

app.get('/', (req, res) => {
  res.send(`
    <h2>🤖 AFK BOT ISHLAYAPTI</h2>
    <p>Status: ${botStatus}</p>
    <p>Chat yozish: <code>/say?msg=SALOM</code></p>
  `)
})

app.get('/say', (req, res) => {
  const msg = req.query.msg
  if (!msg) return res.send('❌ msg yozilmadi')
  if (!bot) return res.send('❌ bot ulanmagan')

  bot.chat(msg)
  res.send('✅ Yuborildi: ' + msg)
})

app.listen(PORT, () =>
  console.log('🌐 Web server ishlayapti:', PORT)
)

// ====== SOZLAMALAR ======
const HOST = 'articraft.uz'
const MC_PORT = 25565
const USERNAME = 'RellixsAFK'
const VERSION = '1.21'
const PASSWORD = '252356n1'

const ANTI_AFK_INTERVAL = 3 * 60 * 1000
const RECONNECT_DELAY = 5000

let bot
let loggedIn = false
let antiAfkTimer = null
let reconnecting = false

// ====== BOT ======
function startBot () {
  console.log('🔄 Bot ulanmoqda...')
  botStatus = '🔄 ulanmoqda'

  bot = mineflayer.createBot({
    host: HOST,
    port: MC_PORT,
    username: USERNAME,
    version: VERSION
  })

  setupEvents()
}

function setupEvents () {
  bot.once('spawn', () => {
    console.log('✅ Serverga kirdi')
    botStatus = '🟡 login kutilmoqda'
    loggedIn = false
  })

  bot.on('message', (msg) => {
    const text = msg.toString()
    console.log('💬 CHAT:', text)

    // LOGIN ANIQLASH (unicode OK)
    if (!loggedIn && /login|\/l/i.test(text)) {
      console.log('🔐 Login yuborildi')
      bot.chat(`/login ${PASSWORD}`)

      setTimeout(() => {
        loggedIn = true
        botStatus = '🟢 SMP → AFK'
        bot.chat('/server smp')
      }, 2000)

      setTimeout(() => {
        bot.chat('/warp afk')
        startAntiAfk()
      }, 4500)
    }
  })

  bot.on('end', () => reconnect('end'))
  bot.on('kicked', (r) => reconnect('kick'))
  bot.on('error', (e) => console.log('⚠️', e.message))
}

// ====== RECONNECT ======
function reconnect (why) {
  console.log('🔁 Qayta ulanmoqda:', why)
  botStatus = '🔁 qayta ulanmoqda'
  loggedIn = false
  stopAntiAfk()

  if (reconnecting) return
  reconnecting = true

  setTimeout(() => {
    reconnecting = false
    startBot()
  }, RECONNECT_DELAY)
}

// ====== ANTI AFK ======
function startAntiAfk () {
  stopAntiAfk()
  antiAfkTimer = setInterval(humanMove, ANTI_AFK_INTERVAL)
  console.log('🟢 Anti‑AFK ishga tushdi')
}

function stopAntiAfk () {
  if (antiAfkTimer) clearInterval(antiAfkTimer)
}

function humanMove () {
  const actions = ['forward', 'left', 'right']
  const action = actions[Math.floor(Math.random() * actions.length)]

  bot.setControlState(action, true)
  setTimeout(() => bot.setControlState(action, false), 1200)

  bot.setControlState('jump', true)
  setTimeout(() => bot.setControlState('jump', false), 300)

  bot.look(Math.random() * Math.PI * 2, 0, true)
}

// ====== START ======
startBot()
