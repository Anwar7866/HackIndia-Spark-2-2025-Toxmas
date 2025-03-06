<?php
class user
{
    function realUserIP()
    {
        switch (true) {
            case (!empty($_SERVER['HTTP_X_REAL_IP'])):
                return $_SERVER['HTTP_X_REAL_IP'];
            case (!empty($_SERVER['HTTP_CLIENT_IP'])):
                return $_SERVER['HTTP_CLIENT_IP'];
            default:
                return $_SERVER['REMOTE_ADDR'];
        }
    }
    function UserLoggedIn()
    {
        if (isset($_SESSION['loggedin'], $_SESSION['id'], $_SESSION['username'], $_SESSION['email'])) {
            return true;
        } else {
            return false;
        }
    }
    function notBanned($odb)
    {
        $SQL = $odb->prepare("SELECT * FROM `bans` WHERE `id` = :userid AND `username` = :username");
        $SQL->execute(array(':userid' => $_SESSION['id'], ':username' => $_SESSION['username']));
        $result = $SQL->fetchColumn(0);
        $count = $SQL->rowCount();
        if ($count == 0) {
            return true;
        } else {
            session_destroy();
            return false;
        }
    }
    function isUserAdmin($odb)
    {
        $SQLCheck = $odb->prepare("SELECT `rank` FROM `users` WHERE `id` = :userid");
        $SQLCheck->execute(array(':userid' => $_SESSION['id']));
        $rank = $SQLCheck->fetchColumn(0);
        if ($rank == 'AdminDevPro') {
            return true;
        } else {
            return false;
        }
    }
    function isUserSupport($odb)
    {
        $SQLCheck = $odb->prepare("SELECT `rank` FROM `users` WHERE `id` = :userid");
        $SQLCheck->execute(array(':userid' => $_SESSION['id']));
        $rank = $SQLCheck->fetchColumn(0);
        if ($rank == 'Xyepport') {
            return true;
        } else {
            return false;
        }
    }
    function isUserPremium($odb)
    {
        $UserInfo = $odb->prepare("SELECT `plan` FROM `users` WHERE `id` = :id");
        $UserInfo->execute(array(':id' => $_SESSION['id']));
        $userplan = $UserInfo->fetchColumn(0);
        $SQLCheck = $odb->prepare("SELECT `premium` FROM `users` WHERE `id` = :userid");
        $SQLCheck->execute(array(':userid' => $_SESSION['id']));
        $userpremium = $SQLCheck->fetchColumn(0);
        $SQLCheck2 = $odb->prepare("SELECT `premium` FROM `plans` WHERE `id` = :userplan");
        $SQLCheck2->execute(array(':userplan' => $userplan));
        $planpremium = $SQLCheck2->fetchColumn(0);
        $premium = ($userpremium + $planpremium);
        if ($premium == '2') {
            return true;
        } else if ($premium == '1') {
            return true;
        } else if ($premium == '0') {
            return false;
        }
    }
    function isUserPrivate($odb)
    {
        $UserInfo = $odb->prepare("SELECT `plan` FROM `users` WHERE `id` = :id");
        $UserInfo->execute(array(':id' => $_SESSION['id']));
        $userplan = $UserInfo->fetchColumn(0);
        $SQLCheck2 = $odb->prepare("SELECT `custom` FROM `plans` WHERE `id` = :userplan");
        $SQLCheck2->execute(array(':userplan' => $userplan));
        $private = $SQLCheck2->fetchColumn(0);
        if ($private == "yes") return true;
        else return false;
    }
    function isUserFree($odb)
    {
        $UserInfo = $odb->prepare("SELECT `plan` FROM `users` WHERE `id` = :id");
        $UserInfo->execute(array(':id' => $_SESSION['id']));
        $userplan = $UserInfo->fetchColumn(0);
        if ($userplan == '0') {
            return true;
        } else {
            return false;
        }
    }
    function hasApiAccess($odb)
    {
        $UserInfo = $odb->prepare("SELECT `plan` FROM `users` WHERE `id` = :id");
        $UserInfo->execute(array(':id' => $_SESSION['id']));
        $userplan = $UserInfo->fetchColumn(0);
        $SQLCheck = $odb->prepare("SELECT `apiaccess` FROM `users` WHERE `id` = :userid");
        $SQLCheck->execute(array(':userid' => $_SESSION['id']));
        $userapi = $SQLCheck->fetchColumn(0);
        $SQLCheck2 = $odb->prepare("SELECT `apiaccess` FROM `plans` WHERE `id` = :userplan");
        $SQLCheck2->execute(array(':userplan' => $userplan));
        $planapi = $SQLCheck2->fetchColumn(0);
        $apiaccess = ($userapi + $planapi);
        if ($apiaccess == '2') {
            return true;
        } else if ($apiaccess == '1') {
            return true;
        } else if ($apiaccess == '0') {
            return false;
        }
    }
    function activeMembership($odb)
    {

        $SQLCheck = $odb->prepare("SELECT `planexpire` FROM `users` WHERE `id` = :userid");
        $SQLCheck->execute(array(':userid' => $_SESSION['id']));
        $expire = $SQLCheck->fetchColumn(0);
        if (time() < $expire) {
            return true;
        } else {
            $SQLUpdateDB = $odb->prepare("UPDATE `users` SET `plan` = 0, `planexpire` = 1767283020, `addon_concs` = 0, `addon_time` = 0, `addon_blacklist` = 0, `apiaccess` = 0, `apitoken` = 0 WHERE `id` = '" . $_SESSION['id'] . "'");
            $SQLUpdateDB->execute();
            return false;
        }
    }
    function CheckInput($String)
    {
        $String = htmlspecialchars(trim($String), ENT_QUOTES);
        return $String;
    }
    function SecureText($string)
    {
        $upper_string = strtoupper($string);
        $parameters = array("<SCRIPT", "UPDATE `", "ALERT(", "<IFRAMW", "<", ">", "</", "/>", "SCRIPT>", "SCRIPT", "DIV", ".CCS", ".JS", "<META", "<FRAME", "<EMBED", "<XML", "<IFRAME", "<IMG", "HREF", "document.cookie", ".INC", ".INI", ".CSS", ".PHP");
        foreach ($parameters as $parameter) {
            if (strpos($upper_string, $parameter) !== false) {
                return true;
            }
        }
    }
    function cleanInput($input)
    {
        $clean = preg_replace("/[^az]/", "", $input);
        $clean = substr($clean, 0, 12);
        return $clean;
    }
    function cleanHex($input)
    {
        $clean = preg_replace("![][xX]([A-Fa-f0–9]{1,3})!", "", $input);
        return $clean;
    }
}
$user = new user;
