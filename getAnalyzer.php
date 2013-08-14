<?php

require_once 'require/require_pdo.php';

if (isset($_GET['analyzer_id'])) {

	try {

		$query = $db->prepare("SELECT ID, NAME, HASHTAGS, EXCLUDES, LANGUAGE, RUNNING, CREATED_AT FROM ANALYZERS WHERE ID = :id");
		$query->execute(array(':id' => $_GET['analyzer_id']));

		header('Content-type: application/json');
		echo json_encode($query->fetch());

	}
	catch (PDOException $e) {
		die($e);
	}

}
else {

	$result = $db->query("SELECT ID, NAME, HASHTAGS, EXCLUDES, LANGUAGE, RUNNING, CREATED_AT FROM ANALYZERS");
	header('Content-type: application/json');
	echo json_encode($result->fetchAll());

}

