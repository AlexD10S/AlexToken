var AlexToken = artifacts.require("./AlexToken.sol");
var AlexTokenSale = artifacts.require("./AlexTokenSale.sol");

module.exports = function(deployer) {
  //Use promise
  deployer.deploy(AlexToken, 100000).then(function(){
    var tokenPrice = 1000000000000000;
    return deployer.deploy(AlexTokenSale,AlexToken.address, tokenPrice);
  });

  
};
