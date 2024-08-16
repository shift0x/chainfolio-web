import { sendTransaction } from "../../lib/chain/transaction";
import { transferERC20Token } from "../../lib/erc20/erc20";

export async function depositERC20(signer, to, token, amountAsBig){
    const calldata = await transferERC20Token(to, amountAsBig)

    return sendTransaction(signer, token, calldata);
}