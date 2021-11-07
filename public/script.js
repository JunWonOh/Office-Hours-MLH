const socket = io('/')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3000'
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-connected', userId => {
    console.log('User connected: ' + userId)
}) 