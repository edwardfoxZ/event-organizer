import { createContext, useState } from "react";
import Web3 from "web3";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contract, setContract] = useState(null);

  return (
    <Web3Context.Provider
      value={{
        web3,
        setWeb3,
        account,
        setAccount,
        balance,
        setBalance,
        contract,
        setContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
