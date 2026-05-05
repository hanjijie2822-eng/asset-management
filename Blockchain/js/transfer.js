var acc = null;
var AssetTrackerContract;

async function initTransfer() {
    if (window.ethereum) {
        try {
            window.web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            acc = accounts[0];
            AssetTrackerContract = new web3.eth.Contract(abi, address);
            console.log("Transfer page ready.");
        } catch (error) {
            console.error("User denied account access:", error);
            alert("Please authorize MetaMask");
        }
    } else {
        alert("Please install MetaMask first");
    }
}

$(document).ready(() => {
    initTransfer();
});

function searchAsset() {
    if (!AssetTrackerContract) {
        alert("Not connected to blockchain yet, please try again");
        return;
    }

    $("#searchResult").html("");
    let assetId = parseInt($('input[name="id"]').val());

    AssetTrackerContract.methods.getAsset(assetId).call((error, response) => {
        if (error) { console.log(error); return; }

        if (response[1] !== "") {
            let content =
                '<h4 style="color: #3a95d6;">Asset Found</h4>' +
                '<strong>Name: </strong>' + response[1] + '<br>' +
                '<strong>Owner: </strong>' + response[3] + '<br>' +
                '<strong>Current Status: </strong>' + response[4];
            $("#searchResult").append(content);
            $("#transferFrom").show();
        } else {
            $("#searchResult").append("<h4>Asset Not Found</h4>");
            $("#transferFrom").hide();
        }
    });
}

function transferAsset() {
    if (!AssetTrackerContract) {
        alert("Not connected to blockchain yet");
        return;
    }

    let assetId = parseInt($('input[name="id"]').val());
    let newOwner = $('input[name="newOwner"]').val();
    let newStatus = $('input[name="newStatus"]').val();
    let newLong = $('input[name="newLong"]').val();
    let newLat = $('input[name="newLat"]').val();

    AssetTrackerContract.methods
        .transferAsset(assetId, newOwner, newLong, newLat, newStatus)
        .send({ from: acc })
        .then(result => {
            if (result.status === true) {
                alert("Transfer Success");
                window.location.href = './index.php';
            }
        })
        .catch(err => {
            console.error(err);
            alert("Transfer failed: " + err.message);
        });
}