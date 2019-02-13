import Web3 from "web3"
import SafeProvider from "safe-web3-provider"
const molochAbi = require('./abi/Moloch.abi.json')

let web3
let moloch

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
  localStorage.setItem("loginType", "metamask");
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
  localStorage.setItem("loginType", "gnosis");
  return web3
}

export async function initMoloch() {
  if (!web3) {
    if (localStorage.getItem("loginType") === "metamask") {
      web3 = await initMetmask()
    } else if (localStorage.getItem("loginType") === "gnosis") {
      web3 = await initGnosisSafe()
    } else {
      throw new Error("Not logged in with web3.")
    }
  }
  // TODO
  moloch = new web3.eth.Contract(molochAbi, "0xFB88dE099e13c3ED21F80a7a1E49f8CAEcF10df6")
  return moloch
}

export function getWeb3() {
  if (!web3) {
    throw new Error("Web3 is not initialized.")
  }
  return web3
}

export function getMoloch() {
  if (!moloch) {
    initMoloch()
  }
  return moloch
}