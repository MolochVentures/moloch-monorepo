# moloch-monorepo

**install ganche-cli**
1. npm install -g ganache-cli
2. ganache-cli -m \"fetch local valve black attend double eye excite planet primary install allow\" -a 100

**install graph-cli**
1. npm install -g @graphprotocol/graph-cli

**install graph protocol**
1. clone repo https://github.com/graphprotocol/graph-node
2. go to docker/docker-compose.yml and replace :

`ethereum: "dev:http://parity:8545"`

with :

`ethereum: "dev:http://host.docker.internal:8545"` 

NOTE: every time ganache-cli is restarted, the name of the network (dev in this reference) needs to be changed with a new name

3. run `docker-compose up`

**create subgraph**
1. open new terminal window
2. clone https://github.com/MolochVentures/moloch-monorepo
3. go to moloch-monorepo/packages/moloch-subgraph
4. run `npm install`
5. run `graph create moloch --node http://127.0.0.1:8020`

**run truffle tests to populate graph and update contract address**
1. go to moloch-monorepo/packages/moloch
2. run `truffle test test/single.js`

**run subgraph**
1. run `yarn codegen`
2. go to  moloch-monorepo/packages/moloch-subgraph/subgraph.yaml
3. update dataSources.source.address with output from running test. You should see something like this "moloch.address 0x9463308d1C9032cC464E395e54E55EDA77495c00". cut and paste the address, "0x9463308d1C9032cC464E395e54E55EDA77495c00" in this example.
4. run `graph deploy moloch --debug --ipfs http://localhost:5001/ --node http://127.0.0.1:8020`

**run front-end**
1. open new terminal window
2. go to moloch-monorepo/packages/moloch-frontend
3. npm install
4. npm start
