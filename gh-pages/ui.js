/* global window:false, document:false */

const data = {
    bitcoinSegwit: {
        xpubs: 'xpub6CVKsQYXc9awxgV1tWbG4foDvdcnieK2JkbpPEBKB5WwAPKBZ1mstLbKVB4ov7QzxzjaxNK6EfmNY5Jsk2cG26EVcEkycGW4tchT2dyUhrx;xpub6CVKsQYXc9ax22ig3KAZMRiJL1xT9Me1sFX3t34mnVVzr6FkciU74qk7AqBkePQ2sM9pKeWp88KfPT2qcVQ19ykqGHMDioJhwywGuJ96Xt8',
        urls: 'https://btc1.trezor.io',
        network: {
            messagePrefix: '\x18Bitcoin Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 0x00,
            scriptHash: 0x05,
            wif: 0x80,
            coin: 'btc',
        },
    },
    bitcoinLegacy: {
        xpubs: 'xpub6BiVtCpG9fQPxnPmHXG8PhtzQdWC2Su4qWu6XW9tpWFYhxydCLJGrWBJZ5H6qTAHdPQ7pQhtpjiYZVZARo14qHiay2fvrX996oEP42u8wZy;xpub6BiVtCpG9fQQ1EW99bMSYwySbPWvzTFRQZCFgTmV3samLSZAYU7C3f4Je9vkNh7h1GAWi5Fn93BwoGBy9EAXbWTTgTnVKAbthHpxM1fXVRL',
        urls: 'https://btc1.trezor.io',
        network: {
            messagePrefix: '\x18Bitcoin Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 0x00,
            scriptHash: 0x05,
            wif: 0x80,
            coin: 'btc',
        },
    },
    bitcoincash: {
        xpubs: 'xpub6DFYZ2FZwJHL4WULnRKTyMAaE9sM5Vi3QoWW9kYWGzR4HxDJ42Gbbdj7bpBAtATpaNeSVqSD3gdFFmZZYK9BVo96rhxPY7SWZWsfmdHpZ7e',
        urls: 'https://bch1.trezor.io',
        network: {
            messagePrefix: '\x18Bitcoin Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 0,
            scriptHash: 5,
            wif: 0x80,
            coin: 'bch',
        },
    },
    bitcoinGoldSegwit: {
        xpubs: 'xpub6BezrjBueDupWpyMVsztAHjR5Sw5fzmHAz9bMUSAsfs62TFaU1qdytKJuXBL4oba2XFoXptxXefT7tyaBQbaQDouHaqaogMHoRG7pUrJZsf;xpub6BezrjBueDupZvwM1PGcPS5fFTQ7ZNQahTzQ7St8qMjXcRBraEZLbwYe38vQ1qxZckd3CHQio3pzSDPXX8wsf5Abxha11aYssjA48SHd85J',
        urls: 'https://btg1.trezor.io',
        network: {
            messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 38,
            scriptHash: 23,
            wif: 0x80,
            coin: 'btg',
        },
    },
    bitcoinGold: {
        xpubs: 'xpub6Ci3YvWwttrxAQjegzMQUfBVBTUyXG5brnoypdzrjqpC6cPfEWLpJnGy5AMgM64EcpFeM1zH6e585FLRo9nXyvHDhrBHrXYa2kNdQnq6iYE',
        urls: 'https://btg1.trezor.io',
        network: {
            messagePrefix: '\x18Bitcoin Gold Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 38,
            scriptHash: 23,
            wif: 0x80,
            coin: 'btg',
        },
    },
    dash: {
        xpubs: 'drkpRzoAZxGzS6tCmAzbkg9ZgQmr2oaLK2u89SxTfc7FW9Mray7oEHusTRbb8kKXbQCMh4vBUiXWsxsFHToHA4AeLCiGKQqDgcE291PqDf3zEUT',
        urls: 'https://dash1.trezor.io',
        network: {
            messagePrefix: '\x19DarkCoin Signed Message:\n',
            bip32: {
                private: 50221816,
                public: 50221772,
            },
            pubKeyHash: 76,
            scriptHash: 16,
            wif: 0xcc,
            coin: 'dash',
        },
    },
    digibyteSegwit: {
        xpubs: 'xpub6CHZ4pRtkriEMy6d7r6yaQ3jQEVP9Hz14kqNdgWDmKugzLhFtP8ZHYFe1uGihkbVSEKTei5RapVd76Gyf1B4We7nSFfuLgRffbtYM3vR2VS',
        urls: 'https://dgb1.trezor.io',
        network: {
            messagePrefix: '\x18DigiByte Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 30,
            scriptHash: 63,
            wif: 0x80,
            coin: 'dgb',
        },
    },
    digibyte: {
        xpubs: 'xpub6CqTerEbegsjrhHTuRNGVdkqfksFMjrZsmf3Lp5JtbiFSgJgCSeodsjAUvXXksAkvAYHYhMeZcjmDRhixpZwYkuMAWf5fAW5ncPzmkcBrHp',
        urls: 'https://dgb1.trezor.io',
        network: {
            messagePrefix: '\x18DigiByte Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 30,
            scriptHash: 63,
            wif: 0x80,
            coin: 'dgb',
        },
    },
    doge: {
        xpubs: 'dgub8s6ZqRM7y5YaswHTn2EiE1dz8BWCdswdi2TTZWtU86Cv78qAgeHib9X7ntGvVaHXPqh4WQogMYthCtCzKwudS3JSnYbVFSdEGPqWnT6B8FB',
        urls: 'https://doge1.trezor.io',
        network: {
            messagePrefix: '\x19DogeCoin Signed Message:\n',
            bip32: {
                private: 49988504,
                public: 49990397,
            },
            pubKeyHash: 30,
            scriptHash: 22,
            wif: 0x80,
            coin: 'doge',
        },
    },
    litecoinSegwit: {
        xpubs: 'Ltub2Z9JbADcx5xj75V5Enx5p9FVnkXXgo3Z3V9EJY7HEPwnBXBxcDdSEWt1ZfzqJhkg4unSdog77UTGPHuqh1rDbHdcjsYJtUS3CGNNHmD5K3X',
        urls: 'https://ltc1.trezor.io',
        network: {
            messagePrefix: '\x18Litecoin Signed Message:\n',
            bip32: {
                private: 27106558,
                public: 27108450,
            },
            pubKeyHash: 48,
            scriptHash: 50,
            wif: 0x80,
            coin: 'ltc',
        },
    },
    litecoin: {
        xpubs: 'Ltub2Y8PyEMWQVgiX4L4gVzU8PakBTQ2WBxFdS6tJARQeasUUfXmBut2jGShnQyD3jgyBf7mmvs5jPNgmgXad5J6M8a8FiZK78dbT21fYtTAC9a',
        urls: 'https://ltc1.trezor.io',
        network: {
            messagePrefix: '\x18Litecoin Signed Message:\n',
            bip32: {
                private: 27106558,
                public: 27108450,
            },
            pubKeyHash: 48,
            scriptHash: 50,
            wif: 0x80,
            coin: 'ltc',
        },
    },
    namecoin: {
        xpubs: 'xpub6CG5oukvBQsT57G4cRpCed53yHY2MknS84DvPEfwHbKPM8FF3sgAWcpAscc1xaMBnfrNWwteTbgL2xBVkHvrLUw6HQM9mgwsuwY1Pv7h4jh',
        urls: 'https://nmc1.trezor.io',
        network: {
            messagePrefix: '\x18Namecoin Gold Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 52,
            scriptHash: 5,
            wif: 0x80,
            coin: 'nmc',
        },
    },
    vertcoinSegwit: {
        xpubs: 'xpub6C8zLxpvrSYvugWob1fmum8tVTzyVJ6apbQT2xxPgNiiGo3QB12FDBuBH8CiYrMx5bMtfeCubKtXjtXeZE7AbV2qJyGsRRiZ31eFRs9dupW',
        urls: 'https://vtc1.trezor.io',
        network: {
            messagePrefix: '\x18Vertcoin Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 71,
            scriptHash: 5,
            wif: 0x80,
            coin: 'vtc',
        },
    },
    vertcoin: {
        xpubs: 'xpub6BwcwbAxw5PtCEZXsXsYrtdpz8eF6YFxUJdJJrsGq4pSqgKygipJQRwjUdVsUXbooQSvZsW2xhU5qdxmFqcurfEJ7ndeiB5776TgzTWTEFR',
        urls: 'https://vtc1.trezor.io',
        network: {
            messagePrefix: '\x18Vertcoin Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 71,
            scriptHash: 5,
            wif: 0x80,
            coin: 'vtc',
        },
    },
    zcash: {
        xpubs: 'xpub6CQdEahwhKRSn9BFc7oWpzNoeqG2ygv3xdofyk7He93NMjvDpGvcQ2o4dZfBNXpqzKydaHp5rhXRT3zYhRYJAErXxarH37f9hgRZ6UPiqfg;xpub6CQdEahwhKRSrZ3ij6AbaVo2Cogb1woDYXEimbJUyzDwm5P6iGZMw6S4JjrHZLawzCjnQG5X4hYdAF3kHEybPHkGxAbskq9gqLDaPznobzn',
        urls: 'https://zec1.trezor.io',
        network: {
            messagePrefix: '\x18ZCash Signed Message:\n',
            bip32: {
                private: 76066276,
                public: 76067358,
            },
            pubKeyHash: 7352,
            scriptHash: 7357,
            wif: 0x80,
            coin: 'zcash',
            consensusBranchId: {
                1: 0x00,
                2: 0x00,
                3: 0x5ba81b19,
                4: 0x76b809bb,
            },
        },
    },
};

const onSelectChange = () => {
    const select = document.getElementById('network');
    const d = data[select.value];
    document.getElementById('xpubs').value = d.xpubs;
    document.getElementById('urls').value = d.urls;
};

window.onload = () => {
    const select = document.getElementById('network');
    select.onchange = onSelectChange;
    Object.keys(data).forEach((key) => {
        const option = document.createElement('option');
        option.text = key;
        option.value = key;
        select.appendChild(option);
    });
    onSelectChange();
};

window.data = data;
