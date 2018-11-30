App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 75000,
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
      return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("AlexTokenSale.json", function(alexTokenSale) {
        App.contracts.AlexTokenSale = TruffleContract(alexTokenSale);
        App.contracts.AlexTokenSale.setProvider(App.web3Provider);
        App.contracts.AlexTokenSale.deployed().then(function(alexTokenSale) {
          console.log("Alex Token Sale Address:", alexTokenSale.address);
        });
      }).done(function() {
        $.getJSON("AlexToken.json", function(alexToken) {
          App.contracts.AlexToken = TruffleContract(alexToken);
          App.contracts.AlexToken.setProvider(App.web3Provider);
          App.contracts.AlexToken.deployed().then(function(alexToken) {
            console.log("Alex Token Address:", alexToken.address);
          });
  
          App.listenForEvents();
          return App.render();
        });
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.AlexTokenSale.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.render();
        })
      })
    },
  
    render: function() {
      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
  
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
          App.account = account;
          $('#accountAddress').html("Your Account: " + account);
        }
      })
  
      // Load token sale contract
      App.contracts.AlexTokenSale.deployed().then(function(instance) {
        alexTokenSaleInstance = instance;
        return alexTokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return alexTokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
  
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.AlexToken.deployed().then(function(instance) {
          alexTokenInstance = instance;
          return alexTokenInstance.balanceOf(App.account);
        }).then(function(balance) {
          $('.alex-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
        })
      });
    },
  
    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      var numberOfTokens = $('#numberOfTokens').val();
      App.contracts.AlexTokenSale.deployed().then(function(instance) {
          console.log(instance);
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 5000000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    }
}

$(function() {
    $(window).load(function() {
        App.init();
    })
});
