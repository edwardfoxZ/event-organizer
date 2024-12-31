const EventOrganizer = artifacts.require("EventOrganizer");
const { expectRevert } = require("@openzeppelin/test-helpers");

contract("EventOrganizer", (accounts) => {
  let eventOrganizer;

  beforeEach(async () => {
    eventOrganizer = await EventOrganizer.new({ from: accounts[0] });
  });

  it("Should NOT create event if the date is not in the future", async () => {
    await expectRevert(
      eventOrganizer.createEvent("Past Event", 10, 10, 1000, 10),
      "the event can be organized in the future"
    );
  });

  it("Should NOT create event if at least one ticket does not exist", async () => {
    const eventDate = Math.floor(Date.now() / 1000) + 3600;
    await expectRevert(
      eventOrganizer.createEvent("Invalid Event", 0, 0, 1000, eventDate),
      "can create event with at least one ticket"
    );
  });

  it("Should create event", async () => {
    const eventDate = Math.floor(Date.now() / 1000) + 3600; // 1 hour in the future
    await eventOrganizer.createEvent("Valid Event", 10, 10, 1000, eventDate);

    const nextId = (await eventOrganizer.nextId()) - 1; // Get the created event ID
    const createdEvent = await eventOrganizer.events(nextId);

    assert.equal(createdEvent.name, "Valid Event", "Event name mismatch");
    assert.equal(
      createdEvent.ticketCount.toString(),
      "10",
      "Ticket count mismatch"
    );
    assert.equal(
      createdEvent.ticketRemaining.toString(),
      "10",
      "Ticket remaining mismatch"
    );
    assert.equal(createdEvent.price.toString(), "1000", "Event price mismatch");
    assert.equal(
      createdEvent.date.toString(),
      eventDate.toString(),
      "Event date mismatch"
    );
  });

  it("Should NOT buy tickets if Ether sent is not correct", async () => {
    const eventDate = Math.floor(Date.now() / 1000) + 3600;
    await eventOrganizer.createEvent(
      "Price Mismatch Event",
      10,
      10,
      1000,
      eventDate
    );

    const nextId = (await eventOrganizer.nextId()) - 1;
    const incorrectCost = 1000 * 5; // Incorrect value for buying tickets

    await expectRevert(
      eventOrganizer.buyTicket(nextId, 10, {
        from: accounts[0],
        value: incorrectCost,
      }),
      "not enough ether sent"
    );
  });

  it("Should NOT buy tickets if ticket remaining is less than quantity", async () => {
    const eventDate = Math.floor(Date.now() / 1000) + 3600;
    await eventOrganizer.createEvent("Overbuy Event", 10, 10, 1000, eventDate);

    const nextId = (await eventOrganizer.nextId()) - 1;
    const totalCost = 1000 * 15; // Cost for 15 tickets

    await expectRevert(
      eventOrganizer.buyTicket(nextId, 15, {
        from: accounts[0],
        value: totalCost,
      }),
      "cannot buy the event tickets that is not enough"
    );
  });

  it("Should buy tickets", async () => {
    const eventDate = Math.floor(Date.now() / 1000) + 3600;
    await eventOrganizer.createEvent(
      "Buy Tickets Event",
      10,
      10,
      1000,
      eventDate
    );

    const nextId = (await eventOrganizer.nextId()) - 1;
    const totalCost = 1000 * 5; // Cost for 5 tickets

    await eventOrganizer.buyTicket(nextId, 5, {
      from: accounts[0],
      value: totalCost,
    });

    const updatedEvent = await eventOrganizer.events(nextId);
    assert.equal(
      updatedEvent.ticketRemaining.toString(),
      "5",
      "Ticket remaining mismatch after purchase"
    );

    const ticketsOwned = await eventOrganizer.tickets(accounts[0], nextId);
    assert.equal(ticketsOwned.toString(), "5", "Ticket ownership mismatch");
  });

  it("Should NOT transfer tickets if sender doesn't have enough", async () => {
    const eventDate = Math.floor(Date.now() / 1000) + 3600;
    await eventOrganizer.createEvent("Transfer Event", 10, 10, 1000, eventDate);

    const nextId = (await eventOrganizer.nextId()) - 1;

    await expectRevert(
      eventOrganizer.transferTicket(nextId, 5, accounts[1], {
        from: accounts[0],
      }),
      "not enough tickets to transfer"
    );
  });

  it("Should transfer tickets", async () => {
    const eventDate = Math.floor(Date.now() / 1000) + 3600;
    await eventOrganizer.createEvent("Transfer Event", 10, 10, 1000, eventDate);

    const nextId = (await eventOrganizer.nextId()) - 1;
    const totalCost = 1000 * 5;

    await eventOrganizer.buyTicket(nextId, 5, {
      from: accounts[0],
      value: totalCost,
    });

    await eventOrganizer.transferTicket(nextId, 3, accounts[1], {
      from: accounts[0],
    });

    const senderTickets = await eventOrganizer.tickets(accounts[0], nextId);
    assert.equal(
      senderTickets.toString(),
      "2",
      "Sender's ticket count mismatch"
    );

    const receiverTickets = await eventOrganizer.tickets(accounts[1], nextId);
    assert.equal(
      receiverTickets.toString(),
      "3",
      "Receiver's ticket count mismatch"
    );
  });
});
