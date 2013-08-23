
/**
 * Module dependencies.
 */

var toobusy = require('toobusy');
var flash = require('connect-flash')
  , express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , async = require('async');

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

app.get('/', function(req,res){
  console.log(req.route);
  pool.getConnection(function(err,connection) {
    if(err) console.log(err);
    connection.query('SELECT gifs.* FROM gifs,tags WHERE gifs.id = tags.gif_id AND tags.tag != "nsfw" ORDER BY RAND() LIMIT 5',function(err,rows,fields){
      if (err) console.log(err);
      images_string = JSON.stringify(rows);
      res.render('index', { site: site, image:rows[0], images_string: images_string});
      connection.end();
    });
  });
});

app.get('/:id(\\d+)', function(req,res){
  console.log(req.route);
  pool.getConnection(function(err,connection) {
    if(err) console.log(err);
    connection.query('SELECT gifs.* FROM gifs,tags WHERE gifs.id = tags.gif_id AND tags.tag != "nsfw" AND id = ?',req.params.id, function(err,rows,fields){
      if(err || rows.length < 1)
      {
        console.log('No gif with id ' + req.params.id+ ' '+ err);
        res.redirect("/");
      }                                                                                                 
      else                                                                                              
      { 
        images_string = JSON.stringify(rows);
        console.log(rows);
        res.render('index', { site:site, image:rows[0], images_string: images_string});
      }                                                                                                 
      connection.end();                                                                                 
    });                                                                                                 
  });    
});

app.get('/:category', function(req,res){
  console.log(req.route);
  pool.getConnection(function(err,connection) {
    if(err) console.log(err);
    connection.query('SELECT gifs.* FROM gifs,tags WHERE gifs.id = tags.gif_id AND tags.tag = ? ORDER BY RAND() LIMIT 5',req.params.category, function(err,rows,fields) {
      if(err || rows.length < 1)
      {
        res.redirect("/");
      }
      else
      {
        images_string = JSON.stringify(rows);
        res.render('index', { site: site, image:rows[0], images_string: images_string});
      }
      connection.end(); 
    });
  });  
});

app.get('/:category/:id(\\d+)', function(req,res){
  console.log(req.route);
  pool.getConnection(function(err,connection) {
    if(err) console.log(err);
    connection.query('SELECT gifs.* FROM gifs,tags WHERE gifs.id = tags.gif_id AND gifs.id = ? AND tags.tag = ? ORDER BY RAND() LIMIT 5',[req.params.id,req.params.category], function(err,rows,fields) {
      if(err || rows.length < 1)
      {
        res.redirect("/"+req.params.category);
      }
      else
      {
        images_string = JSON.stringify(rows);
        res.render('index', { site: site, image:rows[0], images_string: images_string});
      }
      connection.end();
    });
  });
});

app.get('/images/random.json', function(req,res){
  pool.getConnection(function(err,connection){                                                          
    if(err) console.log(err);
    connection.query('SELECT gifs.* FROM gifs,tags WHERE gifs.id = tags.gif_id AND tags.tag != "nsfw"  ORDER BY RAND() LIMIT 5',function(err,rows,fields){            
      if (err) console.log(err);                                                                        
      images = JSON.stringify(rows);                                                                    
      res.render('random', { site: site, images:images});                                                           
      connection.end();                                                                                 
    });                                                                                                 
  });                                                                                                   
});

app.get('/images/:category/random.json', function(req,res){
  pool.getConnection(function(err,connection){                                                               
    if(err) console.log(err);
    connection.query('SELECT gifs.* FROM gifs,tags WHERE gifs.id = tags.gif_id AND tags.tag = ? ORDER BY RAND() LIMIT 5', req.params.category,function(err,rows,fields){                 
      if (err) console.log(err);                                                                             
      images = JSON.stringify(rows);
      res.render('random', { site: site, images:images});                                                                
      connection.end();                                                                                      
    });                                                                                                      
  });
}); 


server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
