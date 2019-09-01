# moloch-monorepo

**install ganache-cli**
  
  Ganache can create a personal blockchain for us that we can use it create accounts and do tests easier.+
  To install it we use npm like that:
  
1. npm install -g ganache-cli
2. ganache-cli -m \"fetch local valve black attend double eye excite planet primary install allow\" -a 100
  With this command we use the seed to create 100 accounts with 100 ETH each. 

**install graph-cli**
1. npm install -g @graphprotocol/graph-cli

**install graph protocol**
1. clone repo https://github.com/graphprotocol/graph-node
2. go to docker/docker-compose.yml and replace :

`ethereum: "dev:http://host.docker.internal:8545"` 

with :

`ethereum: "mainnet:http://host.docker.internal:8545"` 

NOTE: every time ganache-cli is restarted, the name of the network (mainnet in this reference) needs to be changed with a new name

3. run `docker-compose up`

**create subgraph**
1. open new terminal window
2. clone https://github.com/MolochVentures/moloch-monorepo
3. go to moloch-monorepo/packages/subgraph
4. run `npm install`
5. run `graph create moloch --node http://127.0.0.1:8020`

**run truffle tests to populate graph and update contract address**
1. go to moloch-monorepo/packages/contracts
2. run `npm install`
3. run `truffle test test/single.js`
4. Copy `moloch.address` from the output of the test. You'll need it in the next step!

**run subgraph**
1. go to moloch-monorepo/packages/subgraph
2. run `yarn codegen`
3. go to  moloch-monorepo/packages/subgraph/subgraph.yaml
4. update dataSources.source.address with output from running test. You should see something like this "moloch.address 0x9463308d1C9032cC464E395e54E55EDA77495c00". cut and paste the address, "0x9463308d1C9032cC464E395e54E55EDA77495c00" in this example.
5. run `graph deploy moloch --debug --ipfs http://localhost:5001/ --node http://127.0.0.1:8020`

**run front-end**
1. open new terminal window
2. go to moloch-monorepo/packages/frontend
3. npm install
4. npm start
