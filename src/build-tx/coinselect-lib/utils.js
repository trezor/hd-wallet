import BigNumber from 'bignumber.js';
// baseline estimates, used to improve performance
const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 + 1;
// 8 bytes start, 2 times 1 byte count in/out, 1 extra byte for segwit start

const TX_INPUT_BASE = 32 + 4 + 1 + 4;
const TX_OUTPUT_BASE = 8 + 1;

export function inputBytes(input) {
    if (input.script.length == null) {
        throw new Error('Null script length');
    }
    return TX_INPUT_BASE + input.script.length;
}

export function outputBytes(output) {
    if (output.script.length == null) {
        throw new Error('Null script length');
    }
    return TX_OUTPUT_BASE + output.script.length;
}

export function dustThreshold(
    feeRate,
    inputLength,
    outputLength,
    explicitDustThreshold,
) {
    const size = transactionBytes([
        {
            script: {
                length: inputLength,
            },
        },
    ], [
        {
            script: {
                length: outputLength,
            },
        },
    ]);
    const price = size * feeRate;
    const threshold = Math.max(explicitDustThreshold, price);
    return threshold;
}

export function transactionBytes(inputs, outputs) {
    return TX_EMPTY_SIZE
    + inputs.reduce((a, x) => a + inputBytes(x), 0)
    + outputs.reduce((a, x) => a + outputBytes(x), 0);
}

export function uintOrNaN(v) {
    if (typeof v !== 'number') return NaN;
    if (!Number.isFinite(v)) return NaN;
    if (Math.floor(v) !== v) return NaN;
    if (v < 0) return NaN;
    return v;
}

export function bignumberOrNaN(v): BigNumber {
    if (v instanceof BigNumber) return v;
    if (typeof v !== 'string') return new BigNumber(NaN);
    try {
        const value = new BigNumber(v);
        return (value.toFixed() === v && value.isInteger()) ? value : new BigNumber(NaN);
    } catch (error) {
        return new BigNumber(NaN);
    }
}

export function sumOrNaN(range, forgiving = false): BigNumber {
    return range.reduce((a, x) => {
        if (Number.isNaN(a)) return new BigNumber(NaN);
        const value = bignumberOrNaN(x.value);
        if (value.isNaN()) return forgiving ? new BigNumber(0).plus(a) : new BigNumber(NaN);
        return value.plus(a);
    }, new BigNumber(0));
}

// DOGE fee policy https://github.com/dogecoin/dogecoin/issues/1650#issuecomment-722229742
// 1 DOGE base fee + 1 DOGE per every started kb + 1 DOGE for every output below 1 DOGE (dust limit)
export function getFee(feeRate, bytes = 0, options = {}, outputs = []) {
    const defaultFee = feeRate * bytes;
    let baseFee = options.baseFee || 0;
    if (baseFee && bytes) {
        if (options.floorBaseFee) {
            // increase baseFee for every started kb
            baseFee *= parseInt((baseFee + defaultFee) / baseFee, 10);
        } else {
            // simple increase baseFee
            baseFee += defaultFee;
        }
    }
    if (options.dustOutputFee) {
        // find all outputs below dust limit
        for (let i = 0; i < outputs.length; i++) {
            if (outputs[i].value && outputs[i].value - options.dustThreshold <= 0) {
                // increase for every output below dustThreshold
                baseFee += options.dustOutputFee;
            }
        }
    }
    return baseFee || defaultFee;
}

export function finalize(
    inputs,
    outputsO,
    feeRate,
    options,
) {
    const {
        inputLength,
        changeOutputLength,
        dustThreshold: explicitDustThreshold,
    } = options;
    let outputs = outputsO;
    const bytesAccum = transactionBytes(inputs, outputs);
    const blankOutputBytes = outputBytes({ script: { length: changeOutputLength } });
    const feeAfterExtraOutput = getFee(feeRate, bytesAccum + blankOutputBytes, options, outputs);
    const sumInputs = sumOrNaN(inputs);
    const sumOutputs = sumOrNaN(outputs);
    const sumIsNotNaN = (!sumInputs.isNaN() && !sumOutputs.isNaN());
    const remainderAfterExtraOutput = sumIsNotNaN
        ? sumInputs.minus(sumOutputs.plus(feeAfterExtraOutput)) : new BigNumber(0);
    const dust = dustThreshold(
        feeRate,
        inputLength,
        changeOutputLength,
        explicitDustThreshold,
    );

    // is it worth a change output?
    if (remainderAfterExtraOutput.comparedTo(new BigNumber(dust)) > 0) {
        outputs = outputs.concat({
            value: remainderAfterExtraOutput.toString(),
            script: {
                length: changeOutputLength,
            },
        });
    }

    if (!sumIsNotNaN) return { fee: getFee(feeRate, bytesAccum, options, outputs).toString() };
    const fee = sumOrNaN(inputs).minus(sumOrNaN(outputs)).toString();
    return {
        inputs,
        outputs,
        fee,
    };
}

export function anyOf(algorithms) {
    return (utxos, outputs, feeRate, inputLength, outputLength) => {
        let result = { fee: Infinity };

        for (let i = 0; i < algorithms.length; i++) {
            const algorithm = algorithms[i];
            result = algorithm(utxos, outputs, feeRate, inputLength, outputLength);
            if (result.inputs) {
                return result;
            }
        }

        return result;
    };
}

export function utxoScore(x, feeRate) {
    return new BigNumber(x.value).minus(new BigNumber(feeRate * inputBytes(x)));
}
