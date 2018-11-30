var AlexTokenSale = artifacts.require("./AlexTokenSale.sol");
var AlexToken = artifacts.require("./AlexToken.sol");



contract('AlexTokenSale', function(accounts) {
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000; //The price in wei -> 0.001 ether
    var admin = accounts[0];
    var buyer = accounts[1];
    var numberOfTokens;
    //The tokens we want to have available to sell in the token sale
    var tokensAvailable = 75000; //75%

    it ('Initializes the contract with the correct values', function(){
        return AlexTokenSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address){
            assert.notEqual(address,0x0, "has contract address");
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address,0x0, "has token contract address");
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price,tokenPrice, 'token price is correct');
        });
    });

    it ('Tokens buying', function(){
        return AlexToken.deployed().then(function(instance){
            tokenInstance = instance;
            return AlexTokenSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            //We take 75% of the total supply for the token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
        }).then(function(receipt){
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Sell','should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer,'logs the account that purchases the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens,'logs the number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            assert.equal(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
            //test incorrect value for our token
            return tokenSaleInstance.buyTokens(numberOfTokens ,{from: buyer, value: 1});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
            return tokenSaleInstance.buyTokens(80000 ,{from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot purchase an amount of tokens greater than the number for sale');
        });
    });

    it ('Ends Token Sale', function(){
        return AlexToken.deployed().then(function(instance){
            tokenInstance = instance;
            return AlexTokenSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            //test if end the sale from account other than the admin
            return tokenSaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert' >= 0, 'must be admin who end the sale'));
            return tokenSaleInstance.endSale({from: admin});
        }).then(function(receipt){
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 99990), 'returns all unsold tokens to admin';
            //test if token price was reset when selfDestruct contract
            balance = web3.eth.getBalance(tokenSaleInstance.address)
            assert.equal(balance.toNumber(), 0, 'token price was reset');
        });
    });
});