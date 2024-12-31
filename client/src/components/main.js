import React, { useContext, useEffect, useState } from "react";
import { Web3 } from "web3";
import { Web3Context } from "../contexts/Web3";
import { Events } from "./events";
import EventOrganizer from "../contracts/EventOrganizer.json";

export const MainP = () => {
  const { web3, setWeb3, account, setAccount, contract, setContract } =
    useContext(Web3Context);
  const connectWallet = async () => {
    try {
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.enable();
      const accounts = await web3Instance.eth.getAccounts();
      const networkId = await web3Instance.eth.net.getId();
      const deploymentNet = await EventOrganizer.networks[networkId];
      const contract = await web3Instance.eth.Contract(
        EventOrganizer.abi,
        deploymentNet && deploymentNet.address
      );

      if (accounts.length === 0) {
        alert("No account connected to the wallet.");
        return;
      }

      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setContract(contract);

      localStorage.setItem("isWalletConnected", "true");
      localStorage.setItem("connectedAccount", accounts[0]);
    } catch (error) {
      console.error("Connection failed: ", error);
      alert("Please install MetaMask.");
    }
  };

  const reconnectWallet = async () => {
    const isWalletConnected = localStorage.getItem("isWalletConnected");
    if (isWalletConnected === "true" && window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();

        if (accounts.length > 0) {
          setWeb3(web3Instance);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Failed to reconnect: ", error);
      }
    }
  };

  useEffect(() => {
    reconnectWallet();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
          setWeb3(null);
        }
      });

      window.ethereum.on("disconnect", () => {
        setAccount("");
        setWeb3(null);
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center mx-auto">
      <p className="text-4xl font-bold flex p-5">Event Organizer</p>
      <div className="flex mt-5">
        <button
          onClick={connectWallet}
          className={`p-3 text-2xl text-white font-bold rounded-md ${
            web3
              ? "bg-green-500"
              : "bg-red-700 hover:rounded-2xl hover:bg-red-400"
          }  transition-all ease-in-out duration-200`}
        >
          {web3 ? "Connected" : "Connect"}
        </button>
      </div>
      {account && (
        <p className="mt-3 text-lg text-gray-700 translate-y-2 transition-all duration-200 ease-in">
          Connected Account:{" "}
          <span className="font-bold">{account.slice(0, 8)}...</span>
        </p>
      )}

      <Events />
    </div>
  );
};
