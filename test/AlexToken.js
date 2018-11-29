var AlexToken = artifacts.require("./AlexToken.sol");

contract('AlexToken', function(accounts) {
    it ('Initializes the contract with the correct values', function(){
        return AlexToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, 'Alex Token', 'has the correct name');
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol, 'ALEX', 'has the correct symbol');
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard, 'Alex Token v1.0', 'has the correct standard');
        });
    });
    it ('Allocates the initial supply upon development', function(){
        return AlexToken.deployed().then( function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(),100000,'sets the total supply to 100000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(),100000,'it allocates the initial supply to the admin account');
        });
    });

    it('Transfers token ownership', function(){
        return AlexToken.deployed().then(function(instance){
            tokenInstance = instance;
            //.call call the function without creates the transaction(Not trigger the transaction).
            return tokenInstance.transfer.call(accounts[1],9999999999);
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 25000,{from: accounts[0]});
        }).then(function(success){
            assert.equal(success, true, 'transaction successfully');
            return tokenInstance.transfer(accounts[1], 25000, {from: accounts[0]});  
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer','should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0],'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to, accounts[1],'logs the account the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value, 25000,'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 25000, 'adds the amount to the receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 75000, 'deducts the amount from the sending account');
        });
    });


    it('Approves tokens for delegated transfer', function() {
        return AlexToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1],100);
        }).then(function(success){
            assert.equal(success, true, 'approve returns true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0] });  
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Approval','should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0],'logs the account the tokens are authorized by');
            assert.equal(receipt.logs[0].args._spender, accounts[1],'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, 100,'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(),100,'stores the allowance for delegated transfer');
        });
    });

    it('Handles delegated token transfers', function(){
        return AlexToken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then(function(receipt){
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        }).then(function(receipt){
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot trnsfer value larger than balance');
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot trnsfer value larger than approved amount');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(success){
            assert.equal(success, true, 'transferForm returns true');
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer','should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount,'logs the account the tokens are transfered from');
            assert.equal(receipt.logs[0].args._to, toAccount,'logs the account the tokens are transfered to');
            assert.equal(receipt.logs[0].args._value, 10,'logs the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(),90,'deducts the amount from the sending account');
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance){
            assert.equal(balance.toNumber(),10,'adds the amount from the receiving account');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(),0, 'deducts the amount from the allowance');
        });
    });

});