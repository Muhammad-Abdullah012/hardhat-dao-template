// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    /**
     * @param _mintDelay = how long to wait before executing a proposal
     * @param _proposers = List of addresses that can propose
     * @param _executors = Who can execute proposal after proposal passes
     */
    constructor(
        uint256 _mintDelay,
        address[] memory _proposers,
        address[] memory _executors
    ) TimelockController(_mintDelay, _proposers, _executors) {}
}
