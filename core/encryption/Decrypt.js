var bignum = require("bignumber.js");

var FHEMath = require("../math/FHEMath");
var src = require("../math/src");
var CRT = require("../math/CRT");

var Encrypt = require("./Encrypt");
bignum.config({ ROUNDING_MODE: 1 });

class Decrypt {
    /**
     *
     * @returns {[[bignum(),...],[bignum(),...]]}
     */
    Params() {
        var m_initRoot = bignum("13537164");
        var modulus = src.plaintextModulus;
        var x = bignum("1");
        var rootOfUnityTable = new Array(src.cycleorder / 2);
        var preconTable = new Array(src.cycleorder / 2);

        for (var i = 0; i < src.cycleorder / 2; i++) {
            rootOfUnityTable[i] = x;
            preconTable[i] = x.times(bignum("2").pow(64)).idiv(modulus);
            x = x.times(m_initRoot).mod(modulus);
        }

        return [rootOfUnityTable, preconTable];
    }
    /**
     *
     * @param {[bignum(),...]} element
     * @param {bignum()} rootOfUnity
     * @param {bignum()} modulus
     *
     * @returns {[bignum(),...]}
     */
    InverseFormat(element, rootOfUnity, modulus) {
        var [
            rootOfUnityITable,
            preconTableInverse
        ] = CRT.rootOfUnityInverseTable(rootOfUnity, modulus);

        var NTT = CRT.NTTForward(
            element,
            rootOfUnityITable,
            preconTableInverse,
            modulus
        );

        for (var i = 0; i < src.cycleorder / 2; i++) {
            NTT[i] = NTT[i]
                .times(
                    FHEMath.ModInverse(
                        bignum((src.cycleorder / 2).toString()),
                        modulus
                    )
                )
                .mod(modulus);
        }

        NTT = CRT.ModMulPrecon(
            NTT,
            rootOfUnityITable,
            modulus,
            preconTableInverse
        );

        return NTT;
    }
    /**
     *
     * Read the ciphertext and transfer all strings
     * into bignum().
     *
     * @param {[string,...]} c0 ciphertext_part1
     * @param {[string,...]} c1 ciphertext_part2
     *
     * @returns {[c0, c1]}
     */
    ReadCiphertext(ciphertext) {
        var c0_bignum = new Array(src.modulus.length);
        var c1_bignum = new Array(src.modulus.length);
        for (var i = 0; i < src.modulus.length; i++) {
            var temp_c0_bignum = new Array(src.cycleorder / 2);
            var temp_c1_bignum = new Array(src.cycleorder / 2);
            for (var j = 0; j < src.cycleorder / 2; j++) {
                temp_c0_bignum[j] = bignum(ciphertext[i][j]);
                temp_c1_bignum[j] = bignum(ciphertext[i + 3][j]);
            }
            c0_bignum[i] = temp_c0_bignum;
            c1_bignum[i] = temp_c1_bignum;
        }
        c0_bignum.push(...c1_bignum);
        return c0_bignum;
    }
    /**
     *
     * Decrypt the ciphertext and unpack the
     * plaintext.
     *
     * @param {[bignum(),...]} c0
     * @param {[bignum(),...]} c1
     * @param {[bignum(),...]} privatekey
     *
     * @returns {Array of Integers}
     */
    DecryptVector(ciphertext, privatekey) {

        privatekey = FHEMath.vectortoBigNumber(privatekey);
        
        var c0 = new Array(src.modulus.length);
        var c1 = new Array(src.modulus.length);

        for (var i = 0; i < src.modulus.length; i++) {
            c0[i] = ciphertext[i];
            c1[i] = ciphertext[i + 3];
        }
        
        /* decrypt the ciphertext */
        var plaintext = [];
        for (i = 0; i < src.modulus.length; i++) {
            var temp = new Array(src.cycleorder / 2);
            for (var j = 0; j < src.cycleorder / 2; j++) {
                var temp_c = c0[i][j].plus(
                    privatekey[i][j].times(c1[i][j]).mod(src.modulus[i])
                );
                if (temp_c.gt(src.modulus[i])) {
                    temp_c = temp_c.minus(src.modulus[i]);
                }
                temp[j] = temp_c;
            }
            plaintext.push(
                this.InverseFormat(
                    temp,
                    src.rootOfUnityInverse[i],
                    src.modulus[i]
                )
            );
        }

        var coeff = [];
        for (i = 0; i < src.cycleorder / 2; i++) {

            var IntSum = bignum("0");
            var FloatSum = bignum("0");
            
            for (j = 0; j < src.modulus.length; j++) {
                var x = plaintext[j][i];
                /* 
                bignum does not support floats, obviously, 
                we multiply the float by 1000000000, creating an int.
                */
                IntSum = IntSum.plus(
                    CRT.ModMulPrecon(
                        [x],
                        [src.invTable[j]],
                        src.plaintextModulus,
                        [src.invPreconTable[j]]
                    )[0]
                );
                FloatSum = FloatSum.plus(
                    x
                        .times(src.numerator[j])
                        .times(bignum("1000000000"))
                        .idiv(src.denominator[j])
                );
            }
            coeff.push(
                IntSum.plus(FloatSum.idiv(bignum("1000000000")))
                    .mod(src.plaintextModulus)
                    .plus(bignum("1"))
            );
        }

        /* Unpack the decrypted vector */
        var [rootOfUnityTable, preconTable] = this.Params();

        var Input = CRT.ModMulPrecon(
            coeff,
            rootOfUnityTable,
            src.plaintextModulus,
            preconTable
        );

        var Output = CRT.NTTForward(
            Input,
            rootOfUnityTable,
            preconTable,
            src.plaintextModulus
        );
        
        /* Rearrange */
        var res = new Array(src.cycleorder / 2);

        var  m_fromCRT = Encrypt.Params()[1];
        
        for (i = 0; i < src.cycleorder / 2; i++) {
            res[i] = Output[m_fromCRT[i]];
        }

        /* Transfer result to integer */
        const halfModulus = src.plaintextModulus.dividedBy(bignum("2"));

        for (i = 0; i < Output.length; i++) {
            if (res[i].gt(halfModulus)) {
                res[i] = res[i].minus(src.plaintextModulus).toNumber();
            } else {
                res[i] = res[i].toNumber();
            }
        }

        return res;
    }
}

module.exports = new Decrypt();


