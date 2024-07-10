//import smart contract class from generated files
import { LTUSD } from "../generated/LTUSD/LTUSD";
//import entities
import { Account, Token, 
  // TotalTransfer, 
  Role, Black } from "../generated/schema";
//import datatypes
import { BigDecimal, ethereum, Address, BigInt, Int8, Bytes } from "@graphprotocol/graph-ts";
//fetch token details
// export function fetchTokenDetails(event: ethereum.Event): Token | null {
//   //check if token details are already saved
  // let token = Token.load(event.address.toHex());
//   if (!token) {
//     //if token details are not available
//     //create a new token
//     token = new Token(event.address.toHex());

//     //set some default values
//     token.name = "N/A";
//     token.symbol = "N/A";
//     token.decimals = BigInt.zero();

//     //bind the contract
//     let erc20 = LTUSD.bind(event.address);

//     //fetch name
//     let tokenName = erc20.try_name();
//     if (!tokenName.reverted) {
//       token.name = tokenName.value;
//     }

//     //fetch symbol
//     let tokenSymbol = erc20.try_symbol();
//     if (!tokenSymbol.reverted) {
//       token.symbol = tokenSymbol.value;
//     }

//     //fetch decimals
//     let tokenDecimal = erc20.try_decimals();
//     if (!tokenDecimal.reverted) {
//       token.decimals = tokenDecimal.value;
//     }

//     //save the details
//     token.save();
//   }
//   return token;
// }

// export function fetchTotal(event: ethereum.Event): TotalTransfer {
//   //check if token details are already saved
//   let totalTransfer = TotalTransfer.load(event.address.toHex());
//   if (!totalTransfer) {
//     totalTransfer = new TotalTransfer(event.address.toHex());
//     totalTransfer.blockNumber = BigInt.zero();
//     totalTransfer.blockTimestamp = BigInt.zero();
//     totalTransfer.totalCount = BigInt.zero();
//     totalTransfer.totalVolume = BigInt.zero();
//   }
//   return totalTransfer;
// }

//fetch account details
export function fetchAccount(address: string): Account | null {
  const zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");
  if (zeroAddress.equals(Address.fromString(address))) {
    return null;
  }
  let account = Account.load(address);
  if (!account) {
    //if account details are not available
    //create new account
    account = new Account(address);
    account.amount = BigInt.zero();
    account.inTx = 0;
    account.outTx = 0;
    account.blockNumber = BigInt.zero();
    account.blockTimestamp = BigInt.zero();
    account.save();
  }
  return account;
}

//fetch the current balance of a particular token
//in the given account
export function fetchBalance(
  tokenAddress: Address,
  accountAddress: Address
): BigInt | null {
  let erc20 = LTUSD.bind(tokenAddress); //bind token
  //set default value
  let amount: BigInt | null = null;
  //get balance
  let tokenBalance = erc20.try_balanceOf(accountAddress);
  if (!tokenBalance.reverted) {
    amount = tokenBalance.value;
  }
  return amount;
}

// export const MinterRole: string = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";


// const roleMap  = {
//   "0x0000000000000000000000000000000000000000000000000000000000000000": "DEFAULT_ADMIN_ROLE",
//   "0x679bd9d3c888f23cc573720774e2f42add4a913e21d56de2f469b5f3e0b834e0": "BLACK_LISTER_ROLE",
//   "0x32c33f5a95173f202aa9a300d4ba14c55156248d1b2356b88052fc439349ab5d": "MINTER_MASTER_ROLE",
//   "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6": "MINTER_ROLE",
//   "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a": "PAUSER_ROLE",
//   "0xcf6f9f892731e14b8859835f2ff35575f447fb501f46243c4eb8bac19e31a050": "RESCUER_ROLE",
// };

let roleMap  = new Map<string, string>();
roleMap.set("0x0000000000000000000000000000000000000000000000000000000000000000", "DEFAULT_ADMIN_ROLE")
roleMap.set("0x679bd9d3c888f23cc573720774e2f42add4a913e21d56de2f469b5f3e0b834e0", "BLACK_LISTER_ROLE")
roleMap.set("0x32c33f5a95173f202aa9a300d4ba14c55156248d1b2356b88052fc439349ab5d", "MINTER_MASTER_ROLE")
roleMap.set("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", "MINTER_ROLE")
roleMap.set("0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a", "PAUSER_ROLE")
roleMap.set("0xcf6f9f892731e14b8859835f2ff35575f447fb501f46243c4eb8bac19e31a050", "RESCUER_ROLE")


export function fetchRole(roleHash: Bytes, address: Address): Role {
  
  let role = Role.load(roleHash.toHex() + "-" + address.toHex());
  if (!role) {
    //create new Role
    role = new Role(roleHash.toHex() + "-" + address.toHex());
    role.roleName = roleMap.get(roleHash.toHex());
    role.address = address;
    role.enabled = false;
    role.save()
  }
  return role;
}

export function fetchBlack(address: Address): Black {
  let black = Black.load(address.toHex());
  if (!black) {
    //create new black
    black = new Black(address.toHex());
    black.enabled = false;
    black.save();
  }
  return black;
}