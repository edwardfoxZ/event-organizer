import React, { useContext, useEffect, useState } from "react";
import { Web3Context } from "../contexts/Web3";
import Web3 from "web3";

export const Events = () => {
  const {
    web3,
    balance,
    setBalance,
    contract,
    setContract,
    account,
    setAccount,
  } = useContext(Web3Context);
  const [showEventBlank, setShowEventBlank] = useState(false);
  const [eventBlankInputs, setEventBlankInputs] = useState({
    eventName: "",
    ticketCount: 0,
    price: 0,
    date: 0,
  });

  const checkBalance = async () => {
    const web3Instance = new Web3(window.ethereum);
    const accounts = await web3Instance.eth.getAccounts();

    const accountBalance = await web3Instance.eth.getBalance(accounts[0]);
    const balanceToEther = web3Instance.utils.fromWei(accountBalance, "ether");

    setBalance(parseFloat(balanceToEther));
  };

  useEffect(() => {
    checkBalance();
  }, [web3]);

  if (balance === null) {
    return <p>Loading balance...</p>;
  }

  const handleOpenEventBlank = () => {
    setShowEventBlank(true);
  };

  const createEvent = async (e) => {
    e.preventDefault();

    // Access the form values
    const name = e.target.elements.name.value;
    const count = parseInt(e.target.elements.count.value, 10);
    const price = parseFloat(e.target.elements.price.value);
    const date = e.target.elements.date.value;

    // Update the state with the event details
    setEventBlankInputs({
      eventName: name,
      ticketCount: count,
      price: price,
      date: date,
    });

    // Ensure contract is available
    if (!contract) {
      alert("Contract is not initialized.");
      return;
    }

    try {
      // Send the transaction to the blockchain
      await contract.methods
        .createEvent(name, count, price, date)
        .send({ from: account[0] });

      // Optionally, reset the form fields after submission
      setEventBlankInputs({
        eventName: "",
        ticketCount: 0,
        price: 0,
        date: 0,
      });

      // Success message
      alert("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      // Handle the error appropriately
      alert("Error creating event.");
    }
  };

  return (
    <>
      {balance > 0.01 ? (
        <div className="mt-10 flex flex-col">
          <p className="text-2xl">
            You can make your Event{" "}
            <button
              onClick={handleOpenEventBlank}
              disabled={showEventBlank}
              className="bg-blue-800 text-white px-3 rounded-xl hover:bg-blue-400 transition-all duration-500  ease-in-out"
            >
              here!
            </button>
          </p>

          {showEventBlank && (
            <div className="p-5 flex flex-col gap-16 mx-auto mt-10">
              <div className="flex  gap-11">
                <form
                  onSubmit={createEvent}
                  className="flex flex-col items-start gap-3"
                >
                  <label htmlFor="name">Name:</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="name of the event..."
                    className="outline-none focus:border-red-600 focus:ring-0 placeholder:opacity-50 focus:placeholder:opacity-0 border-b-2 border-yellow-400 transition-all duration-300 ease-linear"
                  />

                  <label htmlFor="count">Count:</label>
                  <input
                    id="count"
                    type="number"
                    placeholder="number of the tickets..."
                    className="outline-none focus:border-red-600 focus:ring-0 placeholder:opacity-50 focus:placeholder:opacity-0 border-b-2 border-yellow-400 transition-all duration-300 ease-linear"
                  />

                  <label htmlFor="price">Price:</label>
                  <input
                    id="price"
                    type="number"
                    placeholder="price of the tickets..."
                    className="outline-none focus:border-red-600 focus:ring-0 placeholder:opacity-50 focus:placeholder:opacity-0 border-b-2 border-yellow-400 transition-all duration-300 ease-linear"
                  />

                  <label htmlFor="date">Date:</label>
                  <input
                    id="date"
                    type="number"
                    placeholder="date of the tickets..."
                    className="outline-none focus:border-red-600 focus:ring-0 placeholder:opacity-50 focus:placeholder:opacity-0 border-b-2 border-yellow-400 transition-all duration-300 ease-linear"
                  />

                  <button
                    type="submit"
                    className="shadow-lg text-white bg-slate-700 hover:bg-slate-500 rounded-lg py-2 px-3 focus:text-blue-200 transition-all duration-500 ease-in"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-600 font-bold mt-10">
          Your balance must be at least 0.01ETH
        </p>
      )}
    </>
  );
};
