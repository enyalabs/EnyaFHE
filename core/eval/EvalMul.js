var bignum = require("bignumber.js");

var FHEMath = require("../math/FHEMath");
var src = require("../src/src");
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
 * @param {bignum()} b
 * @param {bignum()} modulus
 */
const ModMulFast = function(element, b, modulus) {
    if (element.gte(b)) {
        element = element.minus(b);
    } else {
        element = element.plus(modulus).minus(b);
    }
    return element;
};
/**
 *
 * @param {[bignum(), bignum(),..]} element
 * @param {bignum()} b
 * @param {bignum()} modulus
 */
const ModAddFast = function(element, b, modulus) {
    var r = element.plus(b);
    return r.gte(modulus) ? r.minus(modulus) : r;
};
/**
 *
 * @param {[bignum(), bignum(),..]} element
 */
const ScaleRound = function(element) {
    const si = [
        bignum("1152921503533286401"),
        bignum("1152921503533298689"),
        bignum("1152921503533304833"),
        bignum("1152921503533350913")
    ];

    const alpha = [
        [
            bignum("46198871993450474"),
            bignum("251621066091009731"),
            bignum("491316129202989902"),
            bignum("389401040112652290")
        ],
        [
            bignum("224491953482968212"),
            bignum("194559693018574524"),
            bignum("1047090839854893213"),
            bignum("26066059072853116")
        ],
        [
            bignum("838767198921877040"),
            bignum("100387398562650158"),
            bignum("105764133598492"),
            bignum("373961935738848355")
        ],
        [
            bignum("43463479134990673"),
            bignum("606353345861064274"),
            bignum("767330273875128057"),
            bignum("363492468608997150")
        ]
    ];

    var ans = new Array(4);

    for (var i = 0; i < 4; i++) {
        ans[i] = new Array(src.cycleorder / 2);
    }
    bignum.config({ DECIMAL_PLACES: 40 });
    for (var rIndex = 0; rIndex < src.cycleorder / 2; rIndex++) {
        var nu = bignum("0");

        for (var vIndex = 0; vIndex < src.modulus.length; vIndex++) {
            var xi = element[vIndex][rIndex];

            nu = nu.plus(
                src.numerator[vIndex]
                    .dividedBy(src.denominator[vIndex])
                    .times(xi)
            );
        }

        bignum.set({ ROUNDING_MODE: 4 });

        var rounded = nu.decimalPlaces(0);

        for (
            var newvIndex = 0;
            newvIndex < element.length - src.modulus.length;
            newvIndex++
        ) {
            var curvalue = bignum("0");

            for (vIndex = 0; vIndex < src.modulus.length; vIndex++) {
                xi = element[vIndex][rIndex];

                curvalue = curvalue.plus(xi.times(alpha[vIndex][newvIndex]));
            }

            xi = element[src.modulus.length + newvIndex][rIndex];
            curvalue = curvalue.plus(
                xi.times(alpha[src.modulus.length][newvIndex])
            );

            var curnativevalue = curvalue.mod(si[newvIndex]);
            ans[newvIndex][rIndex] = ModAddFast(
                curnativevalue,
                rounded,
                si[newvIndex]
            );

        }
    }

    return ans;
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

    var res = new Array(element.length * element.length);

    for (var i = 0; i < element.length; i++) {
        var currentDCRTPoly = new Array(element.length);

        for (var k = 0; k < element.length; k++) {
            var temp = element[i];

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
/**
 *
 * @param {[bignum(), bignum(),..]} m_vector
 */
const SwitchCRT = function(m_vector) {
    const mu = [
        bignum("9223372045443260415"),
        bignum("9223372045443162111"),
        bignum("9223372045443112959"),
        bignum("9223372045442744319")
    ];

    const InvMod = [
        bignum("721534356229277441"),
        bignum("873869973008232954"),
        bignum("710438677828918024")
    ];

    const InvModPre = [
        bignum("11544549710419554348"),
        bignum("13981919581152175168"),
        bignum("11367018855847373714")
    ];

    const si = [
        bignum("1152921503533286401"),
        bignum("1152921503533298689"),
        bignum("1152921503533304833"),
        bignum("1152921503533350913")
    ];

    const DivModsi = [
        [bignum("899678208"), bignum("1384120320"), bignum("9814671360")],
        [bignum("2170552320"), bignum("3183476736"), bignum("12457082880")],
        [bignum("2919235584"), bignum("4196401152"), bignum("13891534848")],
        [bignum("10940841984"), bignum("14199816192"), bignum("27056406528")]
    ];

    const qModsi = [
        bignum("1152810951075087361"),
        bignum("1152628114317308929"),
        bignum("1152508980514458625"),
        bignum("1150871277272285185")
    ];

    var ans = new Array(qModsi.length);

    for (var block = 0; block < ans.length; block++) {
        ans[block] = new Array(src.cycleorder / 2);
    }

    for (var i = 0; i < src.cycleorder / 2; i++) {
        var xVector = new Array(mu.length - 1);
        var nu = bignum("0");

        for (var j = 0; j < mu.length - 1; j++) {
            var x = m_vector[j][i];
            var q = src.modulus[j];

            xVector[j] = CRT.ModMulPrecon([x], [InvMod[j]], q, [
                InvModPre[j]
            ])[0];

            nu = nu.plus(xVector[j].dividedBy(q));
        }

        bignum.set({ ROUNDING_MODE: 4 });
        var alpha = nu.decimalPlaces(0);

        for (var t = 0; t < mu.length; t++) {
            var culvalue = bignum("0");

            for (j = 0; j < mu.length - 1; j++) {
                culvalue = culvalue.plus(xVector[j].times(DivModsi[t][j]));
            }

            var curnativevalue = culvalue.mod(si[t]);
            var temp = alpha.times(qModsi[t]).mod(si[t]);
            ans[t][i] = ModMulFast(curnativevalue, temp, si[t]);
        }
    }
    return ans;
};
/**
 *
 * @param {[bignum(), bignum(),..]} m_vector
 */
const SwitchCRTBack = function(m_vector) {
    const modulus = [
        bignum("1152921503533286401"),
        bignum("1152921503533298689"),
        bignum("1152921503533304833"),
        bignum("1152921503533350913")
    ];

    const mu = [
        bignum("9223372045444243455"),
        bignum("9223372045443899391"),
        bignum("9223372045443350527")
    ];

    const InvMod = [
        bignum("113310074463359253"),
        bignum("293531431347554751"),
        bignum("277286255915027369"),
        bignum("468793741807378821")
    ];

    const InvModPre = [
        bignum("1812961193101914721"),
        bignum("4696502905934046808"),
        bignum("4436580098771556707"),
        bignum("7500699875902033378")
    ];

    const si = [
        bignum("1152921503533163521"),
        bignum("1152921503533206529"),
        bignum("1152921503533275137")
    ];

    const DivModsi = [
        [
            bignum("3579348435075072"),
            bignum("3253953122795520"),
            bignum("3112476900065280"),
            bignum("2347113727918080")
        ],
        [
            bignum("1308075239669760"),
            bignum("1133665207713792"),
            bignum("1062811132231680"),
            bignum("723616090030080")
        ],
        [
            bignum("52997748948992"),
            bignum("25346749497344"),
            bignum("20102594428928"),
            bignum("7878043762688")
        ]
    ];

    const qModsi = [
        bignum("567242855889545859"),
        bignum("715650224914483110"),
        bignum("596966644161445888")
    ];

    var ans = new Array(qModsi.length);

    for (var block = 0; block < ans.length; block++) {
        ans[block] = new Array(src.cycleorder / 2);
    }

    for (var i = 0; i < src.cycleorder / 2; i++) {
        var xVector = new Array(mu.length + 1);
        var nu = bignum("0");

        for (var j = 0; j < mu.length + 1; j++) {
            var x = m_vector[j][i];
            var q = modulus[j];

            xVector[j] = CRT.ModMulPrecon([x], [InvMod[j]], q, [
                InvModPre[j]
            ])[0];

            nu = nu.plus(xVector[j].dividedBy(q));
        }

        bignum.set({ ROUNDING_MODE: 4 });
        var alpha = nu.decimalPlaces(0);

        for (var t = 0; t < mu.length; t++) {
            var culvalue = bignum("0");

            for (j = 0; j < mu.length + 1; j++) {
                culvalue = culvalue.plus(xVector[j].times(DivModsi[t][j]));
            }

            var curnativevalue = culvalue.mod(si[t]);
            var temp = alpha.times(qModsi[t]).mod(si[t]);
            ans[t][i] = ModMulFast(curnativevalue, temp, si[t]);
        }
    }
    return ans;
};
/**
 *
 * @param {[bignum(), bignum(),..]} m_vector
 */
const ExpandCRT = function(element) {
    const si = [
        bignum("1152921503533286401"),
        bignum("1152921503533298689"),
        bignum("1152921503533304833"),
        bignum("1152921503533350913")
    ];

    const sirootofunity = [
        bignum("2017870734301874"),
        bignum("3011438569692224"),
        bignum("5197663069168670"),
        bignum("2216193184298517")
    ];

    var res_element = new Array(element.length);
    var polyInNTT = element;

    for (var i = 0; i < element.length; i++) {
        res_element[i] = InverseFormat(
            element[i],
            src.rootOfUnityInverse[i],
            src.modulus[i]
        );
    }

    var SwitchCRTVector = SwitchCRT(res_element);

    for (i = 0; i < 4; i++) {
        res_element.push(SwitchCRTVector[i]);
        res_element[3 + i] = Format(
            res_element[3 + i],
            sirootofunity[i],
            si[i]
        );
    }

    for (i = 0; i < 3; i++) {
        res_element[i] = polyInNTT[i];
    }
    return res_element;
};
/**
 *
 * @param {[[bignum(),..], [bignum(),..],...]} ciphertext1
 * @param {[[bignum()...], [bignum(),..],...]} ciphertext2
 */
exports.EvalMulti = function(ciphertext1, ciphertext2, multikey) {
    var part1 = new Array(2);
    var part2 = new Array(2);

    for (var i = 0; i < part1.length; i++) {
        part1[i] = ciphertext1.slice(0 + i * 3, 3 + i * 3);
        part2[i] = ciphertext2.slice(0 + i * 3, 3 + i * 3);
    }

    ciphertext1 = part1;
    ciphertext2 = part2;

    var a0 = new Array(src.modulus.length);
    var a1 = new Array(src.modulus.length);
    var a2 = new Array(src.modulus.length);
    var b0 = new Array(src.modulus.length);
    var b1 = new Array(src.modulus.length);
    var b2 = new Array(src.modulus.length);

    for (var i = 0; i < src.modulus.length; i++) {
        b0[i] = multikey[i];
        b1[i] = multikey[i + 3];
        b2[i] = multikey[i + 6];
        a0[i] = multikey[i + 9];
        a1[i] = multikey[i + 12];
        a2[i] = multikey[i + 15];
    }

    const modulus = [
        bignum("1152921503533163521"),
        bignum("1152921503533206529"),
        bignum("1152921503533275137"),
        bignum("1152921503533286401"),
        bignum("1152921503533298689"),
        bignum("1152921503533304833"),
        bignum("1152921503533350913")
    ];

    const rootOfUnity = [
        bignum("928327762595163639"),
        bignum("702989894231962405"),
        bignum("418395004842946957"),
        bignum("344649865316757428"),
        bignum("599096090807234556"),
        bignum("220941583607385831"),
        bignum("408260387856071892")
    ];

    const crootOfUnity = [
        bignum("3419825375260351"),
        bignum("1195715620957928"),
        bignum("3519766358935735")
    ];

    for (var i = 0; i < ciphertext1.length; i++) {
        ciphertext1[i] = ExpandCRT(ciphertext1[i]);
        ciphertext2[i] = ExpandCRT(ciphertext2[i]);
    }

    var isFirstAdd = new Array(ciphertext1.length * ciphertext2.length - 1);
    var c = new Array(ciphertext1.length * ciphertext2.length - 1);

    for (var size_1 = 0; size_1 < ciphertext1.length; size_1++) {
        for (var size_2 = 0; size_2 < ciphertext2.length; size_2++) {
            if (typeof isFirstAdd[size_1 + size_2] == "undefined") {
                var ctemp = new Array(ciphertext2[size_1].length);

                for (var j = 0; j < ciphertext1[size_1].length; j++) {
                    var temp = new Array(src.cycleorder / 2);

                    for (var t = 0; t < temp.length; t++) {
                        temp[t] = ciphertext1[size_1][j][t]
                            .times(ciphertext2[size_2][j][t])
                            .mod(modulus[j]);
                    }

                    ctemp[j] = temp;
                }

                c[size_1 + size_2] = ctemp;
                isFirstAdd[size_1 + size_2] = true;
            } else {
                var ctemp = new Array(ciphertext2[size_1].length);

                for (var j = 0; j < ciphertext1[size_1].length; j++) {
                    var temp = new Array(src.cycleorder / 2);

                    for (var t = 0; t < temp.length; t++) {
                        temp[t] = c[size_1 + size_2][j][t].plus(
                            ciphertext1[size_1][j][t]
                                .times(ciphertext2[size_2][j][t])
                                .mod(modulus[j])
                        );

                        if (temp[t].gte(modulus[j])) {
                            temp[t] = temp[t].minus(modulus[j]);
                        }
                    }

                    ctemp[j] = temp;
                }

                c[size_1 + size_2] = ctemp;
                isFirstAdd[size_1 + size_2] = true;
            }
        }
    }

    for (var t = 0; t < c.length; t++) {
        for (j = 0; j < c[t].length; j++) {
            c[t][j] = InverseFormat(c[t][j], rootOfUnity[j], modulus[j]);
        }
    }

    for (var t = 0; t < c.length; t++) {
        c[t] = ScaleRound(c[t]);
    }

    for (var t = 0; t < c.length; t++) {
        c[t] = SwitchCRTBack(c[t]);
    }

    var c0 = c[0];
    var c1 = c[1];
    var c2 = c[2];

    var digistc2 = CRTDecompose(c2);

    for (i = 0; i < src.modulus.length; i++) {
        c0[i] = Format(c0[i], crootOfUnity[i], modulus[i]);
        c1[i] = Format(c1[i], crootOfUnity[i], modulus[i]);
    }

    for (i = 0; i < src.modulus.length; i++) {
        for (var j = 0; j < src.cycleorder / 2; j++) {
            c1[i][j] = c1[i][j].plus(
                digistc2[i][j].times(a0[i][j]).mod(modulus[i])
            );
            if (c1[i][j].gt(modulus[i])) {
                c1[i][j] = c1[i][j].minus(modulus[i]);
            }

            c0[i][j] = c0[i][j].plus(
                digistc2[i][j].times(b0[i][j]).mod(modulus[i])
            );
            if (c0[i][j].gt(modulus[i])) {
                c0[i][j] = c0[i][j].minus(modulus[i]);
            }
        }
    }

    for (i = 0; i < src.modulus.length; i++) {
        for (var j = 0; j < src.cycleorder / 2; j++) {
            c1[i][j] = c1[i][j].plus(
                digistc2[i + 3][j].times(a1[i][j]).mod(modulus[i])
            );
            if (c1[i][j].gt(modulus[i])) {
                c1[i][j] = c1[i][j].minus(modulus[i]);
            }

            c0[i][j] = c0[i][j].plus(
                digistc2[i + 3][j].times(b1[i][j]).mod(modulus[i])
            );
            if (c0[i][j].gt(modulus[i])) {
                c0[i][j] = c0[i][j].minus(modulus[i]);
            }
        }
    }

    for (i = 0; i < src.modulus.length; i++) {
        for (var j = 0; j < src.cycleorder / 2; j++) {
            c1[i][j] = c1[i][j].plus(
                digistc2[i + 6][j].times(a2[i][j]).mod(modulus[i])
            );
            if (c1[i][j].gt(modulus[i])) {
                c1[i][j] = c1[i][j].minus(modulus[i]);
            }

            c0[i][j] = c0[i][j].plus(
                digistc2[i + 6][j].times(b2[i][j]).mod(modulus[i])
            );
            if (c0[i][j].gt(modulus[i])) {
                c0[i][j] = c0[i][j].minus(modulus[i]);
            }
        }
    }

    c0.push(...c1);

    return c0;
};