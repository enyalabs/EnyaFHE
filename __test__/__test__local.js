var EnyaFHE = require("../index");
var bignum  = require("bignumber.js");
var _ = require('lodash/core');

var Decrypt = require("../core/encryption/Decrypt")
var EvalAdd = require("../core/eval/EvalAdd")
var EvalSub = require("../core/eval/EvalSub")
var EvalMul = require("../core/eval/EvalMul")
var FHEMath = require("../core/math/FHEMath")

function arraysEqual(a1,a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}

function Test() {

    console.log("\n")
    console.log("EnyaFHE: Test1 ------------------------")
    console.log("EnyaFHE: Simple Encryption/Decryption -")
    console.log("EnyaFHE: ------------------------------")
    
    /* Generate private key */
    console.time("EnyaFHE: key gen");
    var privatekey = EnyaFHE.PrivateKeyGen();
    
    /* Generate public key */
    var publickey = EnyaFHE.PublicKeyGen();

    /* Generate multi key */
    var multikey = EnyaFHE.MultiKeyGen();

    /* Generate rotation key */
    var rotakey = EnyaFHE.RotaKeyGen();
    console.timeEnd("EnyaFHE: key gen");

    /* Pack the weight */
    console.time("EnyaFHE: Encrypt a number");
    var weights = [17];
    var ptxt = EnyaFHE.PackVector(weights);

    /* Encrypt the plaintext */
    var ciphertext = EnyaFHE.EncryptVector(
        ptxt,
        publickey
    );
    console.timeEnd("EnyaFHE: Encrypt a number");
    
    /* Decrypt the ciphertext */
    console.time("EnyaFHE: Decrypt");
    
    var text = EnyaFHE.DecryptVector(
        EnyaFHE.ReadCiphertext(ciphertext)
    );

    console.timeEnd("EnyaFHE: Decrypt");

    if (text[0] !== weights[0]) {
        console.log("Result actual  :",text[0])
        console.log("Result expected:",weights[0])
        throw new Error("EnyaFHE: Test1 (Simple Encryption/Decryption) Failed");
    } else {
        console.log("EnyaFHE: Test1 (Simple Encryption/Decryption) Passed");
    }

    console.log("\n")
    console.log("EnyaFHE: Test2 ------------------------")
    console.log("EnyaFHE: Decrypt large file -----------")
    console.log("EnyaFHE: ------------------------------")

    /* Load demo data */
    var demo = require("./demo");

    console.time("EnyaFHE: Loading demo data");
    var ciphertext = EnyaFHE.ReadCiphertext(demo.ciphertext);
    
    /* Read privatekey */
    var demo_privatekey = [];
    for (var i = 0; i < 3; i++) {
        var temp_privatekey_bignum = [];
        for (var j = 0; j < 512; j++) {
            temp_privatekey_bignum.push(bignum(demo.privatekey[i][j]));
        }
        demo_privatekey.push(temp_privatekey_bignum);
    }
    console.timeEnd("EnyaFHE: Loading demo data");
    
    /* Decrypt demo data*/
    console.time("EnyaFHE: Decrypt");
    text = Decrypt.DecryptVector(ciphertext, demo_privatekey);
    console.timeEnd("EnyaFHE: Decrypt");
    
    if (text[0] === [131785]) {
        throw new Error("EnyaFHE: Test2 (File Decrypt) Failed");
    } else {
        console.log("EnyaFHE: Test2 (File Decrypt) Passed");
    }

    console.log("\n")
    console.log("EnyaFHE: Test3 ------------------------")
    console.log("EnyaFHE: Addition of two vectors ------")
    console.log("EnyaFHE: ------------------------------")
    
    /* Generate private key */
    console.time("EnyaFHE: key gen");
    var privatekey = EnyaFHE.PrivateKeyGen();
    
    /* Generate public key */
    var publickey = EnyaFHE.PublicKeyGen();

    /* Generate multi key */
    var multikey = EnyaFHE.MultiKeyGen();

    /* Generate rotation key */
    var rotakey = EnyaFHE.RotaKeyGen();
    console.timeEnd("EnyaFHE: key gen");

    /* Pack the weight */
    console.time("EnyaFHE: Encrypt two vectors");
    var weights1 = [100, 200, 300, 400, 500];
    var ptxt1 = EnyaFHE.PackVector(weights1);

    /* Encrypt the plaintext */
    var ciphertext1 = EnyaFHE.EncryptVector(
        ptxt1,
        publickey
    );

    var weights2 = [100, 200, 300, 400, 500];
    var ptxt2 = EnyaFHE.PackVector(weights2);

    /* Encrypt the plaintext */
    var ciphertext2 = EnyaFHE.EncryptVector(
        ptxt2,
        publickey
    );

    var ciphertext = EvalAdd.EvalAdd(ciphertext1, ciphertext2)
    console.timeEnd("EnyaFHE: Encrypt two vectors");
    
    /* Decrypt the ciphertext */
    console.time("EnyaFHE: Decrypt");
    
    var text = EnyaFHE.DecryptVector(
        EnyaFHE.ReadCiphertext(ciphertext)
    );
    console.timeEnd("EnyaFHE: Decrypt");

    if (!arraysEqual(text.slice(0,5),[200, 400, 600, 800, 1000])) {
      console.log(text.slice(0,5))
      console.log([200, 400, 600, 800, 1000])
      throw new Error("EnyaFHE: Test3 (Addition) Failed");
    } else {
      console.log("EnyaFHE: Test3 (Addition) Passed");
    }

    console.log("\n")
    console.log("EnyaFHE: Test4 ------------------------")
    console.log("EnyaFHE: Subtraction of two vectors ---")
    console.log("EnyaFHE: ------------------------------")
    
    /* Generate private key */
    console.time("EnyaFHE: key gen");
    var privatekey = EnyaFHE.PrivateKeyGen();
    
    /* Generate public key */
    var publickey = EnyaFHE.PublicKeyGen();

    /* Generate multi key */
    var multikey = EnyaFHE.MultiKeyGen();

    /* Generate rotation key */
    var rotakey = EnyaFHE.RotaKeyGen();
    console.timeEnd("EnyaFHE: key gen");

    /* Pack the weights */
    console.time("EnyaFHE: Encrypt two vectors");
    var weights1 = [100, 200, 300, 400, 500];
    var ptxt1 = EnyaFHE.PackVector(weights1);

    /* Encrypt the plaintext */
    var ciphertext1 = EnyaFHE.EncryptVector(
        ptxt1,
        publickey
    );

    var weights2 = [34, 200, 300, 400, 500];
    var ptxt2 = EnyaFHE.PackVector(weights2);

    /* Encrypt the plaintext */
    var ciphertext2 = EnyaFHE.EncryptVector(
        ptxt2,
        publickey
    );

    var ciphertext = EvalSub.EvalSub(ciphertext1, ciphertext2)
    console.timeEnd("EnyaFHE: Encrypt two vectors");
    
    /* Decrypt the ciphertext */
    console.time("EnyaFHE: Decrypt");
    
    var resultArraySub = EnyaFHE.DecryptVector(
        EnyaFHE.ReadCiphertext(ciphertext)
    );
    console.timeEnd("EnyaFHE: Decrypt");

    if (!arraysEqual(resultArraySub.slice(0,5), [66, 0, 0, 0, 0])) {
        console.log(resultArraySub.slice(0,5))
        console.log([66, 0, 0, 0, 0])
        throw new Error("EnyaFHE: Test4 (Subtraction) Failed");
    } else {
        console.log("EnyaFHE: Test4 (Subtraction) Passed");
    }

    console.log("\n")
    console.log("EnyaFHE: Test5 ------------------------")
    console.log("EnyaFHE: Multiplication of two vectors ")
    console.log("EnyaFHE: (EbyE Square) ----------------")
    
    /* Generate private key */
    console.time("EnyaFHE: key gen");
    var privatekey = EnyaFHE.PrivateKeyGen();
    
    /* Generate public key */
    var publickey = EnyaFHE.PublicKeyGen();
    
    /* Generate multi key */
    var multikey = EnyaFHE.MultiKeyGen();
    
    /* Generate rotation key */
    var rotakey = EnyaFHE.RotaKeyGen();
    console.timeEnd("EnyaFHE: key gen");
    
    /* Pack the weight */
    console.time("EnyaFHE: Encrypt a number");
    var weights = [170, 42, 7];
    var ptxt = EnyaFHE.PackVector(weights);
    
    /* Encrypt the plaintext */
    var ciphertext = EnyaFHE.EncryptVector(
        ptxt,
        publickey
    );
    
    console.timeEnd("EnyaFHE: Encrypt a number");

    ciphertext = EvalMul.EvalMul(
        FHEMath.vectortoBigNumber(ciphertext), 
        FHEMath.vectortoBigNumber(ciphertext), 
        FHEMath.vectortoBigNumber(multikey)
    )
    
    /* Decrypt the ciphertext */
    console.time("EnyaFHE: Decrypt");
    
    var resultArrayMul = EnyaFHE.DecryptVector(
        EnyaFHE.ReadCiphertext(ciphertext)
    );
    console.timeEnd("EnyaFHE: Decrypt");

    if (!arraysEqual(resultArrayMul.slice(0,3), [28900, 1764, 49])) {
        console.log(resultArrayMul.slice(0,3))
        console.log([28900, 1764, 49])
        throw new Error("EnyaFHE: Test5 (Multiplication) Failed");
    } else {
        console.log("EnyaFHE: Test5 (Multiplication) Passed");
    }
}

Test()