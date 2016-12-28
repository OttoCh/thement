var express         = require('express'),
    session         = require('express-session'),
    MongoStore      = require('connect-mongo')(session),
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override'),
    http            = require('http'),
    port         		= process.env.PORT || 3500;
    app             = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('X-HTTP-Method-Override'));

app.get('/', function(req, res){
  res.send('thement')
})

app.listen(port)
console.log('Thement running at ', port)
