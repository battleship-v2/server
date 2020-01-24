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
    io.emit('fetch-rooms', rooms)
  })

  socket.on('join-room', function(payload) {
    let index = rooms.findIndex(room => room.name == payload.roomName)
    rooms[index].players.push({
      name: payload.playerName,
      score: 0,
      hisTurn: false,
    })

    socket.join(payload.roomName)
    // io.to(payload.roomName).emit('update-room', rooms[index])
    io.emit('fetch-rooms', rooms)
  })

  socket.on('game', function(room) {
    room.isPlaying = true
    room.players[0].hisTurn = true
    io.in(room.name).emit('change-status', room)
  })

  socket.on('turn', function(room) {
      room.players[0] === false
      room.players[1] === true
      io.in(room.name).emit('change-turn', room)
  })

  socket.on('end', function(room) {
      let text = ''
      if(room.players[0].score > room.players[1].score) {
        text = `${room.players[0].name} Win the game with score ${room.players[0].score}`
      }else {
        text = `${room.players[1].name} Win the game with score ${room.players[1].score}`
      }

      const result = {
          text: text,
          score : {
              player1: room.players[0].score,
              player2: room.players[1].score
          }
      }

      io.in(room.name).emit('end-result', result)
      
  })
})

server.listen(port, () => console.log('listening on port', port))
