
/**
 * Module dependencies.
 */

var flash = require('connect-flash')
  , express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , auth = require('./routes/auth');

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
    btceTrade = new BTCE('ADHRY1UX-RTLJLAOC-VHX6JQHE-99ZTTTZI-EIJ26FN0','35cb2f64c8569809ec0062a53ce9634d12f2dab5ca9f3e4804298cd5d1b84721'),
    btcePublic = new BTCE();
var wallet = {usd:0,ltc:0,btc:0};
var tickers = {btce: {buy: {ltc_usd: 1, ltc_btc: 1, btc_usd: 1}, sell: {ltc_usd: 1, ltc_btc: 1, btc_usd: 1} } };
var greaseltc, reversegltc;

update_wallet = function()
{
	btceTrade.getInfo(function(err,data) {
		if (err) {
			throw err;
		}
		console.log(data);
		wallet.usd = data.funds.usd;
		wallet.ltc = data.funds.ltc;
		wallet.btc = data.funds.btc;
	});
}


do_greaseltc = function(trade)
{
	console.log("Perform GreaseLTC");
	console.log(trade);
	/*
	btceTrade.trade("ltc_usd","buy",trade.ltc_usd.rate,trade.ltc_usd.amount, function(err, data) {
		if (err) {
			throw err;
		}
		console.log(data);
	});
	*/
};

do_reversegltc = function(trade)
{

};


update_tickers = function()
{
  var ltc_usd, btc_ltc, btc_usd;
  var cash = wallet.usd;

	btcePublic.ticker("ltc_usd", function(err, data) {
    if (err) {
            throw err;
    }
    data.ticker.currency = 'LTC_USD';
    console.log(data);
    var query = connection.query('INSERT INTO ticker SET ?',data.ticker, function(err,result) {
    });
    console.log(query.sql);
    ltc_usd.sell = data.ticker.sell;
    ltc_usd.buy = data.ticker.buy;
  });

	btcePublic.ticker("ltc_btc", function(err, data) {
    if (err) {
            throw err;
    }
    data.ticker.currency = 'LTC_BTC';
    console.log(data);
    var query = connection.query('INSERT INTO ticker SET ?',data.ticker, function(err,result) {
    });
    console.log(query.sql);
    ltc_btc.sell = data.ticker.sell;
    ltc_btc.buy = data.ticker.buy;
  });

	btcePublic.ticker("btc_usd", function(err, data) {
    if (err) {
            throw err;
    }
    data.ticker.currency = 'BTC_USD';
    console.log(data);
    var query = connection.query('INSERT INTO ticker SET ?',data.ticker, function(err,result) {
    });
    console.log(query.sql);
    btc_usd.sell = data.ticker.sell;
    btc_usd.buy = data.ticker.buy;
  });

	greaseltc = cash / ltc_usd.buy * ltc_btc.sell * btc_usd.sell * 0.99940012;
	reversegltc = cash / btc_usd.buy / ltc_btc.buy * ltc_usd.sell * 0.99940012;

	console.log("Tickers: ");
	console.log(tickers.btce);
	
	if (greaseltc > wallet.usd)
	{
		do_greaseltc({'ltc_usd': {'rate':ltc_usd.buy,'amount':cash / ltc_usd.buy}, 'ltc_btc': {'rate':ltc_btc.sell,'amount': cash / ltc_usd.buy}, 'btc_usd': {'rate':btc_usd.sell,'amount': cash / ltc_usd.buy * ltc_btc.sell} });
	}
	else if ( reversegltc > wallet.usd )
	{
		do_reversegltc({'btc_usd': {'rate':btc_usd.buy,'amount':cash / btc_usd.buy}, 'ltc_btc': {'rate':ltc_btc.buy,'amount': cash / btc_usd.buy}, 'ltc_usd': {'rate':ltc_usd.sell,'amount': cash / btc_usd.buy / ltc_btc.buy} });
	}

  tickers.btce.sell.ltc_usd = ltc_usd.sell;
  tickers.btce.buy.ltc_usd = ltc_usd.buy;
  tickers.btce.sell.ltc_btc = ltc_btc.sell;
  tickers.btce.buy.ltc_btc = ltc_btc.buy;
  tickers.btce.sell.btc_usd = btc_usd.sell;
  tickers.btce.buy.btc_usd = btc_usd.buy;

	console.log("Cash: "+wallet.usd);
	console.log("GreaseLTC: "+greaseltc);
	console.log("ReverseGLTC: "+reversegltc);

}


update_wallet();
setInterval(update_tickers,10000);

var io = require("socket.io").listen(server)

io.sockets.on('connection', function (socket) {
	setInterval(function() {
		socket.emit('ticker',{greaseltc: greaseltc, reversegltc: reversegltc,usd: wallet.usd,ltc: wallet.ltc, btc: wallet.btc,btce:tickers.btce});
	},10500);
});

app.get('/', function(req,res){
  res.render('index', { title: 'GreaseLTC', greaseltc: greaseltc, reversegltc: reversegltc });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
