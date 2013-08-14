<?php

include_once 'require/require_pdo.php';


$sql = "UPDATE ANALYZERS SET RUNNING = 0 WHERE 1";
$db->query($sql);

$db = null;

$dir = __DIR__;
$path = $dir."/forever";

$analyzer_id = $argc>0?$argv[1]:$_GET['analyzer_id'];

// find running process and kill it (dirty hack)
$cmd1 = "ps -fp $(pgrep -u www-data node) | grep monitor";
exec($cmd1, $output);

// Only if process running...
if ($output) {

	preg_match('/www-data([ ]?)([0-9]+).*$/', $output[0], $matches);
	$pid = $matches[2];

	// wait all forever script have been killed
	sleep(1);

	exec("kill -9 ".$pid, $output);
	print_r($output);
}

/* DON'T WORK ???
$cmd1 = "forever stop";
exec($cmd1, $output);
print_r($output);
*/

$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
$randomString = '';
for ($i = 0; $i < 6; $i++) {
    $randomString .= $characters[rand(0, strlen($characters) - 1)];
}

// hack forever pids file //
touch("$path/pids/$randomString.pid");

$cmd3 = "forever start -p $path --pidFile $path/pids/$randomString.pid -a -o $path/log/wwwdata_out.log -e $path/log/wwwdata_err.log -l $path/log/wwwdata_forever.log $dir/run_analyzer.js $analyzer_id";
echo $cmd3.PHP_EOL;

exec($cmd3, $output);
print_r($output);

// echo "process started" . PHP_EOL;