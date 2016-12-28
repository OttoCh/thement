var express         = require('express'),
    session         = require('express-session'),
    MongoStore      = require('connect-mongo')(session),
    methodOverride  = require('method-override'),
    mongoose        = require('mongoose'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    http            = require('http'),
    app             = express()

mongoose.connect('mongodb://127.0.0.1:27017/tugasakhir')

app.all('/api/v1/*', [require('./middlewares/auth')])
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(methodOverride('X-HTTP-Method-Override'))

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: '8sayfh3ruh2893hr',
  cookie: { maxAge: 60000 }
}));

var student         = require('./routes/student.route')
var index           = require('./routes/index.route')

app.use('/', index)
app.use('/api/v1/student', student)

app.listen(3500)
console.log('Thement running at 3500')
