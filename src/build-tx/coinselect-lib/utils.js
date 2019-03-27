import BigInteger from 'bigi';
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

export function bigIntOrNaN(v): BigInteger | NaN {
    if (v instanceof BigInteger) return v;
    if (typeof v !== 'string') return NaN;
    try {
        const value = new BigInteger(v);
        return value.toString() === v ? value : NaN;
    } catch (error) {
        return NaN;
    }
}

export function sumOrNaN(range, forgiving = false): BigInteger | NaN {
    return range.reduce((a, x) => {
        if (Number.isNaN(a)) return NaN;
        const value = bigIntOrNaN(x.value);
        if (Number.isNaN(value)) return forgiving ? a.add(BigInteger.ZERO) : NaN;
        return a.add(value);
    }, BigInteger.ZERO);
}

export function finalize(
    inputs,
    outputsO,
    feeRate,
    inputLength,
    changeOutputLength,
    explicitDustThreshold,
) {
    let outputs = outputsO;
    const bytesAccum = transactionBytes(inputs, outputs);
    const blankOutputBytes = outputBytes({ script: { length: changeOutputLength } });
    const feeAfterExtraOutput = BigInteger.valueOf(feeRate * (bytesAccum + blankOutputBytes));
    const sumInputs = sumOrNaN(inputs);
    const sumOutputs = sumOrNaN(outputs);
    const sumIsNotNaN = (!Number.isNaN(sumInputs) && !Number.isNaN(sumOutputs));
    const remainderAfterExtraOutput = sumIsNotNaN
        ? sumOrNaN(inputs).subtract(sumOrNaN(outputs).add(feeAfterExtraOutput)) : BigInteger.ZERO;
    const dust = dustThreshold(
        feeRate,
        inputLength,
        changeOutputLength,
        explicitDustThreshold,
    );

    // is it worth a change output?
    if (remainderAfterExtraOutput.compareTo(BigInteger.valueOf(dust)) > 0) {
        outputs = outputs.concat({
            value: remainderAfterExtraOutput.toString(),
            script: {
                length: changeOutputLength,
            },
        });
    }

    if (!sumIsNotNaN) return { fee: (feeRate * bytesAccum).toString() };
    const fee = sumOrNaN(inputs).subtract(sumOrNaN(outputs)).toString();
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
    return new BigInteger(x.value).subtract(BigInteger.valueOf(feeRate * inputBytes(x)));
}
