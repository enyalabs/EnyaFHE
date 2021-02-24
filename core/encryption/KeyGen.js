var bignum = require("bignumber.js");

var FHEMath = require("../math/FHEMath");
var src = require("../math/src");
var CRT = require("../math/CRT");

var nextFrame = require("next-frame");

bignum.config({ ROUNDING_MODE: 1 });

class KeyGen {
    /**
     *
     * @param {[String, String,...]} element
     * @param {[String, String, String]} rootofunity
     * @param {[String, String, String]} modulus
     * @returns {[String, String,...]]}
     */
    Format(element, rootOfUnity, modulus) {
        var [
            rootOfUnityTableByModulus,
            preconTable
        ] = CRT.rootOfUnityForwardTable(rootOfUnity, modulus);

        var Input = CRT.ModMulPrecon(
            element,
            rootOfUnityTableByModulus,
            modulus,
            preconTable
        );

        var Output = CRT.NTTForward(
            Input,
            rootOfUnityTableByModulus,
            preconTable,
            modulus
        );

        return Output;
    }
    /**
     *
     * Returns are two parts of a multiply key.
     *
     * @param {[String, String,...]} privatekey
     * @returns {[[String,...],[String,...]]} MultiKey_part1 and MultiKey_part2
     */
    MultKey(privatekey, modulus = src.modulus, rootOfUnity = src.rootOfUnity) {
        privatekey = FHEMath.vectortoBigNumber(privatekey);
        var SquarePrivateKey = new Array(privatekey.length);
        for (var i = 0; i < privatekey.length; i++) {
            var temp_SquarePrivateKey = new Array(privatekey[i].length);
            for (var j = 0; j < privatekey[i].length; j++) {
                temp_SquarePrivateKey[j] = 
                    privatekey[i][j].times(privatekey[i][j]).mod(modulus[i]);
            }
            SquarePrivateKey[i] = temp_SquarePrivateKey;
        }
        var [part1, part2] = this.KeySwitch(
            SquarePrivateKey,
            privatekey,
            modulus,
            rootOfUnity
        );
        part1.push(...part2);
        return FHEMath.vectortoString(part1);
    }
    /**
     *
     * RN version
     * Returns are two parts of a multiply key.
     *
     * @param {[String, String,...]} privatekey
     * @returns {[[String,...],[String,...]]} MultiKey_part1 and MultiKey_part2
     */
    async MultKeyRN(
        privatekey,
        modulus = src.modulus,
        rootOfUnity = src.rootOfUnity
    ) {
        privatekey = FHEMath.vectortoBigNumber(privatekey);
        var SquarePrivateKey = new Array(privatekey.length);
        for (var i = 0; i < privatekey.length; i++) {
            var temp_SquarePrivateKey = new Array(privatekey[i].length);
            for (var j = 0; j < privatekey[i].length; j++) {
                await nextFrame();
                temp_SquarePrivateKey[j] = 
                    privatekey[i][j].times(privatekey[i][j]).mod(modulus[i]);
            }
            SquarePrivateKey[i] = temp_SquarePrivateKey;
        }
        var[part1, part2] = await this.KeySwitchRN(
            SquarePrivateKey,
            privatekey,
            modulus,
            rootOfUnity
        );
        part1.push(...part2);
        return FHEMath.vectortoString(part1);
    }
    /**
     *
     * Returns are two parts of a rotation key.
     * If you don't know what you are doing, don't change anything!
     *
     * @param {[String, String,...]} privatekey
     * @returns {[[String,...],[String,...]]} RotaKey_part1 and RotaKey_part2
     */
    RotaKey(
        privatekey,
        indexlist = [1],
        modulus = src.modulus,
        rootOfUnity = src.rootOfUnity
    ) {
        privatekey = FHEMath.vectortoBigNumber(privatekey);
        var indices = new Array(indexlist.length);
        for (var i = 0; i < indexlist.length; i++) {
            indices[i] = CRT.FindRotationIndex(indexlist[i], 1024);
        }

        var temp_privatekey = new Array(privatekey.length*indices.length);

        for (i = 0; i < indices.length; i++) {
            for (var j = 0; j < privatekey.length; j++) {
                var temp = new Array(512).fill(0);
                var logm = 10; // log2(1024)

                for (var t = 1; t < 1024; t = t + 2) {
                    var idx =
                        t * indices[i] - (((t * indices[i]) >> logm) << logm);
                    temp[t >> 1] = privatekey[j][idx >> 1];
                }
                temp_privatekey[i*j + j] = temp;
            }
        }
        var [part1, part2] = this.KeySwitch(
            temp_privatekey,
            privatekey,
            modulus,
            rootOfUnity
        );
        part1.push(...part2);
        return FHEMath.vectortoString(part1);
    }
    /**
     *
     * RN version
     * Returns are two parts of a rotation key.
     * If you don't know what you are doing, don't change anything!
     *
     * @param {[String, String,...]} privatekey
     * @returns {[[String,...],[String,...]]} RotaKey_part1 and RotaKey_part2
     */
    async RotaKeyRN(
        privatekey,
        indexlist = [1],
        modulus = src.modulus,
        rootOfUnity = src.rootOfUnity
    ) {
        privatekey = FHEMath.vectortoBigNumber(privatekey);
        var indices = new Array(indexlist.length);
        for (var i = 0; i < indexlist.length; i++) {
            indices[i] = CRT.FindRotationIndex(indexlist[i], 1024);
        }

        var temp_privatekey = new Array(privatekey.length*indices.length);

        for (i = 0; i < indices.length; i++) {
            for (var j = 0; j < privatekey.length; j++) {
                await nextFrame();
                var temp = new Array(512).fill(0);
                var logm = 10; // log2(1024)

                for (var t = 1; t < 1024; t = t + 2) {
                    var idx =
                        t * indices[i] - (((t * indices[i]) >> logm) << logm);
                    temp[t >> 1] = privatekey[j][idx >> 1];
                }
                temp_privatekey[i*j + j] = temp;
            }
        }
        var [part1, part2] = await this.KeySwitchRN(
            temp_privatekey,
            privatekey,
            modulus,
            rootOfUnity
        );
        part1.push(...part2);
        return FHEMath.vectortoString(part1);
    }
    /**
     *
     * @param {[String, String,...]} Key1
     * @param {[String, String,...]} Key2
     */
    KeySwitch(Key1, Key2, modulus, rootOfUnity) {
        var KeySwitch_Part1 = [];
        var KeySwitch_Part2 = [];

        for (var i = 0; i < Key2.length; i++) {
            var rdg = FHEMath.DiscreteGaussian(modulus);

            for (var j = 0; j < Key2.length; j++) {
                var rdu = FHEMath.DiscreteUniform(modulus[j]);
                var a = this.Format(rdu, rootOfUnity[j], modulus[j]);

                KeySwitch_Part2.push(a);

                var e = this.Format(rdg[j], rootOfUnity[j], modulus[j]);

                var temp_array = new Array(Key2[i].length);

                /* Key1 - (a*s + e)  */
                for (var t = 0; t < Key2[i].length; t++) {
                    var temp = a[t]
                        .times(Key2[j][t])
                        .mod(modulus[j])
                        .plus(e[t]);
                    if (temp.gt(modulus[j])) {
                        temp = temp.minus(modulus[j]);
                    }

                    if (i == j) {
                        temp = Key1[j][t].minus(temp);

                        if (temp.lte(bignum("0"))) {
                            temp = temp.plus(modulus[j]);
                        }
                        temp_array[t] = temp;
                    } else {
                        temp_array[t] = modulus[j].minus(temp);
                    }
                }
                KeySwitch_Part1.push(temp_array);
            }
        }
        return [KeySwitch_Part1, KeySwitch_Part2];
    }
    /**
     *
     * RN version
     *
     * @param {[String, String,...]} Key1
     * @param {[String, String,...]} Key2
     */
    async KeySwitchRN(Key1, Key2, modulus, rootOfUnity) {
        var KeySwitch_Part1 = [];
        var KeySwitch_Part2 = [];

        for (var i = 0; i < Key2.length; i++) {
            var rdg = FHEMath.DiscreteGaussian(modulus);
            await nextFrame();
            for (var j = 0; j < Key2.length; j++) {
                var rdu = FHEMath.DiscreteUniform(modulus[j]);
                var a = this.Format(rdu, rootOfUnity[j], modulus[j]);

                KeySwitch_Part2.push(a);

                var e = this.Format(rdg[j], rootOfUnity[j], modulus[j]);

                var temp_array = new Array(Key2[i].length);
                
                /* Key1 - (a*s + e)  */
                for (var t = 0; t < Key2[i].length; t++) {
                    var temp = a[t]
                        .times(Key2[j][t])
                        .mod(modulus[j])
                        .plus(e[t]);
                    if (temp.gt(modulus[j])) {
                        temp = temp.minus(modulus[j]);
                    }

                    if (i == j) {
                        temp = Key1[j][t].minus(temp);

                        if (temp.lte(bignum("0"))) {
                            temp = temp.plus(modulus[j]);
                        }
                        temp_array[t] = temp;
                    } else {
                        temp_array[t] = modulus[j].minus(temp);
                    }
                }
                KeySwitch_Part1.push(temp_array);
            }
        }
        return [KeySwitch_Part1, KeySwitch_Part2];
    }
    /**
     *
     * Returns are two parts of a public key.
     *
     * @param {[String, String,...]} PrivateKey
     * @returns {[[String,...], [String,...]]} PublicKey_part1 and PublicKey_part2
     */
    PublicKey(
        privatekey,
        rootOfUnity = src.rootOfUnity,
        modulus = src.modulus
    ) {
        privatekey = FHEMath.vectortoBigNumber(privatekey);
        var a = new Array(modulus.length);
        var b = new Array(modulus.length);

        var rdg = FHEMath.DiscreteGaussian(modulus);

        for (var i = 0; i < modulus.length; i++) {
            var rdu = FHEMath.DiscreteUniform(modulus[i]);
            rdu = this.Format(rdu, rootOfUnity[i], modulus[i]);
            a[i] = rdu;

            var temp_rdg = this.Format(rdg[i], rootOfUnity[i], modulus[i]);

            var temp = new Array(src.cycleorder / 2);
            for (var j = 0; j < src.cycleorder / 2; j++) {
                /* 
            b = b - e
            b = b - a * s 
            */
                var b_temp = modulus[i].minus(temp_rdg[j]);
                b_temp = b_temp.minus(
                    rdu[j].times(privatekey[i][j]).mod(modulus[i])
                );
                if (b_temp.lt(bignum("0"))) {
                    b_temp = b_temp.plus(modulus[i]);
                }
                temp[j] = b_temp;
            }
            b[i] = temp;
        }
        b.push(...a);
        return FHEMath.vectortoString(b);
    }
    /**
     *
     * RN version
     * Returns are two parts of a public key.
     *
     * @param {[String, String,...]} PrivateKey
     * @returns {[[String,...], [String,...]]} PublicKey_part1 and PublicKey_part2
     */
    async PublicKeyRN(
        privatekey,
        rootOfUnity = src.rootOfUnity,
        modulus = src.modulus
    ) {
        privatekey = FHEMath.vectortoBigNumber(privatekey);
        var a = new Array(modulus.length);
        var b = new Array(modulus.length);

        var rdg = FHEMath.DiscreteGaussian(modulus);

        for (var i = 0; i < modulus.length; i++) {
            await nextFrame();
            var rdu = FHEMath.DiscreteUniform(modulus[i]);
            rdu = this.Format(rdu, rootOfUnity[i], modulus[i]);
            a[i] = rdu;

            var temp_rdg = this.Format(rdg[i], rootOfUnity[i], modulus[i]);

            var temp = new Array(src.cycleorder / 2);
            for (var j = 0; j < src.cycleorder / 2; j++) {
                /* 
            b = b - e
            b = b - a * s 
            */
                var b_temp = modulus[i].minus(temp_rdg[j]);
                b_temp = b_temp.minus(
                    rdu[j].times(privatekey[i][j]).mod(modulus[i])
                );
                if (b_temp.lt(bignum("0"))) {
                    b_temp = b_temp.plus(modulus[i]);
                }
                temp[j] = b_temp;
            }
            b[i] = temp;
        }
        b.push(...a);
        return FHEMath.vectortoString(b);
    }
    /**
     *
     * Returns are a private key.
     *
     * @returns {[String,...]} private key
     */
    PrivateKey(seed, rootOfUnity = src.rootOfUnity, modulus = src.modulus) {
        var s = new Array(modulus.length);
        var rdb = FHEMath.DiscreteBinary(modulus, seed);

        for (var i = 0; i < modulus.length; i++) {
            var temp_rdb = this.Format(rdb[i], rootOfUnity[i], modulus[i]);
            s[i] = temp_rdb;
        }

        return FHEMath.vectortoString(s);
    }
    /**
     *
     * RN version
     * Returns are a private key.
     *
     * @returns {[String,...]} private key
     */
    async PrivateKeyRN(seed, rootOfUnity = src.rootOfUnity, modulus = src.modulus) {
        var s = new Array(modulus.length);
        var rdb = FHEMath.DiscreteBinary(modulus, seed);

        for (var i = 0; i < modulus.length; i++) {
            await nextFrame();

            var temp_rdb = this.Format(rdb[i], rootOfUnity[i], modulus[i]);
            s[i] = temp_rdb;
        }

        return FHEMath.vectortoString(s);
    }
}

module.exports = new KeyGen();
