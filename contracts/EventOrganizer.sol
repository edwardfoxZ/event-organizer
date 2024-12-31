// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

contract EventOrganizer {
    struct Event {
        address admin;
        uint id;
        string name;
        uint ticketCount;
        uint ticketRemaining;
        uint price;
        uint date;
    }
    mapping(uint => Event) public events;
    mapping(address => mapping(uint => uint)) public tickets;
    uint public nextId;

    function createEvent(
        string calldata _name,
        uint _ticketCount,
        uint _ticketRemaining,
        uint _price,
        uint _date
    ) external {
        require(
            block.timestamp < _date,
            "the event can be organized in the future"
        );
        require(_ticketCount > 0, "can create event with at least one ticket");

        events[nextId] = Event(
            msg.sender,
            nextId,
            _name,
            _ticketCount,
            _ticketRemaining,
            _price,
            _date
        );

        nextId++;
    }

    function buyTicket(
        uint _id,
        uint _quantity
    ) external payable ticketExists(_id) eventActive(_id) {
        Event storage event_ = events[_id];
        require(
            msg.value == (event_.price * _quantity),
            "not enough ether sent"
        );
        require(
            event_.ticketRemaining >= _quantity,
            "cannot buy the event tickets that is not enough"
        );

        event_.ticketRemaining -= _quantity;
        tickets[msg.sender][_id] += _quantity;
    }

    function transferTicket(
        uint _eventId,
        uint _quantity,
        address to
    ) external ticketExists(_eventId) eventActive(_eventId) {
        require(
            tickets[msg.sender][_eventId] >= _quantity,
            "not enough tickets to transfer"
        );
        tickets[msg.sender][_eventId] -= _quantity;
        tickets[to][_eventId] += _quantity;
    }

    /** Modifiers */

    modifier ticketExists(uint _id) {
        require(events[_id].date != 0, "this event does not exist");
        _;
    }

    modifier eventActive(uint _id) {
        require(
            events[_id].date > block.timestamp,
            "this event does not active anymore"
        );
        _;
    }
}
