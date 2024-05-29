import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { TotalSupply } from "../generated/schema"
import { Transfer as TransferEvent } from "../generated/LTUSD/LTUSD"
import { handleTransfer } from "../src/ltusd"
import { createTransferEvent } from "./ltusd-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let owner = Address.fromString("0x0000000000000000000000000000000000000000")
    let spender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let value = BigInt.fromI32(234)
    let newTransferEvent = createTransferEvent(owner, spender, value)
    handleTransfer(newTransferEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Transfer created and stored", () => {
    assert.entityCount("TotalSupply", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    // assert.fieldEquals(
    //   "TotalSupply",
    //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
    //   "id",
    //   "0x0000000000000000000000000000000000000001"
    // )
    assert.fieldEquals(
      "TotalSupply",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "value",
      "234"
    )
    assert.fieldEquals(
      "TotalSupply",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "blockNumber",
      "1"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
