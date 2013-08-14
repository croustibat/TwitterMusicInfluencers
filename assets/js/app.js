// -- APP -- //
var $hasPushState   = ('pushState' in history);
var $currentUri     = window.location.pathname;

// connect to socket.io
var socket = io.connect('http://labs.croustib.at:8888');

// HIGHCHARTS
Highcharts.setOptions({
	global : {
		useUTC : false
	}
});

var chartsource = new Highcharts.Chart({
    chart: {
    	renderTo: 'percent-source',
    	type:'pie',
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false
    },
    title: {
        text: 'Tweet Source Repartition '
    },
    tooltip: {
	    pointFormat: '{series.name} : <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true,
                color: '#000000',
                connectorColor: '#000000',
                format: '<b>{point.name}</b> : {point.percentage:.1f} %'
            }
        }
    },
    series: [{
        type: 'pie',
        name: 'Tweets Sources',
        data: []
    }]
});


// Fetch geocoding
// connect to gmap
/*var map = new GMaps({
	div: '#map',
	lat: -12.043333,
	lng: -77.028333
});*/
/*$('#address').typeahead({

	source : function(query, process){
		GMaps.geocode({
			address: query,
			callback: function(results, status) {
				console.log(results[0]);
				var latlng = results[0].geometry.location;

				var citiesList = [];
				for(var i=results.length;i--;){
					citiesList.push(results[i].formatted_address+" #"+latlng.lng()+","+latlng.lat());
				}
				process(citiesList);
			}
		});
	},
	updater: function (item) {
		var loc = item.split('#');
		$('#locations').val(loc[1]);
		return item;
	}

});*/

$(document).on('click', '.change-page', changePage);

$(window).on('load hashchange', function(e) {

	var $hash = location.hash.split('-');

	if ($hash[0] == "" && e.type != "load") {
	    location.reload();
	}
	else if ($hash[0] == "#analyzer") {
		triggerPage('analyzer', $hash[1]);
	}
	else if ($hash[0] == "#list") {
		triggerPage('list', null);
	}
});

function triggerPage(type, elem_id) {

    if (elem_id==null) {
        $('body').append('<a href="javascript:void(0)" data-page="'+type+'" id="auto-fired" class="change-page">&nbsp;</a>');
    }
    else {
        $('body').append('<a href="javascript:void(0)" data-page="'+type+'" data-id="'+elem_id+'" id="auto-fired" class="change-page">&nbsp;</a>');
    }

    $('#auto-fired').trigger('click').remove();
}

function changePage(e) {

    var $elem = $(e.currentTarget);
    var $page = $elem.attr('data-page');

    switch($page) {
        case 'analyzer':
        	var id = $elem.attr('data-id');
            if ($hasPushState) {
              var $toUri = encodeURI('/musicinfluencers/#analyzer-'+id);
              if($toUri != $currentUri) {
                history.pushState({uri:$toUri},'', $toUri);
                $currentUri = $toUri;
              }
            }
            document.title = 'Analyzer | Analyzer Twitt';
            showDetails(id);
            break;

           case 'list' :
           case 'home' :

				$('.nav li').removeClass('active');
				$elem.parent().addClass('active');

				if ($page != 'home') {

					document.title = 'List of analyzers | Analyzer Twitt';

					if ($hasPushState) {
					  var $toUri = encodeURI('/musicinfluencers/#list');
					  if($toUri != $currentUri) {
					    history.pushState({uri:$toUri},'', $toUri);
					    $currentUri = $toUri;
					  }
					}

					$('#home').hide();
					$('#page-charts').hide();
					$('#analyzer').show();

					$.get('getAnalyzer.php', showAnalyzerList);
				}
				else {
					document.title = 'Home | Analyzer Twitt';

					if ($hasPushState) {
					  var $toUri = encodeURI('/musicinfluencers/#home');
					  if($toUri != $currentUri) {
					    history.pushState({uri:$toUri},'', $toUri);
					    $currentUri = $toUri;
					  }
					}

					$('#analyzer').hide();
					$('#page-charts').hide();
					$('#home').show();
				}
           break;
        default :
        	location.reload();
    }
}

