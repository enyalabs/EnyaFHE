var bignum = require("bignumber.js");
var nextFrame = require("next-frame");

var FHEMath = require("../math/FHEMath");
var src = require("../math/src");
var CRT = require("../math/CRT");

exports.EvalSub = function (ciphertext1, ciphertext2) {
    /* Read in values */
    ciphertext1 = FHEMath.vectortoBigNumber(ciphertext1);
    ciphertext2 = FHEMath.vectortoBigNumber(ciphertext2);   
    
    // console.log(ciphertext2.length);

    var res = new Array(ciphertext1.length);
    for (var i = 0; i < ciphertext1.length; i++){
        var temp = new Array(ciphertext1[0].length);
        for (var j = 0; j < ciphertext1[0].length; j++) {
            var temp_val = ciphertext1[i][j].minus(ciphertext2[i][j]);
            if (temp_val.lt(bignum('0'))) {
                t = i;
                if (t > 2) t -= 3;
                temp[j] = temp_val.plus(src.modulus[t]);
            } else {
                temp[j] = temp_val;
            }
        }
        res[i] = temp;
    }
    return FHEMath.vectortoString(res);
}
