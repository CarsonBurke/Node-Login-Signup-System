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
try {
    client.connect()
    console.log("connected to db")
} catch (error) {

    console.log("failed to connect to db")
}

client.query("INSERT INTO users(col1) VALUES('bob') RETURNING *", (error, result) => {
    if (error) {
        console.log(error.stack)
    } else {
        console.log(result.rows[0])
    }
})

client.query("SELECT * FROM users", (error, result) => {
    if (error) {
        console.log(error.stack)
    } else {

        let rows = result.rows

        for (let row of rows) {

            console.log(row)
        }
    }
})

var server = app.listen(5200)

//https://node-postgres.com/

//https://stackoverflow.com/questions/34351395/how-to-return-postgresql-database-result-by-using-pg-and-node-only