import BigNumber from 'bignumber.js';
import * as utils from '../utils';

const maxTries = 1000000;

function calculateEffectiveValues(utxos, feeRate) {
    return utxos.map((utxo) => {
        const value = utils.bignumberOrNaN(utxo.value);
        if (value.isNaN()) {
            return {
                utxo,
                effectiveValue: new BigNumber(0),
            };
        }

        const effectiveFee = utils.inputBytes(utxo) * feeRate;
        const effectiveValue = value.minus(effectiveFee);
        return {
            utxo,
            effectiveValue,
        };
    });
}

export default function branchAndBound(factor) {
    return (utxos, outputs, feeRate, options) => {
        const { inputLength, changeOutputLength, dustThreshold: explicitDustThreshold } = options;

        const feeRateBigInt = utils.bignumberOrNaN(feeRate);
        if (feeRateBigInt.isNaN() || !feeRateBigInt.isInteger()) return {};
        const feeRateNumber = feeRateBigInt.toNumber();

        const costPerChangeOutput = utils.outputBytes({
            script: {
                length: changeOutputLength,
            },
        }) * feeRateNumber;

        const costPerInput = utils.inputBytes({
            script: {
                length: inputLength,
            },
        }) * feeRateNumber;

        const costOfChange = Math.floor((costPerInput + costPerChangeOutput) * factor);
        const txBytes = utils.transactionBytes([], outputs);

        const bytesAndFee = feeRateBigInt.times(txBytes);

        const outSum = utils.sumOrNaN(outputs);
        if (outSum.isNaN()) {
            return { fee: '0' };
        }

        const outAccum = outSum.plus(bytesAndFee);

        const effectiveUtxos = calculateEffectiveValues(utxos, feeRateNumber)
            .filter(x => x.effectiveValue.comparedTo(new BigNumber(0)) > 0)
            .sort((a, b) => {
                const subtract = b.effectiveValue.minus(a.effectiveValue).toNumber();
                if (subtract !== 0) {
                    return subtract;
                }
                return a.utxo.i - b.utxo.i;
            });

        const selected = search(effectiveUtxos, outAccum, costOfChange);
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
                feeRateNumber,
                inputLength,
                changeOutputLength,
                explicitDustThreshold,
            );
        }

        return { fee: '0' };
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
    let selectedAccum = new BigNumber(0); // sum of effective values

    let done = false;
    let backtrack = false;

    let remaining = effectiveUtxos.reduce((a, x) => x.effectiveValue.plus(a), new BigNumber(0));
    const costRange = target.plus(costOfChange);

    let depth = 0;
    while (!done) {
        if (tries <= 0) { // Too many tries, exit
            return null;
        }

        if (selectedAccum.comparedTo(costRange) > 0) {
            // Selected value is out of range, go back and try other branch
            backtrack = true;
        } else if (selectedAccum.comparedTo(target) >= 0) {
            // Selected value is within range
            done = true;
        } else if (depth >= effectiveUtxos.length) {
            // Reached a leaf node, no solution here
            backtrack = true;
        } else if (selectedAccum.plus(remaining).comparedTo(target) < 0) {
            // Cannot possibly reach target with amount remaining
            if (depth === 0) {
                // At the first utxo, no possible selections, so exit
                return null;
            }
            backtrack = true;
        } else { // Continue down this branch
            // Remove this utxo from the remaining utxo amount
            remaining = remaining.minus(effectiveUtxos[depth].effectiveValue);
            // Inclusion branch first (Largest First Exploration)
            selected[depth] = true;
            selectedAccum = selectedAccum.plus(effectiveUtxos[depth].effectiveValue);
            depth++;
        }

        // Step back to the previous utxo and try the other branch
        if (backtrack) {
            backtrack = false; // Reset
            depth--;

            // Walk backwards to find the first utxo which has not has its second branch traversed
            while (!selected[depth]) {
                remaining = remaining.plus(effectiveUtxos[depth].effectiveValue);

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
            selectedAccum = selectedAccum.minus(effectiveUtxos[depth].effectiveValue);
            depth++;
        }
        tries--;
    }

    return selected;
}
