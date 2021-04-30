// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "../Interfaces/IERC20Detailed.sol";
import "../Interfaces/IMarketFactory.sol";
import "../ERC721/MarketERC721.sol";

contract MarketFactory is IMarketFactory {
    address[] public override markets;

    // solhint-disable-next-line no-empty-blocks
    constructor() {}

    function create(
        string calldata ipfs,
        string[] calldata outcomes,
        address owner,
        address resolver,
        uint256 timestamp,
        IERC20Detailed collateral
    ) external override returns (address) {
        address addr = address(new MarketERC721(ipfs, outcomes, msg.sender, owner, resolver, timestamp, collateral));
        emit Deployed(addr, msg.sender);
        markets.push(addr);
        return addr;
    }

    function marketsLength() external view override returns (uint256) {
        return markets.length;
    }
}
