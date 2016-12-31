var express         = require('express'),
    redis           = require('redis'),
    session         = require('express-session'),
    redisStore      = require('connect-redis')(session),
    methodOverride  = require('method-override'),
    mongoose        = require('mongoose'),
    client          = redis.createClient(),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    http            = require('http'),
    jade            = require('jade'),
    path            = require('path'),
    morgan          = require('morgan'),
    util            = require('util'),
    app             = express()

mongoose.connect('mongodb://127.0.0.1:27017/tugasakhir')

app.all('/api/v1/*', [require('./middlewares/auth')])

app.use(session({
  secret: 'idf032nasd',
  store: new redisStore({host: 'localhost', port: 6379, client:client, ttl: 260}),
  saveUninitialized: false,
  resave: false
}))

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
//app.use(bodyParser({ keepExtensions: true, uploadDir: __dirname+'/public/uploads'}))
app.use(cookieParser())
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(morgan('dev'))
app.use('/static', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade')

var student_apis    = require('./routes/api.student.route')
var student         = require('./routes/student.route')

var admin           = require('./routes/admin.route')
var index           = require('./routes/index.route')

app.use('/', index)
app.use('/student', student)
app.use('/api/v1/student', student_apis)
app.use('/api/v1/admin', admin)

app.listen(3500)
console.log('Thement running at 3500')
