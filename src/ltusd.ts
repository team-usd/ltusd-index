import {   
  Transfer as TransferEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Blacklisted,
  UnBlacklisted
} from "../generated/LTUSD/LTUSD"
import { TotalSupply, Transfer, Account, TotalTransfer} from "../generated/schema"
import {
  fetchAccount,
  fetchBalance,
  fetchTotal,
  fetchRole,
  fetchBlack,
} from "./utils"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { LTUSD } from "../generated/LTUSD/LTUSD" 

const zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");

function handleMint(event: TransferEvent): void {
  if (event.params.from.equals(zeroAddress) || event.params.to.equals(zeroAddress)) {
    let totalSupply = new TotalSupply(event.transaction.hash.concatI32(event.logIndex.toI32()));

    let contract = LTUSD.bind(event.address)
    let totalSupplyResult = contract.try_totalSupply();
    if (!totalSupplyResult.reverted) {
      totalSupply.value = totalSupplyResult.value;
      totalSupply.blockNumber = event.block.number;
      totalSupply.blockTimestamp = event.block.timestamp;
      totalSupply.save();
    }
  }
}

function handleTransferData(event: TransferEvent): void {
  let entity = new Transfer("auto");
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;

  entity.blockNumber = event.block.number;
  // entity.timestamp = event.block.timestamp.toI32();
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  let zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");
  if (event.params.from.equals(zeroAddress)) {
    entity.type = "MINT";
  } else if (event.params.to.equals(zeroAddress)) {
    entity.type = "BURN";
  } else {
    entity.type = "NORMAL";
    
  }

  entity.save();

  if (entity.type === "NORMAL") {
    let total = fetchTotal(event);
    total.totalCount = total.totalCount.plus(BigInt.fromI32(1));
    total.totalVolume = total.totalVolume.plus(event.params.value);
    total.blockNumber = event.block.number;
    total.blockTimestamp = event.block.timestamp;
    total.save();
  }
}

function handleBalance(event: TransferEvent, address: Address): void {
  //fetch account details
  let account = fetchAccount(address.toHex());

  if (account !== null) {
    let balance = fetchBalance(event.address, address);
    if (balance !== null) {
      account.amount = balance;
    }
    if (address.equals(event.params.from) && !zeroAddress.equals(event.params.to)) {
      account.outTx = account.outTx + 1;
    }
    if(address.equals(event.params.to) && !zeroAddress.equals(event.params.from)) {
      account.inTx = account.inTx + 1;
    }

    account.blockNumber = event.block.number;
    account.blockTimestamp = event.block.timestamp;
    account.save();
  }
}


export function handleTransfer(event: TransferEvent): void {
  handleMint(event);

  // let entity = new Transfer(
  //   event.transaction.hash.concatI32(event.logIndex.toI32()),
  // )
  handleTransferData(event);

  // let token = fetchTokenDetails(event);
  // if (!token) { //if token == null
  //     return
  // }

  //get account addresses from event
  handleBalance(event, event.params.from);
  handleBalance(event, event.params.to);

  //setting the token balance of the 'from' account
  // let fromTokenBalance = TokenBalance.load(token.id + "-" + fromAccount.id);
  // if (!fromTokenBalance) { //if balance is not already saved
  //       //create a new TokenBalance instance
  //       // while creating the new token balance,
  //       // the combination of the token address 
  //       // and the account address is  
  //       // passed as the identifier value
  //       fromTokenBalance = new TokenBalance(token.id + "-" + fromAccount.id);
  //       fromTokenBalance.token = token.id;
  //       fromTokenBalance.account = fromAccount.id;
  // }

  // fromTokenBalance.amount = fetchBalance(event.address,event.params.from)
  // //filtering out zero-balance tokens - optional
  // if(fromTokenBalance.amount != BigDecimal.fromString("0")){
  //   fromTokenBalance.save();
  // }
  
  //setting the token balance of the 'to' account
  // let toTokenBalance = TokenBalance.load(token.id + "-" + toAccount.id);
  // if (!toTokenBalance) {
  //     toTokenBalance = new TokenBalance(token.id + "-" + toAccount.id);
  //     toTokenBalance.token = token.id;
  //     toTokenBalance.account = toAccount.id;
  //   }
  // toTokenBalance.amount = fetchBalance(event.address,event.params.to)
  // if(toTokenBalance.amount != BigDecimal.fromString("0")){
  //   toTokenBalance.save();
  // }
}
export function handleRoleGranted(event: RoleGrantedEvent): void {
  let role = fetchRole(event.params.role, event.params.account);
  role.enabled = true;
  role.save();
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let role = fetchRole(event.params.role, event.params.account);
  role.enabled = false;
  role.save();
}

export function handleBlacklisted(event: Blacklisted): void {
  let black = fetchBlack(event.params._account);
  black.enabled = true;
  black.save();
}

export function handleUnBlacklisted(event: UnBlacklisted): void {
  let black = fetchBlack(event.params._account);
  black.enabled = false;
  black.save();
}