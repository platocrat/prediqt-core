// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.6;

interface IERC20Market {
    function mint(address _addr, uint256 _amount) external;

    function burn(uint256 _amount) external;
}
