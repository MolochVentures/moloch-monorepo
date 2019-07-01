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

  get proposalIndex(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get delegateKey(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get memberAddress(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get applicant(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get tokenTribute(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get sharesRequested(): BigInt {
    return this._event.parameters[5].value.toBigInt();
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

  get proposalIndex(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get delegateKey(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get memberAddress(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get uintVote(): i32 {
    return this._event.parameters[3].value.toI32();
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

  get proposalIndex(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get applicant(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get memberAddress(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get tokenTribute(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }

  get sharesRequested(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get didPass(): boolean {
    return this._event.parameters[5].value.toBoolean();
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

export class Abort extends EthereumEvent {
  get params(): AbortParams {
    return new AbortParams(this);
  }
}

export class AbortParams {
  _event: Abort;

  constructor(event: Abort) {
    this._event = event;
  }

  get proposalIndex(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get applicantAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class UpdateDelegateKey extends EthereumEvent {
  get params(): UpdateDelegateKeyParams {
    return new UpdateDelegateKeyParams(this);
  }
}

export class UpdateDelegateKeyParams {
  _event: UpdateDelegateKey;

  constructor(event: UpdateDelegateKey) {
    this._event = event;
  }

  get memberAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newDelegateKey(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class SummonComplete extends EthereumEvent {
  get params(): SummonCompleteParams {
    return new SummonCompleteParams(this);
  }
}

export class SummonCompleteParams {
  _event: SummonComplete;

  constructor(event: SummonComplete) {
    this._event = event;
  }

  get summoner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get shares(): BigInt {
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
  value7: boolean;
  value8: boolean;
  value9: BigInt;
  value10: string;
  value11: BigInt;

  constructor(
    value0: Address,
    value1: Address,
    value2: BigInt,
    value3: BigInt,
    value4: BigInt,
    value5: BigInt,
    value6: boolean,
    value7: boolean,
    value8: boolean,
    value9: BigInt,
    value10: string,
    value11: BigInt
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
    this.value10 = value10;
    this.value11 = value11;
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
    map.set("value7", EthereumValue.fromBoolean(this.value7));
    map.set("value8", EthereumValue.fromBoolean(this.value8));
    map.set("value9", EthereumValue.fromUnsignedBigInt(this.value9));
    map.set("value10", EthereumValue.fromString(this.value10));
    map.set("value11", EthereumValue.fromUnsignedBigInt(this.value11));
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

  members(param0: Address): Moloch__membersResult {
    let result = super.call("members", [EthereumValue.fromAddress(param0)]);
    return new Moloch__membersResult(
      result[0].toAddress(),
      result[1].toBigInt(),
      result[2].toBoolean(),
      result[3].toBigInt()
    );
  }

  totalSharesRequested(): BigInt {
    let result = super.call("totalSharesRequested", []);
    return result[0].toBigInt();
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
      result[7].toBoolean(),
      result[8].toBoolean(),
      result[9].toBigInt(),
      result[10].toString(),
      result[11].toBigInt()
    );
  }

  memberAddressByDelegateKey(param0: Address): Address {
    let result = super.call("memberAddressByDelegateKey", [
      EthereumValue.fromAddress(param0)
    ]);
    return result[0].toAddress();
  }

  gracePeriodLength(): BigInt {
    let result = super.call("gracePeriodLength", []);
    return result[0].toBigInt();
  }

  abortWindow(): BigInt {
    let result = super.call("abortWindow", []);
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

  getCurrentPeriod(): BigInt {
    let result = super.call("getCurrentPeriod", []);
    return result[0].toBigInt();
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
