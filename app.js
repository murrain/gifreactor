
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

var app = express();
var server = http.createServer(app)

app.use(function(req, res, next) {
  if (toobusy()) res.send(503, "I'm busy right now, sorry.");
  else next();
});

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

var title = 'GifReactor';

app.get('/mu-51b3d246-acc75319-c960211f-673bde03', function(req,res){
  res.render('blitz', { title: title });
});

var mysql      = require('mysql');
var pool = mysql.createPool({
  host     : '127.0.0.1',
  port     : '3307',
  user     : 'root',
  password : 'kegr6tpxfwdkpgmm',
  database : 'gifreactor'
});

app.get('/', function(req,res){
  res.render('index', { title: title });
});

app.get(/^\d+$/, function(req,res){
  pool.getConnection(function(err,connection) {
    connection.query('SELECT * FROM gifs WHERE id = ?',req.params[0], function(err,rows,fields){
      if(err || rows.length < 1)
      {
        console.log('No gif with id ' + req.params[0]+ ' '+ err);
        connection.query('SELECT * FROM gifs ORDER BY RAND() LIMIT 5',function(err,rows,fields){        
          if (err) console.log(err);                                                                    
          images = JSON.stringify(rows);                                                                
          res.render('random', { images:images, title: title});                                                       
        });                                                                                             
      }                                                                                                 
      else                                                                                              
      {                                                                                                 
        images = JSON.stringify(rows);                                                                  
        res.render('random', { images:images, title: title});                                                         
      }                                                                                                 
      connection.end();                                                                                 
    });                                                                                                 
  });    
});

app.get('/:category', function(req,res){
  console.log("category: "+ req.params.category);
  pool.getConnection(function(err,connection) {
    connection.query('SELECT gifs.* FROM gifs,tags WHERE gifs.id = tags.gif_id AND tags.tag = ? ORDER BY RAND() LIMIT 5',req.params.category, function(err,rows,fields) {
      if (err) console.log(err)
      images = JSON.stringify(rows);
      if( rows.length < 1)
      {
        res.redirect("/");
      }
      else
      {
        res.render('index', { title: title, images:images});
      }
      connection.end(); 
    });
  });  
});

app.get('/images/random.json', function(req,res){
  if (req.query.id)
  {
    pool.getConnection(function(err,connection) {
      connection.query('SELECT * FROM gifs WHERE id = ?',req.query.id, function(err,rows,fields){
        if(err || rows.length < 1)
        {
          console.log('No gif with id ' + req.query.id+ ' '+ err);
          connection.query('SELECT * FROM gifs ORDER BY RAND() LIMIT 5',function(err,rows,fields){        
            if (err) console.log(err);                                                                    
            images = JSON.stringify(rows);                                                                
            res.render('random', { images:images, title: title});                                                       
          });                                                                                             
        }                                                                                                 
        else                                                                                              
        {                                                                                                 
          images = JSON.stringify(rows);                                                                  
          res.render('random', { images:images, title: title});                                                         
        }                                                                                                 
        connection.end();                                                                                 
      });                                                                                                 
    });                                                                                                   
  }                                                                                                       
  else                                                                                                    
  {                                                                                                       
    pool.getConnection(function(err,connection){                                                          
      connection.query('SELECT * FROM gifs ORDER BY RAND() LIMIT 5',function(err,rows,fields){            
        if (err) console.log(err);                                                                        
        images = JSON.stringify(rows);                                                                    
        res.render('random', { images:images});                                                           
        connection.end();                                                                                 
      });                                                                                                 
    });                                                                                                   
  }                                                                                                       
});

app.get('/images/:category/random.json', function(req,res){
  if (req.query.id)
  {
    pool.getConnection(function(err,connection) {
      if (err) console.log(err);
      connection.query('SELECT * FROM gifs WHERE id = ?',req.query.id, function(err,rows,fields){
        if(err || rows.length < 1)
        {
          console.log('No gif with id ' + req.query.id+ ' '+ err);
          connection.query('SELECT gifs.* FROM gifs, tags WHERE gifs.id = tags.gif_id AND tags.tag = ? ORDER BY RAND() LIMIT 5', req.params.category, function(err,rows,fields){
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
        connection.end();                                                                                      
      });                                                                                                      
    });                                                                                                        
  }                                                                                                            
  else                                                                                                         
  {                                                                                                            
    pool.getConnection(function(err,connection){                                                               
      if(err) console.log(err);
      connection.query('SELECT gifs.* FROM gifs,tags WHERE gifs.id = tags.gif_id AND tags.tag = ? ORDER BY RAND() LIMIT 5', req.params.category,function(err,rows,fields){                 
        if (err) console.log(err);                                                                             
        images = JSON.stringify(rows);
        res.render('random', { images:images});                                                                
        connection.end();                                                                                      
      });                                                                                                      
    });                                                                                                        
  }                                                                                                            
}); 


server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


