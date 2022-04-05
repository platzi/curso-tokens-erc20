// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

// import upgradeable version of the ERC20 contract
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
// import Ownable upgradeable so only the contract owner can run admin actions on the contract
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
// import the open the Proxy contract
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PlatziTokenV1 is
    ERC20Upgradeable,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    // using an initializer instead of a contructor
    function initialize(uint256 initialSupply) public initializer {
        // As we are not using constructors we have to use the ERC20's contract initializer as well
        __ERC20_init("PlatziToken", "PLZ");
        // init the ownable contract and proxy
        __Ownable_init_unchained();
        __UUPSUpgradeable_init();
        // mint an initial amount of tokens
        _mint(msg.sender, initialSupply * (10**decimals()));
    }

    // Override this function required for the proxy to work
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
