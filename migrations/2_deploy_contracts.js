var AlexToken = artifacts.require("./AlexToken.sol");

module.exports = function(deployer) {
  deployer.deploy(AlexToken, 100000);
};
