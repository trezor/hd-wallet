import BigInteger from 'bigi';
import * as utils from '../utils';

const maxTries = 1000000;

function calculateEffectiveValues(utxos, feeRate) {
    return utxos.map((utxo) => {
        const value = utils.bigIntOrNaN(utxo.value);
        if (Number.isNaN(value)) {
            return {
                utxo,
                effectiveValue: BigInteger.ZERO,
            };
        }

        const effectiveFee = utils.inputBytes(utxo) * feeRate;
        const effectiveValue = value.subtract(BigInteger.valueOf(effectiveFee));
        return {
            utxo,
            effectiveValue,
        };
    });
}

export default function branchAndBound(factor) {
    return (utxos, outputs, feeRate, options) => {
        const { inputLength, changeOutputLength, dustThreshold: explicitDustThreshold } = options;

        if (!Number.isFinite(utils.uintOrNaN(feeRate))) return {};

        const costPerChangeOutput = utils.outputBytes({
            script: {
                length: changeOutputLength,
            },
        }) * feeRate;
        const costPerInput = utils.inputBytes({
            script: {
                length: inputLength,
            },
        }) * feeRate;
        const costOfChange = Math.floor((costPerInput + costPerChangeOutput) * factor);

        const bytesAndFee = BigInteger.valueOf(utils.transactionBytes([], outputs)).multiply(BigInteger.valueOf(feeRate));
        const outSum = utils.sumOrNaN(outputs);
        if (Number.isNaN(outSum)) {
            return { fee: 0 };
        }
        const outAccum = outSum.add(bytesAndFee);

        const effectiveUtxos = calculateEffectiveValues(utxos, feeRate)
            .filter(x => x.effectiveValue.compareTo(BigInteger.ZERO) > 0)
            .sort((a, b) => {
                const subtract = b.effectiveValue.subtract(a.effectiveValue).intValue();
                if (subtract !== 0) {
                    return subtract;
                }
                return a.utxo.i - b.utxo.i;
            });

        const selected = search(effectiveUtxos, outAccum, BigInteger.valueOf(costOfChange));
        if (selected !== null) {
            const inputs = [];

            for (let i = 0; i < effectiveUtxos.length; i++) {
                if (selected[i]) {
                    inputs.push(effectiveUtxos[i].utxo);
                }
            }

            return utils.finalize(
                inputs,
                outputs,
                feeRate,
                inputLength,
                changeOutputLength,
                explicitDustThreshold,
            );
        }
        return {
            fee: 0,
        };
    };
}

// Depth first search
// Inclusion branch first (Largest First Exploration), then exclusion branch
function search(effectiveUtxos, target, costOfChange) {
    if (effectiveUtxos.length === 0) {
        return null;
    }

    let tries = maxTries;

    const selected = []; // true -> select the utxo at this index
    let selectedAccum = BigInteger.ZERO; // sum of effective values

    let done = false;
    let backtrack = false;

    let remaining = effectiveUtxos.reduce((a, x) => a.add(x.effectiveValue), BigInteger.ZERO);
    const costRange = target.add(costOfChange);

    let depth = 0;
    while (!done) {
        if (tries <= 0) { // Too many tries, exit
            return null;
        }

        if (selectedAccum.compareTo(costRange) > 0) {
            // Selected value is out of range, go back and try other branch
            backtrack = true;
        } else if (selectedAccum.compareTo(target) >= 0) {
            // Selected value is within range
            done = true;
        } else if (depth >= effectiveUtxos.length) {
            // Reached a leaf node, no solution here
            backtrack = true;
        } else if (selectedAccum.add(remaining).compareTo(target) < 0) {
            // Cannot possibly reach target with amount remaining
            if (depth === 0) {
                // At the first utxo, no possible selections, so exit
                return null;
            }
            backtrack = true;
        } else { // Continue down this branch
            // Remove this utxo from the remaining utxo amount
            remaining = remaining.subtract(effectiveUtxos[depth].effectiveValue);
            // Inclusion branch first (Largest First Exploration)
            selected[depth] = true;
            selectedAccum = selectedAccum.add(effectiveUtxos[depth].effectiveValue);
            depth++;
        }

        // Step back to the previous utxo and try the other branch
        if (backtrack) {
            backtrack = false; // Reset
            depth--;

            // Walk backwards to find the first utxo which has not has its second branch traversed
            while (!selected[depth]) {
                remaining = remaining.add(effectiveUtxos[depth].effectiveValue);

                // Step back one
                depth--;

                if (depth < 0) {
                    // We have walked back to the first utxo
                    // and no branch is untraversed. No solution, exit.
                    return null;
                }
            }

            // Now traverse the second branch of the utxo we have arrived at.
            selected[depth] = false;
            selectedAccum = selectedAccum.subtract(effectiveUtxos[depth].effectiveValue);
            depth++;
        }
        tries--;
    }

    return selected;
}
