var bignum = require("bignumber.js");
var nextFrame = require("next-frame");

var FHEMath = require("../math/FHEMath");
var src = require("../src/src");
var CRT = require("../math/CRT");

exports.EvalAdd = function (ciphertext1, ciphertext2) {
    /* Read in values */
    ciphertext1 = FHEMath.vectortoBigNumber(ciphertext1);
    ciphertext2 = FHEMath.vectortoBigNumber(ciphertext2);   

    var res = new Array(ciphertext1.length);

    for (var i = 0; i < ciphertext1.length; i++){
        var temp = new Array(ciphertext1[0].length);
        for (var j = 0; j < ciphertext1[0].length; j++) {
            var temp_val = ciphertext1[i][j].plus(ciphertext2[i][j]);
            console.log({module: src.modulus[i]})
            if (temp_val.gt(src.modulus[i])) {
                console.log({oldnumber: temp_val})
                temp[j] = temp_val.minus(src.modulus[i]);
                console.log({newnumber: temp[j]})
            } else {
                temp[j] = temp_val;
            }
        }
        res[i] = temp;
    }
    return FHEMath.vectortoString(res);
}