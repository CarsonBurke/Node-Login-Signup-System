require('dotenv').config()
const express = require('express')
const session = require('express-session')
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt')
const { Pool, Client } = require('pg')
const { Router } = require('express')

let app = express()

let client = new Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT
})

try {

    client.connect()
    console.log("connected to db")
} catch {

    console.log("failed to connect to db")
}

app.use(session({
    name: "userSession",
    secret: 'secretCode',
    saveUninitialized: true,
    resave: false,
    duration: 2592000000,
    activeDuration: 2592000000,
    secure: true
}))

app.use(bodyParser.urlencoded({ extended: true }))

app.post('/signup', function(req, res, next) {

    const username = req.body.username
    const email = req.body.email
    const password = req.body.password

    if (!username || !email || !password) {

        res.redirect("/#form")
        return
    }

    function generateHash(password) {
        const hash = bcrypt.hashSync(password, 10)

        return hash
    }

    let insertAccount = new Promise((resolve, reject) => {
        client.query("INSERT INTO users(username, email, hash) VALUES('" + username + "', '" + email + "', '" + generateHash(password) + "') RETURNING *", (err, res) => {

            if (res) {

                resolve(res.rows[0].user_id)
            }
        })
    })

    insertAccount.then((value) => {

        console.log("signup up with user_id: " + value)

        req.session.user_id = value
        req.session.username = username
        req.session.email = email
        req.session.hash = generateHash(password)

        res.redirect("/profiles/" + req.session.user_id)

        next()
    })
})

app.post('/login', function(req, res) {

    let password = req.body.password

    accounts().then(

        function(value) {

            for (let account of value) {

                bcrypt.compare(password, account.hash, function(err, result) {

                    if (!err && result) {

                        console.log("logged in with user_id: " + account.user_id)

                        req.session.user_id = account.user_id
                        req.session.username = account.username
                        req.session.email = account.email
                        req.session.hash = account.hash

                        res.redirect("/profiles/" + req.session.user_id)
                    }
                })
            }
        })
})

function accounts() {
    return new Promise((resolve, reject) => {
        client.query("TABLE users", function(err, res) {

            if (err) {

                reject(err.stack)
            } else {

                resolve(res.rows)
            }
        })
    })
}

function isUser(req) {

    if (req.session && req.session.user_id) {

        return true
    }
    return false
}

function compareAccount(id1, id2) {

    if (id1 == id2) {

        return true
    }

    return false
}

function enforceAccount(req, res, next) {

    if (!isUser(req)) {

        console.log('not logged in, redirected to /#form')
        res.redirect("/#form")
    } else {

        next()
    }
}

app.use(express.static(__dirname + '/views'))

app.get('/profiles/:user_id', function(req, res) {

    accounts().then(

        function(value) {

            for (let account of value) {

                if (account.user_id == req.params.user_id) {

                    res.render(__dirname + "/views/profile.ejs", {

                        account: account,
                        isAccount: compareAccount(req.session.user_id, account.user_id),
                        userAccount: {
                            user_id: req.session.user_id,
                            username: req.session.username,
                            email: req.session.email,
                            hash: req.session.hash
                        },
                        hasAccount: isUser(req)
                    })

                    break
                }
            }
        })
});

app.get('/', function(req, res) {

    res.render(__dirname + "/views/index.ejs", {
        userAccount: {
            user_id: req.session.user_id,
            username: req.session.username,
            email: req.session.email,
            hash: req.session.hash
        },
        hasAccount: isUser(req)
    })
})

app.get('/information', function(req, res) {
    accounts().then(

        function(value) {

            res.render(__dirname + "/views/information.ejs", {

                accounts: value,
                userAccount: {
                    user_id: req.session.user_id,
                    username: req.session.username,
                    email: req.session.email,
                    hash: req.session.hash
                },
                hasAccount: isUser(req)
            })
        })
})


app.get('/logout', function(req, res, next) {

    req.session.destroy()
    res.redirect('/')
    next()
})

app.listen(5200)

//https://node-postgres.com/

//https://stackoverflow.com/questions/34351395/how-to-return-postgresql-database-res-by-using-pg-and-node-only

//https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application

//https://stackabuse.com/using-postgresql-with-nodejs-and-node-postgres/

//https://expressjs.com/en/resources/middleware/session.html

//https://github.com/Createdd/simpleDynamicNodeJS/blob/master/router.js

//