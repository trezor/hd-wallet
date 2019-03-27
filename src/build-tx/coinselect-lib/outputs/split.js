import BigInteger from 'bigi';
import * as utils from '../utils';

function filterCoinbase(utxos, minConfCoinbase) {
    return utxos.filter((utxo) => {
        if (utxo.coinbase) {
            return utxo.confirmations >= minConfCoinbase;
        }
        return true;
    });
}

// split utxos between each output, ignores outputs with .value defined
export default function split(utxosOrig, outputs, feeRate, options) {
    const {
        inputLength,
        changeOutputLength,
        dustThreshold: explicitDustThreshold,
    } = options;
    const coinbase = options.coinbase || 100;

    const feeRateBigInt = utils.bigIntOrNaN(feeRate);
    if (Number.isNaN(feeRateBigInt)) return {};
    const feeRateNumber = feeRateBigInt.intValue();

    const utxos = filterCoinbase(utxosOrig, coinbase);

    const bytesAccum = utils.transactionBytes(utxos, outputs);
    const fee = feeRateNumber * bytesAccum;
    const FEE_RESPONSE = { fee: fee.toString() };
    if (outputs.length === 0) return FEE_RESPONSE;

    const inAccum = utils.sumOrNaN(utxos);
    if (Number.isNaN(inAccum)) return FEE_RESPONSE;
    const outAccum = utils.sumOrNaN(outputs, true);
    const remaining = inAccum.subtract(outAccum).subtract(BigInteger.valueOf(fee));
    if (remaining.compareTo(BigInteger.ZERO) < 0) return FEE_RESPONSE;

    const unspecified = outputs.reduce(
        (a, x) => a + (Number.isNaN(utils.bigIntOrNaN(x.value)) ? 1 : 0),
        0,
    );

    if (remaining.toString() === '0' && unspecified === 0) {
        return utils.finalize(utxos, outputs, feeRateNumber, inputLength, changeOutputLength);
    }

    // this is the same as "unspecified"
    // const splitOutputsCount = outputs.reduce((a, x) => a + !Number.isFinite(x.value), 0);
    const splitValue = remaining.divide(BigInteger.valueOf(unspecified));
    const dustThreshold = utils.dustThreshold(
        feeRateNumber,
        inputLength,
        changeOutputLength,
        explicitDustThreshold,
    );

    // ensure every output is either user defined, or over the threshold
    if (!outputs.every(x => x.value !== undefined
        || (
            splitValue.compareTo(BigInteger.valueOf(dustThreshold)) > 0
        ))) return FEE_RESPONSE;

    // assign splitValue to outputs not user defined
    const outputsSplit = outputs.map((x) => {
        if (x.value !== undefined) return x;

        // not user defined, but still copy over any non-value fields
        const y = {};
        Object.keys(x).forEach((k) => { y[k] = x[k]; });
        y.value = splitValue.toString();
        return y;
    });

    return utils.finalize(
        utxos,
        outputsSplit,
        feeRateNumber,
        inputLength,
        changeOutputLength,
        explicitDustThreshold,
    );
}
