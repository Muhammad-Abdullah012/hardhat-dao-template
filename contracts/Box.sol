// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Box is Ownable {
    uint256 private value;

    event valueChanged(uint256 indexed newValue);

    constructor() Ownable() {
        value = 0;
    }

    function changeValue(uint256 newValue) public onlyOwner {
        value = newValue;
        emit valueChanged(newValue);
    }

    function getValue() public view returns (uint256) {
        return value;
    }
}
