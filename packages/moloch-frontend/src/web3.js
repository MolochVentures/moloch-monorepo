
import SafeProvider from "safe-web3-provider"
const Web3 = require("web3")

const molochAbi = require('./abi/Moloch.abi.json')
const erc20Abi = require('./abi/ERC20.abi.json')

let web3
let moloch
let token

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
    rpcUrl: process.env.REACT_APP_ETH_URL
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
  moloch = new web3.eth.Contract(molochAbi, process.env.REACT_APP_MOLOCH_ADDRESS)
  return moloch
}

export async function initToken() {
  if (!web3) {
    if (localStorage.getItem("loginType") === "metamask") {
      web3 = await initMetmask()
    } else if (localStorage.getItem("loginType") === "gnosis") {
      web3 = await initGnosisSafe()
    } else {
      throw new Error("Not logged in with web3.")
    }
  }
  token = new web3.eth.Contract(erc20Abi, process.env.REACT_APP_TOKEN_ADDRESS)
  return token
}

export function getWeb3() {
  if (!web3) {
    throw new Error("Web3 is not initialized.")
  }
  return web3
}

export async function getMoloch() {
  if (!moloch) {
    await initMoloch()
  }
  return moloch
}

export async function getToken() {
  if (!token) {
    await initToken()
  }
  return token
}