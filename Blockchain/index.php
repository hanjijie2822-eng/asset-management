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
        
            <div class="row">
                <div class="col-6">
                    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">Create Asset</button>
                </div>
                <div class="col-6">
                  <form class="form-inline float-right">
                      <button class="btn btn-secondary" type="button" onclick="window.location.href='assetDetail.php'">Search Asset</button>
                  </form>
                  <form class="form-inline float-right">
                      <button class="btn btn-secondary mr-2" type="button" onclick="window.location.href='transfer.php'">Transfer Asset</button>
                  </form>
                </div>
            </div>
        
        <div class="border-top my-3"></div>
      <h4 class="display-8"style="color: #3a95d6;">
        <div id="loading-div">
          <div class="inner-div"><div id="count"></div></div>
          <div class="inner-div">
            <img src="./images/loading.gif" alt="loading" id="loading" />
          </div>
        </div>
      </h4>
      <table class="table table-hover">
        <thead class="thead-dark">
          <tr>
            <th style="text-align:center"scope="col">Id</th>
            <th style="text-align:center"scope="col">Batch No.</th>
            <th style="text-align:center"scope="col">Name</th>
            <th style="text-align:center"scope="col">Manufacturer</th>
            <th style="text-align:center"scope="col">Owner</th>
            <th style="text-align:center"scope="col">Status</th>
            <th style="text-align:center"scope="col">Description</th>
            <th style="text-align:center"scope="col">Location</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>

      <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Create a new asset</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="container">
                <div class="form-group">
                  <input type="text" name="batchNo" class="form-control" placeholder="Batch Number" required />
                </div>
                <div class="form-group">
                  <input type="text" name="name" class="form-control" placeholder="Name" required />
                </div>
                <div class="form-group">
                  <input type="text" name="desc" class="form-control" placeholder="Description" required />
                </div>
                <div class="form-group">
                  <input type="text" name="manufacturer" class="form-control" placeholder="Manufacturer" required />
                </div>
                <div class="form-group">
                  <input type="text" name="owner" class="form-control" placeholder="Owner" required />
                </div>
                <div class="form-group">
                  <input type="text" name="status" class="form-control" placeholder="Current Status" required />
                </div>
                <div class="form-group">
                  <input type="text" name="address" class="form-control" placeholder="Address (e.g. Shanghai, Beijing Tiananmen, New York)" required />
                  <small class="form-text text-muted">Enter a place name, system will auto-convert to coordinates</small>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" onclick="createNewAsset()">Create</button>
            </div>
          </div>
        </div>
      </div>
      <div>
          <div class="border-top my-3"></div>
          <div class="card pr-2 pl-2 pt-2 pb-2">
          <div class="card-header">
          <h4 class="display-8"style="color: #3a95d6;">Assets History</h4>
          </div>
          <div class="card-body" id="dataLog"></div>
          </div>
      </div>
    </div>

    <script src="./js/app.js?v=<?php echo time(); ?>" type="text/javascript"></script>
</body>

<?php require "template/footer.php" ?>