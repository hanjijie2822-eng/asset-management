<?php
session_start();
 
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}
?>

<?php require "template/header.php" ?>

<body>
<?php require "template/navbar.php" ?>
<br><br>
<div class="container">
      <h2 class="display-8" style="color: #3a95d6;">Transfer Asset</h2>
      <br />
      <div class="row">
        <div class="col">
          <div class="row">
            <div class="col">
              <input type="number" name="id" class="form-control" placeholder="Id of the asset" />
              <br />
              <div id="searchResult"></div>
            </div>
            <div class="col">
              <button onclick="searchAsset()" class="btn btn-primary">Search</button>
            </div>
          </div>
        </div>
        <div class="col">
          <div id="transferFrom" style="display: none">
            <div class="form-group">
              <h5>Enter the new details below</h5>
            </div>
            <div class="form-group">
              <input type="text" name="newOwner" class="form-control" placeholder="New Owner" />
            </div>
            <div class="form-group">
              <input type="text" name="newStatus" class="form-control" placeholder="New status of the asset" />
            </div>
            <div class="form-group">
              <input type="text" id="newAddress" name="newAddress" class="form-control" placeholder="New address of the asset" oninput="clearGeoResult()" />
              <small id="geoResult" class="form-text text-muted"></small>
              <input type="hidden" name="newLong" id="newLong" />
              <input type="hidden" name="newLat" id="newLat" />
            </div>
            <div class="form-group">
              <button onclick="geocodeAndTransfer()" class="btn btn-success">Transfer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <script src="./js/transfer.js?v=<?php echo time(); ?>" type="text/javascript"></script>
    <script>
      function clearGeoResult() {
        document.getElementById("geoResult").textContent = "";
        document.getElementById("newLong").value = "";
        document.getElementById("newLat").value = "";
      }

      async function geocodeAndTransfer() {
        const address = document.getElementById("newAddress").value.trim();
        const geoResult = document.getElementById("geoResult");

        if (!address) {
          geoResult.style.color = "red";
          geoResult.textContent = "Please enter an address";
          return;
        }

        geoResult.style.color = "#555";
        geoResult.textContent = "Resolving address...";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();

          if (!data || data.length === 0) {
            geoResult.style.color = "red";
            geoResult.textContent = "Address not found, please try again";
            return;
          }

          const { lat, lon, display_name } = data[0];
          document.getElementById("newLat").value = lat;
          document.getElementById("newLong").value = lon;
          geoResult.style.color = "green";
          geoResult.textContent = `✓ Resolved: ${display_name} (Longitude ${parseFloat(lon).toFixed(5)}, Latitude ${parseFloat(lat).toFixed(5)})`;

          // Call the existing transferAsset function
          transferAsset();
        } catch (err) {
          geoResult.style.color = "red";
          geoResult.textContent = "Failed to resolve address, please check your network connection";
        }
      }
    </script>
</body>

<?php require "template/footer.php" ?>