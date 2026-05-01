# 📦 Blockchain Parcel Tracking System

A decentralized parcel tracking system built with Ethereum blockchain, PHP, and Raspberry Pi with RFID technology.

---

## 📋 Project Overview

This project implements a full-stack parcel tracking system that uses blockchain technology to ensure transparency and immutability of parcel status updates. Physical parcels are tagged with RFID cards, which can be scanned using a Raspberry Pi + RC522 RFID reader to automatically update parcel status on the blockchain.

---

## ✨ Features

- 🔐 **User Authentication** — Register, login, and session management
- 📦 **Asset Management** — Create, view, and transfer parcel assets on the blockchain
- 📍 **Real-time Location Tracking** — Address input auto-converts to coordinates via OpenStreetMap (Nominatim API)
- 🗺️ **Interactive Map** — Visualize parcel route and history using Leaflet.js
- 📜 **Status History** — Full audit trail of every parcel transfer recorded on blockchain
- 💳 **RFID Integration** — Scan RFID cards with Raspberry Pi to register and update parcels
- 🌐 **Web Interface** — Accessible from any device on the same network

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Bootstrap, JavaScript, jQuery |
| Backend | PHP 8.4 |
| Database | MariaDB (MySQL compatible) |
| Blockchain | Ethereum (Ganache local testnet) |
| Smart Contract | Solidity (via Truffle) |
| Web3 | Web3.js (browser), Web3.py (Raspberry Pi) |
| Map | Leaflet.js + OpenStreetMap |
| Hardware | Raspberry Pi 5 (16GB), RC522 RFID Reader |
| IoT Script | Python 3 |

---

## 📁 Project Structure

```
Blockchain/
├── index.php              # Main dashboard - asset table & history
├── login.php              # User login page
├── register.php           # User registration page
├── logout.php             # Session logout
├── transfer.php           # Transfer asset ownership & status
├── assetDetail.php        # Search & track asset with map
├── delete.php             # Delete asset
├── config.php             # Database configuration
├── truffle-config.js      # Truffle blockchain configuration
├── template/
│   ├── header.php         # HTML header template
│   ├── navbar.php         # Navigation bar template
│   └── footer.php         # HTML footer template
├── js/
│   ├── app.js             # Main dashboard logic
│   ├── searchAsset.js     # Asset search & map rendering
│   ├── transfer.js        # Transfer asset logic
│   ├── ether_config.js    # Smart contract ABI & address
│   └── truffle-config.js  # Truffle config
├── vendor/                # PHP dependencies
└── rfid_blockchain.py     # Raspberry Pi RFID scanning script
```

---

## ⚙️ Prerequisites

### Computer (Windows/Mac/Linux)
- [XAMPP](https://www.apachefriends.org/) or any Apache + PHP + MySQL stack
- [Node.js](https://nodejs.org/) (v14+)
- [Truffle](https://trufflesuite.com/) — `npm install -g truffle`
- [Ganache](https://trufflesuite.com/ganache/) — Local Ethereum blockchain
- [MetaMask](https://metamask.io/) — Browser extension for blockchain interaction

### Raspberry Pi 5
- Raspberry Pi OS (Debian Bookworm)
- Apache2 + PHP 8.4
- MariaDB
- Python 3 + pip
- RC522 RFID module connected via SPI

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/blockchain-parcel-tracking.git
cd blockchain-parcel-tracking
```

### 2. Set Up Database

Import the database schema into MySQL/MariaDB:

```sql
CREATE DATABASE blockchain;
USE blockchain;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
```

### 3. Configure Database Connection

Edit `config.php`:

```php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'blockchain');
```

### 4. Deploy Smart Contract

Start Ganache, then deploy the contract:

```bash
truffle migrate --reset
```

Copy the deployed contract address and update `js/ether_config.js`:

```javascript
var address = "YOUR_CONTRACT_ADDRESS_HERE";
```

### 5. Configure MetaMask

- Network: Custom RPC
- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `5777`
- Import a Ganache account using its private key

### 6. Run the Web Application

Place the project folder in your web server's root directory:
- XAMPP: `C:\xampp\htdocs\Blockchain\`
- Access at: `http://localhost/Blockchain`

---

## 🍓 Raspberry Pi Setup

### Hardware Wiring (RC522 → Raspberry Pi 5)

| RC522 Pin | Raspberry Pi Pin | GPIO |
|-----------|-----------------|------|
| 3.3V | Pin 1 | 3.3V |
| RST | Pin 22 | GPIO25 |
| GND | Pin 6 | GND |
| MISO | Pin 21 | GPIO9 |
| MOSI | Pin 19 | GPIO10 |
| SCK | Pin 23 | GPIO11 |
| SDA | Pin 24 | GPIO8 |
| IRQ | — | Not connected |

### Software Setup

```bash
# Enable SPI interface
sudo raspi-config  # Interface Options → SPI → Enable

# Install dependencies
sudo apt install apache2 php libapache2-mod-php php-mysqli mariadb-server -y
pip install mfrc522 web3 --break-system-packages

# Copy project files
sudo cp -r /path/to/Blockchain /var/www/html/

# Import database
sudo mariadb -u root blockchain < blockchain.sql
```

### Running the RFID Script

```bash
python3 rfid_blockchain.py
```

**Script features:**
- Scan RFID card → display parcel info from blockchain
- Register new parcels by scanning unregistered cards
- Update parcel status and owner
- Auto-convert address to GPS coordinates

---

## 📱 How to Use

### Web Interface

1. Register an account at `http://<server-ip>/Blockchain/register.php`
2. Login and connect MetaMask to Ganache
3. **Create Asset** — Fill in parcel details and address
4. **Transfer Asset** — Search by ID, update owner/status/location
5. **Search Asset** — Track parcel route on interactive map

### RFID Scanner (Raspberry Pi)

1. Run `python3 rfid_blockchain.py` on the Raspberry Pi
2. **New card** → Choose to register → Enter parcel details
3. **Registered card** → View parcel info → Update status

---

## 🔗 Smart Contract Functions

| Function | Description |
|----------|-------------|
| `createAsset()` | Create a new parcel asset |
| `transferAsset()` | Transfer ownership and update status |
| `getAsset(id)` | Get parcel details |
| `getAssetCount()` | Get total number of assets |
| `getLongLat(id)` | Get current location coordinates |
| `getStatus(id, index)` | Get status at a specific history point |

---

## 👥 Team

- Han Jijie

---

## 📄 License

This project is for academic purposes.
