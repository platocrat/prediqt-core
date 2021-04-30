// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

interface IERC721Market {
    enum Status {Invalid, Started, Resolved}
    struct Outcome {
        address token;
        uint256 result;
    }

    event Created(
        string ipfs,
        address indexed sender,
        address indexed addr,
        address resolver,
        address indexed owner,
        uint256 timestamp,
        address[] tokens
    );
    event Resolved(address indexed sender, address indexed addr);
    event Minted(address indexed sender, address indexed addr, uint256 amount);
    event Claimed(address indexed sender, address indexed addr, uint256 amount);

    function resolve(Outcome[] memory _outcome) external returns (bool);

    function mint(uint256 amount) external returns (uint256);

    function claim(address to, uint256 amount) external returns (uint256);
}
