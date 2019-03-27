/* global it:false, describe:false */

import assert from 'assert';
import BigInteger from 'bigi';

import { uintOrNaN, bigIntOrNaN } from '../../src/build-tx/coinselect-lib/utils';

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
    it('bigIntOrNaN', () => {
        assert.deepStrictEqual(bigIntOrNaN('1'), new BigInteger('1'));
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN('')), true);
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN('deadbeef')), true);
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN('0x dead beef')), true);
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN(Infinity)), true);
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN(NaN)), true);
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN(1)), true);
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN('1.1')), true);
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN(1.1)), true);
        assert.deepStrictEqual(Number.isNaN(bigIntOrNaN(-1)), true);
    });
});
