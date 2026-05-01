var assetCount = 0;
var acc = null;
var AssetTrackerContract;

async function initWeb3() {
    if (window.ethereum) {
        try {
            window.web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            acc = accounts[0];
            console.log("Connected account:", acc);
            AssetTrackerContract = new web3.eth.Contract(abi, address);
            renderPageContent();
            listenToContractEvents();
        } catch (error) {
            console.error("User denied account access:", error);
            alert("Please authorize MetaMask");
        }
    } else {
        alert("Please install MetaMask first");
    }
}

$(document).ready(() => {
    initWeb3();
});

// Convert address to coordinates using OpenStreetMap (free, no API key needed)
async function geocodeAddress(addressText) {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(addressText);
    const response = await fetch(url, {
        headers: { 'Accept-Language': 'en' }
    });
    const data = await response.json();
    if (data.length === 0) {
        throw new Error('Address not found: ' + addressText);
    }
    return {
        lat: data[0].lat,
        lng: data[0].lon,
        displayName: data[0].display_name
    };
}

function renderPageContent() {
    $("tbody").html("");

    AssetTrackerContract.methods.getAssetCount().call((error, response) => {
        if (error) console.log(error);
        else {
            assetCount = response;
            $("#count").html("Total " + response + " Assets");
            renderTable();
        }
    });

    function renderTable() {
        for (let i = 1; i <= parseInt(assetCount); i++) {
            (function(idx) {
                AssetTrackerContract.methods.getLongLat(idx).call(async (error, response) => {
                    let resLong = "", resLat = "";
                    if (!error) {
                        resLong = response[0];
                        resLat = response[1];
                    }
                    AssetTrackerContract.methods.getAsset(idx).call(async (error, response) => {
                        if (error) { console.log(error); return; }
                        if (response[1] === "") return;

                        let row =
                            '<tr>' +
                            '<th scope="row" style="text-align:center">' + idx + "</th>" +
                            '<td style="text-align:center">' + response[0] + "</td>" +
                            '<td style="text-align:center">' + response[1] + "</td>" +
                            '<td style="text-align:center">' + response[2] + "</td>" +
                            '<td style="text-align:center">' + response[3] + "</td>" +
                            '<td style="text-align:center">' + response[4] + "</td>" +
                            '<td style="text-align:center">' + response[5] + "</td>" +
                            '<td style="text-align:center" id="loc-' + idx + '"><small class="text-muted">解析中...</small></td>' +
                            '</tr>';
                        $("tbody").append(row);

                        if (resLong && resLat && resLong !== "0" && resLat !== "0") {
                            try {
                                const geoRes = await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?format=json&lon=${resLong}&lat=${resLat}`,
                                    { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8' } }
                                );
                                const geoData = await geoRes.json();
                                const addr = geoData.display_name || (resLong + " / " + resLat);
                                $("#loc-" + idx).text(addr);
                            } catch (e) {
                                $("#loc-" + idx).text(resLong + " / " + resLat);
                            }
                        } else {
                            $("#loc-" + idx).text("N/A");
                        }
                    });
                });
            })(i);
        }
        $("#loading").hide();
    }
}

async function createNewAsset() {
    let batchNo = $('input[name="batchNo"]').val();
    let name = $('input[name="name"]').val();
    let desc = $('input[name="desc"]').val();
    let manufacturer = $('input[name="manufacturer"]').val();
    let owner = $('input[name="owner"]').val();
    let status = $('input[name="status"]').val();
    let addressText = $('input[name="address"]').val();

    if (!batchNo || !name || !desc || !manufacturer || !owner || !status || !addressText) {
        alert('All inputs are required!');
        return;
    }

    // Convert address to coordinates
    let lng, lat;
    try {
        const result = await geocodeAddress(addressText);
        lng = result.lng;
        lat = result.lat;
        console.log("Address resolved:", result.displayName, "->", lat, lng);
    } catch (err) {
        alert(err.message + "\nPlease try a different address (e.g. Shanghai, Beijing).");
        return;
    }

    AssetTrackerContract.methods
        .createAsset(batchNo, name, desc, manufacturer, owner, status, lng, lat)
        .send({ from: acc })
        .then(result => {
            if (result.status === true) {
                alert("Success");
                console.log(result);
                $('input[name="batchNo"]').val("");
                $('input[name="name"]').val("");
                $('input[name="desc"]').val("");
                $('input[name="manufacturer"]').val("");
                $('input[name="owner"]').val("");
                $('input[name="status"]').val("");
                $('input[name="address"]').val("");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Create failed: " + err.message);
        });
    $("#exampleModal").modal("hide");
}

function listenToContractEvents() {
    $("#dataLog").html("");

    AssetTrackerContract.events.AssetCreate({ fromBlock: 0 })
    .on('data', function(result) {
        const v = result.returnValues;
        const newEventData =
            '<h6><span class="badge badge-primary">Create</span> New asset created with id ' +
            '<strong>' + v[0] + '</strong> by <strong>' + v[1] + '</strong>' +
            ' current status <strong>' + v[2] + '</strong></h6>';
        $("#dataLog").append(newEventData);
    })
    .on('error', console.error);

    AssetTrackerContract.events.AssetTransfer({ fromBlock: 0 })
    .on('data', function(result) {
        const v = result.returnValues;
        const newEventData =
            '<h6><span class="badge badge-info">Transfer</span> Asset with id ' +
            '<strong>' + v[0] + '</strong> Transfered to new owner ' +
            '<strong>' + v[1] + '</strong></h6>';
        $("#dataLog").append(newEventData);

    })
    .on('error', console.error);
}