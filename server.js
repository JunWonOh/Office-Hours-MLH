require('dotenv').config();

// imports
const port = process.env.PORT || 3001;
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { auth, requiresAuth } = require('express-openid-connect');

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

app.get('/', (req, res) => {
    //oidc = open id connect
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
    //how to obtain user data:
    //given_name, family_name, nickname, name, picture, email
    res.send(JSON.stringify(req.oidc.user));
});


app.listen(port, function() {
    console.log(`Server initialized on port ${port}`);
    console.log("From server.js");
});