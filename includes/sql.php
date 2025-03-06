<?php
error_reporting(0);
// error_reporting(E_ALL);
// ini_set('display_errors', 1);
session_set_cookie_params(3600);
session_start();
date_default_timezone_set('Europe/Amsterdam');
define('DB_HOST', 'localhost');
define('DB_NAME', 'financebot');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');

define('ERROR_MESSAGE', '<title>Problem while connecting to database</title>
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700" rel="stylesheet">
<style>
  html, body { padding: 0; margin: 0; width: 100%; height: 100%; }
  * {box-sizing: border-box;}
  body { text-align: center; padding: 0; background: #18191C; color: #fff; font-family: Open Sans; }
  h1 { font-size: 50px; font-weight: 100; text-align: center;}
  body { font-family: Open Sans; font-weight: 100; font-size: 20px; color: #fff; text-align: center; display: -webkit-box; display: -ms-flexbox; display: flex; -webkit-box-pack: center; -ms-flex-pack: center; justify-content: center; -webkit-box-align: center; -ms-flex-align: center; align-items: center;}
  article { display: block; width: 700px; padding: 50px; margin: 0 auto; }
  a { color: #fff; font-weight: bold;}
  a:hover { text-decoration: none; }
  img { height: 150px; margin-top: 1em; }
</style>

<article>
   	<img src="" />
    <h1>Problem while connecting to database</h1>
    <div>
        <p>Verify that the database is configured correctly!</p>
        <p>&mdash; CLOSED.AI</p>
    </div>
</article>');
try {
    global $odb;
    $odb = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8', DB_USERNAME, DB_PASSWORD);
    $odb->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $odb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $Exception) {
    error_log('ERROR: ' . $Exception->getMessage() . ' - ' . $_SERVER['REQUEST_URI'] . ' u ' . date('l jS \of F, Y, h:i:s A') . "\n", 3, 'errors.log');
    die(ERROR_MESSAGE);
}
