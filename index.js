let express = require('express')
let app = express()

app.use(express.static(__dirname + '/public'))

const { Client } = require('pg')

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'nodeProject1',
})

client.connect()

const text = "INSERT INTO users(col1) VALUES('a') RETURNING *"

client.query(text, (err, res) => {
    if (err) {
        console.log(err.stack)
    } else {
        console.log(res.rows[0])
    }
})

var server = app.listen(5200)

//https://node-postgres.com/