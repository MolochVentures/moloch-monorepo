import Web3 from 'web3';
const molochArtifact = require('../../contracts/Moloch.json')

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

export const molochContract = new web3.eth.Contract(molochArtifact.abi, process.env.MOLOCH_ADDRESS)