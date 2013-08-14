<?php

// MYSQL
$host   = '127.0.0.1';
$user   = 'USER';
$pass   = 'PASS';
$dbname = 'DB_NAME';

// Step 1: Establish a connection
$db = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
