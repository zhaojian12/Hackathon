// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    enum TradeStatus { Created, Locked, Shipped, Received, Cancelled }

    struct Trade {
        uint256 id;
        address buyer;
        address seller;
        uint256 amount; // Amount in ERC20
        string description;
        TradeStatus status;
        uint8 rating; // 1-5, 0 means not rated
        string trackingNumber;
        string shippingMethod;
        string remarks;
    }

    struct SellerReputation {
        uint256 totalRating;
        uint256 totalTrades;
    }

    IERC20 public stablecoin;
    uint256 public tradeCounter;
    mapping(uint256 => Trade) public trades;
    mapping(address => SellerReputation) public sellerStats;

    event TradeCreated(uint256 indexed tradeId, address indexed buyer, address indexed seller, uint256 amount, string description);
    event FundsDeposited(uint256 indexed tradeId, address indexed buyer);
    event TradeShipped(uint256 indexed tradeId, string trackingNumber, string shippingMethod, string remarks);
    event TradeReceived(uint256 indexed tradeId);
    event ExporterRated(uint256 indexed tradeId, address indexed seller, uint8 rating);
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
            status: TradeStatus.Created,
            rating: 0,
            trackingNumber: "",
            shippingMethod: "",
            remarks: ""
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

    function confirmShipment(uint256 _tradeId, string calldata _trackingNumber, string calldata _shippingMethod, string calldata _remarks) external {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.seller, "Only seller can confirm shipment");
        require(trade.status == TradeStatus.Locked, "Funds must be locked");

        trade.trackingNumber = _trackingNumber;
        trade.shippingMethod = _shippingMethod;
        trade.remarks = _remarks;
        trade.status = TradeStatus.Shipped;
        emit TradeShipped(_tradeId, _trackingNumber, _shippingMethod, _remarks);
    }

    function confirmReceipt(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can confirm receipt");
        require(trade.status == TradeStatus.Shipped, "Goods not shipped yet");

        trade.status = TradeStatus.Received;
        emit TradeReceived(_tradeId);
        
        // Auto release funds
        _release(_tradeId);
    }

    function confirmReceiptAndRate(uint256 _tradeId, uint8 _rating) external {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can confirm receipt");
        require(trade.status == TradeStatus.Shipped, "Goods not shipped yet");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");

        // 1. Mark as Received
        trade.status = TradeStatus.Received;
        emit TradeReceived(_tradeId);

        // 2. Release Funds
        _release(_tradeId);

        // 3. Apply Rating
        trade.rating = _rating;
        sellerStats[trade.seller].totalRating += _rating;
        sellerStats[trade.seller].totalTrades += 1;
        emit ExporterRated(_tradeId, trade.seller, _rating);
    }

    function rateExporter(uint256 _tradeId, uint8 _rating) external {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can rate");
        require(trade.status == TradeStatus.Received, "Trade not completed");
        require(trade.rating == 0, "Already rated");
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");

        trade.rating = _rating;
        sellerStats[trade.seller].totalRating += _rating;
        sellerStats[trade.seller].totalTrades += 1;

        emit ExporterRated(_tradeId, trade.seller, _rating);
    }

    function getSellerReputation(address _seller) external view returns (uint256 averageRating, uint256 totalTrades) {
        SellerReputation storage stats = sellerStats[_seller];
        if (stats.totalTrades == 0) return (0, 0);
        return (stats.totalRating * 10 / stats.totalTrades, stats.totalTrades);
    }

    function _release(uint256 _tradeId) internal {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.Received, "Must be in Received state");

        require(stablecoin.transfer(trade.seller, trade.amount), "Transfer failed");
        emit FundsReleased(_tradeId, trade.seller);
    }

    function cancelTrade(uint256 _tradeId) external {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer || msg.sender == trade.seller, "Only participants can cancel");
        
        if (trade.status == TradeStatus.Created) {
            trade.status = TradeStatus.Cancelled;
            emit TradeCancelled(_tradeId);
        } else if (trade.status == TradeStatus.Locked) {
             require(trade.status == TradeStatus.Locked, "Already shipped");
             trade.status = TradeStatus.Cancelled;
             require(stablecoin.transfer(trade.buyer, trade.amount), "Refund failed");
             emit TradeCancelled(_tradeId);
        } else {
            revert("Cannot cancel after shipment or completion");
        }
    }
}
