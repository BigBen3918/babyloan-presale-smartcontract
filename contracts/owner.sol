// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./presale.sol";

interface ownableContract {
    function transferOwnership(address to) external;
}

contract owner is Ownable {
    address public tokenAddress;
    address public router;
    address public factory;
    address public busd;
    address public bnb;
    address payable public presale;

    function setAddresses(
        address _tokenAddress,
        address _router,
        address _factory,
        address _busd,
        address _bnb,
        address _presale
    ) external onlyOwner {
        tokenAddress = _tokenAddress;
        router = _router;
        factory = _factory;
        busd = _busd;
        bnb = _bnb;
        presale = payable(_presale);
    }

    // market action
    function addAndRemoveLiquidity(
        uint Amount,
        uint tokenAmount,
        uint AmountMin,
        uint tokenAmountMin
    ) external onlyOwner {
        address pair = ISwapFactory(factory).getPair(tokenAddress, bnb);

        uint initBalance = IERC20(pair).balanceOf(presale);
        IERC20(tokenAddress).approve(router, tokenAmount);
        Presale(presale).addLiquidity(
            Amount,
            tokenAmount,
            AmountMin,
            tokenAmountMin
        );

        uint removeAmount = IERC20(pair).balanceOf(presale) - initBalance;

        Presale(presale).claimToken(pair, removeAmount);
        removeAmount = IERC20(pair).balanceOf(address(this));
        IERC20(pair).approve(router, removeAmount);

        ISwapRouter(router).removeLiquidityETH(
            tokenAddress,
            removeAmount,
            0,
            0,
            address(this),
            block.timestamp
        );
    }

    function transferOwnershipToOther(address contractAddress, address to)
        external
        onlyOwner
    {
        ownableContract(contractAddress).transferOwnership(to);
    }

    fallback() external payable {}

    receive() external payable {}
}
