var btce_api = {"btc_usd": {"ticker": "https://btc-e.com/api/2/btc_usd/ticker", "trades": "https://btc-e.com/api/2/btc_usd/trades ", "depth": "https://btc-e.com/api/2/btc_usd/depth"}, "ltc_btc": {"ticker": "https://btc-e.com/api/2/ltc_btc/ticker ", "trades": "https://btc-e.com/api/2/ltc_btc/trades", "depth": "https://btc-e.com/api/2/ltc_btc/depth"}, "ltc_usd": {"ticker": "https://btc-e.com/api/2/ltc_usd/ticker", "trades": "https://btc-e.com/api/2/ltc_usd/trades", "depth": "https://btc-e.com/api/2/ltc_usd/depth"} };

var ticker = function(ticker)
{
	var self = this;

	high = new ko.observable(ticker.high);
	low = new ko.observable(ticker.low);
	avg = new ko.observable(ticker.avg);
	vol = new ko.observable(ticker.vol);
	vol_cur = new ko.observable(ticker.vol_cur);
	last = new ko.observable(ticker.last);
	buy = new ko.observable(ticker.buy);
	sell = new ko.observable(ticker.sell);
	server_time = new ko.observable(ticker.server_time);
}

var viewModel = function(api_key)
{
	var self = this;
	$.getJSON(btce_api.btc_usd.ticker, function(data){
		console.log(data);
	});
}