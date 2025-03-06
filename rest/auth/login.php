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
$password = htmlspecialchars(($_POST['password']));

$hashed = SHA1(md5($password));
if (empty($errors)) {
    $DBCheck = $odb->prepare("SELECT `id`, `username`, `email` FROM `users` WHERE `username` = :username AND `password` = :password");
    $DBCheck->execute(array(':username' => $username, ':password' => $hashed));
    $userinfo = $DBCheck->fetch(PDO::FETCH_ASSOC);
    $countaccs = $DBCheck->rowCount();
    if ($countaccs <= 0) {
        $errors[] = "There is problem with your request, please try again!";
        echo json_encode(array('status' => 'error', 'message' => 'Wrong password or username!'));
        die();
    }
    if ($countaccs > 0) {
        session_regenerate_id();
        $_SESSION['loggedin'] = true;
        $_SESSION['id'] = $userinfo['id'];
        $_SESSION['username'] = $userinfo['username'];
        $_SESSION['email'] = $userinfo['email'];
        $UpdateDB = $odb->prepare("UPDATE `users` SET `lastlogin` = :lastlogin, `login_ip` = '$ip' WHERE `id` = :id AND `username` = :username");
        $UpdateDB->execute(array(':lastlogin' => $date, ':id' => $userinfo['id'], ':username' => $userinfo['username']));
        echo json_encode(array('status' => 'success', 'message' => 'You have successfully logged in, you will be redirected in 3 seconds..'));
    }
}
