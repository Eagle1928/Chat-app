const path = require('path')
const http = require('http')
const express = require('express') // npm init --> npm install express
const socketio = require('socket.io')
const Filter = require('bad-words') // a npm script named bad-words
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/user')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

//  IMPORTANT COMMANDS USING SOCKET

// 1) socket.emit --> will emit the event to the specific connection
// 2) io.emit --> will emit the event to everyone
// 3) socket.broadcast.emit --> will emit the event to everyone except the specific connection
// 4) io.on('commandname, () => { }) triggers events some from clients some from server.
// 5) io.to)room.emit --> emits an event to everybody in a specific room
// 6) socket.broadcast.to(room).emit --> emits an event to everyone in a specific room
//server (emit) -> client (recieve) -- acknowledgment --> server
//client (emit) -> server (recieve) -- acknowledgment --> client

io.on('connection', (socket) => {
    console.log('New WebSocket connection')
  
        socket.on('join', (options, callback) => {
          
          const {error, user} = addUser({id: socket.id, ...options})

          if(error) {
              console.log("error")
                return callback(error)
            } 
            socket.join(user.room) // joining a specific socket room
           
            socket.emit('message', generateMessage('Welcome','Admin'))
            socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, 'Admin'))
           io.to(user.room).emit('roomData', {
               room: user.room,
               users: getUsersInRoom(user.room)
           })
            callback()
        })

        socket.on('sendMessage', (message, callback) => {
            const filter = new Filter()
           const user =  getUser(socket.id)
            if(filter.isProfane(message)) {
                return callback(' Profainty is not allowed')
            }
            io.to(user.room).emit('message', generateMessage(message,user.username))
            callback()
        })

        socket.on('sendLocation',(coords,callback) => {
            const user =  getUser(socket.id)
            console.log(user)
            const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
            io.to(user.room).emit('locationMessage', generateLocationMessage(url,user.username))
            callback()
        })

        socket.on('disconnect', () => {
            const user = removeUser(socket.id)
            if(user) {
            io.to(user.room).emit('message',generateMessage(` ${user.username} has left`, 'Admin'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}! `)
})