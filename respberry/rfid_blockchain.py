import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522
from web3 import Web3
import json
import urllib.request
import urllib.parse

CARD_MAP = {}

w3 = Web3(Web3.HTTPProvider("http://172.20.10.4:7545"))
account = w3.eth.accounts[1]

contract_address = "0x36A2C0bFC569A528D311047868094E7D5a1e69d2"
abi = json.loads('[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"string","name":"manufacturer","type":"string"},{"indexed":false,"internalType":"string","name":"status","type":"string"}],"name":"AssetCreate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"string","name":"newOwner","type":"string"},{"indexed":false,"internalType":"string","name":"newLong","type":"string"},{"indexed":false,"internalType":"string","name":"newLat","type":"string"}],"name":"AssetTransfer","type":"event"},{"constant":true,"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getAsset","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAssetCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"string","name":"_batchNo","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"string","name":"_manufacturer","type":"string"},{"internalType":"string","name":"_owner","type":"string"},{"internalType":"string","name":"_status","type":"string"},{"internalType":"string","name":"_long","type":"string"},{"internalType":"string","name":"_lat","type":"string"}],"name":"createAsset","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"},{"internalType":"string","name":"_newOwner","type":"string"},{"internalType":"string","name":"_newLong","type":"string"},{"internalType":"string","name":"_newLat","type":"string"},{"internalType":"string","name":"_status","type":"string"}],"name":"transferAsset","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]')

contract = w3.eth.contract(address=contract_address, abi=abi)
reader = SimpleMFRC522()

def geocode(address_text):
    try:
        url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + urllib.parse.quote(address_text)
        req = urllib.request.Request(url, headers={"User-Agent": "rfid-tracker"})
        res = urllib.request.urlopen(req, timeout=10)
        data = json.loads(res.read())
        if data:
            return data[0]["lon"], data[0]["lat"]
    except Exception as e:
        print(f"Address geocoding failed: {e}")
    return "0", "0"

print("=== RFID Package Scanning System ===")
print("Blockchain connection status:", "✅ Connected" if w3.is_connected() else "❌ Not connected")
print("Please place an RFID card on the reader...")

try:
    while True:
        id, text = reader.read()
        print(f"\nCard scanned. ID: {id}")

        if id in CARD_MAP:
            asset_id = CARD_MAP[id]
            info = contract.functions.getAsset(asset_id).call()
            print(f"\n📦 Package Info:")
            print(f"  Batch No:     {info[0]}")
            print(f"  Name:         {info[1]}")
            print(f"  Manufacturer: {info[2]}")
            print(f"  Owner:        {info[3]}")
            print(f"  Status:       {info[4]}")
            print(f"  Description:  {info[5]}")

            print(f"\nSelect new status:")
            print("1. In Transit")
            print("2. Arrived at Warehouse")
            print("3. Out for Delivery")
            print("4. Delivered")
            choice = input("Enter number to select: ")
            status_map = {"1": "In Transit", "2": "Arrived at Warehouse", "3": "Out for Delivery", "4": "Delivered"}
            new_status = status_map.get(choice, "Unknown")
            new_owner = input("Enter new responsible person's name: ")
            new_address = input("Enter new address: ")
            print("Geocoding address...")
            lng, lat = geocode(new_address)
            print(f"Geocode result: Longitude={lng}, Latitude={lat}")

            tx = contract.functions.transferAsset(
                asset_id, new_owner, lng, lat, new_status
            ).transact({"from": account})
            print(f"✅ Blockchain updated successfully! Transaction hash: {tx.hex()}")

        else:
            print("⚠️  Unknown card!")
            print("\nSelect an action:")
            print("1. Register new package and bind to this card")
            print("2. Ignore")
            op = input("Enter number: ")

            if op == "1":
                print("\nEnter new package information:")
                batch_no = input("Batch Number: ")
                name = input("Name: ")
                desc = input("Description: ")
                manufacturer = input("Manufacturer: ")
                owner = input("Owner: ")
                status = input("Current Status: ")
                address_text = input("Address (e.g. Cornell University): ")
                print("Geocoding address...")
                lng, lat = geocode(address_text)
                print(f"Geocode result: Longitude={lng}, Latitude={lat}")

                tx = contract.functions.createAsset(
                    batch_no, name, desc, manufacturer, owner, status, lng, lat
                ).transact({"from": account})

                asset_id = contract.functions.getAssetCount().call()
                CARD_MAP[id] = asset_id
                print(f"✅ New package created! Package ID: {asset_id}")
                print(f"✅ Card {id} has been bound to package {asset_id}")

        print("\nReady to scan next card...")
finally:
    GPIO.cleanup()