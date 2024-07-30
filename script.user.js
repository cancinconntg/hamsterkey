// ==UserScript==
// @name        Hamster bikee keygen
// @version     1.9
// @homepageURL https://github.com/cancinconntg/hamsterkey/blob/main/README.md
// @downloadURL https://cancinconntg.github.io/hamsterkey/script.user.js
// @author      cancinconntg
// @namespace   Violentmonkey Scripts
// @match       *://cancinconntg.github.io/*
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceURL
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// @resource    BACKGROUND https://cancinconntg.github.io/hamster-bike-keygen/keygen_bg.jpg
// @noframes
// ==/UserScript==

const APP_TOKEN = 'd28721be-fd2d-4b45-869e-9f253b554e50'
const PROMO_ID = '43e35910-c168-4634-ad4f-52fd764a843f'

const DEBUG_MODE = false
const EVENTS_DELAY = DEBUG_MODE ? 350 : 20000

start()

function initProgress(keyText) {
  const delays = 6
  const progressPerDelay = 20
  let totalProgress = progressPerDelay * delays
  let emojiFlip = false
  keyText.innerText = `${emojiFlip ? '⏳' : '⌛'}0%`
  let curProgress = 0
  async function progressDelay(unexpected) {
    if (unexpected) {
      totalProgress += progressPerDelay
    }
    const delay = EVENTS_DELAY * delayRandom()
    const delayInterval = delay / progressPerDelay
    for (let i = 0; i < progressPerDelay; i++) {
      keyText.innerText = `${emojiFlip ? '⏳' : '⌛'}${Math.round(curProgress / totalProgress * 100)}%`
      curProgress++
      emojiFlip = !emojiFlip
      await sleep(delayInterval)
    }
  }

  return progressDelay
}

async function start() {
  const CLIENT_ID = GM_getValue('clientID', generateClientId())
  GM_setValue('clientID', CLIENT_ID)
  console.log('clientID', CLIENT_ID)

  const keyTexts = []
  const copyBtns = []
  const nextBtns = []

  const { startBtn, buttons } = createLayout(keyTexts, copyBtns, nextBtns)

  startBtn.onclick = () => {
    buttons.innerHTML = ''
    keyTexts.forEach(keyText => {
      keyText.innerText = '⏳⏳⏳'
    })
    keygen().catch(onKeygenFail)
  }

  async function keygen() {
    const tokens = await Promise.all([...Array(4)].map(() => login(CLIENT_ID)))
    const progressDelays = keyTexts.map(keyText => initProgress(keyText))
    console.log('logins, tokens:', tokens)
    
    const generateKeyPromises = tokens.map(async (token, index) => {
      for (let i = 0; i < 7; i++) {
        await progressDelays[index](i >= 5)
        const hasCode = await emulateProgess(token)
        console.log(`Key ${index + 1} - emulate progress...`, hasCode)
        if (hasCode) {
          break
        }
      }
      await progressDelays[index]()
      return generateKey(token)
    })

    const keys = await Promise.all(generateKeyPromises)
    console.log('keys:', keys)

    keys.forEach((key, index) => {
      keyTexts[index].innerText = key
      copyBtns[index].onclick = () => {
        navigator.clipboard.writeText(key)
        const copyBtnDefaultText = copyBtns[index].innerText
        copyBtns[index].innerText = '✅'
        setTimeout(() => copyBtns[index].innerText = copyBtnDefaultText, 1500)
      }
    })

    buttons.innerHTML = ''
    nextBtns.forEach(nextBtn => {
      buttons.appendChild(nextBtn)
    })
  }

  function onKeygenFail(e) {
    keyTexts.forEach(keyText => {
      keyText.style.fontSize = '12px'
      keyText.innerText = e.toString()
    })
    buttons.innerHTML = ''
    nextBtns.forEach(nextBtn => {
      buttons.appendChild(nextBtn)
    })
  }
}

