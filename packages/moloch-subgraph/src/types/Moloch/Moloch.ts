import {
  EthereumEvent,
  SmartContract,
  EthereumValue,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class SubmitProposal extends EthereumEvent {
  get params(): SubmitProposalParams {
    return new SubmitProposalParams(this);
  }
}

export class SubmitProposalParams {
  _event: SubmitProposal;

  constructor(event: SubmitProposal) {
    this._event = event;
  }

  get index(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get applicant(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get memberAddress(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class ProcessProposal extends EthereumEvent {
  get params(): ProcessProposalParams {
    return new ProcessProposalParams(this);
  }
}

export class ProcessProposalParams {
  _event: ProcessProposal;

  constructor(event: ProcessProposal) {
    this._event = event;
  }

  get index(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get applicant(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get proposer(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get didPass(): boolean {
    return this._event.parameters[3].value.toBoolean();
  }

  get shares(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }
}

export class SubmitVote extends EthereumEvent {
  get params(): SubmitVoteParams {
    return new SubmitVoteParams(this);
  }
}

export class SubmitVoteParams {
  _event: SubmitVote;

  constructor(event: SubmitVote) {
    this._event = event;
  }

  get sender(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get memberAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get proposalIndex(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get uintVote(): i32 {
    return this._event.parameters[3].value.toI32();
  }
}

export class Ragequit extends EthereumEvent {
  get params(): RagequitParams {
    return new RagequitParams(this);
  }
}

export class RagequitParams {
  _event: Ragequit;

  constructor(event: Ragequit) {
    this._event = event;
  }

  get memberAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get sharesToBurn(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Moloch__membersResult {
  value0: Address;
  value1: BigInt;
  value2: boolean;
  value3: BigInt;

  constructor(
    value0: Address,
    value1: BigInt,
    value2: boolean,
    value3: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromAddress(this.value0));
    map.set("value1", EthereumValue.fromUnsignedBigInt(this.value1));
    map.set("value2", EthereumValue.fromBoolean(this.value2));
    map.set("value3", EthereumValue.fromUnsignedBigInt(this.value3));
    return map;
  }
}

export class Moloch__proposalQueueResult {
  value0: Address;
  value1: Address;
  value2: BigInt;
  value3: BigInt;
  value4: BigInt;
  value5: BigInt;
  value6: boolean;
  value7: BigInt;
  value8: string;
  value9: BigInt;

  constructor(
    value0: Address,
    value1: Address,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt,
    value5: BigInt,
    value6: boolean,
    value7: BigInt,
    value8: string,
    value9: BigInt
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
    this.value7 = value7;
    this.value8 = value8;
    this.value9 = value9;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromAddress(this.value0));
    map.set("value1", EthereumValue.fromAddress(this.value1));
    map.set("value2", EthereumValue.fromUnsignedBigInt(this.value2));
    map.set("value3", EthereumValue.fromUnsignedBigInt(this.value3));
    map.set("value4", EthereumValue.fromUnsignedBigInt(this.value4));
    map.set("value5", EthereumValue.fromUnsignedBigInt(this.value5));
    map.set("value6", EthereumValue.fromBoolean(this.value6));
    map.set("value7", EthereumValue.fromUnsignedBigInt(this.value7));
    map.set("value8", EthereumValue.fromString(this.value8));
    map.set("value9", EthereumValue.fromUnsignedBigInt(this.value9));
    return map;
  }
}

export class Moloch extends SmartContract {
  static bind(address: Address): Moloch {
    return new Moloch("Moloch", address);
  }

  processingReward(): BigInt {
    let result = super.call("processingReward", []);
    return result[0].toBigInt();
  }

  currentPeriod(): BigInt {
    let result = super.call("currentPeriod", []);
    return result[0].toBigInt();
  }

  members(param0: Address): Moloch__membersResult {
    let result = super.call("members", [EthereumValue.fromAddress(param0)]);
    return new Moloch__membersResult(
      result[0].toAddress(),
      result[1].toBigInt(),
      result[2].toBoolean(),
      result[3].toBigInt()
    );
  }

  totalShares(): BigInt {
    let result = super.call("totalShares", []);
    return result[0].toBigInt();
  }

  proposalQueue(param0: BigInt): Moloch__proposalQueueResult {
    let result = super.call("proposalQueue", [
      EthereumValue.fromUnsignedBigInt(param0)
    ]);
    return new Moloch__proposalQueueResult(
      result[0].toAddress(),
      result[1].toAddress(),
      result[2].toBigInt(),
      result[3].toBigInt(),
      result[4].toBigInt(),
      result[5].toBigInt(),
      result[6].toBoolean(),
      result[7].toBigInt(),
      result[8].toString(),
      result[9].toBigInt()
    );
  }

  memberAddressByDelegateKey(param0: Address): Address {
    let result = super.call("memberAddressByDelegateKey", [
      EthereumValue.fromAddress(param0)
    ]);
    return result[0].toAddress();
  }

  pendingProposals(): BigInt {
    let result = super.call("pendingProposals", []);
    return result[0].toBigInt();
  }

  gracePeriodLength(): BigInt {
    let result = super.call("gracePeriodLength", []);
    return result[0].toBigInt();
  }

  summoningTime(): BigInt {
    let result = super.call("summoningTime", []);
    return result[0].toBigInt();
  }

  votingPeriodLength(): BigInt {
    let result = super.call("votingPeriodLength", []);
    return result[0].toBigInt();
  }

  proposalDeposit(): BigInt {
    let result = super.call("proposalDeposit", []);
    return result[0].toBigInt();
  }

  guildBank(): Address {
    let result = super.call("guildBank", []);
    return result[0].toAddress();
  }

  dilutionBound(): BigInt {
    let result = super.call("dilutionBound", []);
    return result[0].toBigInt();
  }

  periodDuration(): BigInt {
    let result = super.call("periodDuration", []);
    return result[0].toBigInt();
  }

  approvedToken(): Address {
    let result = super.call("approvedToken", []);
    return result[0].toAddress();
  }

  isApplicant(param0: Address): boolean {
    let result = super.call("isApplicant", [EthereumValue.fromAddress(param0)]);
    return result[0].toBoolean();
  }

  canRagequit(highestIndexYesVote: BigInt): boolean {
    let result = super.call("canRagequit", [
      EthereumValue.fromUnsignedBigInt(highestIndexYesVote)
    ]);
    return result[0].toBoolean();
  }

  hasVotingPeriodExpired(startingPeriod: BigInt): boolean {
    let result = super.call("hasVotingPeriodExpired", [
      EthereumValue.fromUnsignedBigInt(startingPeriod)
    ]);
    return result[0].toBoolean();
  }

  getMemberProposalVote(memberAddress: Address, proposalIndex: BigInt): i32 {
    let result = super.call("getMemberProposalVote", [
      EthereumValue.fromAddress(memberAddress),
      EthereumValue.fromUnsignedBigInt(proposalIndex)
    ]);
    return result[0].toI32();
  }
}
