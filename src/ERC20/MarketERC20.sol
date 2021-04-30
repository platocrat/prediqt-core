// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.6;

import "../Interfaces/IERC20Market.sol";
import "../Interfaces/IERC721Market.sol";
import "../Interfaces/IERC20Detailed.sol";
import "../openzeppelin/token/ERC20/ERC20.sol";
import "../openzeppelin/access/Ownable.sol";

contract MarketERC20 is
    ERC20,
    IERC20Market,
    Ownable // TODO: remove Ownable and use proper interfaces // TODO: try cloning
{
    bool internal locked;

    modifier blockReentrancy {
        require(!locked, "Contract is locked");
        locked = true;
        _;
        locked = false;
    }

    constructor(
        string memory _name,
        address _owner,
        IERC20Detailed _collateral
    ) ERC20("MarketERC20", _name) {
        transferOwnership(_owner);
        _setupDecimals(_collateral.decimals());
    }

    function mint(address _addr, uint256 _amount) external override onlyOwner {
        _mint(_addr, _amount);
    }

    function burn(uint256 _amount) external override blockReentrancy {
        _burn(msg.sender, _amount);
        IERC721Market(this.owner()).claim(msg.sender, _amount);
    }
}
