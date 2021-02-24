var bignum = require("bignumber.js");

var FHEMath = require("../math/FHEMath");
var src = require("../src/src");
var CRT = require("../math/CRT");

var KeyGen = require("./KeyGen");
bignum.config({ ROUNDING_MODE: 1 });

class Encrypt {
    constructor(){
        this.m_initRoot = 13537164;
    }
    /**
     *
     * @returns {[[String,..], [String,...]]} two fixed tables
     */
    Params(m = src.cycleorder) {
        var permutation = m >> 1;
        var permutation_by_2 = m >> 2;
        var index = 1;
        var m_toCRT = new Array(permutation).fill(0);
        var m_fromCRT = new Array(permutation).fill(0);

        for (var i = 0; i < permutation_by_2; i++) {
            m_toCRT[(index - 1) / 2] = i;
            m_fromCRT[i] = (index - 1) / 2;

            var factor_index = (index * (m - 1)) % m;
            m_toCRT[(factor_index - 1) / 2] = i + permutation_by_2;
            m_fromCRT[i + permutation_by_2] = (factor_index - 1) / 2;

            index = (index * 5) % m;
        }
        return [m_toCRT, m_fromCRT];
    }
    /**
     *
     * Pack up the weights
     *
     * @param {Array} vector
     * @returns {[String,..]}
     */
    VectorPacked(vector) {
        var vectorInt = vector.reduce((acc, cur) => {
            let curInt = bignum(cur).times(bignum(Math.pow(10, 4))).toNumber();
            acc.push(parseInt(curInt));
            return acc;
        }, []);

        var m_toCRT = this.Params()[0];

        while (vectorInt.length < src.cycleorder / 2) {
            vectorInt.push(0);
        }

        var permutation = new Array(src.cycleorder / 2).fill(0);

        for (var i = 0; i < src.cycleorder / 2; i++) {
            permutation[i] = bignum(vectorInt[m_toCRT[i]].toString());
        }

        var res = this.SpecialCRT(permutation);

        return FHEMath.vectortoString(res);
    }
    /**
     *
     * Special situation of CRT
     *
     * @param {[String,...]} element
     * @returns {[String,..]}
     */
    SpecialCRT(element) {
        var [
            rootOfUnityITable,
            preconTableInverse
        ] = CRT.rootOfUnityInverseTable(
            FHEMath.ModInverse(
                bignum(this.m_initRoot.toString()),
                src.plaintextModulus
            ),
            src.plaintextModulus // modulus
        ); //8630410687 --> ModInverse

        var ans = CRT.NTTForward(
            element,
            rootOfUnityITable,
            preconTableInverse,
            src.plaintextModulus
        );
        for (var i = 0; i < src.cycleorder / 2; i++) {
            ans[i] = ans[i]
                .times(bignum("14238471297"))
                .mod(src.plaintextModulus);
        }
        ans = CRT.ModMulPrecon(
            ans,
            rootOfUnityITable,
            src.plaintextModulus,
            preconTableInverse
        );
        return ans;
    }
    /**
     *
     * Encrypt the plaintext. It returns two parts of
     * the ciphertext.
     *
     * @param {[String,...]} element
     * @param {[String,...]} p0
     * @param {[String,...]} p1
     * @returns {[[String,..], [String,...]]}
     */
    VectorEncrypt(element, publickey) {

        element = FHEMath.vectortoBigNumber(element);
        publickey = FHEMath.vectortoBigNumber(publickey);

        var rdg1 = FHEMath.DiscreteGaussian(src.modulus);
        var rdg2 = FHEMath.DiscreteGaussian(src.modulus);
        var rdb = FHEMath.DiscreteBinary(src.modulus);

        var c0 = [];
        var c1 = [];

        var p0 = [];
        var p1 = [];

        for (var i = 0; i < src.modulus.length; i++) {
            p0.push(publickey[i]);
            p1.push(publickey[i + 3]);
        }
        /* ptxt = vector(3 * 512) */
        for (i = 0; i < src.modulus.length; i++) {
            var ptxt = KeyGen.Format(
                element,
                src.rootOfUnity[i],
                src.modulus[i]
            );

            var u = KeyGen.Format(rdb[i], src.rootOfUnity[i], src.modulus[i]);

            var e1 = KeyGen.Format(rdg1[i], src.rootOfUnity[i], src.modulus[i]);
            var e2 = KeyGen.Format(rdg2[i], src.rootOfUnity[i], src.modulus[i]);

            var c0_vector = [];
            var c1_vector = [];

            for (var j = 0; j < src.cycleorder / 2; j++) {
                /* generate c0, where c0 = p0 * u + e1 + ptxt * deltaTable */
                var temp_c0 = p0[i][j]
                    .times(u[j])
                    .mod(src.modulus[i])
                    .plus(e1[j]);
                if (temp_c0.gt(src.modulus[i])) {
                    temp_c0 = temp_c0.minus(src.modulus[i]);
                }
                temp_c0 = temp_c0.plus(
                    ptxt[j].times(src.deltaTable[i]).mod(src.modulus[i])
                );
                if (temp_c0.gt(src.modulus[i])) {
                    temp_c0 = temp_c0.minus(src.modulus[i]);
                }
                c0_vector.push(temp_c0);

                /* generate c1, where c1 = p1 * u + e2 */
                var temp_c1 = p1[i][j]
                    .times(u[j])
                    .mod(src.modulus[i])
                    .plus(e2[j]);
                if (temp_c1.gt(src.modulus[i])) {
                    temp_c1 = temp_c1.minus(src.modulus[i]);
                }
                c1_vector.push(temp_c1);
            }

            c0.push(c0_vector);
            c1.push(c1_vector);
        }
        for (i = 0; i < c1.length; i++){
            c0.push(c1[i]);
        }
        return FHEMath.vectortoString(c0);
    }
}

module.exports = new Encrypt();
