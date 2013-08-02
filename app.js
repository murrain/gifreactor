
/**
 * Module dependencies.
 */

var flash = require('connect-flash')
  , express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , async = require('async');

var app = express();
var server = http.createServer(app)

app.configure(function(){
  app.set('port', process.env.PORT || 3001);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'isaidcomeonfhqwgahds' }));
  app.use(flash());
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
  res.render('blitz', { title: 'AwesomeFollowUP' });
});

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  port     : '3307',
  user     : 'root',
  password : 'kegr6tpxfwdkpgmm',
  database : 'gifreactor'
});

app.get('/', routes.index);

app.get('/images/random.json', function(req,res){
  if (req.query.id)
  {
    connection.query('SELECT * FROM gifs WHERE id = ?',req.query.id, function(err,rows,fields){
      if(err || rows.length < 1) 
      {
        console.log('No gif with id ' + req.query.id+ ' '+ err);
        connection.query('SELECT * FROM gifs ORDER BY RAND() LIMIT 5',function(err,rows,fields){
          if (err) console.log(err);
          images = JSON.stringify(rows);                                                                                       
          res.render('random', { images:images});                                                                              
        });
      }
      else
      {
        images = JSON.stringify(rows);
        res.render('random', { images:images});
      }
    });
  }
  else
  {
    connection.query('SELECT * FROM gifs ORDER BY RAND() LIMIT 5',function(err,rows,fields){
      if (err) console.log(err);
      images = JSON.stringify(rows);
      res.render('random', { images:images});
    });
  }
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


connection.connect();

//var io = require("socket.io").listen(server)
/*

io.sockets.on('connection', function (socket) {
	setInterval(function() {
		socket.emit('ticker',{greaseltc: greaseltc, reversegltc: reversegltc,usd: wallet.usd,ltc: wallet.ltc, btc: wallet.btc,btce:tickers.btce});
	},10000);
});
*/

app.get('/', function(req,res){
  res.render('index', { title: 'GifReactor' });
});
