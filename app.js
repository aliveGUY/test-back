const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello from server!')
})

app.listen(8080, () => {
  console.log('Server running on http://localhost:8080')
})
