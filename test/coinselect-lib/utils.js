/* global it:false, describe:false */

import assert from 'assert';

import BigNumber from 'bignumber.js';
import { uintOrNaN, bignumberOrNaN, getFee } from '../../src/build-tx/coinselect-lib/utils';

describe('coinselect utils', () => {
    it('uintOrNaN', () => {
        assert.deepStrictEqual(uintOrNaN(1), 1);
        assert.deepStrictEqual(Number.isNaN(uintOrNaN('')), true);
        assert.deepStrictEqual(Number.isNaN(uintOrNaN(Infinity)), true);
        assert.deepStrictEqual(Number.isNaN(uintOrNaN(NaN)), true);
        assert.deepStrictEqual(Number.isNaN(uintOrNaN('1')), true);
        assert.deepStrictEqual(Number.isNaN(uintOrNaN('1.1')), true);
        assert.deepStrictEqual(Number.isNaN(uintOrNaN(1.1)), true);
        assert.deepStrictEqual(Number.isNaN(uintOrNaN(-1)), true);
    });
    it('bignumberOrNaN', () => {
        assert.deepStrictEqual(bignumberOrNaN('1'), new BigNumber('1'));
        assert.deepStrictEqual(bignumberOrNaN('').isNaN(), true);
        assert.deepStrictEqual(bignumberOrNaN('deadbeef').isNaN(), true);
        assert.deepStrictEqual(bignumberOrNaN('0x dead beef').isNaN(), true);
        assert.deepStrictEqual(bignumberOrNaN(Infinity).isNaN(), true);
        assert.deepStrictEqual(bignumberOrNaN(NaN).isNaN(), true);
        assert.deepStrictEqual(bignumberOrNaN(1).isNaN(), true);
        assert.deepStrictEqual(bignumberOrNaN('1.1').isNaN(), true);
        assert.deepStrictEqual(bignumberOrNaN(1.1).isNaN(), true);
        assert.deepStrictEqual(bignumberOrNaN(-1).isNaN(), true);
    });
    it('getBaseFee', () => {
        assert.deepStrictEqual(getFee(1, 100), 100);
        assert.deepStrictEqual(getFee(1, 200, {}), 200);
        // without floor
        assert.deepStrictEqual(getFee(1, 200, { baseFee: 1000 }), 1200);
        assert.deepStrictEqual(
            getFee(
                2,
                127,
                { baseFee: 1000, dustOutputFee: 1000, dustThreshold: 9 },
                [{ value: 8 }, { value: 7 }],
            ),
            3254,
        );

        // with floor
        assert.deepStrictEqual(getFee(1, 200, { baseFee: 1000, floorBaseFee: true }), 1000);
        assert.deepStrictEqual(
            getFee(
                2,
                1000,
                {
                    baseFee: 1000,
                    dustOutputFee: 1000,
                    dustThreshold: 9,
                    floorBaseFee: true,
                },
                [{ value: 8 }, { value: 7 }],
            ),
            5000,
        );
    });
});
