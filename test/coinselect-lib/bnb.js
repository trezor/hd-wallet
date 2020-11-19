/* global it:false, describe:false */

import assert from 'assert';

import coinAccum from '../../src/build-tx/coinselect-lib/inputs/bnb';
import fixtures from './fixtures/bnb.json';
import * as utils from './_utils';

describe('coinselect bnb', () => {
    fixtures.forEach((f) => {
        it(f.description, () => {
            const { inputLength, outputLength, dustThreshold } = f;
            const inputs = utils.expand(f.inputs, true, inputLength);
            const outputs = utils.expand(f.outputs, false, outputLength);
            const expected = utils.addScriptLengthToExpected(
                f.expected, inputLength, outputLength, dustThreshold,
            );

            const actual = coinAccum(
                f.factor,
            )(
                inputs,
                outputs,
                f.feeRate, { inputLength, changeOutputLength: outputLength, dustThreshold },
            );

            assert.deepStrictEqual(actual, expected);
            if (actual.inputs) {
                const feedback = coinAccum(
                    f.factor,
                )(
                    actual.inputs,
                    actual.outputs,
                    f.feeRate,
                    { inputLength, changeOutputLength: outputLength, dustThreshold },
                );
                assert.deepStrictEqual(feedback, expected);
            }
        });
    });
});
