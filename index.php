<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Twitter live stream : NodeJS + Socket.io</title>

		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="description" content="">
		<meta name="author" content="">

		<link href="http://fonts.googleapis.com/css?family=Oxygen|Marck+Script" rel="stylesheet" type="text/css">

		<!-- Le styles -->
		<link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/css/bootstrap-combined.min.css" rel="stylesheet">
		<link href="//netdna.bootstrapcdn.com/font-awesome/3.0.2/css/font-awesome.css" rel="stylesheet">

		<link rel="stylesheet" href="/assets/css/admin.css" type="text/css">

		<!--[if IE 7]>
		 <link href="//netdna.bootstrapcdn.com/font-awesome/3.0.2/css/font-awesome-ie7.css" rel="stylesheet">
		<![endif]-->

		<!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
		<!--[if lt IE 9]>
		 <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
		<script>
	      var $domaine = "localhost";
	    </script>
		</head>
	<body>

		<div class="container">

			<div class="row">

				<div class="span2">

				<div class="main-left-col">

					<h1><i class="icon-bar-chart icon-large"></i> Analyze tweets</h1>

					<ul class="side-nav">

						<li class="active">
							<a href="javascript:;" class="change-page" data-page="home"><i class="icon-home"></i> Home</a>
						</li>
						<li class="dropdown">
							<a href="javascript:;" class="change-page" data-page="list"><i class="icon-signal"></i> Analyzers</a>
						</li>
					</ul>

				</div> <!-- end main-left-col -->

			</div> <!-- end span2 -->

			<div class="span10">
				<div class="main-area dashboard">

					<div id="home" class="row">
						<div class="span5">
							<div class="slate">
								<div class="page-header">
									<h2><i class="icon-plus-sign"></i> Add analyzer</h2>
								</div>

								<form>
									<label>Subject (Hastags)</label>
									<input type="text" class="input-large" id="hashtags" value="nowplaying, spotify" />

									<label>Exclude terms</label>
									<input type="text" class="input-large" id="exclude-hastags" value="" />


									<label>Restrict to location</label>
									<select id="language">
										<option value="">Worldwide</option>
										<option value="fr">France</option>
										<option value="en">UK</option>
										<option value="us">USA</option>
										<option value="de">Germany</option>
										<option value="es">Spain</option>
									</select>
									<input type="hidden" id="locations" value=""/>

									<br /><br />
									<button id="btn-test" type="button" class="btn">Test</button>
									<button id="btn-analyzer" type="button" class="btn btn-small btn-primary">Create new analyzer</button>
									<div id="map" style="display:none"></div>
								</form>
							</div>
						</div>
						<div id="stream" class="span5"></div>
					</div>

					<div id="analyzer" class="row" style="display:none">
						<div class="span10">
							<div class="slate">
								<div class="page-header">
									<h2><i class="icon-signal pull-right"></i>Analysers Lists</h2>
									<small><i class="icon-exclamation-sign"></i> Only 1 analyzer could run at the same time. So when you launch one, it stops another one...</small>
								</div>
								<table class="orders-table table"></table>
							</div>
						</div>
					</div>

					<div id="page-charts" class="row" style="display:none">

						<div class="span10">
							<div class="page-header">
								<h2></h2>
								<small><i class="icon-lightbulb"></i> Auto refresh every 3s...</small>
							</div>
							<div class="slate clearfix">
								<a href="javascript:;" class="stat-column">
									<span id="count-tweet" class="number">--</span>
									<span>Tweets</span>
								</a>

								<a href="javascript:;" class="stat-column">
									<span id="count-urls" class="number">--</span>
									<span>Urls</span>
								</a>

							</div>
						</div>

						<div class="span10">
							<div class="slate">
								<div class="page-header"><h2><i class="icon-bar-chart pull-right"></i> Sources</h2></div>
								<div id="percent-source" style="position:relative;" class="span10"></div>
							</div>
						</div>

						<div class="span5">
							<div class="slate">
								<div class="page-header"><h2><i class="icon-user pull-right"></i> Best users by followers</h2></div>
								<div id="best-user"></div>
							</div>
						</div>

						<div class="span5">
							<div class="slate">
								<div class="page-header"><h2><i class="icon-user pull-right"></i> Best users by nb tweets</h2></div>
								<div id="best-user-by-tweets"></div>
							</div>
						</div>

						<div class="span10">
							<div class="slate">
								<div class="page-header"><h2><i class="icon-link pull-right"></i> Last URLS</h2></div>
								<div id="list-urls"></div>
							</div>
						</div>

					</div>

				</div>
			</div>

		</div> <!-- end container -->

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
		<script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/js/bootstrap.min.js"></script>
		<script src="//cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min.js"></script>
		<script src="http://code.highcharts.com/highcharts.js"></script>

		<script src="/assets/js/bootbox.min.js"></script>

		<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"></script>
		<script src="/assets/js/gmaps.js"> </script>

		<script src="http://localhost:8888/socket.io/socket.io.js"></script>

		<script src="/assets/js/app.js"> </script>

	</body>
</html>