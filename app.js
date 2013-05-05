
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
	btcePublic.ticker("ltc_usd", function(err, data) {
                if (err) {
                        throw err;
                }
                data.ticker.currency = 'LTC_USD';
                console.log(data);
                var query = connection.query('INSERT INTO ticker SET ?',data.ticker, function(err,result) {
                });
                console.log(query.sql);
                tickers.btce.sell.ltc_usd = data.ticker.sell;
                tickers.btce.buy.ltc_usd = data.ticker.buy;

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
                tickers.btce.sell.ltc_btc = data.ticker.sell;
                tickers.btce.buy.ltc_btc = data.ticker.buy;
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
                tickers.btce.sell.btc_usd = data.ticker.sell;
                tickers.btce.buy.btc_usd = data.ticker.buy;
        });

	greaseltc = wallet.usd / tickers.btce.buy.ltc_usd * tickers.btce.sell.ltc_btc * tickers.btce.sell.btc_usd * 0.99940012;
	reversegltc = wallet.usd / tickers.btce.buy.btc_usd / tickers.btce.buy.ltc_btc * tickers.btce.sell.ltc_usd * 0.99940012;

	console.log("Tickers: ");
	console.log(tickers.btce);
	
	if (greaseltc > wallet.usd)
	{
		do_greaseltc({'ltc_usd': {rate:tickers.btce.buy.ltc_usd,amount:wallet.usd / tickers.btce.buy.ltc_usd}, 'ltc_btc': {rate:tickers.btce.sell.ltc_btc,amount: wallet.usd / tickers.btce.sell.ltc_usd}, 'btc_usd': {rate:tickers.btce.sell.btc_usd,amount: wallet.usd / tickers.btce.sell.ltc_usd * tickers.btce.buy.ltc_btc} });
	}
	else if ( reversegltc > wallet.usd )
	{
		do_reversegltc({'btc_usd': {rate:tickers.btce.sell.btc_usd,amount:wallet.usd / tickers.btce.sell.btc_usd}, 'ltc_btc': {rate:tickers.btce.buy.ltc_btc,amount: wallet.usd / tickers.btce.buy.ltc_usd}, 'btc_usd': {rate:tickers.btce.sell.btc_usd,amount: wallet.usd / tickers.btce.buy.ltc_usd * tickers.btce.buy.ltc_btc} });
	}
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
