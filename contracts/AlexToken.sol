pragma solidity ^0.4.2;

contract AlexToken {

    string public name = "Alex Token";
    string public symbol = "ALEX";
    string public standard = "Alex Token v1.0";
    uint256 public totalSupply;
    //mapping in Solidity is key-value store
    mapping(address => uint256) public balanceOf;
    //Account A, approve account B,C,D...
    mapping(address => mapping(address => uint256)) public allowance;

    //We can listen Event, so be aware when it is triggered
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
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

    /*
     * Allows _spender to withdraw from your account multiple times, up to the _value amount. 
     * If this function is called again it overwrites the current allowance with _value.
     */
    function approve (address _spender, uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
        Approval(msg.sender,_spender,_value);

        return true;
    }

    //Like the function above, transfer, what with a third party(_from)
    function transferFrom (address _from, address _to, uint256 _value) public returns (bool success){
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        //Update the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        //Update the allowance
        allowance[_from][msg.sender] -= _value;
        //Fire the event
        Transfer(_from,_to,_value);

        return true;
    }
}