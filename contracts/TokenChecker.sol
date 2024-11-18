// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenChecker {
    struct TokenInfo {
        address tokenAddress;
        uint256 balance;
        uint256 allowance;
    }

    function getTokenInfo(address wallet, address[] calldata tokens) external view returns (TokenInfo[] memory) {
        TokenInfo[] memory tokenInfos = new TokenInfo[](tokens.length);
        
        for (uint i = 0; i < tokens.length; i++) {
            IERC20 token = IERC20(tokens[i]);
            tokenInfos[i] = TokenInfo({
                tokenAddress: tokens[i],
                balance: token.balanceOf(wallet),
                allowance: token.allowance(wallet, address(this))
            });
        }
        
        return tokenInfos;
    }

    function approveTokens(address[] calldata tokens, uint256[] calldata amounts) external {
        require(tokens.length == amounts.length, "Arrays length mismatch");
        
        for (uint i = 0; i < tokens.length; i++) {
            IERC20 token = IERC20(tokens[i]);
            require(token.approve(msg.sender, amounts[i]), "Approval failed");
        }
    }

    function revokeApproval(address token) external {
        require(IERC20(token).approve(msg.sender, 0), "Revoke failed");
    }
}