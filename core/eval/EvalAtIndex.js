var bignum = require("bignumber.js");

var FHEMath = require("../math/FHEMath");
var src = require("../math/src");
var CRT = require("../math/CRT");

/**
 *
 * @param {[bignum(), bignum(),..]} element
 * @param {bignum()} rootOfUnity
 * @param {bignum()} modulus
 */
const Format = function(element, rootOfUnity, modulus) {
    var [rootOfUnityTableByModulus, preconTable] = CRT.rootOfUnityForwardTable(
        rootOfUnity,
        modulus
    );

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
};
/**
 *
 * @param {[bignum(), bignum(),..]} element
 * @param {bignum()} rootOfUnity
 * @param {bignum()} modulus
 */
const InverseFormat = function(element, rootOfUnity, modulus) {
    var [rootOfUnityITable, preconTableInverse] = CRT.rootOfUnityInverseTable(
        rootOfUnity,
        modulus
    );

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

    NTT = CRT.ModMulPrecon(NTT, rootOfUnityITable, modulus, preconTableInverse);

    return NTT;
};
/**
 *
 * @param {[bignum(), bignum(),..]} element
 */
const CRTDecompose = function(element) {
    const modulus = [
        bignum("1152921503533163521"),
        bignum("1152921503533206529"),
        bignum("1152921503533275137")
    ];

    const rootOfUnity = [
        bignum("3419825375260351"),
        bignum("1195715620957928"),
        bignum("3519766358935735")
    ];
    
    const InvrootOfUnity =[
        bignum("928327762595163639"),
        bignum("702989894231962405"),
        bignum("418395004842946957")
    ];

    var res = new Array(element.length * element.length);
    var element_transfer = new Array(element.length);

    for (var i = 0; i < element.length; i++) {
        element_transfer[i] = InverseFormat(element[i], InvrootOfUnity[i], modulus[i])
    }

    for (var i = 0; i < element.length; i++) {
        var currentDCRTPoly = new Array(element.length);

        for (var k = 0; k < element.length; k++) {
            var temp = element_transfer[i];

            if (i != k) {
                var temp_sm = SwitchModulus(temp, modulus[i], modulus[k]);
                currentDCRTPoly[k] = Format(
                    temp_sm,
                    rootOfUnity[k],
                    modulus[k]
                );
            } else {
                currentDCRTPoly[k] = Format(temp, rootOfUnity[k], modulus[k]);
            }
        }
        for (var j = 0; j < element.length; j++) {
            res[i * 3 + j] = currentDCRTPoly[j];
        }
    }
    return res;
};
/**
 *
 * @param {[bignum(), bignum(),..]} element
 * @param {bignum()} oldmodulus
 * @param {bignum()} newmodulus
 */
const SwitchModulus = function(element, oldmodulus, newmodulus) {
    var diff = oldmodulus.gt(newmodulus)
        ? oldmodulus.minus(newmodulus)
        : newmodulus.minus(oldmodulus);
    var oldModulusByTwo = oldmodulus.dividedToIntegerBy(bignum("2"));
    var res = new Array(src.cycleorder / 2);
    for (var i = 0; i < element.length; i++) {
        if (oldmodulus.lt(newmodulus)) {
            if (element[i].gt(oldModulusByTwo)) {
                res[i] = element[i].plus(diff);
            } else {
                res[i] = element[i];
            }
        } else {
            if (element[i].gt(oldModulusByTwo)) {
                res[i] = element[i].minus(diff);
            } else {
                res[i] = element[i];
            }
        }
    }

    return res;
};

exports.EvalAtIndex = function(ciphertext, indexnumber, rotakey) {
    
    const modulus = [
        bignum("1152921503533163521"),
        bignum("1152921503533206529"),
        bignum("1152921503533275137")
    ];

    var a0 = new Array(src.modulus.length);
    var a1 = new Array(src.modulus.length);
    var a2 = new Array(src.modulus.length);
    var b0 = new Array(src.modulus.length);
    var b1 = new Array(src.modulus.length);
    var b2 = new Array(src.modulus.length);

    for (var i = 0; i < src.modulus.length; i++) {
        b0[i] = rotakey[i];
        b1[i] = rotakey[i + 3];
        b2[i] = rotakey[i + 6];
        a0[i] = rotakey[i + 9];
        a1[i] = rotakey[i + 12];
        a2[i] = rotakey[i + 15];
    }

    var ciphertext_part = new Array(2);
    var c = new Array(2);

    for (var i = 0; i < src.modulus.length - 1; i++) {
        ciphertext_part[i] = ciphertext.slice(0 + i * 3, 3 + i * 3);
    }

    var index = CRT.FindRotationIndex(indexnumber, src.cycleorder)

    for (i = 0; i < src.modulus.length - 1; i++) {

        var temp_ciphertext = new Array(src.modulus);

        for (var j = 0; j < src.modulus.length; j++) {
            
            var temp = new Array(512).fill(0);
            var logm = 10; // log2(1024)

            for (var t = 1; t < 1024; t = t + 2) {
                var idx =
                    t * index - (((t * index) >> logm) << logm);
                temp[t >> 1] = ciphertext_part[i][j][idx >> 1];
            }
            temp_ciphertext[j] = temp;
        }
        c[i] = temp_ciphertext
    }

    var c0 = c[0];
    var c1 = c[1];
    var c2 = c[2];

    var digistsC2 = CRTDecompose(c1)

    for (i = 0; i < src.modulus.length; i++) {
        for (var j = 0; j < src.cycleorder / 2; j++) {
            c1[i][j] = digistsC2[i][j].times(a0[i][j]).mod(modulus[i]);

            c0[i][j] = c0[i][j].plus(
                digistsC2[i][j].times(b0[i][j]).mod(modulus[i])
            );
            if (c0[i][j].gt(modulus[i])) {
                c0[i][j] = c0[i][j].minus(modulus[i]);
            }
        }
    }

    for (i = 0; i < src.modulus.length; i++) {
        for (var j = 0; j < src.cycleorder / 2; j++) {
            c1[i][j] = c1[i][j].plus(
                digistsC2[i + 3][j].times(a1[i][j]).mod(modulus[i])
            );
            if (c1[i][j].gt(modulus[i])) {
                c1[i][j] = c1[i][j].minus(modulus[i]);
            }

            c0[i][j] = c0[i][j].plus(
                digistsC2[i + 3][j].times(b1[i][j]).mod(modulus[i])
            );
            if (c0[i][j].gt(modulus[i])) {
                c0[i][j] = c0[i][j].minus(modulus[i]);
            }
        }
    }

    for (i = 0; i < src.modulus.length; i++) {
        for (var j = 0; j < src.cycleorder / 2; j++) {
            c1[i][j] = c1[i][j].plus(
                digistsC2[i + 6][j].times(a2[i][j]).mod(modulus[i])
            );
            if (c1[i][j].gt(modulus[i])) {
                c1[i][j] = c1[i][j].minus(modulus[i]);
            }

            c0[i][j] = c0[i][j].plus(
                digistsC2[i + 6][j].times(b2[i][j]).mod(modulus[i])
            );
            if (c0[i][j].gt(modulus[i])) {
                c0[i][j] = c0[i][j].minus(modulus[i]);
            }
        }
    }

    c0.push(...c1);

    return c0;
} 