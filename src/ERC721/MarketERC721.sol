// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

import "../ERC20/MarketERC20.sol";
import "../Interfaces/IERC20Market.sol";
import "../Interfaces/IERC721Market.sol";
import "../Interfaces/IERC20Detailed.sol";
import "../openzeppelin/token/ERC721/ERC721.sol";

contract MarketERC721 is
    ERC721,
    IERC721Market // TODO: try cloning
{
    using SafeMath for uint256;

    address public immutable resolver;
    address public immutable creator;
    uint256 public immutable timestamp;
    IERC20Detailed public immutable collateral;
    address[] public tokens;
    string public ipfs;
    Status public status;
    mapping(address => Outcome) public outcome;
    bool internal locked;

    constructor(
        string memory _ipfs,
        string[] memory outcomes,
        address _creator,
        address _owner,
        address _resolver,
        uint256 _timestamp,
        IERC20Detailed _collateral
    ) ERC721("MarketERC721", _ipfs) {
        require(_timestamp > block.timestamp, "Market: WRONG_TIMESTAMP");
        _mint(_owner, 1); // TODO: test & make sure its not burnable
        _setTokenURI(1, string(abi.encodePacked("ipfs://", _ipfs)));
        ipfs = _ipfs;
        resolver = _resolver;
        creator = _creator;
        timestamp = _timestamp;
        collateral = _collateral;
        status = Status.Started;

        require(outcomes.length > 1, "Market: WRONG_OUTCOMES_AMOUNT");
        address[] memory _tokens = new address[](outcomes.length);
        for (uint256 i = 0; i < outcomes.length; i++) {
            _tokens[i] = address(new MarketERC20(outcomes[i], address(this), _collateral));
        }
        tokens = _tokens;

        emit Created(_ipfs, _creator, address(this), _resolver, _owner, _timestamp, _tokens);
    }

    modifier blockReentrancy {
        require(!locked, "Contract is locked");
        locked = true;
        _;
        locked = false;
    }

    modifier withStatus(Status _status) {
        require(status == _status, "Market: WRONG_STATUS");
        _;
    }

    function resolve(Outcome[] memory _outcome) external override withStatus(Status.Started) returns (bool) {
        require(_outcome.length == tokens.length, "Market: WRONG_RESOLVE_AMOUNT");
        // TODO: check addresses equals to tokens
        require(msg.sender == resolver, "Market: FORBIDDEN");
        require(_outcome.length == tokens.length, "Market: MISSING_OUTCOMES");
        require(block.timestamp >= timestamp, "Market: TOO_EARLY");

        uint256 totalIncome = 0;
        for (uint256 i = 0; i < _outcome.length; i++) {
            require(_outcome[i].result >= 0 && _outcome[i].result <= 100, "Market: WRONG_RESULT");
            outcome[_outcome[i].token] = _outcome[i];
            totalIncome += _outcome[i].result;
        }

        require(totalIncome == 100, "Market: WRONG_SUM_OUTCOMES");

        status = Status.Resolved;
        emit Resolved(msg.sender, address(this));
        return true;
    }

    function mint(uint256 amount) external override withStatus(Status.Started) blockReentrancy returns (uint256) {
        collateral.transferFrom(msg.sender, address(this), amount);
        for (uint256 i = 0; i < tokens.length; i++) {
            IERC20Market(tokens[i]).mint(msg.sender, amount);
        }

        emit Minted(msg.sender, address(this), amount);
        return amount;
    }

    function claim(address to, uint256 amount)
        external
        override
        withStatus(Status.Resolved)
        blockReentrancy
        returns (uint256)
    {
        require(outcome[msg.sender].token != address(0), "Market: TOKEN_DOES_NOT_EXIST");
        uint256 amountToReceive = amount.mul(outcome[msg.sender].result).div(100);
        if (amountToReceive > 0) {
            collateral.transfer(to, amountToReceive);
        }

        emit Claimed(to, address(this), amountToReceive);
        return amountToReceive;
    }
}
