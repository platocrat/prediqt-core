// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "./IERC20Detailed.sol";

interface IMarketFactory {
    event Deployed(address indexed addr, address indexed sender);

    function markets(uint256) external view returns (address);

    function marketsLength() external view returns (uint256);

    function create(
        string calldata ipfs,
        string[] calldata outcomes,
        address owner,
        address resolver,
        uint256 timestamp,
        IERC20Detailed collateral
    ) external returns (address);
}
