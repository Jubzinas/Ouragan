// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./ETHTornado.sol";

contract Ouragan {
    ETHTornado tornado;

    constructor(address _tornado) public {
        tornado = ETHTornado(_tornado);
    }
}
