let express = require('express')
let app = express()

app.use(express.static(__dirname + '/public'))

var server = app.listen(5200)