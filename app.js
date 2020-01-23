const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 3000

const rooms = [
  {
    name: 'Shadow walker',
    players: [],
    isPlaying: false,
  },
  {
    name: 'Light runner',
    players: [],
    isPlaying: false,
  },
]

app.get('/', function(req, res) {
  res.json({ message: 'Server alive' })
})

io.on('connect', function(socket) {
  io.emit('fetch-rooms', rooms)

  socket.on('create-room', function(payload) {
    rooms.push({ name: payload, players: [], isPlaying: false })
    io.emit('fetch_rooms', rooms)
  })

  socket.on('join-room', function(payload) {
    let index = rooms.findIndex(room => room.name == payload.roomName)
    rooms[index].players.push({
      name: payload.playerName,
      score: 0,
      hisTurn: false,
    })

    socket.join(payload.roomName)
    io.to(payload.roomName).emit('update-room', rooms[index])
  })
})

server.listen(port, () => console.log('listening on port', port))
