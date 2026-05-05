var AssetTrackerContract;
var currentMap = null;

async function initSearch() {
    if (window.ethereum) {
        try {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            AssetTrackerContract = new web3.eth.Contract(abi, address);
            console.log("Search page ready.");
        } catch (error) {
            console.error("User denied account access:", error);
            alert("Please authorize MetaMask to connect to this site");
        }
    } else {
        alert("Please install MetaMask first");
    }
}

$(document).ready(() => {
    initSearch();
});

function searchAsset() {
    if (!AssetTrackerContract) {
        alert("Not connected to blockchain yet, please try again");
        return;
    }

    $("#loading").show();
    let id = parseInt($('input[name="id"]').val());

    if (!id || id <= 0) {
        alert("Please enter a valid asset ID");
        return;
    }

    $("#searchResult").html("");
    $("#statusHistory").html('<br><h4>Status History</h4>');

    if (currentMap !== null) {
        currentMap.remove();
        currentMap = null;
    }

    AssetTrackerContract.methods.getAsset(id).call((error, response) => {
        if (error) { console.log(error); return; }

        if (response[1] !== "") {
            let result =
                '<br><h4 style="color: #3a95d6;">Asset Found</h4>' +
                '<div class="border-top my-3"></div>' +
                '<div class="card p-3" style="background: #f8f9fa;">' +
                "<p><strong>Name: </strong>" + response[1] + "</p>" +
                "<p><strong>Batch No: </strong>" + response[0] + "</p>" +
                "<p><strong>Manufacturer: </strong>" + response[2] + "</p>" +
                "<p><strong>Current Owner: </strong>" + response[3] + "</p>" +
                "<p><strong>Description: </strong>" + response[5] + "</p>" +
                "<p><strong>Current Status: </strong><span class='badge badge-info'>" + response[4] + "</span></p>" +
                '</div>' +
                '<br><h5>Asset Location & Route</h5>' +
                '<div id="mapid" style="width: 100%; height: 400px; border-radius: 8px; border: 2px solid #3a95d6; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"></div>' +
                '<small class="text-muted">Green: Start | Red: Current | Blue dashed: History path</small>';

            $("#searchResult").html(result);
            $("#loading").hide();
            $("#statusHistory").show();

            loadAssetHistoryAndMap(id);
        } else {
            $("#searchResult").html(
                '<br><div class="alert alert-warning"><h4>Asset Not Found</h4>' +
                '<p>Asset with ID ' + id + ' not found.</p></div>'
            );
            $("#loading").hide();
            $("#statusHistory").hide();
        }
    });
}

function loadAssetHistoryAndMap(id) {
    AssetTrackerContract.methods.AssetStore(id).call((error, response) => {
        if (error) { console.log(error); return; }

        let statusCount = parseInt(response[5]);
        let historyPoints = [];
        let pendingRequests = statusCount;

        for (let i = 1; i <= statusCount; i++) {
            (function(idx) {
                AssetTrackerContract.methods
                    .getStatus(id, idx)
                    .call((error, statusResponse) => {
                        if (error) { console.log(error); return; }

                        let date = new Date(parseInt(statusResponse[0]) * 1000);
                        let owner = statusResponse[2];
                        let status = statusResponse[1];
                        let lng = parseFloat(statusResponse[3]);
                        let lat = parseFloat(statusResponse[4]);

                        historyPoints[idx] = {
                            index: idx, lat: lat, lng: lng,
                            date: date, owner: owner, status: status
                        };

                        let badgeColor = idx === 1 ? 'success' : (idx === statusCount ? 'danger' : 'info');
                        let stepLabel = idx === 1 ? 'Start' : (idx === statusCount ? 'Current' : 'Transit');

                        let event =
                            '<div class="card mb-2 p-2" style="border-left: 4px solid ' +
                            (idx === 1 ? '#28a745' : (idx === statusCount ? '#dc3545' : '#17a2b8')) + ';">' +
                            '<small class="text-muted">' + date.toLocaleString() + '</small><br>' +
                            '<span class="badge badge-' + badgeColor + '">' + stepLabel + ' #' + idx + '</span> ' +
                            '<strong> ' + owner + '</strong><br>' +
                            'Status: ' + status + '<br>' +
                            '<small>Loc: ' + lat.toFixed(4) + ', ' + lng.toFixed(4) + '</small>' +
                            '</div>';
                        $("#statusHistory").append(event);

                        pendingRequests--;
                        if (pendingRequests === 0) {
                            renderMap(historyPoints, statusCount);
                        }
                    });
            })(i);
        }
    });
}

function renderMap(historyPoints, statusCount) {
    let current = historyPoints[statusCount];
    if (!current || isNaN(current.lat) || isNaN(current.lng)) {
        $("#mapid").html('<div class="alert alert-warning">No valid coordinates for this asset</div>');
        return;
    }

    currentMap = L.map('mapid').setView([current.lat, current.lng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(currentMap);

    let validPoints = [];
    for (let i = 1; i <= statusCount; i++) {
        let pt = historyPoints[i];
        if (pt && !isNaN(pt.lat) && !isNaN(pt.lng)) {
            validPoints.push(pt);
        }
    }

    if (validPoints.length > 1) {
        let pathCoords = validPoints.map(p => [p.lat, p.lng]);
        L.polyline(pathCoords, {
            color: '#007bff', weight: 3, opacity: 0.7, dashArray: '10, 10'
        }).addTo(currentMap).bindPopup('Asset path');
    }

    validPoints.forEach((pt) => {
        let isStart = pt.index === 1;
        let isEnd = pt.index === statusCount;
        let iconColor = isStart ? 'green' : (isEnd ? 'red' : 'blue');

        let svgIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color:' + iconColor + ';width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        let popupContent =
            '<strong>' + (isStart ? 'Start' : (isEnd ? 'Current Location' : 'Transit Point')) + '</strong><br>' +
            '<strong>Step:</strong> #' + pt.index + '<br>' +
            '<strong>Owner:</strong> ' + pt.owner + '<br>' +
            '<strong>Status:</strong> ' + pt.status + '<br>' +
            '<strong>Time:</strong> ' + pt.date.toLocaleString() + '<br>' +
            '<strong>Coords:</strong> ' + pt.lat.toFixed(4) + ', ' + pt.lng.toFixed(4);

        L.marker([pt.lat, pt.lng], { icon: svgIcon })
            .addTo(currentMap)
            .bindPopup(popupContent);
    });

    if (validPoints.length > 1) {
        let bounds = L.latLngBounds(validPoints.map(p => [p.lat, p.lng]));
        currentMap.fitBounds(bounds, { padding: [50, 50] });
    } else {
        currentMap.setView([current.lat, current.lng], 13);
    }
}