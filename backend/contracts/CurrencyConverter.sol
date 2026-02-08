// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CurrencyConverter is Ownable {
    IERC20 public axcnh;
    
    // Rate mapping: How many units of 'Token' for 1 unit of AXCNH?
    // Using 18 decimals for rates to avoid precision loss.
    // Example: If 1 AXCNH = 0.5 BRST, rate is 0.5 * 1e18
    // Example: If 1 AXCNH = 0.14 USDT, rate is 0.14 * 1e18
    mapping(address => uint256) public rates;

    event Swapped(address indexed user, address indexed fromToken, address indexed toToken, uint256 amountIn, uint256 amountOut);
    event RateUpdated(address indexed token, uint256 newRate);

    constructor(address _axcnh) Ownable(msg.sender) {
        axcnh = IERC20(_axcnh);
    }

    function setRate(address _token, uint256 _rate) external onlyOwner {
        rates[_token] = _rate;
        emit RateUpdated(_token, _rate);
    }

    function swapAXCNHToToken(address _token, uint256 _amount) external {
        uint256 rate = rates[_token];
        require(rate > 0, "Token not supported");
        
        uint256 amountOut = (_amount * rate) / 1e18;
        require(axcnh.transferFrom(msg.sender, address(this), _amount), "Transfer AXCNH failed");
        
        if (_token == address(0)) {
            payable(msg.sender).transfer(amountOut);
        } else {
            require(IERC20(_token).transfer(msg.sender, amountOut), "Transfer Out failed");
        }
        
        emit Swapped(msg.sender, address(axcnh), _token, _amount, amountOut);
    }

    function swapTokenToAXCNH(address _token, uint256 _amount) external payable {
        uint256 rate = rates[_token];
        require(rate > 0, "Token not supported");
        
        uint256 amountIn = _amount;
        if (_token == address(0)) {
            amountIn = msg.value;
            require(amountIn > 0, "No CFX sent");
        } else {
            require(IERC20(_token).transferFrom(msg.sender, address(this), _amount), "Transfer In failed");
        }

        // amountOut = amountIn / rate * 1e18
        uint256 amountOut = (amountIn * 1e18) / rate;
        require(axcnh.transfer(msg.sender, amountOut), "Transfer AXCNH failed");
        
        emit Swapped(msg.sender, _token, address(axcnh), amountIn, amountOut);
    }

    // Allow contract to receive CFX
    receive() external payable {}

    // Admin function to fund the converter with liquidity
    function fund(address _token, uint256 _amount) external payable {
        if (_token == address(0)) {
            // Native CFX already in contract via msg.value
        } else {
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }
    }
}
