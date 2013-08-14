This is an experimental project. The purpose is to create real-time graph of Twitter datas by running a background analyzer based on :

 - a list of hashtags/words to follow,
 - an exclude hashtags/words list,
 - an optionnal country

The analyzers store all tweets from the Twitter Public Stream API.

Requirements
=======

In order to make it run on your server, you'll need some dependecies first :

 - NODEJS
 - NPM
 - SOCKET.IO
 - NODEJS MODULES :
  - forever : https://github.com/nodejitsu/forever
  - ntwitter : https://github.com/AvianFlu/ntwitter
  - mysql : https://github.com/felixge/node-mysql
 - MYSQL
 - PHP (with PDO enable)

Tips : you should make npm modules run globally on your system when installing with the command

````bash
npm -g install <package>
````

Getting Start
=======

After installing all the dependencies, clone this project and change the connection values to your mysql and twitter account.

in server.js and run_analyzer.js
````javascript
var DB = mysql.createConnection({
  host     : 'localhost',
  database : 'DB_NAME',
  user     : 'USER',
  password : 'PASS'
});

// Twitter Connect
var twit = new twitter({
	consumer_key		: 'KEY',
	consumer_secret		: 'SECRET',
	access_token_key	: 'TOKEN_KEY',
	access_token_secret	: 'TOKEN_SECRET'
});
````

in require/require_pdo.php
````php
// MYSQL
$host   = 'localhost';
$user   = 'USER';
$pass   = 'PASS';
$dbname = 'DB_NAME';
````

then run the JS server on port 8888 (could be modified in server.js) :
````javascript
forever start server.js
forever list
````

the "forever list" command show the process running (you should carefuly read the forever documentation and how it works especially the log part.)

Then go to your brower pointing to the document root :

````
http://localhost/cloning_dir/
````

!!! don't forget to change all path in index.php and assets/js/app.js according to your configuration !!!

What you can get ?
=======

Homepage :
![Homepage](http://cloud.croustib.at/public.php?service=files&t=6b7edc86ea302e0e51f3610bafdd26bd&download)

Analyzer List :
![List](http://cloud.croustib.at/public.php?service=files&t=6e00718b447b5396cd25618d6e5656d4&download)

Reporting page :
![Reporting](http://cloud.croustib.at/public.php?service=files&t=82a25f1f93b27fe0b63d3c80b4f3fc62&download)


TODO
=======

It's an experimental project, so it's not a PRODUCTION READY project.
What could be done to make it better :

- use a js framework on the client side like AngularJS or EmberJS (to replace the ugly assets/app.js)
- improve the background analyzer process (forever is a little buggy)
- improve the reporting page by adding datas
- maybe use redis or mongodb to store tweets
