/**
 * Module dependencies.
 */

var toobusy = require('toobusy');
var flash = require('connect-flash')
  , express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , async = require('async')
  , passport = require('passport')
  , auth = require('./routes/auth');

var site = require('./site');

var app = express();
var server = http.createServer(app)

app.use(function(req, res, next) {
  if (toobusy()) res.send(503, "I'm busy right now, sorry.");
  else next();
});

app.configure(function(){
  app.set('port', process.env.PORT || site.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'isaidcomeonfhqwgahds' }));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

process.on('uncaughtException', function (error) {
   console.log(error.stack);
});

app.get('/mu-51b3d246-acc75319-c960211f-673bde03', function(req,res){
  res.render('blitz', { title: title });
});

var mysql      = require('mysql');
var pool = mysql.createPool({
  host     : site.mysql.host,
  port     : site.mysql.port,
  user     : site.mysql.user,
  password : site.mysql.password,
  database : site.mysql.database
});

var redis = require("redis"),
client = redis.createClient();

app.get('/', function(req,res){
  images = ["http://i.imgur.com/MioCm0Y.gif","http://i.imgur.com/f21Uo0p.gif","http://images.gifreactor.com/hzjfx.gif"];
  random = Math.floor(Math.random()* images.length);
  console.log(req.route);	
  res.render("admin", { site: site, image: images[random] }); 
});

app.get('/401', function(req,res){
  res.send(401, 'Invalid username or password does not match');
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/401', failureFlash: true }),
  function(req, res) {
    res.send(200,'Great Success');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
