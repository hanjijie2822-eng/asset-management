const AssetLibrary = artifacts.require("AssetLibrary");
const AssetTracker = artifacts.require("AssetTracker");

module.exports = function (deployer) {
  deployer.deploy(AssetLibrary);
  deployer.link(AssetLibrary, AssetTracker);
  deployer.deploy(AssetTracker);
};