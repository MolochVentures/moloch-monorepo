import Web3 from "web3"
import SafeProvider from "safe-web3-provider"

let web3

export async function initMetmask() {
  if (!window.ethereum && !window.web3) {
    // Non-DApp browsers won't work.
    alert("Metamask needs to be installed and configured.");
  }
  if (window.ethereum) {
    // Modern DApp browsers need to enable Metamask access.
    try {
      await window.ethereum.enable()
    } catch (error) {
      alert("Metamask needs to be enabled.")
    }
  }
  web3 = new Web3(Web3.givenProvider)
  return web3
}

export function initGnosisSafe() {
  /**
   *  Create Safe Provider
   */
  const provider = new SafeProvider({
    // TODO: CHANGE THIS TO INFURA/ALCHEMY
    rpcUrl: "http://localhost:8545"
  });

  /**
   *  Create Web3
   */
  web3 = new Web3(provider);
  return web3
}

export function getWeb3() {
  if (!web3) {
    throw new Error("Web3 is not initialized.")
  }
  return web3
}