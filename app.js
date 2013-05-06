
/**
 * Module dependencies.
 */

var flash = require('connect-flash')
  , express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , auth = require('./routes/auth')
  , async = require('async');

var app = express();
var server = http.createServer(app)

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
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

app.get('/mu-51b3d246-acc75319-c960211f-673bde03', function(req,res){
  res.render('blitz', { title: 'AwesomeFollowUP' });
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  port     : '3307',
  user     : 'root',
  password : 'kegr6tpxfwdkpgmm',
  database : 'greaseltc'
});

connection.connect();


var BTCE = require('btc-e'),
    fs = require('fs'),
    current_nonce = fs.existsSync("nonce.json") ? JSON.parse(fs.readFileSync("nonce.json")) : Math.round((new Date()).getTime() / 1000),
    btceTrade = new BTCE('ADHRY1UX-RTLJLAOC-VHX6JQHE-99ZTTTZI-EIJ26FN0','35cb2f64c8569809ec0062a53ce9634d12f2dab5ca9f3e4804298cd5d1b84721',function(){
      current_nonce++;
      fs.writeFile("nonce.json", current_nonce);
      return current_nonce;
    }),
    btcePublic = new BTCE();
var wallet = {usd:0,ltc:0,btc:0};
var tickers = {btce: {buy: {ltc_usd: 1, ltc_btc: 1, btc_usd: 1}, sell: {ltc_usd: 1, ltc_btc: 1, btc_usd: 1} } };
var greaseltc, reversegltc;

function floorFigure(figure, decimals){
     if (!decimals) decimals = 2;
     var d = Math.pow(10,decimals);
     return ((figure*d)/d).toFixed(decimals);
};

do_greaseltc = function(trade)
{
  console.log("Perform GreaseLTC");
  console.log(trade);
  async.series([
    function(callback)
    {
      btceTrade.trade("ltc_usd","buy",trade.ltc_usd.rate,trade.ltc_usd.amount, function(err, data) {
        console.log(data);
        if (err)
        {
          console.log("Error");
          console.log(err);
          callback(err,"gltc_trade_1");
        }
        else
        {
          callback(null,"gltc_trade_1");
        }
      });
    },
    function(callback)
    {
      btceTrade.trade("ltc_btc","sell",trade.ltc_btc.rate,trade.ltc_btc.amount, function(err, data) {
        console.log(data);
        if (err)
        {
          console.log("Error");
          console.log(err);
          callback(err,"gltc_trade_2");
        }
        else
        {
          callback(null,"gltc_trade_2");
        }
      })
    },
    function(callback)
    {
      btceTrade.trade("btc_usd","sell",trade.btc_usd.rate,trade.btc_usd.amount, function(err, data) {
        console.log(data);
        if (err)
        {
          console.log("Error");
          console.log(err);
          callback(err,"gltc_trade_3"); 
        }
        else
        {
          callback(null,"gltc_trade_3"); 
        }
      })
    }
  ]);
};

do_reversegltc = function(trade)
{
  console.log("Perform ReverseGreaseLTC");
  console.log(trade);
  async.series([
    function(callback)
    {
      btceTrade.trade("btc_usd","buy",trade.ltc_usd.rate,trade.ltc_usd.amount, function(err, data) {
        console.log(data);
        callback(null,"rgltc_trade_1");
      });
    },
    function(callback)
    {
      btceTrade.trade("ltc_btc","buy",trade.ltc_btc.rate,trade.ltc_btc.amount, function(err, data) {
        console.log(data);
        callback(null,"rgltc_trade_2");
      })
    },
    function(callback)
    {
      btceTrade.trade("ltc_usd","sell",trade.ltc_usd.rate,trade.ltc_usd.amount, function(err, data) {
        console.log(data);
        callback(null,"rgltc_trade_3");
      })
    }
  ]);
};

update_wallets = function()
{
  console.log("Updating wallets");
	btceTrade.getInfo(function(err,data) {
		if (err) {
			throw err;
		}
		wallet.usd = data.funds.usd;
		wallet.ltc = data.funds.ltc;
		wallet.btc = data.funds.btc;
    console.log(wallet);
	});
}

