import BigNumber from 'bignumber.js';
import * as utils from '../utils';

// add inputs until we reach or surpass the target value (or deplete)
// worst-case: O(n)
export default function accumulative(utxos, outputs, feeRate, options) {
    const { changeOutputLength, dustThreshold: explicitDustThreshold, inputLength } = options;

    const feeRateBigInt = utils.bignumberOrNaN(feeRate);
    if (feeRateBigInt.isNaN() || !feeRateBigInt.isInteger()) return {};
    const feeRateNumber = feeRateBigInt.toNumber();
    let bytesAccum = utils.transactionBytes([], outputs);

    let inAccum = new BigNumber(0);
    const inputs = [];
    const outAccum = utils.sumOrNaN(outputs);

    for (let i = 0; i < utxos.length; ++i) {
        const utxo = utxos[i];
        const utxoBytes = utils.inputBytes(utxo);
        const utxoFee = feeRateNumber * utxoBytes;
        const utxoValue = utils.bignumberOrNaN(utxo.value);

        // skip detrimental input
        if (utxoValue.isNaN()
            || utxoValue.comparedTo(new BigNumber(utxoFee)) < 0) {
            if (i === utxos.length - 1) {
                return {
                    fee: (feeRateNumber * (bytesAccum + utxoBytes)).toString(),
                };
            }
        } else {
            bytesAccum += utxoBytes;
            inAccum = inAccum.plus(utxoValue);
            inputs.push(utxo);

            const fee = feeRateNumber * bytesAccum;
            const outAccumWithFee = outAccum.isNaN()
                ? new BigNumber(0) : outAccum.plus(new BigNumber(fee));

            // go again?
            if (inAccum.comparedTo(outAccumWithFee) >= 0) {
                return utils.finalize(
                    inputs,
                    outputs,
                    feeRateNumber,
                    inputLength,
                    changeOutputLength,
                    explicitDustThreshold,
                );
            }
        }
    }

    return { fee: (feeRateNumber * bytesAccum).toString() };
}
