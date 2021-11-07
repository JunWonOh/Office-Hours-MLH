require('dotenv').config();

// imports
const port = process.env.PORT || 3001;
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { auth, requiresAuth } = require('express-openid-connect');

app.set('view engine', 'ejs');
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
        socket.broadcast.to(roomId).emit('mouse', data);
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
        res.render("whiteboard");
    }
    res.render('room', { roomId: req.params.room, name: req.oidc.user.name })
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

// app.get('/board', requiresAuth(), (req, res) => {
//     console.log('hello')
//     res.render("whiteboard");
// });