update_tickers = function()
{
  console.log("Updating tickers");
  var ltc_usd = {buy: 1, sell: 1}, ltc_btc={buy: 1, sell: 1}, btc_usd = {buy: 1, sell: 1};
  var cash = wallet.usd;
  async.parallel([
    function(callback)
    {
      btcePublic.ticker("ltc_usd", function(err, data) {
        data.ticker.currency = 'LTC_USD';
        var query = connection.query('INSERT INTO ticker SET ?',data.ticker, function(err,result) {
        });
        ltc_usd.sell = data.ticker.buy;
        ltc_usd.buy = data.ticker.sell;
        callback(null,'ltc_usd_done');
      });
    },
    function(callback)
    {
      btcePublic.ticker("ltc_btc", function(err, data) {
        data.ticker.currency = 'LTC_BTC';
        var query = connection.query('INSERT INTO ticker SET ?',data.ticker, function(err,result) {
        });
        ltc_btc.sell = data.ticker.buy;
        ltc_btc.buy = data.ticker.sell;
        callback(null,'ltc_btc_done');
      });
    },
    function(callback)
    {
      btcePublic.ticker("btc_usd", function(err, data) {
        data.ticker.currency = 'BTC_USD';
        var query = connection.query('INSERT INTO ticker SET ?',data.ticker, function(err,result) {
        });
        btc_usd.sell = data.ticker.buy;
        btc_usd.buy = data.ticker.sell;
        callback(null, 'btc_usd_done');
      })
    }
  ],
  function(err, results)
  {
    tickers.btce.sell.ltc_usd = ltc_usd.sell;
    tickers.btce.buy.ltc_usd = ltc_usd.buy;
    tickers.btce.sell.ltc_btc = ltc_btc.sell;
    tickers.btce.buy.ltc_btc = ltc_btc.buy;
    tickers.btce.sell.btc_usd = btc_usd.sell;
    tickers.btce.buy.btc_usd = btc_usd.buy;

    greaseltc = cash / ltc_usd.buy * ltc_btc.sell * btc_usd.sell * 0.99940012;
    reversegltc = cash / btc_usd.buy / ltc_btc.buy * ltc_usd.sell * 0.99940012;
    
    btceTrade.orderList({active: 1},function(err,data){
      console.log("OrderList:");
      console.log(data);
      if (greaseltc > cash && cash >= 1)
      {
        //do_greaseltc({'ltc_usd': {'rate':ltc_usd.buy,'amount':floorFigure(cash / ltc_usd.buy,8)}, 'ltc_btc': {'rate':ltc_btc.sell,'amount': floorFigure(cash / ltc_usd.buy,8)}, 'btc_usd': {'rate':btc_usd.sell,'amount': floorFigure(floorFigure(cash / ltc_usd.buy,8) * ltc_btc.sell,8)} });
      }
      else if ( reversegltc > cash && cash >= 1 )
      {
        //do_reversegltc({'btc_usd': {'rate':btc_usd.buy,'amount':cash / btc_usd.buy}, 'ltc_btc': {'rate':ltc_btc.buy,'amount': cash / btc_usd.buy}, 'ltc_usd': {'rate':ltc_usd.sell,'amount': cash / btc_usd.buy / ltc_btc.buy} });
      }
    });

    //console.log("Tickers: ");
    //console.log(tickers.btce);

    //console.log("Wallet: ");
    //console.log(wallet);
    //console.log("GreaseLTC: "+greaseltc);
    //console.log("ReverseGLTC: "+reversegltc);
  });
    
}

make_money = function()
{
  async.series([
    function(callback)
    {
      update_wallets()
      callback(null, 'wallets');
    },
    function(callback)
    {
      update_tickers()
      callback(null,"tickers");
    }
  ],
  function(err, results)
  {
    if (err)
    {
      console.log("Error: "+err);
    }
  });
}

setInterval(make_money,5000);

var io = require("socket.io").listen(server)

io.sockets.on('connection', function (socket) {
	setInterval(function() {
		socket.emit('ticker',{greaseltc: greaseltc, reversegltc: reversegltc,usd: wallet.usd,ltc: wallet.ltc, btc: wallet.btc,btce:tickers.btce});
	},10000);
});

app.get('/', function(req,res){
  res.render('index', { title: 'GreaseLTC', greaseltc: greaseltc, reversegltc: reversegltc });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
