var express     = require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    morgan      = require('morgan'),
    mongoose    = require('mongoose'),
    jwt         = require('jsonwebtoken'),
    config      = require('./config'),
    User        = require('./models/user.model')

var port        = process.env.PORT || 3300;
mongoose.connect(config.database)
app.set('superSecret', config.secret)

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(morgan('dev'))


// sample user
app.get('/setup', function(req, res){
  var wil = new User ({
    name: 'wildan',
    password: 'wildan123',
    admin: true
  })

  wil.save(function(err){
    if(err) throw err

    console.log('user saved')
    res.json({succes: true})
  })
})

// APIs
var router = express.Router()

router.post('/auth', function(req, res){
  User.findOne({
    name: req.body.name
  }, function(err, user){
    if(err) throw err
    if(!user) {
      res.json({success: false, message: 'User not found'})
    } else if (user){
      if (user.password != req.body.password){
        res.json({success: false, message: 'Wrong password'})
      } else {
        // logged in
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 1440 // 24 hours
        })
        res.json({
          success: true,
          message:'Logged in',
          token:token
        })
      }
    }
  }
)
})

// route middleware to verify a token
router.use(function(req, res, next){
  // check for token
  var token = req.body.token || req.query.token || req.headers['x-access-token']

  // decode token
  if(token){
    jwt.verify(token, app.get('superSecret'), function(err, decoded){
      if(err){
        return res.json({success: false, message: 'Failed to authenticate token'})
      } else {
        req.decoded = decoded;
        next()
      }
    })
  } else {
    // there's no token
    return res.json({
      success: false,
      message: 'No token provided'
    })
  }
})

router.get('/', function(req, res){
  res.json({message: "Welcome to API"})
})

router.get('/users', function(req, res){
  User.find({}, function(err, users){
    res.json(users)
  })
})

app.use('/api', router)

app.listen(port)
console.log('Magic happens at ', port)
