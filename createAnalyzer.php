<?php

require_once 'require/require_pdo.php';

$name = $_GET['name'];
$ht   = $_GET['ht'];
$lang = $_GET['lang'];
$exc  = $_GET['exc'];

$sql = "INSERT INTO ANALYZERS (NAME, HASHTAGS, EXCLUDES, LANGUAGE, CREATED_AT) VALUES (:name, :ht, :exc, :lang, :created)";

$query = $db->prepare($sql);
$query->execute(array(
	":name"    => $name,
	":ht"      => $ht,
	":exc"     => $exc,
	":lang"    => $lang,
	":created" => date('Y-m-d H:i:s')
));

$db = null;
echo 'ok';