// send data for testing params
$(document).on('click', '#btn-test', function(e) {
	e.preventDefault();

	$('#stream').html('');

	var hash = $('#hashtags').val().split(',');
	if (hash[0] == '') {
		alert("Your should provide a valid hashtags");
		return false;
	}

	var loc = $('#locations').val();

	var data = {hashtags:hash, locations:loc};
	socket.emit('test event', data);

	return false;
});

// read data from socket.io/node server
socket.on("data", function(json) {

	var data = JSON.parse(json);

	if (data.entities.urls.length > 0 && data.entities.hashtags.length > 0) {

		var hashtags = '';
		for(var i=data.entities.hashtags.length; i--;){
			hashtags += "<strong>" + data.entities.hashtags[i].text + "</strong>, ";
		}

		var urls = '';
		for (var i=data.entities.urls.length; i--;) {
			urls += data.entities.urls[i].expanded_url + " <br />";
		}

		$("<li></li>")
		.attr('class','alert alert-info')
		.css('list-style-type', 'none')
		.html("<h4>@" + data.user.screen_name + "</h4> <br /> Hashtags = " + hashtags + "<br /> " + data.text +  " <br /> Urls = " + urls + " <br />")
		.prependTo("#stream");
	}
});

$(document).on('click','#btn-analyzer', function(e){
	e.preventDefault();

	bootbox.prompt("Choose a name for your analyzer ?", function(result) {
		if (result === null) {
			return false;
		}
		else {
			var hahstags = $('#hashtags').val().trim();
			var language = $('#language').val().trim();
			var excludes = $('#exclude-hastags').val().trim();

			$.get('createAnalyzer.php', {name:result, ht:hahstags, lang:language, exc: excludes}, function(response) {
				bootbox.alert('Analyzer has been created. Go check analyzers...');
			});
		}
	});

	return false;
});

$(document).on('click', '.details', function(e){
	var id = $(this).attr('data-id');
	var title = $(this).attr('data-title');

	triggerPage('analyzer', id);
});


$(document).on('click', '.launchit', function(e) {

	var id = $(this).attr('data-id');

	$.get('startAnalyzer.php', {analyzer_id:id}, function(resp){
		triggerPage('analyzer', id);
	});

});

