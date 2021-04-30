// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.6;

/**
 * @title ERC20Detailed token
 * @dev The decimals are only for visualization purposes.
 * All the operations are done using the smallest and indivisible token unit,
 * just as on Ethereum all the operations are done in wei.
 */
interface IERC20Detailed {
    /**
     * @return the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @return the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @return the number of decimals of the token.
     */
    function decimals() external view returns (uint8);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(address recipient, uint256 amount) external returns (bool);
}
