const mineflayer = require('mineflayer')
const readline = require('readline')

// ====== SOZLAMALAR ======
const HOST = 'articraft.uz'
const PORT = 25565
const USERNAME = 'RellixsAFK'
const VERSION = '1.21'
const PASSWORD = '252356n1'

const ANTI_AFK_INTERVAL = 3 * 60 * 1000 // 3 minut
const RECONNECT_DELAY = 5000

let bot
let antiAfkTimer = null
let reconnecting = false

// ====== KONSOL BOSHQARUV ======
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('line', (input) => {
  if (!input || !bot) return
  bot.chat(input)
})

// ====== BOT YARATISH ======
function startBot() {
  console.log('🔄 Bot ulanmoqda...')

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: VERSION
  })

  setupEvents()
}

// ====== EVENTLAR ======
function setupEvents() {
  bot.once('spawn', () => {
    console.log('✅ Serverga kirdi → SMP ga o‘tyapti')
    setTimeout(() => bot.chat('/server smp'), 500)
  })

  bot.on('message', (msg) => {
    const text = msg.toString().toLowerCase()

    if (text.includes('login') || text.includes('/l')) {
      console.log('🔐 Login qilinyapti')
      setTimeout(() => bot.chat(`/login ${PASSWORD}`), 1200)
    }

    if (text.includes('smp')) {
      setTimeout(() => {
        console.log('📍 SMP → /warp afk')
        bot.chat('/warp afk')
      }, 1200)

      setTimeout(() => startAntiAfk(), 3000)
    }
  })

  bot.on('kicked', (reason) => {
    console.log('❌ Kick:', JSON.stringify(reason))
    reconnect()
  })

  bot.on('end', () => {
    console.log('⚠️ Ulanish uzildi')
    reconnect()
  })

  bot.on('error', (err) => {
    console.log('⚠️ Error:', err)
  })
}

// ====== QAYTA ULANISH ======
function reconnect() {
  stopAntiAfk()
  if (reconnecting) return
  reconnecting = true

  setTimeout(() => {
    reconnecting = false
    startBot()
  }, RECONNECT_DELAY)
}

// ====== ANTI AFK ======
function startAntiAfk() {
  stopAntiAfk()
  smallMove() // birinchi harakatni darhol bajarish

  antiAfkTimer = setInterval(() => {
    smallMove()
  }, ANTI_AFK_INTERVAL)

  console.log(`🟢 Anti-AFK ishga tushdi (${ANTI_AFK_INTERVAL/60000} minut)`)
}

function stopAntiAfk() {
  if (antiAfkTimer) {
    clearInterval(antiAfkTimer)
    antiAfkTimer = null
  }
}

// ====== TASODIFIY HARAKAT ======
function smallMove() {
  const steps = 2 + Math.floor(Math.random() * 3) // 2–4 harakat
  for (let i = 0; i < steps; i++) {
    const actions = ['forward', 'left', 'right']
    const action = actions[Math.floor(Math.random() * actions.length)]
    const duration = 1200 + Math.random() * 1800 // 1.2–3s

    bot.setControlState(action, true)
    setTimeout(() => bot.setControlState(action, false), duration)

    // odamga o‘xshab qarash
    const yaw = Math.random() * Math.PI * 2
    const pitch = (Math.random() - 0.5) * Math.PI / 4
    bot.look(yaw, pitch, true)
  }

  // warp afk ga kelgach 2 marta sakrash
  bot.setControlState('jump', true)
  setTimeout(() => bot.setControlState('jump', false), 300)
  setTimeout(() => {
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 300)
  }, 500)
}

// ====== START ======
startBot()