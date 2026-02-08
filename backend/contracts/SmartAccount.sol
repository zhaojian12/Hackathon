// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SmartAccount
 * @dev 用于 EIP-7702 委派的逻辑合约。
 * 当 EOA 通过 0x04 交易委派此合约时，EOA 将获得此处定义的逻辑。
 */
contract SmartAccount {
    // 错误定义
    error ExecutionFailed(uint256 index, address dest, bytes data);
    error Unauthorized();

    /**
     * @dev 简单的权限检查。
     * 在 EIP-7702 中，代码在 EOA 环境中运行。
     * 我们需要确保只有在该 EOA 授权的情况下才能执行逻辑。
     * 通常通过签名或检查 msg.sender == address(this) 来实现（对于简单的自调用）。
     */
    modifier onlySelf() {
        if (msg.sender != address(this)) {
            revert Unauthorized();
        }
        _;
    }

    /**
     * @dev 执行单笔调用。
     * 注意：由于 7702 环境下代码在 EOA 账户上运行，address(this) 就是该 EOA。
     */
    function execute(address dest, uint256 value, bytes calldata func) external payable returns (bytes memory) {
        // 这里可以添加更复杂的签名验证逻辑（符合 EIP-4337 或自定义协议）
        // 为了简化演示，我们假设任何通过此合约发起的调用都是合法的（实际上需要保护）
        
        (bool success, bytes memory result) = dest.call{value: value}(func);
        if (!success) {
            revert ExecutionFailed(0, dest, func);
        }
        return result;
    }

    /**
     * @dev 批量执行调用。
     */
    function executeBatch(
        address[] calldata dests,
        uint256[] calldata values,
        bytes[] calldata funcs
    ) external payable {
        if (dests.length != values.length || dests.length != funcs.length) {
            revert Unauthorized(); // 长度不匹配
        }

        for (uint256 i = 0; i < dests.length; i++) {
            (bool success, ) = dests[i].call{value: values[i]}(funcs[i]);
            if (!success) {
                revert ExecutionFailed(i, dests[i], funcs[i]);
            }
        }
    }

    // 接收原生币
    receive() external payable {}
}
