import { utils } from 'ethers'

export function numberToBig(amount, decimals) {
    return utils.parseUnits(amount.toString(), decimals).toString();
}

export function numberFromBig(amount, decimals){
    return Number(utils.formatUnits(amount.toString(), decimals));
}