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
    flash           = require('express-flash'),
    async           = require('async'),
    config          = require('./config/db.json'),
    app             = express();

mongoose.connect(config.local, function(err){
    if(!err){
        console.log('CONNECTED to DB');
    } else {
        // send telegram bot
        console.log('Cant connect to mongodb server');
    }
});

app.all('/api/v1/*', [require('./middlewares/auth')]);

// express-session
app.use(session({
  secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
  proxy: true,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ url: config.local})
  })
);

// flash session
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 60000 },
    store: new MongoStore({ url: config.local}),
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));
app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(morgan('dev'));
app.use('/static', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var student_apis    = require('./routes/api.student.route');
var student         = require('./routes/student.route');
var lecturer        = require('./routes/lecturer.route');

var admin           = require('./routes/admin.route');
var superAdmin      = require('./routes/admin/super');
var operator        = require('./routes/admin/operator');
var kaprodi         = require('./routes/admin/kaprodi');
var index           = require('./routes/index.route');

app.use('/', index);
app.use('/student', student);
app.use('/lecturer', lecturer);
app.use('/admin', admin);
app.use('/operator', operator);
app.use('/kaprodi', kaprodi);
app.use('/super', superAdmin);

app.use('/api/v1/student', student_apis);
app.use('/api/v1/admin', admin);

app.listen(3500);
console.log('Thement running at 3500');
