var pgtools = require("pgtools")

const config = {

    user: "postgres",
    host: "localhost",
    password: "postgres",
    port: 5432
}

pgtools.createdb(config, "nodeProject1", function(error, response) {

    if (error) {

        console.error(error)
        process.exit(-1)
    }

    console.log(response)
})