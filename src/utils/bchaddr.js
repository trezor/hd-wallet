/* @flow */
import bchaddrjs from 'bchaddrjs';

// FIXME still necessary here???
// Cashaddr format is neither base58 nor bech32, so it would fail
// in bitcoinjs-trezor. For this reason use legacy format
export const convertCashAddress = (address: string): string => {
    try {
        if (bchaddrjs.isCashAddress(address)) {
            return bchaddrjs.toLegacyAddress(address);
        }
    } catch (e) {
        // noting
    }
    return address;
};
