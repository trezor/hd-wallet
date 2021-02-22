import BigNumber from 'bignumber.js';
import * as utils from '../utils';

// add inputs until we reach or surpass the target value (or deplete)
// worst-case: O(n)
export default function accumulative(utxos0, outputs, feeRate, options) {
    const feeRateBigInt = utils.bignumberOrNaN(feeRate);
    if (feeRateBigInt.isNaN() || !feeRateBigInt.isInteger()) return {};
    const feeRateNumber = feeRateBigInt.toNumber();
    let bytesAccum = utils.transactionBytes([], outputs);

    let inAccum = new BigNumber(0);
    const inputs = [];
    const outAccum = utils.sumOrNaN(outputs);

    // split utxos into required and the rest
    const requiredUtxos = [];
    const utxos = [];
    utxos0.forEach((u) => {
        if (u.required) {
            requiredUtxos.push(u);
            const utxoBytes = utils.inputBytes(u);
            const utxoValue = utils.bignumberOrNaN(u.value);
            bytesAccum += utxoBytes;
            inAccum = inAccum.plus(utxoValue);
            inputs.push(u);
        } else {
            utxos.push(u);
        }
    });

    // check if required utxo is enough
    if (requiredUtxos.length > 0) {
        const requiredIsEnough = utils.finalize(
            requiredUtxos,
            outputs,
            feeRateNumber,
            options,
        );
        if (requiredIsEnough.inputs) {
            return requiredIsEnough;
        }
    }

    // continue with the rest
    for (let i = 0; i < utxos.length; ++i) {
        const utxo = utxos[i];
        const utxoBytes = utils.inputBytes(utxo);
        const utxoFee = feeRateNumber * utxoBytes;
        const utxoValue = utils.bignumberOrNaN(utxo.value);

        // skip detrimental input
        if (utxoValue.isNaN()
            || utxoValue.comparedTo(new BigNumber(utxoFee)) < 0) {
            if (i === utxos.length - 1) {
                const fee = utils.getFee(feeRateNumber, bytesAccum + utxoBytes, options, outputs);
                return {
                    fee: fee.toString(),
                };
            }
        } else {
            bytesAccum += utxoBytes;
            inAccum = inAccum.plus(utxoValue);
            inputs.push(utxo);

            const fee = utils.getFee(feeRateNumber, bytesAccum, options, outputs);
            const outAccumWithFee = outAccum.isNaN()
                ? new BigNumber(0) : outAccum.plus(fee);

            // go again?
            if (inAccum.comparedTo(outAccumWithFee) >= 0) {
                return utils.finalize(
                    inputs,
                    outputs,
                    feeRateNumber,
                    options,
                );
            }
        }
    }

    const fee = utils.getFee(feeRateNumber, bytesAccum, options, outputs);
    return { fee: fee.toString() };
}
