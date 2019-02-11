import * as W3 from 'web3';
import Web3 from 'web3/types'
const molochArtifact = require('../../contracts/Moloch.json')

// TODO: fix this, issue created: https://github.com/ethereum/web3.js/issues/2363
// @ts-ignore
const web3 = new W3(new W3.providers.HttpProvider('http://localhost:8545')) as Web3;

export const molochContract = new web3.eth.Contract(molochArtifact.abi, process.env.MOLOCH_ADDRESS)