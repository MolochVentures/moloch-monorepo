import { SharesMinted, SharesBurned, AddKeepers, RemoveKeepers } from "../generated/MolochPool/MolochPool";
import { Member } from "../generated/schema";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleSharesMinted(event: SharesMinted): void {
  let id = event.params.recipient.toHex();
  let member = Member.load(id);

  if (member == null) {
    member = new Member(id);
    member.shares = event.params.sharesToMint;
    member.keepers = [];
  } else {
    member.shares.plus(event.params.sharesToMint);
  }

  member.save()
}

export function handleSharesBurned(event: SharesBurned): void {
  let member = Member.load(event.params.recipient.toHex());
  member.shares.minus(event.params.sharesToBurn);
  member.save();
}

export function handleAddKeepers(event: AddKeepers): void {
  let member = Member.load(event.transaction.from.toHex());
  member.keepers.concat(event.params.addedKeepers as Bytes[]);
  member.save();
}

export function handleRemoveKeepers(event: RemoveKeepers): void {
  // let member = Member.load(event.transaction.from.toHex());
  // for (let i = 0; i < event.params.removedKeepers.length; i++) {
  //   let keeper = member.keepers[i];
  //   member.keepers = member.keepers.filter(k => k != keeper); 
  // }
  // member.save();
}
