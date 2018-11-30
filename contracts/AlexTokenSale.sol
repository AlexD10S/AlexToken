pragma solidity ^0.4.24;
import "./AlexToken.sol";
import "../lib/SafeMath.sol";

contract AlexTokenSale {
    address admin;      //The person who deploy the contract.
    AlexToken public tokenContract; //address of the token Contract
    uint256 public tokenPrice;
    uint256 public tokensSold;
    using SafeMath for uint256;

    //We can listen Event, so be aware when it is triggered
    event Sell(
        address _buyer,
        uint256 _amount
    );

    function AlexTokenSale(AlexToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;

        tokenPrice = _tokenPrice;
    }

    //declared payable to recieve ethers.
    function buyTokens(uint256 _numberOfTokens) public payable {
        //Check no one overpaid or underpaid for AlexToken
        //msg.value is the amount in wei the user is sending
        //mul is a function to multiply in a ssage way(using library SafeMath)
        require(msg.value == _numberOfTokens.mul(tokenPrice));
        //See the contract has enough tokens
        //require(tokenContract.balanceOf(msg.sender) >= _numberOfTokens);
        //TODO: Check difference between this and msg.sender
        require(tokenContract.balanceOf(this) >= _numberOfTokens);

        //Buy functionality
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokensSold += _numberOfTokens;

        Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        //address(this) is smart contract adddress.
        require(tokenContract.transfer(admin, tokenContract.balanceOf(this)));

        //self destruction
        selfdestruct(admin);
    }

   

}