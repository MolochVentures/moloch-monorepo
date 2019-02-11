# moloch-subgraph

This subgraph listens for the following smart contract events : 
- SubmitProposal(uint256 indexed index, address indexed applicant, address indexed memberAddress)

- ProcessProposal(uint256 indexed index, address indexed applicant, address indexed proposer, bool didPass, uint256 shares)

- SubmitVote(address indexed sender, address indexed memberAddress, uint256 indexed proposalIndex, uint8 uintVote)

- Ragequit(address indexed memberAddress, uint256 sharesToBurn)

These events get save in to the following entities :
```
type Vote @entity {
  id: ID!
  sender: Bytes!
  memberAddress: Bytes!
  index: BigInt!
  uintVote: Int!
}

type Proposal @entity {
  id: ID!
  index: BigInt!
  applicant: Bytes!
  proposer: Bytes!
  shares: BigInt!
  votes: [Vote!]
  didPass: Int!
}

type Member @entity {
  id: ID!
  memberAddress: Bytes!
  shares: BigInt!
  isProcessed: Int!
  didPass: Int!
  didRagequit: Int!
  votes: [Vote!]
}
```

To create graph, run `graph create moloch --node http://127.0.0.1:8020`

After updating subgraph or schema, run `yarn codegen`

To deploy locally, run `graph deploy jamesyoung/moloch --debug --ipfs http://localhost:5001/ --node http://127.0.0.1:8020`
