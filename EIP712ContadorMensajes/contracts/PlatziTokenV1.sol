// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PlatziTokenV1 is ERC20Upgradeable, UUPSUpgradeable, OwnableUpgradeable {

  function initialize(uint256 initialSupply) initializer public {
    __ERC20_init("PlatziToken", "PLZ");
    __Ownable_init_unchained();
    __UUPSUpgradeable_init();
    _mint(msg.sender, initialSupply * (10 ** decimals()));
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}