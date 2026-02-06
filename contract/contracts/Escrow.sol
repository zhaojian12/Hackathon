// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    enum TradeStatus { Created, Locked, Released, Cancelled }

    struct Trade {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount; // Amount in ERC20
        string description;
        TradeStatus status;
    }

    IERC20 public stablecoin;
    uint256 public tradeCounter;
    mapping(uint256 => Trade) public trades;

    event TradeCreated(uint256 indexed tradeId, address indexed buyer, address indexed seller, uint256 amount, string description);
    event FundsDeposited(uint256 indexed tradeId, address indexed buyer);
    event FundsReleased(uint256 indexed tradeId, address indexed seller);
    event TradeCancelled(uint256 indexed tradeId);

    constructor(address _stablecoin) {
        stablecoin = IERC20(_stablecoin);
    }

    function createTrade(address _seller, uint256 _amount, string memory _description) external returns (uint256) {
        require(_seller != address(0), "Invalid seller address");
        require(_amount > 0, "Amount must be greater than 0");

        tradeCounter++;
        trades[tradeCounter] = Trade({
            id: tradeCounter,
            buyer: msg.sender,
            seller: _seller,
            amount: _amount,
            description: _description,
            status: TradeStatus.Created
        });

        emit TradeCreated(tradeCounter, msg.sender, _seller, _amount, _description);
        return tradeCounter;
    }

    function depositFunds(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(trade.buyer == msg.sender, "Only buyer can deposit");
        require(trade.status == TradeStatus.Created, "Trade not in Created state");

        // Transfer funds from buyer to this contract
        require(stablecoin.transferFrom(msg.sender, address(this), trade.amount), "Transfer failed");

        trade.status = TradeStatus.Locked;
        emit FundsDeposited(_tradeId, msg.sender);
    }

    function releaseFunds(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        // In this PoC, we allow buyer or seller (implied logic as per requirement: "Buyer confirms receipt" or "Seller requests"?)
        // Requirement says: "Buyer confirms... funds released". So mainly Buyer calls.
        // Also "Seller requests release" -> logic usually implies someone checks.
        // For simplicity and trust minimized PoC: The Buyer (who deposited) must release it to Seller.
        // OR a third party.
        // Requirement 39: "By seller... or by buyer...".
        // Let's implement: Buyer can release. (Because they are satisfied).
        
        require(msg.sender == trade.buyer, "Only buyer can release funds"); 
        require(trade.status == TradeStatus.Locked, "Funds not locked");

        trade.status = TradeStatus.Released;
        require(stablecoin.transfer(trade.seller, trade.amount), "Transfer failed");

        emit FundsReleased(_tradeId, trade.seller);
    }

    function cancelTrade(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "Only participants can cancel");
        
        if (trade.status == TradeStatus.Locked) {
             // If locked, usually requires mutual consent or dispute resolution.
             // For PoC simplicity: Allow buyer to cancel if they haven't "confirmed" but Seller might have shipped? 
             // That's risky for Seller. 
             // Safety: Only if Seller agrees? Or strictly: "Funds return to Buyer".
             // Let's stick to safe PoC: If locked, cancel refunds Buyer. 
             // Note: In real world, this needs Arbitration.
             // For this PoC: We will allow Buyer to cancel ONLY if Created.
             // If Locked, maybe only Seller can refund? Or Buyer can cancel (withdraw)?
             // Let's allow canceling only if Created. 
             require(trade.status == TradeStatus.Created, "Cannot cancel locked trade without arbitration (not implemented)");
             trade.status = TradeStatus.Cancelled;
             emit TradeCancelled(_tradeId);
        } else if (trade.status == TradeStatus.Created) {
            trade.status = TradeStatus.Cancelled;
             emit TradeCancelled(_tradeId);
        } else {
            revert("Cannot cancel finished trade");
        }
    }
}
