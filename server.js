// Start App
var http    = require('http')
, sys       = require('util')
, server    = http.createServer(function(){})
, twitter   = require('ntwitter')
, io        = require('socket.io').listen(server)
, mysql     = require('mysql')
, forever 	= require('forever');

// Server port
server.listen(8888);

// Mysql
var DB = mysql.createConnection({
  host     : 'localhost',
  database : 'DB_NAME',
  user     : 'USER',
  password : 'PASS'
});

DB.connect();

// Twitter Connect
var twit = new twitter({
	consumer_key		: 'KEY',
	consumer_secret		: 'SECRET',
	access_token_key	: 'TOKEN_KEY',
	access_token_secret	: 'TOKEN_SECRET'
});

// At start define  a new watch list
var _watchList = ['nowplaying', 'deezer'];
var _loc = [];

watchTwitter = function(watchList, locations, socket) {

	var filters = {};
	if (watchList.length > 0) {
		filters.track = watchList;
	}

	if (locations != '') {
		filters.locations = locations;
	}

	// console.log(filters);

	twit.stream('statuses/filter', filters, function(stream) {

		stream.on('data', function (data) {
			socket.emit('data', JSON.stringify(data));
		});
		stream.on('end', function (response) {
		 console.log('end disconnected  ');
		});
		stream.on('destroy', function (response) {
		  console.log('destroy disconnected  ');
		 // Handle a 'silent' disconnection from Twitter, no end/error event fired
		});

		setTimeout(stream.destroy, 15000);
   	});
}


// Send datas for reporting page
var interval;
watchAnalyzer = function(analyzer_id, socket) {

	clearInterval(interval);

	// NB TWEETS
	var sql = "SELECT COUNT(ID) as NB FROM TWEETS WHERE ANALYZER_ID = "+analyzer_id+";";
	// GET SOURCES REPARTITION
	sql += "SELECT SOURCE, COUNT(SOURCE) as NB FROM TWEETS_URLS WHERE ANALYZER_ID = "+analyzer_id+" GROUP BY SOURCE ORDER BY NB DESC;";
	// BEST USER BY FOLLOWERS
	sql += "SELECT DISTINCT(USERNAME), USERFOLLOWERCOUNT, USERVERIFIED, COUNT(ID) AS NB FROM TWEETS WHERE ANALYZER_ID = "+analyzer_id+" GROUP BY USERNAME ORDER BY USERFOLLOWERCOUNT DESC LIMIT 5;";
	// NB URLS
	sql += "SELECT COUNT(ID) as NB FROM TWEETS_URLS WHERE ANALYZER_ID = "+analyzer_id+";";
	// DETAILS OF URLS
	sql += "SELECT SOURCE, LINK FROM TWEETS_URLS WHERE ANALYZER_ID = "+analyzer_id+" ORDER BY ID DESC LIMIT 10;";
	// BEST USER BY NB TWEETS
	sql += "SELECT DISTINCT(USERNAME), USERFOLLOWERCOUNT, USERVERIFIED, COUNT(ID) AS NB FROM TWEETS WHERE ANALYZER_ID = "+analyzer_id+" GROUP BY USERNAME ORDER BY NB DESC LIMIT 5;";

	interval = setInterval(function() {
		DB.query(sql, function(err, rows) {
			socket.volatile.emit('datas analyzer', rows);
		});
	}, 3000);

	socket.on('disconnect', function () {
	    clearInterval(interval);
	});
}

var child_proc=null;
var is_proc=false;

// Socket io listener event
io.sockets.on('connection', function (socket) {

	socket.on('test event', function (data) {
    	watchTwitter(data.hashtags, data.locations, socket);
    });


	socket.on('detail analyzer', function (data) {
    	watchAnalyzer(data.analyzer_id, socket);
    });

});





