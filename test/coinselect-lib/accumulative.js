import assert from 'assert';

import coinAccum from '../../src/build-tx/coinselect-lib/inputs/accumulative';
import fixtures from './fixtures/accumulative.json';
import * as utils from './_utils';

describe('coinselect accumulative', () => {
    fixtures.forEach((f) => {
        it(f.description, () => {
            const inputs = utils.expand(f.inputs, true, f.inputLength);
            const outputs = utils.expand(f.outputs, false, f.outputLength);
            const expected = utils.addScriptLengthToExpected(
                f.expected, f.inputLength, f.outputLength, f.dustThreshold,
            );
            const options = {
                inputLength: f.inputLength,
                changeOutputLength: f.outputLength,
                dustThreshold: f.dustThreshold,
                baseFee: f.baseFee,
                floorBaseFee: f.floorBaseFee,
                dustOutputFee: f.dustOutputFee,
            };

            const actual = coinAccum(
                inputs,
                outputs,
                f.feeRate,
                options,
            );

            assert.deepStrictEqual(actual, expected);
            if (actual.inputs) {
                const feedback = coinAccum(
                    actual.inputs,
                    actual.outputs,
                    f.feeRate,
                    options,
                );
                assert.deepStrictEqual(feedback, expected);
            }
        });
    });
});
