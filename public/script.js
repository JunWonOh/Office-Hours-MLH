//peerjs -> npm i -g peer, peerjs --port 3000

const socket = io('/')
//use DOM to access the grid html element
const videoGrid = document.getElementById('video-grid')
//peer generates unique user IDs, on top of sending webRTC video/audio streams between peers
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3000'
})
//create a video html element
const myVideo = document.createElement('video')
//your own mic is muted
myVideo.muted = true
const peers = {}
//create a video and audio feed
navigator.mediaDevices.getUserMedia({
  video: true,
  //audio has more nuanced settings to improve quality, could just do audio: true
  audio: {
    autoGainControl: false,
    channelCount: 2,
    echoCancellation: false,
    latency: 0,
    noiseSuppression: true,
    sampleRate: 48000,
    sampleSize: 16,
    volume: 1.0
  }
}).then(stream => {
  //once the video/audio feed is created, call addVideoStream to append a new video from user
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    //answer the call by sending user's stream
    call.answer(stream)
    const video = document.createElement('video')
    //retrieve peer's streams 
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
  //when a socket is shared between users
  socket.on('user-connected', userId => {
    //call connectToNewUser in 100ms, passing in userId and stream
    setTimeout(connectToNewUser, 100, userId, stream)
  })
})

//once someone disconnects, remove them from dictionary
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

//when the url for the video chat is opened, generate a new user id
myPeer.on('open', id => {
  //send to server.js that 'join-room' is now active, as well as the current room and user id
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  //call userId, send them the video/audio stream
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    //get video/audio feed from other connected users (not userId), and add them as video elements on the page for userId
    addVideoStream(video, userVideoStream)
  })
  //when a user disconnects from a call, remove their video
  call.on('close', () => {
    video.remove()
  })
  //insert into peers dictionary defined at the top
  peers[userId] = call
}

//add a new video (user webcam) to the page
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

