<?php
function sanitizeFilename($filename)
{
    return preg_replace("([^\w\s\d\-_~,;:\[\]\(\]]|[\.]{2,})", '', $filename);
}

$employee = json_decode($_POST["json"], true);

file_put_contents("data/markers/".sanitizeFilename($employee["name"]).".json", json_encode($employee));
?>