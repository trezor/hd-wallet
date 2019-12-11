/* global it:false, describe:false */

import assert from 'assert';

import BigNumber from 'bignumber.js';
import { uintOrNaN, bignumberOrNaN } from '../../src/build-tx/coinselect-lib/utils';

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
});
