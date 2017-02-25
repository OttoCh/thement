var express         = require('express'),
    session         = require('express-session'),
    MongoStore      = require('connect-mongo')(session),
    methodOverride  = require('method-override'),
    mongoose        = require('mongoose'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    http            = require('http'),
    jade            = require('jade'),
    path            = require('path'),
    morgan          = require('morgan'),
    winston         = require('winston'),
    compression     = require('compression'),
    app             = express();

mongoose.connect('mongodb://wildan:wildan123@ds028679.mlab.com:28679/tugasakhir');

app.all('/api/v1/*', [require('./middlewares/auth')]);

// express-session
app.use(session({
  secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
  proxy: true,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ url: 'mongodb://wildan:wildan123@ds028679.mlab.com:28679/tugasakhir'})
  })
);


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(morgan('dev'));
app.use(compression());
app.use('/static', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var student_apis    = require('./routes/api.student.route');
var student         = require('./routes/student.route');
var lecturer        = require('./routes/lecturer.route');

var admin           = require('./routes/admin.route');
var index           = require('./routes/index.route');

app.use('/', index);
app.use('/student', student);
app.use('/lecturer', lecturer);
app.use('/admin', admin);
app.use('/api/v1/student', student_apis);
app.use('/api/v1/admin', admin);

app.listen(3500);
console.log('Thement running at 3500');
