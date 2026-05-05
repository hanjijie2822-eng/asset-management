<?php
session_start();

if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}
?>

<?php require "template/header.php" ?>

<body>

<!-- Leaflet CSS & JS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<?php require "template/navbar.php" ?>
<br><br>

<div class="container">
    <h1 class="display-4"></h1>
    <div id="loading-div">
        <div class="inner-div">
            <div id="count">
                <h2 class="display-8" style="color: #3a95d6;">Track Asset</h2>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <input type="number" name="id" class="form-control" placeholder="Id of the asset" />
        </div>
        <div class="col">
            <button class="btn btn-primary" type="button" onclick="searchAsset()">Track</button>
        </div>
    </div>

    <div class="border-top my-3"></div>

    <div class="row">
        <div class="col-md-7">
            <div class="lead" id="searchResult"></div>
        </div>
        <div class="col-md-5">
            <div id="statusHistory" style="display: none">
                <br>
                <h4>Status History</h4>
            </div>
        </div>
    </div>
</div>

<script src="./js/searchAsset.js?v=<?php echo time(); ?>"></script>

</body>

<?php require "template/footer.php" ?>