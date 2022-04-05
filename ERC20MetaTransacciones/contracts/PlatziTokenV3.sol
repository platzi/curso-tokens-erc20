// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/metatx/ERC2771ContextUpgradeable.sol";

contract PlatziTokenV3 is
    ERC20Upgradeable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ERC2771ContextUpgradeable
{
    function initialize(uint256 initialSupply, address trustedForwarder)
        public
        initializer
    {
        __ERC20_init("PlatziToken", "PLZ");
        __Ownable_init_unchained();
        __UUPSUpgradeable_init();
        _mint(msg.sender, initialSupply * (10**decimals()));
        // Initiating ERC2771Context contract
        __ERC2771Context_init_unchained(trustedForwarder);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    function mint(address toAccount, uint256 amount) public onlyOwner {
        _mint(toAccount, amount);
    }

    // Overriding message _msgSender function so the one provided by ERC2771Context contract is used (To extract the sender from the execution data)
    function _msgSender()
        internal
        view
        override(ERC2771ContextUpgradeable, ContextUpgradeable)
        returns (address)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    // Overriding message _msgData function so the one provided by ERC2771Context contract is used (In case there is an internal function that needs it)
    function _msgData()
        internal
        view
        override(ERC2771ContextUpgradeable, ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }
}
