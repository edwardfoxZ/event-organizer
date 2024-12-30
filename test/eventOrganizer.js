const EventOrganizer = artifacts.require("EventOrganizer");

contract("EventOrganizer", (accounts, networks) => {
  let eventOrganizer = null;

  beforeEach(async () => {
    eventOrganizer = await EventOrganizer.new({ from: accounts[0] });
  });

  it("Should")//...
});
