let express = require('express')
let session = require('express-session')
let bodyParser = require("body-parser")
var uniqid = require('uniqid')

let app = express()

const { Client } = require('pg')

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'nodeProject1',
})

try {

    client.connect()
    console.log("connected to db")
} catch {

    console.log("failed to connect to db")
}

app.use(session({
    genid: function() { return uniqid },
    name: "userSession",
    secret: 'secretCode',
    saveUninitialized: true,
    resave: false,
    duration: 2592000000,
    activeDuration: 2592000000,
    secure: true
}))

app.use(function(req, res, next) {
    if (!req.session.username) {

        req.session.username = {}
    }
    if (!req.session.email) {

        req.session.email = {}
    }
    if (!req.session.passcode) {

        req.session.passcode = {}
    }

    next()
})


app.use(bodyParser.urlencoded({ extended: true }))

app.post('/signup', function(req, res, next) {

    if (req.body.username && req.body.email && req.body.passcode) {

        //req.session.username: req.body.username
        req.session.email = req.body.email
        req.session.passcode = req.body.passcode

        console.log(req.session.username)

        insertAccount(req.session.username, req.session.email, req.session.passcode)

        res.redirect("/account")
    }
    next()
})

app.post('/login', function(req, res) {

})

function insertAccount(username, email, passcode) {
    client.query("INSERT INTO users(username, email, passcode) VALUES ('" + username + "', '" + email + "', '" + passcode + "') RETURNING *", (req, res) => {
        if (req) {
            console.log(req.stack)
        } else {
            //console.log(res.rows[0])
        }
    })
}

let accounts

client.query("TABLE users", function(req, res) {
    if (req) {
        console.log(req.stack)
    } else {

        accounts = res.rows
    }
})

function isUser(req) {
    if (req.session == null) {

        return true
    }
    return false
}

function requireLogin(req, res, next) {
    if (isUser(req)) {

        console.log("No user")
        res.redirect("/#form")
    } else {
        next()
    }
}

app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {

    res.render(__dirname + "/public/index.ejs", {
        hasAccount: isUser(req)
    })
})

app.get('/account', requireLogin, function(req, res) {
    console.log(req.session.username)
    res.render(__dirname + "/public/account.ejs", {
        account: {
            username: req.session.username,
            email: req.session.email,
            passcode: req.session.passcode
        },
        hasAccount: isUser(req)
    })
})

app.get('/information', function(req, res) {

    res.render(__dirname + "/public/information.ejs", {

        accounts: accounts,
        hasAccount: isUser(req)
    })
})

app.get('/navbar', function(req, res) {

    res.render(__dirname + "/public/information.ejs", {

        accounts: accounts,
        hasAccount: isUser(req)
    })
})

app.get('/logout', function(req, res) {

    req.session = null
    res.redirect('/')
})

var server = app.listen(5200)

//https://node-postgres.com/

//https://stackoverflow.com/questions/34351395/how-to-return-postgresql-database-res-by-using-pg-and-node-only

//https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application

//https://stackabuse.com/using-postgresql-with-nodejs-and-node-postgres/

//https://expressjs.com/en/resources/middleware/session.html

//