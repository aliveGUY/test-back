const express = require('express')
const cors = require('cors')
const app = express()

const allowedOrigins = ['http://localhost:3000', 'https://test-front-lv0s.onrender.com']

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: '*'
}

const database = [
  'Apple',
  'Banana',
  'Orange',
  'Tomato',
]

const progressTracking = {}

app.use(cors(corsOptions))


const progressBar = (id, percent, time) => `
<span
hx-get="https://test-back-220v.onrender.com/progress/${id}"
hx-trigger="every 600ms"
hx-target="this"
hx-swap="outerHTML"
>
Progress for ${id}:  ${percent}%. Processing will complete in ${time} seconds.
</span>
`


const minDuration = 10000

app.get('/', (req, res) => {
  const response = database.map(item => `
    <list-item id="${item}" href="${item}">
      <span slot="item">${item}</span>
    </list-item>
    <div id="${item}-progress"></div>
    `).join('')
  res.send(`<ul>${response}</ul>`)
})

app.post('/start/:id', (req, res) => {
  const { id } = req.params
  const startTime = Date.now()

  const progress = { value: 0, interval: null, startTime }


  progress.interval = setInterval(() => {
    progress.value += 10
    if (progress.value >= 100) {
      progress.value = 100
      clearInterval(progress.interval)
    }
  }, 1000)

  const endTime = startTime + minDuration
  const remainingTime = Math.max(endTime - Date.now(), 0)


  res.send(progressBar(id, progress.value, Math.ceil(remainingTime / 1000)))

  setTimeout(() => {
    if (progressTracking[id] && progressTracking[id].interval) {
      clearInterval(progressTracking[id].interval)
    }
    progressTracking[id] = null
  }, remainingTime)

  progressTracking[id] = progress

})


app.get('/progress/:id', (req, res) => {
  const { id } = req.params
  const progress = progressTracking[id]

  if (!progress) {
    res.send('')
    return
  }

  const endTime = progress.startTime + minDuration
  const remainingTime = Math.max(endTime - Date.now(), 0)

  res.send(progressBar(id, progress.value, Math.ceil(remainingTime / 1000)))
})

app.get('/is-any-in-progress', (req, res) => {
  let progressData = ''
  let foundProgress = false

  for (const [id, progress] of Object.entries(progressTracking)) {
    if (!progress) continue

    const endTime = progress.startTime + minDuration
    const remainingTime = Math.max(endTime - Date.now(), 0)

    progressData += progressBar(id, progress.value, Math.ceil(remainingTime / 1000))

    if (!foundProgress) {
      res.set('HX-Target', `#${id}-progress`)
      foundProgress = true
    }
  }

  console.log(res.headers)

  if (foundProgress) {
    res.send(progressData)
  } else {
    res.send('')
  }
})



app.listen(8080, () => {
  console.log('Server running on http://localhost:8080')
})
