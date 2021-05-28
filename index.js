require('dotenv').config()
let express = require('express')
let session = require('express-session')
let bodyParser = require("body-parser")
let bcrypt = require('bcrypt')
let { Pool, Client } = require('pg');
const { post } = require('jquery')

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

    function insertAccount() {
        return new Promise(function(resolve) {
            client.query("INSERT INTO users(username, email, password) VALUES('" + username + "', '" + email + "', '" + generateHash(password) + "') RETURNING *", (err, res) => {

                resolve(res.rows[0].id)
            })
        })
    }

    addValues()

    async function addValues() {

        req.session.id = await insertAccount()
        req.session.username = username
        req.session.email = email
        req.session.password = generateHash(password)

        console.log("id: " + JSON.stringify(req.session))

        res.redirect("/account")

        next()
    }
})

app.post('/login', function(req, res) {

})

let accounts

client.query("TABLE users", function(err, res) {

    if (err) {

        console.log(err.stack)
    } else {

        accounts = res.rows
    }
})

function isUser(req) {

    if (req.session && req.session.username) {

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

renderPages()

function renderPages() {

    app.use(express.static(__dirname + '/views'))

    app.get('/', function(req, res) {

        res.render(__dirname + "/views/index.ejs", {

            hasAccount: isUser(req)
        })
    })

    app.get('/account', enforceAccount, function(req, res) {

        res.render(__dirname + "/views/account.ejs", {
            account: {
                username: req.session.username,
                email: req.session.email,
                password: req.session.password
            },
            hasAccount: isUser(req)
        })
    })

    //app.get('/:id', function(req, res) {
    //
    //    for (let account of accounts) {
    //
    //        if (account.id == '/:id') {
    //
    //            console.log(account.id)
    //
    //            res.render(__dirname + "/views/account.ejs", {
    //                account: {
    //                    username: req.session.username,
    //                    email: req.session.email,
    //                    password: req.session.password
    //                },
    //                hasAccount: isUser(req)
    //            })
    //        }
    //    }
    //})

    app.get('/information', function(req, res) {

        for (let account of accounts) {

            if (account.username == '/information') {

                console.log(account.id)
            }
        }

        res.render(__dirname + "/views/information.ejs", {

            accounts: accounts,
            hasAccount: isUser(req)
        })
    })

    app.get('/navbar', function(req, res) {

        res.render(__dirname + "/views/information.ejs", {

            accounts: accounts,
            hasAccount: isUser(req)
        })
    })

    app.get('/logout', function(req, res, next) {

        req.session.destroy()
        res.redirect('/')
        next()
    })
}

app.listen(5200)

//https://node-postgres.com/

//https://stackoverflow.com/questions/34351395/how-to-return-postgresql-database-res-by-using-pg-and-node-only

//https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application

//https://stackabuse.com/using-postgresql-with-nodejs-and-node-postgres/

//https://expressjs.com/en/resources/middleware/session.html

//