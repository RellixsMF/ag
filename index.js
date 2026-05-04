const mineflayer = require('mineflayer')
const express = require('express')

// ===== WEB (Render / UptimeRobot) =====
const app = express()
const PORT = process.env.PORT || 3000

let botStatus = '⏳ ulanmoqda...'

app.get('/', (req, res) => {
  res.send(`
    <h2>🤖 AFK BOT ISHLAYAPTI</h2>
    <p>Status: ${botStatus}</p>
    <p>/say?msg=SALOM</p>
  `)
})

app.get('/say', (req, res) => {
  if (!bot) return res.send('❌ bot yo‘q')
  bot.chat(req.query.msg || 'salom')
  res.send('✅ yuborildi')
})

app.listen(PORT, () =>
  console.log('🌐 Web server port:', PORT)
)

// ===== SOZLAMALAR =====
const HOST = 'barq.aternos.me'
const MC_PORT = 25332
const USERNAME = 'Marlowww'
const VERSION = '1.21'
const PASSWORD = 'gugugugaga'

const ANTI_AFK_INTERVAL = 3 * 60 * 1000
const RECONNECT_DELAY = 5000

let bot
let loggedIn = false
let antiAfkTimer
let reconnecting = false
let loginTries = 0

// ===== BOT START =====
function startBot () {
  console.log('🔄 Bot ulanmoqda...')
  botStatus = '🔄 ulanmoqda'
  loggedIn = false
  loginTries = 0

  bot = mineflayer.createBot({
    host: HOST,
    port: MC_PORT,
    username: USERNAME,
    version: VERSION
  })

  setupEvents()
}

// ===== EVENTS =====
function setupEvents () {
  bot.once('spawn', () => {
    console.log('✅ Serverga kirdi')
    botStatus = '🟡 tekshirilmoqda...'

    // Agar server login so‘ramasa — majburan davom etamiz
    setTimeout(forceContinueIfNoLogin, 6000)
  })

  bot.on('message', msg => {
    const text = msg.toString()
    console.log('💬 CHAT:', text)

    // 🔐 LOGIN ANIQLASH (unicode + oddiy)
    if (!loggedIn && /login|ʟᴏɢɪɴ|\/l/i.test(text)) {
      doLogin()
    }

    // ✅ Login muvaffaqiyatli bo‘lsa (chat belgilariga qarab)
    if (!loggedIn && /success|welcome|logged|kir/i.test(text)) {
      loggedIn = true
      afterLogin()
    }
  })

  bot.on('end', () => reconnect('end'))
  bot.on('kicked', r => reconnect('kick'))
  bot.on('error', e => console.log('⚠️', e.message))
}

// ===== LOGIN =====
function doLogin () {
  if (loginTries >= 3) return

  loginTries++
  console.log('🔐 Login yuborildi', loginTries)
  bot.chat(`/login ${PASSWORD}`)
}

// Agar login so‘ralmasa
function forceContinueIfNoLogin () {
  if (loggedIn) return

  console.log('⚠️ Login so‘ralmadi → davom etyapman')
  loggedIn = true
  afterLogin()
}

// ===== LOGIN DAN KEYIN =====
function afterLogin () {
  botStatus = '🟢 SMP ga kiryapti'

  setTimeout(() => bot.chat('/server smp'), 2000)
  setTimeout(() => bot.chat('/warp afk'), 5000)
  setTimeout(startAntiAfk, 7000)
}

// ===== ANTI AFK =====
function startAntiAfk () {
  clearInterval(antiAfkTimer)

  antiAfkTimer = setInterval(() => {
    const a = ['forward', 'left', 'right']
    const act = a[Math.floor(Math.random() * a.length)]

    bot.setControlState(act, true)
    setTimeout(() => bot.setControlState(act, false), 1200)

    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 300)

    bot.look(Math.random() * Math.PI * 2, 0, true)
  }, ANTI_AFK_INTERVAL)

  botStatus = '🟢 AFK rejim'
  console.log('🟢 Anti‑AFK yoqildi')
}

function reconnect (why) {
  if (reconnecting) return
  reconnecting = true

  console.log('🔁 Qayta ulanmoqda:', why)
  botStatus = '🔁 qayta ulanmoqda'
  clearInterval(antiAfkTimer)

  setTimeout(() => {
    reconnecting = false
    startBot()
  }, RECONNECT_DELAY)
}

startBot()
