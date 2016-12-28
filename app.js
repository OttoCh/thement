var express         = require('express'),
    session         = require('express-session'),
    MongoStore      = require('connect-mongo')(session),
    mongoose        = require('mongoose'),
    methodOverride  = require('method-override'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    http            = require('http'),
    port         		= 3500;
    app             = express()

mongoose.connect('mongodb://127.0.0.1:27017/tugasakhir')

app.all('/api/v1/*', [require('./middlewares/auth')])
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(methodOverride('X-HTTP-Method-Override'))

var student         = require('./routes/student.route')
var index           = require('./routes/index.route')

app.use('/', index)
app.use('/api/v1/student', student)

app.listen(port)
console.log('Thement running at ', port)
