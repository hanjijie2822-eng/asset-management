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
        print(f"地址解析失败: {e}")
    return "0", "0"

print("=== RFID 包裹扫描系统 ===")
print("区块链连接状态:", "✅ 已连接" if w3.is_connected() else "❌ 未连接")
print("请把 RFID 卡放到读卡器上...")

try:
    while True:
        id, text = reader.read()
        print(f"\n扫描到卡片 ID: {id}")

        if id in CARD_MAP:
            asset_id = CARD_MAP[id]
            info = contract.functions.getAsset(asset_id).call()
            print(f"\n📦 包裹信息:")
            print(f"  Batch No:     {info[0]}")
            print(f"  Name:         {info[1]}")
            print(f"  Manufacturer: {info[2]}")
            print(f"  Owner:        {info[3]}")
            print(f"  Status:       {info[4]}")
            print(f"  Description:  {info[5]}")

            print(f"\n请选择新状态:")
            print("1. 运输中")
            print("2. 已到达仓库")
            print("3. 派送中")
            print("4. 已签收")
            choice = input("输入数字选择: ")
            status_map = {"1":"运输中","2":"已到达仓库","3":"派送中","4":"已签收"}
            new_status = status_map.get(choice, "未知")
            new_owner = input("输入新负责人名字: ")
            new_address = input("输入新地址: ")
            print("正在解析地址...")
            lng, lat = geocode(new_address)
            print(f"地址解析结果: 经度={lng}, 纬度={lat}")

            tx = contract.functions.transferAsset(
                asset_id, new_owner, lng, lat, new_status
            ).transact({"from": account})
            print(f"✅ 区块链更新成功！交易哈希: {tx.hex()}")

        else:
            print("⚠️  未知卡片！")
            print("\n请选择操作:")
            print("1. 注册新包裹并绑定此卡")
            print("2. 忽略")
            op = input("输入数字: ")

            if op == "1":
                print("\n请输入新包裹信息:")
                batch_no = input("Batch Number: ")
                name = input("Name: ")
                desc = input("Description: ")
                manufacturer = input("Manufacturer: ")
                owner = input("Owner: ")
                status = input("Current Status: ")
                address_text = input("Address (地址，如 Cornell University): ")
                print("正在解析地址...")
                lng, lat = geocode(address_text)
                print(f"地址解析结果: 经度={lng}, 纬度={lat}")

                tx = contract.functions.createAsset(
                    batch_no, name, desc, manufacturer, owner, status, lng, lat
                ).transact({"from": account})

                asset_id = contract.functions.getAssetCount().call()
                CARD_MAP[id] = asset_id
                print(f"✅ 新包裹已创建！包裹ID: {asset_id}")
                print(f"✅ 卡片 {id} 已绑定到包裹 {asset_id}")

        print("\n继续扫描下一张卡...")
finally:
    GPIO.cleanup()
