import {
  SmartContract,
  method,
  AccountUpdate,
  state,
  State,
  PublicKey,
  UInt64,
} from 'o1js';

//TODO: ZKProgram should be added to the contract
//TODO:https://docs.minaprotocol.com/zkapps/tutorials/offchain-storage check

export class GameContract extends SmartContract {
  @state(PublicKey) player1 = State<PublicKey>();
  @state(UInt64) totalAmount = State<UInt64>();

  @method async initGame(player1Address: PublicKey) {
    this.player1.set(player1Address);

    // Player 1 contributes
    const senderUpdate1 = AccountUpdate.createSigned(player1Address);
    senderUpdate1.send({
      to: this.address,
      amount: UInt64.from(200_000_000),
    });
  }

  @method async distributeReward(winnerAddress: PublicKey) {
    const p1 = this.player1.getAndRequireEquals();

    const isWinnerValid = winnerAddress.equals(p1);
    isWinnerValid.assertTrue('Winner must be one of the two players');

    this.send({ to: winnerAddress, amount: UInt64.from(200_000_000) });
  }
}
