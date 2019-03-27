import BigInteger from 'bigi';
import * as utils from '../utils';

// add inputs until we reach or surpass the target value (or deplete)
// worst-case: O(n)
export default function accumulative(utxos, outputs, feeRate, options) {
    const { changeOutputLength, dustThreshold: explicitDustThreshold, inputLength } = options;

    const feeRateBigInt = utils.bigIntOrNaN(feeRate);
    if (Number.isNaN(feeRateBigInt)) return {};
    const feeRateNumber = feeRateBigInt.intValue();
    let bytesAccum = utils.transactionBytes([], outputs);

    let inAccum = BigInteger.ZERO;
    const inputs = [];
    const outAccum = utils.sumOrNaN(outputs);

    for (let i = 0; i < utxos.length; ++i) {
        const utxo = utxos[i];
        const utxoBytes = utils.inputBytes(utxo);
        const utxoFee = feeRateNumber * utxoBytes;
        const utxoValue = utils.bigIntOrNaN(utxo.value);

        // skip detrimental input
        if (Number.isNaN(utxoValue) || utxoValue.compareTo(BigInteger.valueOf(utxoFee)) < 0) {
            if (i === utxos.length - 1) {
                return {
                    fee: (feeRateNumber * (bytesAccum + utxoBytes)).toString(),
                };
            }
        } else {
            bytesAccum += utxoBytes;
            inAccum = inAccum.add(utxoValue);
            inputs.push(utxo);

            const fee = feeRateNumber * bytesAccum;
            const outAccumWithFee = Number.isNaN(outAccum)
                ? BigInteger.ZERO : outAccum.add(BigInteger.valueOf(fee));

            // go again?
            if (inAccum.compareTo(outAccumWithFee) >= 0) {
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
