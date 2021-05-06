var pgtools = require("pgtools")

const config = {
  
  user: "postgres",
  host: "localhost",
  password: "postgres",
  port: 5432
}

pgtools.createdb(config, "nodeProject", function(err, res) {

  if (err) {

    console.error(err)
    process.exit(-1)
  }

  console.log(res)
})