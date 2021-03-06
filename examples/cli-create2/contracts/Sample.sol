pragma solidity ^0.5.0;

import "zos-lib/contracts/Initializable.sol";

contract Sample is Initializable {
  uint256 public value;

  function initialize(uint256 _value) initializer public {
    value = _value;
  }
}