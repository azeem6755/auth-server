require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const app = express();
const auth = require('./middleware/auth')

app.use(express.json());

// Logic goes here

module.exports = app;


const User = require('./model/user');

app.post('/register', async (req, res) => {
    try {
        const {firstName, lastName, email, password} = req.body;

        if (!(email && password && firstName && lastName)) {
            res.status(400).send('All input is required.');
        }

        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            first_name: firstName,
            last_name: lastName,
            email: email.toLowerCase(), // sanitize
            password: encryptedPassword,
        });

        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "5h",
            }
        );
        user.token = token;

        res.status(201).json(user)

    }
    catch(e) {
        console.log(e)
    }
});

app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!(email && password)) {
            res.status(400).send('Please enter email and password');
        }

        const user = await User.findOne({email});

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '5h',
                }
            );

            user.token = token;
            return res.status(200).json(user);
        }
        return res.status(400).send("Invalid Credentials");
    }
    catch(e) {
        console.log(e)
    }
});

app.get('/welcome', auth, (req, res) => {
    res.status(200).send('Welcome to Goa Singham.')
});
