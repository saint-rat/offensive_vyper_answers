# @version ^0.3.2

"""
@title Unstoppable Auction
@author jtriley.eth
@license MIT
"""

event NewBid:
    bidder: indexed(address)
    amount: uint256


owner: public(address)

total_deposit: public(uint256)

deposits: public(HashMap[address, uint256])

highest_bid: public(uint256)

highest_bidder: public(address)

auction_start: public(uint256)

auction_end: public(uint256)


@external
def __init__(auction_start: uint256, auction_end: uint256):
    assert auction_start < auction_end, "invalid time stamps"

    self.auction_start = auction_start

    self.auction_end = auction_end

    self.owner = msg.sender


@internal
def _handle_bid(bidder: address, amount: uint256):
    assert self.balance == self.total_deposit + amount, "invalid balance"

    assert self.auction_start <= block.timestamp and block.timestamp < self.auction_end, "not active"

    # if the current bidder is not highest_bidder, assert their bid is higher than the last,
    # otherwise, this means the highest_bidder is increasing their bid
    if bidder != self.highest_bidder:
        assert amount > self.highest_bid, "bid too low"

    self.total_deposit += amount

    self.deposits[bidder] += amount

    self.highest_bid = amount

    self.highest_bidder = bidder

    log NewBid(bidder, amount)


@external
def withdraw():
    """
    @notice Withdraws a losing bid
    @dev Throws if msg sender is still the highest bidder
    """
    assert self.highest_bidder != msg.sender, "highest bidder may not withdraw"

    #if i can make the next line fail by self destructing balance into it, then it will stop the contract
    assert self.balance == self.total_deposit, "invalid balance"

    amount: uint256 = self.deposits[msg.sender]

    self.deposits[msg.sender] = 0

    self.total_deposit -= amount

    send(msg.sender, amount)


@external
def owner_withdraw():
    """
    @notice Owner withdraws Ether once the auction ends
    @dev Throws if msg sender is not the owner or if the auction has not ended
    """
    assert msg.sender == self.owner, "unauthorized"

    assert self.balance == self.total_deposit, "invalid balance"

    assert block.timestamp >= self.auction_end, "auction not ended"

    send(msg.sender, self.balance)


@external
@payable
def bid():
    """
    @notice Places a bid if msg.value is greater than previous bid. If bidder is the
    same as the last, allow them to increase their bid.
    @dev Throws if bid is not high enough OR if auction is not live.
    """
    self._handle_bid(msg.sender, msg.value)


@external
@payable
def __default__():
    self._handle_bid(msg.sender, msg.value)