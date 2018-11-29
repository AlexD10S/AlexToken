pragma solidity ^0.4.2;

contract AlexToken {

    string public name = "Alex Token";
    string public symbol = "ALEX";
    string public standard = "Alex Token v1.0";
    uint256 public totalSupply;
    //mapping in Solidity is key-value store
    mapping(address => uint256) public balanceOf;

    //We can listen Event, so be aware when it is triggered
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    //Constructor
    function AlexToken (uint256 _initialSupply) public {
        //The _ in the variable is a Solidity convention.
        totalSupply = _initialSupply;
        //msg.sender is the account who deploy the contract. msg is a global variable. 
        balanceOf[msg.sender] = _initialSupply;
    }

    function transfer (address _to, uint256 _value) public returns (bool success){
        //require, if is false stop execution and throw error. (It spend the gas)
        require(balanceOf[msg.sender] >= _value);
        //Simple transaction(add value from address, deduce in to address)
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        //Must fire a transfer EVENT(see documentation ERC20)
        Transfer(msg.sender,_to,_value);
        
        return true;
    }
}