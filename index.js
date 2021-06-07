require('dotenv').config()
const express = require('express')
const session = require('express-session')
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt')
const { Pool, Client } = require('pg')

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

app.post('/signup', async function(req, res, next) {

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
        client.query("INSERT INTO users(username, email, hash) VALUES($1, $2, $3) RETURNING user_id", [username, email, generateHash(password)], (err, res) => {

            if (res) {

                resolve(res.rows[0].user_id)
            } else if (err) {

                resolve(false)
            }
        })
    })

    insertAccount = await insertAccount

    if (insertAccount != false) {

        console.log("signup up with user_id: " + insertAccount)

        req.session.user_id = insertAccount

        res.redirect("/profiles/" + req.session.user_id)

        next()
    } else {

        res.redirect("/")
        next()
    }
})

app.post('/login', async function(req, res, next) {

    let email = req.body.email
    let password = req.body.password

    function returnHashIfAccount(email) {
        return new Promise((resolve, reject) => {
            client.query("SELECT * FROM users WHERE email = $1", [email], function(err, res) {

                if (res.rows[0]) {

                    resolve(res.rows[0])
                } else {

                    resolve(false)
                }
            })
        })
    }

    if (await returnHashIfAccount(email) != false) {

        let account = await returnHashIfAccount(email)

        bcrypt.compare(password, account.hash, function(err, result) {

            if (!err && result) {

                console.log("logged in with user_id: " + account.user_id)

                req.session.user_id = account.user_id

                res.redirect("/profiles/" + req.session.user_id)
            } else {

                res.redirect("/")

                next()
            }
        })
    }
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

function returnIfAccount(id1, id2) {
    return new Promise((resolve, reject) => {
        if (id1 == id2 || (id1 && !id2)) {
            client.query("SELECT * FROM users WHERE user_id = $1", [id1], function(err, res) {

                if (res.rows[0]) {

                    resolve(res.rows[0])
                } else {

                    resolve(false)
                }
            })
        } else {
            resolve(false)
        }
    })
}

function findAccountWithId(id) {
    return new Promise((resolve, reject) => {
        client.query("SELECT * FROM users WHERE user_id = $1", [id], function(err, res) {

            if (err) {

                reject(err.stack)
            } else {

                resolve(res.rows[0])
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

app.get('/profiles/:user_id', async function(req, res) {

    res.render(__dirname + "/views/profile.ejs", {

        account: await findAccountWithId(req.params.user_id),
        userAccount: await returnIfAccount(req.session.user_id, req.params.user_id),
    })
});

app.get('/', async function(req, res) {

    res.render(__dirname + "/views/index.ejs", {
        userAccount: await returnIfAccount(req.session.user_id),
    })
})

app.get('/information', async function(req, res) {

    res.render(__dirname + "/views/information.ejs", {

        accounts: await accounts(),
        userAccount: await returnIfAccount(req.session.user_id),
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