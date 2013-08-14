
var sys     = require('util')
, twitter   = require('ntwitter')
, mysql     = require('mysql');

var analyzer_id = 0;
var counter 	= 0;


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


var sql = "SELECT * FROM ANALYZERS WHERE ID = "+process.argv[2];

DB.query(sql, function(err, rows){

	if (err) throw err;

	analyzer_id = rows[0].ID;

	console.log('USE ANALYZER -- ', analyzer_id);

	DB.query('UPDATE ANALYZERS SET RUNNING = 0', function(err,results){});

	DB.query('UPDATE ANALYZERS SET RUNNING = 1 WHERE ID = ?', [analyzer_id], function(err, results) {

		if (err) throw err;

		watchTwitter(rows[0].HASHTAGS, rows[0].LANGUAGE, rows[0].EXCLUDES);

	});
});

end = function(){
	DB.end();
}

watchTwitter = function(watchList, language, excludesTerms) {

	var filters = {};
	if (watchList.length > 0) {
		filters.track = watchList;
	}

	if (language != '') {
		filters.language = language;
	}

	twit.stream('statuses/filter', filters, function(stream) {
		stream.on('data', function (data) {
			parseTweet(data, excludesTerms);
		});
		stream.on('end', function (response) {
			console.log('disconnected  ');
			end();
		});
		stream.on('destroy', function (response) {
			console.log('disconnected  ');
		 	// Handle a 'silent' disconnection from Twitter, no end/error event fired
			end();
		});
   	});
}

parseTweet = function(tweet, excludesTerms) {


   	if (!tweet.text) {
    	return;
   	}

   	var urls = tweet.entities.urls;

   	// Check if there's url
	if (urls.length <= 0) {
		return;
	}

	// exclude terms
	var exclFound = false;
	var excludes = excludesTerms.trim().split(',');

	if (excludes.length > 0) {
		for (var i = excludes.length; i--;) {
			if (excludes[i] == '') continue;
			var r = new RegExp(excludes[i], 'ig');
			if (tweet.text.match(r)) {
				exclFound = true;
			}
		}
	}

	if (exclFound) {
		return;
	}

	var fav_count = tweet.favorite_count == undefined ? 0 : tweet.favorite_count;
	// get everything we want to store
	var t = [
		analyzer_id,
		tweet.user.screen_name,
		tweet.user.id,
		tweet.id_str,
		tweet.created_at,
		tweet.text,
		tweet.user.followers_count,
		tweet.user.statuses_count,
		tweet.user.verified,
		tweet.coordinates,
		tweet.retweet_count,
		fav_count
	];

	// INSERT TWEET
	DB.query('INSERT INTO TWEETS SET ANALYZER_ID = ?, USERNAME = ?, USERID = ?, TID = ?, CREATED_AT = ? , TEXT = ?, USERFOLLOWERCOUNT = ?, USERSTATUSCOUNT = ?, USERVERIFIED = ?, GEO = ?, RT_COUNT = ?, FAV_COUNT = ?', t,
	   function(error, results) {
	      if(error) {
	         console.log("Error: " + error.message + 'at: ' + t[3]);
	      } else {
	         console.log("analyzer "+ analyzer_id +" - Tweet added at: " + t[3]);
	      }
	   }
	);

	// INSERT URLS
	for (var i = urls.length; i--;) {

		var u = urls[i].expanded_url;

		var source = '';
		if (u.match(/youtu/)) {
			source = 'YOUTUBE';
		}
		else if (u.match(/spoti/)) {
			source = 'SPOTIFY';
		}
		else if (u.match(/rdio/) || u.match(/rd.io/)) {
			source = 'RDIO';
		}
		else if (u.match(/deezer/) || u.match(/dzr.fm/)) {
			source = 'DEEZER';
		}
		else if (u.match(/itunes/)) {
			source = 'ITUNES';
		}
		else if (u.match(/grooveshark/)) {
			source = 'GROOVESHARK';
		}

		DB.query('INSERT INTO TWEETS_URLS SET SOURCE = ?, LINK = ?, ANALYZER_ID = ?', [source, u, analyzer_id],
		   function(error, results) {
		      if(error) {
		         console.log("Error: " + error.message);
		      } else {
		         console.log("Urls added");
		      }
		   }
		);

	}
}




// DB.end();