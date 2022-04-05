// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EIP712MessageCounter is EIP712 {

  mapping(address => uint256) private _counters;
  mapping(address => string) private _accountsLastMessage;

  struct Signature {
    address signer;
    string message;
  }

  bytes32 private constant _SIGNATURE_STRUCT_HASH =
    keccak256("Signature(address signer,string message)");

  constructor() EIP712("EIP712MessageCounter", "0.0.1") {

  }

  function _verifySignedMessage(Signature calldata signatureMessage, bytes calldata signature) private view returns (bool) {
    bytes32 digest = _hashTypedDataV4(
      keccak256(abi.encode(
        _SIGNATURE_STRUCT_HASH, signatureMessage.signer, keccak256(bytes(signatureMessage.message))
      ))
    );
    address messageSigner = ECDSA.recover(digest, signature);
    return messageSigner == signatureMessage.signer;
  }

  function setSignerMessage(Signature calldata signatureMessage, bytes calldata signature) public returns (bool) {
    require(_verifySignedMessage(signatureMessage, signature), "EIP712MessageCounter: Signature does not match expected Signature message");

    _counters[signatureMessage.signer] = _counters[signatureMessage.signer] + 1;
    _accountsLastMessage[signatureMessage.signer] = signatureMessage.message;

    return true;
  }

  function countOf(address account) public view returns (uint256) {
    return _counters[account];
  }

  function lastMessageOf(address account) public view returns (string memory) {
    return _accountsLastMessage[account];
  }
}