function showDetails(id) {

	$('#analyzer,#home').hide();
	$('#page-charts').show();

	$.getJSON('getAnalyzer.php', {analyzer_id:id}, function(json){
		$('#page-charts h2:first').html(json.NAME);
	})

	// send request
	socket.emit('detail analyzer', {analyzer_id:id});

	// listen datas from analyzer
	socket.on('datas analyzer', function(json) {

		var nb_tweets      = json[0];
		var nb_urls        = json[3];
		var sources        = json[1];
		var users          = json[2];
		var urls           = json[4];
		var users_by_tweet = json[5];

		// TWEETS STATS
		$('#count-tweet').html(numeral(nb_tweets[0].NB).format('0,0'));
		$('#count-urls').html(numeral(nb_urls[0].NB).format('0,0'))

		// SOURCES
		var datapie = [];

		for (var i=0; i<sources.length;i++) {
			var source_name = (sources[i].SOURCE == "") ? "Unknown" : sources[i].SOURCE;
			var percent = parseInt(sources[i].NB) * 100 / parseInt(nb_urls[0].NB);
			datapie.push([source_name, percent]);
		}

		chartsource.series[0].setData(datapie);

		// BEST USERS - INFLUENCERS??
		var user_html = '<table class="orders-table table">';
		user_html += "<tr>";
			user_html += "<th>Username</th>";
			user_html += "<th>Nb Followers</th>";
			user_html += "<th>Nb tweets</th>";
			user_html += "<th>Verified</th>";
		user_html += "</tr>";

		for (var i=0; i<users.length;i++) {

			user_html += "<tr>";
			var user_verified = (users[i].USERVERIFIED) ? "<i class=icon-ok-sign></i>" : "--";
				user_html += "<td><a href='http://twitter.com/"+users[i].USERNAME+"' target=_blank >@"+users[i].USERNAME+"</a></td>";
				user_html += "<td>"+numeral(users[i].USERFOLLOWERCOUNT).format('0,0')+"</td>";
				user_html += "<td>"+users[i].NB+"</td>";
				user_html += "<td>"+user_verified+"</td>";
			user_html += "</tr>";

		}

		user_html += '</table>';
		$('#best-user').html(user_html);


		// BEST USERS BY NB TWEETS - INFLUENCERS??
		var user_html = '<table class="orders-table table">';
		user_html += "<tr>";
			user_html += "<th>Username</th>";
			user_html += "<th>Nb Followers</th>";
			user_html += "<th>Nb tweets</th>";
			user_html += "<th>Verified</th>";
		user_html += "</tr>";

		for (var i=0; i<users_by_tweet.length;i++) {
			user_html += "<tr>";
			var user_verified = (users_by_tweet[i].USERVERIFIED) ? "<i class=icon-ok-sign></i>" : "--";
				user_html += "<td><a href='http://twitter.com/"+users_by_tweet[i].USERNAME+"' target=_blank>@"+users_by_tweet[i].USERNAME+"</a></td>";
				user_html += "<td>"+numeral(users_by_tweet[i].USERFOLLOWERCOUNT).format('0,0')+"</td>";
				user_html += "<td>"+users_by_tweet[i].NB+"</td>";
				user_html += "<td>"+user_verified+"</td>";
			user_html += "</tr>";
		}
		user_html += '</table>';
		$('#best-user-by-tweets').html(user_html);


		// LINKS
		var urls_html = '<table class="orders-table table">';
		for (var i=0; i<urls.length;i++) {
			urls_html += "<tr>";
				urls_html += "<td>"+urls[i].SOURCE+"</td>";
				urls_html += "<td><a href='"+urls[i].LINK+"' target=_blank>"+urls[i].LINK+"</a></td>";
			urls_html += "</tr>";
		}
		urls_html += '</table>';
		$('#list-urls').html(urls_html);
	});
}

function showAnalyzerList(json) {

	$('#analyzer table').html('');

	var _header = "<th>Title</th><th>Created At</th><th>#Hashtags</th><th>Excludes</th><th>Country</th><th>Actions</th>";
	$('<tr></tr>').html(_header).appendTo('#analyzer table');

	for (var i=json.length;i--;) {
		if (json[i].RUNNING == "1") {
			var _html = '<td><h5><a href="javascript:;" class="details" data-title="'+json[i].NAME+'" data-id="'+json[i].ID+'">'+json[i].NAME+'</a> <span class="label label-info">running</span></h5></td>'+
				'<td>'+json[i].CREATED_AT+'</td>'+
				'<td>'+json[i].HASHTAGS+'</td>'+
				'<td>'+json[i].EXCLUDES+'</td>'+
				'<td>'+json[i].LANGUAGE+'</td>'+
				'<td><a href="javascript:;" class="btn btn-info details" data-title="'+json[i].NAME+'" data-id="'+json[i].ID+'">REALTIME REPORTING</a></td>';
		}
		else {
			var _html = '<td><h5><a href="javascript:;" class="details" data-title="'+json[i].NAME+'" data-id="'+json[i].ID+'">'+json[i].NAME+'</a></h5></td>'+
					'<td>'+json[i].CREATED_AT+'</td>'+
					'<td>'+json[i].HASHTAGS+'</td>'+
					'<td>'+json[i].EXCLUDES+'</td>'+
					'<td>'+json[i].LANGUAGE+'</td>'+
					'<td><a href="javascript:;" data-title="'+json[i].NAME+'" data-id="'+json[i].ID+'" class="launchit btn">Launch this analyzer</a></td>';
		}

		$('<tr></tr>').html(_html).appendTo('#analyzer table');
	}
}
