require('dotenv').config();

// imports
const port = process.env.PORT || 3001;
const cors = require('cors');
const express = require('express');
const app = express();
const { auth, requiresAuth } = require('express-openid-connect');
const bodyParser = require('body-parser')

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var server = app.listen(port, function() {
    console.log(`Server initialized on port ${port}`);
    console.log("From server.js");
});

const socket = require('socket.io');
const io = socket(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true,
    }
});
const { v4: uuidV4 } = require('uuid');

io.sockets.on('connection', function(socket) {
    console.log(`connected at: ${socket.id}`);
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        // socket.to(roomId).emit('user-connected', userId)
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
    socket.on('mouse', function(data) {
        console.log('location: ' + window.location)
        // socket.broadcast.to(currId).emit('mouse', data);
        socket.broadcast.emit('mouse', data);
        console.log(data);
    });
});

app.use(
    auth({
        //every route does not need authentication
        authRequired: false,
        auth0Logout: true,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET
    })
);


app.get('/:room', (req, res) => {
    if (req.params.room === "board") {
        console.log(req.query)
        console.log(req.params)
        res.render("whiteboard", { wb_socket_id: req.query.socket });
    } else {
        res.render('room', { roomId: req.params.room, name: req.oidc.user.name })
    }
})

app.post('/board', (req, res) => {
    res.redirect('/board?socket=' + req.body.wb_socket_id);
})

app.get('/', (req, res) => {
    //oidc = open id connect
    req.oidc.isAuthenticated() ? res.redirect(`/${uuidV4()}`) : res.render("home")
});

app.get('/profile', requiresAuth(), (req, res) => {
    //Gathered user data:
    //given_name, family_name, nickname, name, picture, email
    res.send(JSON.stringify(req.oidc.user));
});

app.get('/board/:room', requiresAuth(), (req, res) => {
    console.log('yo: ' + req.params.room);
    res.render("whiteboard", { roomId: req.params.room });
});