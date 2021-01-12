var bignum = require("bignumber.js");

bignum.config({ ROUNDING_MODE: 1 }); 

var src = require("../src/src");

class ChineseRemainderTransform {
    /**
     *
     * Returns are two fixed tables which are inputs for the
     * ModMulPrecon model. It is written as a function rather than
     * varruction to save time.
     *
     *@param {bignum()} Root
     *@param {bignum()} Mod
     *@returns {[[bignum(),...], [bignum(),...]]} two fixed tables
     */
    rootOfUnityForwardTable(Root, Mod) {
        var rootOfUnityTableByModulus = new Array(src.cycleorder / 2);
        var preconTable = new Array(src.cycleorder / 2);
        var x = bignum("1");

        for (var i = 0; i < src.cycleorder / 2; i++) {
            rootOfUnityTableByModulus[i] = x;
            preconTable[i] = x.times(bignum("2").pow(64)).idiv(Mod);
            x = x.times(Root).mod(Mod);
        }
        return [rootOfUnityTableByModulus, preconTable];
    }
    /**
     *
     * Returns are two fixed tables.
     *
     *@param {bignum()} Root
     *@param {bignum()} Mod
     *@returns {[[bignum(),...], [bignum(),...]]} two fixed tables
     */
    rootOfUnityInverseTable(Root, Mod) {
        var rootOfUnityInversTableByModulus = new Array(src.cycleorder / 2);
        var preconTableInverse = new Array(src.cycleorder / 2);
        var x = bignum("1");

        for (var i = 0; i < src.cycleorder / 2; i++) {
            rootOfUnityInversTableByModulus[i] = x;
            preconTableInverse[i] = x.times(bignum("2").pow(64)).div(Mod);
            x = x.times(Root).mod(Mod);
        }
        return [rootOfUnityInversTableByModulus, preconTableInverse];
    }
    /**
     *
     * @param {[bignum(),...]} element
     * @param {[bignum(),...]} RootOfUnity
     * @param {bignum()}       modulus
     * @param {[bignum(),...]} PreconTable
     * @returns {[bignum(),...]}
     */
    ModMulPrecon(element, RootOfUnity, modulus, PreconTable) {
        var res = new Array(element.length);
        for (var i = 0; i < element.length; i++) {
            /*
            (element * percontable - (element * percontable) % (2^64)) / (2^64)
            */
            var high = element[i]
                .times(PreconTable[i])
                .minus(
                    element[i]
                        .times(PreconTable[i])
                        .mod(bignum("18446744073709551616"))
                )
                .div(bignum("18446744073709551616")); // 2^64
            /*
            element * rootofunity - high * modulus
            */
            var prime = element[i].times(RootOfUnity[i]).minus(high.times(modulus));

            res[i] = prime.minus(modulus).gte(bignum("0")) ? prime.minus(modulus) : prime;
        }
        return res;
    }
    /**
     *
     * @param {[bignum(),...]} element
     * @param {[bignum(),...]} RootOfUnity
     * @param {bignum()}       modulus
     * @param {[bignum(),...]} PreconTable
     * @returns {[bignum(),...]}
     */
    NTTForward(element, RootOfUnity, PreconTable, modulus) {
        var res = new Array(src.cycleorder / 2);

        for (var i = 0; i < src.cycleorder / 2; i++) {
            res[i] = element[this.ReverseBits(i, 9)]; // 2^9 = 512
        }

        var logn = Math.log2(src.cycleorder / 2);

        for (var logm = 1; logm <= logn; logm++) {
            var index = [];
            for (i = 0; i < 1 << (logm - 1); i++) {
                index.push(i << (1 + logn - logm));
            }

            for (var j = 0; j < src.cycleorder / 2; j = j + (1 << logm)) {
                for (i = 0; i < 1 << (logm - 1); i++) {
                    var x = index[i];

                    var omega = RootOfUnity[x];
                    var preomega = PreconTable[x];

                    var indexEven = j + i;
                    var indexOdd = indexEven + (1 << (logm - 1));

                    var oddVal = res[indexOdd];

                    if (!oddVal.eq(bignum("0"))) {
                        if (oddVal.eq(bignum("1"))) {
                            var omegaFactor = omega;
                        } else {
                            omegaFactor = this.ModMulPrecon(
                                [oddVal],
                                [omega],
                                modulus,
                                [preomega]
                            )[0];
                        }

                        var butterflyPlus = res[indexEven];
                        butterflyPlus = butterflyPlus.plus(omegaFactor);

                        if (butterflyPlus.gte(modulus)) {
                            butterflyPlus = butterflyPlus.minus(modulus);
                        }

                        var butterflyMinus = res[indexEven];

                        if (butterflyMinus.lt(omegaFactor)) {
                            butterflyMinus = butterflyMinus.plus(modulus);
                        }

                        butterflyMinus = butterflyMinus.minus(omegaFactor);

                        res[indexEven] = butterflyPlus;
                        res[indexOdd] = butterflyMinus;
                    } else {
                        res[indexOdd] = res[indexEven];
                    }
                }
            }
        }
        return res;
    }
    /**
     *
     * @param {num} n
     * @param {num} m
     * @returns {num}
     */
    ReverseBits(n, m) {
        var index =
            ((src.table[n & 0xff] << 8) | src.table[(n >> 8) & 0xff]) >>
            src.shift[m & 0x7];
        return index;
    }
    /**
     *
     * @param {num} i
     * @param {num} m
     * @returns {num}
     */
    FindRotationIndex(i, m) {
        var n = m / 2;
        var f1 = 5;
        var f2 = m - 1;
        var g0 = f1;

        if (i < n / 2) {
            var g = f1;
            for (var j = 1; j < i; j++) {
                g = (g * g0) % m;
            }
        } else {
            g = f2;
            for (j = n / 2; j < i; j++) {
                g = (g * g0) % m;
            }
        }
        return g;
    }
}

module.exports = new ChineseRemainderTransform();
