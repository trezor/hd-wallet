/* global it:false, describe:false */

import assert from 'assert';
import BigInteger from 'bigi';

import { uintOrNaN, bigIntOrNaN } from '../../src/build-tx/coinselect-lib/utils';

describe('coinselect utils', () => {
    it('uintOrNaN', () => {
        assert.deepEqual(uintOrNaN(1), 1);
        assert.deepEqual(Number.isNaN(uintOrNaN('')), true);
        assert.deepEqual(Number.isNaN(uintOrNaN(Infinity)), true);
        assert.deepEqual(Number.isNaN(uintOrNaN(NaN)), true);
        assert.deepEqual(Number.isNaN(uintOrNaN('1')), true);
        assert.deepEqual(Number.isNaN(uintOrNaN('1.1')), true);
        assert.deepEqual(Number.isNaN(uintOrNaN(1.1)), true);
        assert.deepEqual(Number.isNaN(uintOrNaN(-1)), true);
    });
    it('bigIntOrNaN', () => {
        assert.deepEqual(bigIntOrNaN('1'), new BigInteger('1'));
        assert.deepEqual(Number.isNaN(bigIntOrNaN('')), true);
        assert.deepEqual(Number.isNaN(bigIntOrNaN('deadbeef')), true);
        assert.deepEqual(Number.isNaN(bigIntOrNaN('0x dead beef')), true);
        assert.deepEqual(Number.isNaN(bigIntOrNaN(Infinity)), true);
        assert.deepEqual(Number.isNaN(bigIntOrNaN(NaN)), true);
        assert.deepEqual(Number.isNaN(bigIntOrNaN(1)), true);
        assert.deepEqual(Number.isNaN(bigIntOrNaN('1.1')), true);
        assert.deepEqual(Number.isNaN(bigIntOrNaN(1.1)), true);
        assert.deepEqual(Number.isNaN(bigIntOrNaN(-1)), true);
    });
});
