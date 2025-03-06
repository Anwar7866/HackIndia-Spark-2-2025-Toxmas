<?php

require '../../includes/sql.php';
if (!(isset($_SERVER['HTTP_REFERER']))) {
    die(json_encode(array('status' => 'error', 'message' => 'Authorization error!')));
}
$ip = $_SERVER["HTTP_CF_CONNECTING_IP"];
if (!isset($ip)) {
    $ip = $_SERVER['REMOTE_ADDR'];
}

if (!(filter_var($ip, FILTER_VALIDATE_IP))) {
    $errors[] = "Problem with your IP Address.";
    echo json_encode(array('status' => 'error', 'message' => 'Problem with your IP Address.'));
    die();
}

$date = date('Y-m-d H:i:s');
$username = stripslashes(htmlentities(($_POST['username'])));
$email = stripslashes($_POST['email']);
$password = htmlspecialchars(($_POST['password']));
$rpassword = htmlspecialchars(($_POST['rpassword']));
$hashedpass = SHA1(md5($password));

if (empty($username) || empty($email) || empty($password) || empty($rpassword)) {
    $errors[] = "Please fill all required fields to create account!";
    echo json_encode(array('status' => 'error', 'message' => 'Please fill all required fields to create account!'));
    die();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email format";
    echo json_encode(array('status' => 'error', 'message' => 'Invalid email format!'));
    die();
}
if (!ctype_alnum($username) || strlen($username) < 6 || strlen($username) > 20) {
    $errors[] = "Username must be between 6-20 characters!";
    echo json_encode(array('status' => 'error', 'message' => 'Username must be between 6-20 characters!'));
    die();
}
if ($password != $rpassword) {
    $errors[] = "The passwords you entered do not match!";
    echo json_encode(array('status' => 'error', 'message' => 'The passwords you entered do not match!'));
    die();
}


$DBUserName = $odb->prepare("SELECT `username` FROM `users` WHERE `username` = :username");
$DBUserName->execute(array(':username' => $username));
$checkusername = $DBUserName->rowCount();
$DBEmail = $odb->prepare("SELECT `email` FROM `users` WHERE `email` = :email");
$DBEmail->execute(array(':email' => $email));
$checkemail = $DBEmail->rowCount();
if ($checkusername > 0) {
    $errors[] = "This username already exists in the database!";
    echo json_encode(array('status' => 'error', 'message' => 'This username already exists in the database!'));
    die();
} else if ($checkemail > 0) {
    $errors[] = "There is already registered account with this email address!";
    echo json_encode(array('status' => 'error', 'message' => 'There is already registered account with this email address!'));
    die();
} else {
    $InsertDB = $odb->prepare("INSERT INTO `users`(`id`, `username`, `password`, `email`, `balance`, `created`, `lastlogin`, `login_ip`) VALUES (NULL, :username, :password, :email,  0, NOW(), NOW(), '$ip')");
    $InsertDB->execute(array(':username' => $username, ':password' => $hashedpass, ':email' => $email));
    $SelectFromDB = $odb->prepare("SELECT * FROM `users` WHERE `username` = :username AND `email` = :email AND `password` = :password");
    $SelectFromDB->execute(array(':username' => $username, ':email' => $email, ':password' => $hashedpass));
    $userinfo = $SelectFromDB->fetch(PDO::FETCH_ASSOC);
    session_regenerate_id();
    $_SESSION['loggedin'] = true;
    $_SESSION['id'] = $userinfo['id'];
    $_SESSION['username'] = $userinfo['username'];
    $_SESSION['email'] = $userinfo['email'];
    echo json_encode(array('status' => 'success', 'message' => 'You have successfully registered, you will be redirected in 3 seconds..'));
}
