// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IExchange.sol";

contract Cleanable is Ownable {
    // claim token that unexpectedly send to contract
    function claimToken(address tokenAddress, uint256 amount)
        external
        onlyOwner
    {
        IERC20(tokenAddress).transfer(owner(), amount);
    }

    // claim ETH that unexpectedly send to contract
    function claimETH(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }
}

contract Presale is Cleanable {
    event BuyEvent(address to, uint256 amount);
    struct Terms {
        uint256 initialprice; //1e6
        uint256 startTime; // presale start time
        uint256 period; // each round period
        uint hikeRate; // each round hike
        uint256 roundCount;
        uint256 bnbPrice; //1e6
    }

    // round infos
    uint public roundNum;
    Terms public terms;

    // addresses
    address public tokenAddress;
    address public busdAddress;
    address public routerAddress;

    // config

    function setInitAddresses(
        address _tokenAddress,
        address _busdAddress,
        address _routerAddress
    ) external onlyOwner {
        tokenAddress = _tokenAddress;
        busdAddress = _busdAddress;
        routerAddress = _routerAddress;
    }

    function setTerms(
        uint initialprice,
        uint start,
        uint period,
        uint hikeRate,
        uint roundCount,
        uint bnbPrice
    ) external onlyOwner {
        terms.initialprice = initialprice;
        terms.startTime = start + block.timestamp;
        terms.period = period;
        terms.hikeRate = hikeRate;
        terms.roundCount = roundCount;
        terms.bnbPrice = bnbPrice;
    }

    function setBNBPrice(uint _bnbPrice) external onlyOwner {
        terms.bnbPrice = _bnbPrice;
    }

    // presale
    function checkTerm() internal view returns (bool) {
        return
            block.timestamp > terms.startTime &&
            block.timestamp < terms.startTime + terms.period * terms.roundCount;
    }

    function getPrice() public view returns (uint) {
        return
            terms.initialprice +
            ((block.timestamp - terms.startTime) / terms.period) *
            terms.hikeRate;
    }

    function getAmount(uint amount) public view returns (uint) {
        return ((amount * terms.bnbPrice) / getPrice());
    }

    function getAmountWithBUSD(uint amount) public view returns (uint) {
        return (amount * 1e6) / getPrice();
    }

    function buy() external payable {
        require(checkTerm(), "presale ended");
        IERC20(tokenAddress).transfer(msg.sender, getAmount(msg.value));
        emit BuyEvent(msg.sender, getAmount(msg.value));
    }

    function buyWithBusd(uint amount) external {
        require(checkTerm(), "presale ended");
        IERC20(busdAddress).transferFrom(msg.sender, address(this), amount);
        IERC20(tokenAddress).transfer(msg.sender, getAmountWithBUSD(amount));
        emit BuyEvent(msg.sender, getAmountWithBUSD(amount));
    }

    // market action
    function addLiquidity(
        uint Amount,
        uint tokenAmount,
        uint AmountMin,
        uint tokenAmountMin
    ) external onlyOwner {
        IERC20(tokenAddress).approve(routerAddress, tokenAmount);
        ISwapRouter(routerAddress).addLiquidityETH{value: Amount}(
            tokenAddress,
            tokenAmount,
            tokenAmountMin,
            AmountMin,
            address(this),
            block.timestamp
        );
    }

    function buyBNB(uint Amount, uint tokenAmountMin) external onlyOwner {
        address[] memory path = new address[](2);
        path[0] = ISwapRouter(routerAddress).WETH();
        path[1] = tokenAddress;
        ISwapRouter(routerAddress).swapExactETHForTokens{value: Amount}(
            tokenAmountMin,
            path,
            address(this),
            block.timestamp
        );
    }

    function addLiquidityBUSD(
        uint Amount,
        uint tokenAmount,
        uint AmountMin,
        uint tokenAmountMin
    ) external onlyOwner {
        IERC20(busdAddress).approve(routerAddress, Amount);
        IERC20(tokenAddress).approve(routerAddress, tokenAmount);
        ISwapRouter(routerAddress).addLiquidity(
            busdAddress,
            tokenAddress,
            Amount,
            tokenAmount,
            AmountMin,
            tokenAmountMin,
            address(this),
            block.timestamp
        );
    }

    function buyBUSD(uint Amount, uint tokenAmountMin) external onlyOwner {
        address[] memory path = new address[](2);
        path[0] = busdAddress;
        path[1] = tokenAddress;

        IERC20(busdAddress).approve(routerAddress, Amount);
        ISwapRouter(routerAddress).swapExactTokensForTokens(
            Amount,
            tokenAmountMin,
            path,
            address(this),
            block.timestamp
        );
    }

    fallback() external payable {}

    receive() external payable {}
}
