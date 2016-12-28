var express         = require('express'),
    session         = require('express-session'),
    MongoStore      = require('connect-mongo')(session),
    methodOverride  = require('method-override'),
    http            = require('http'),
    port         		= process.env.PORT || 3500;
    app             = express()

app.all('/api/v1/*', [require('./middlewares/auth')])
app.use(methodOverride('X-HTTP-Method-Override'));

var student         = require('./routes/student.route')
var index           = require('./routes/index.route')

app.use('/', index)
app.use('/api/v1/student', student)

app.listen(port)
console.log('Thement running at ', port)