function createLayout(keyTexts, copyBtns, nextBtns) {
  document.body.innerHTML = ''

  const container = document.createElement('div')

  container.style.display = 'flex'
  container.style.fontFamily = 'monospace'
  container.style.alignItems = 'flex-end'
  container.style.boxSizing = 'border-box'
  container.style.position = 'absolute'
  container.style.top = '0px'
  container.style.right = '0px'
  container.style.margin = '0'
  container.style.padding = '0'
  const layoutWidth = Math.min(window.innerWidth, 768)
  const layoutHeight = Math.min(layoutWidth, window.innerHeight)
  container.style.width = `${layoutWidth}px`
  container.style.height = `${layoutHeight}px`
  container.style.background = 'url('+GM_getResourceURL('BACKGROUND')+')'
  container.style.backgroundPosition = 'center'
  container.style.backgroundSize = 'cover'

  const overlay = document.createElement('div')

  overlay.style.display = 'flex'
  overlay.style.flexDirection = 'column'
  overlay.style.width = '100%'
  overlay.style.margin = '0'
  overlay.style.padding = '0 0 30px 0'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'
  overlay.style.background = 'rgba(0, 0, 0, 0.6)'
  overlay.style.backgroundSize = 'cover'

  const promoLink = document.createElement('a')
  promoLink.style.color = 'lime'
  promoLink.style.textShadow = 'black 0 0 3px'
  promoLink.style.position = 'absolute'
  promoLink.style.left = '10px'
  promoLink.style.top = '10px'
  promoLink.href = 'https://georg95.github.io/bike-keygen.html'
  promoLink.innerText = 'georg95.github.io/bike-keygen.html'
  promoLink.target = '_blank'

  const buttons = document.createElement('div')
  buttons.style.background = 'none'
  buttons.style.display = 'flex'
  buttons.style.margin = '0'
  buttons.style.padding = '0'

  const startBtn = document.createElement('button')
  startBtn.style.width = '100px'
  startBtn.style.height = '100px'
  startBtn.style.fontSize = '50px'
  startBtn.innerText = '▶️'

  buttons.appendChild(startBtn)
  overlay.appendChild(promoLink)
  overlay.appendChild(buttons)
  container.appendChild(overlay)
  document.body.appendChild(container)

  for (let i = 0; i < 4; i++) {
    const keyText = document.createElement('div')
    keyText.style.margin = '20px 0'
    keyText.style.padding = '0'
    keyText.style.background = 'none'
    keyText.style.color = 'white'
    keyText.style.fontSize = `${Math.min(Math.floor(layoutWidth / 16))}px`
    keyTexts.push(keyText)
    overlay.appendChild(keyText)

    const copyBtn = document.createElement('button')
    copyBtn.style.width = '50px'
    copyBtn.style.height = '50px'
    copyBtn.style.fontSize = '25px'
    copyBtn.style.marginRight = '20px'
    copyBtn.innerText = '📋'
    copyBtns.push(copyBtn)

    const nextBtn = document.createElement('button')
    nextBtn.style.width = '50px'
    nextBtn.style.height = '50px'
    nextBtn.style.fontSize = '25px'
    nextBtn.innerText = '↻'
    nextBtns.push(nextBtn)
  }

  return { startBtn, buttons }
}

function delayRandom() {
  return (Math.random()/3 + 1)
}

async function login(clientId) {
    if(!clientId) { throw new Error('no client id') }
    if (DEBUG_MODE) {
      return 'd28721be-fd2d-4b45-869e-9f253b554e50:deviceid:1722266117413-8779883520062908680:8B5BnSuEV2W:1722266117478'
    }
    const { clientToken } = await vmFetch('https://api.gamepromo.io/promo/login-client', {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io'
        },
        method: 'POST',
        body: {
            appToken: APP_TOKEN,
            clientId: clientId,
            clientOrigin: 'deviceid'
        }
    })
    return clientToken
}

const attempts = {}
async function emulateProgess(clientToken) {
    if(!clientToken) { throw new Error('no access token') }
    if (DEBUG_MODE) {
      attempts[clientToken] = (attempts[clientToken] || 0) + 1
      return attempts[clientToken] >= 5
    }
    const { hasCode } = await vmFetch('https://api.gamepromo.io/promo/register-event', {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io',
            'Authorization': `Bearer ${clientToken}`
        },
        method: 'POST',
        body: {
            promoId: PROMO_ID,
            eventId: crypto.randomUUID(),
            eventOrigin: 'undefined'
        }
    })
    return hasCode
}

async function generateKey(clientToken) {
    if (DEBUG_MODE) {
      if (attempts[clientToken] >= 5) {
        return 'BIKE-3YD-5ZA6-3VJA-Y77'
      } else {
        return ''
      }
    }
    const { promoCode } = await vmFetch('https://api.gamepromo.io/promo/create-code', {
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'Host': 'api.gamepromo.io',
            'Authorization': `Bearer ${clientToken}`
        },
        method: 'POST',
        body: {
            promoId: PROMO_ID
        }
    })
    return promoCode
}

async function vmFetch(url, options) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: options.method,
      url: url,
      headers: options.headers,
      data: typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
      responseType: 'json',
      onload: response => {
        try {
          console.log(response.responseText)
          resolve(JSON.parse(response.responseText))
        } catch(e) {reject(response.responseText)}
      },
      onerror: response => {
        reject(response)
      },
    })
  })
}
async function sleep(ms) {
    return new Promise(res => setTimeout(res, ms))
}
function generateClientId() {
    const timestamp = Date.now();
    const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
    return `${timestamp}-${randomNumbers}`;
}
