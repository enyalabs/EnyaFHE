
var bignum  = require("bignumber.js");
var _ = require('lodash/core');

var EnyaFHE = require("../index");

var Decrypt = require("../dist/encryption/Decrypt");
var EvalAdd = require("../core/eval/EvalAdd")
var EvalSub = require("../core/eval/EvalSub")
var EvalMul = require("../core/eval/EvalMul")
var FHEMath = require("../core/math/FHEMath");

function arraysEqual(a1,a2) {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1)==JSON.stringify(a2);
}

function Test() {

    console.log("EnyaFHE: -------- Test1 ---------");
    console.log("EnyaFHE: -- EnyaFHE Encryption --")
    console.log("EnyaFHE: --------- Local --------")
    
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
    var weights = [17.5];
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
    console.log(text[0])
    console.log(weights)

    if (text[0] !== weights[0]) {
        console.log("Result actual  :",text[0])
        console.log("Result expected:",weights[0])
        throw new Error("EnyaFHE: Test1 (float) failed!");
    } else {
        console.log("EnyaFHE: Passed Test1 (float)");
    }
    console.log("\n")

    console.log("EnyaFHE: -------- Test2 ---------");
    console.log("EnyaFHE: -- EnyaFHE Decryption --")
    console.log("EnyaFHE: ------ Local Test ------")
    
    /* Load demo data */
    var demo = require("./demo");
    console.time("EnyaFHE: Load demo data");
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
        throw new Error("EnyaFHE: Test2 failed!");
    } else {
        console.log("EnyaFHE: Passed Test2");
    }
    console.log("\n")

    /* Add Test */
    console.log("EnyaFHE: ------- Test3 -------");
    console.log("EnyaFHE: ------ EvalAdd ------");
    console.log("EnyaFHE: ----- Local Test -----");
    
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
      throw new Error("EnyaFHE: Test3 failed!");
    } else {
      console.log("EnyaFHE: Passed Test3");
    }
    console.log("\n")

    /* Sub Test */
    console.log("EnyaFHE: ------- Test4 -------");
    console.log("EnyaFHE: ------ EvalSub ------");
    console.log("EnyaFHE: ----- Local Test -----");
    
    /* Generate private key */
    console.time("EnyaFHE: key gen");
    var privatekey = EnyaFHE.PrivateKeyGen();
    
    /* Generate public key */
    var publickey = EnyaFHE.PublicKeyGen();

    /* Generate multi key */
    var multikey = EnyaFHE.MultiKeyGen();

    /* Generate rotation key */
    var rotakey = EnyaFHE.RotaKeyGen();
    console.timeEnd("EnyaFHE: key generation");

    /* Pack the weights */
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

    var ciphertext = EvalSub.EvalSub(ciphertext1, ciphertext2)
    console.timeEnd("EnyaFHE: Encrypt two vectors");
    
    /* Decrypt the ciphertext */
    console.time("EnyaFHE: Decrypt");
    
    var text = EnyaFHE.DecryptVector(
        EnyaFHE.ReadCiphertext(ciphertext)
    );
    console.timeEnd("EnyaFHE: Decrypt");

    if (!arraysEqual(text.slice(0,5), [0, 0, 0, 0, 0])) {
        console.log(text.slice(0,5))
        console.log([0, 0, 0, 0, 0])
        throw new Error("EnyaFHE: Test4 failed!");
    } else {
        console.log("EnyaFHE: Passed Test4");
    }
    console.log("\n")

    console.log("EnyaFHE: ------- Test5 ---------");
    console.log("EnyaFHE: ------ EvalMulti ------")
    console.log("EnyaFHE: ----- Local Test ------")
    
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
    var weights = [170];
    var ptxt = EnyaFHE.PackVector(weights);
    
    /* Encrypt the plaintext */
    var ciphertext = EnyaFHE.EncryptVector(
        ptxt,
        publickey
    );
    
    console.timeEnd("EnyaFHE: Encrypt a number");
    ciphertext = EvalMulti.EvalMul(
        FHEMath.vectortoBigNumber(ciphertext), 
        FHEMath.vectortoBigNumber(ciphertext), 
        FHEMath.vectortoBigNumber(multikey)
    )
    
    /* Decrypt the ciphertext */
    console.time("EnyaFHE: Decrypt");
    
    var text = EnyaFHE.DecryptVector(
        EnyaFHE.ReadCiphertext(ciphertext)
    );
    console.timeEnd("EnyaFHE: Decrypt");

    console.log(text[0])
    if (text[0] == [28900]) {
        console.log("EnyaFHE: Passed Test5");
    } else {
        throw new Error("EnyaFHE: Test5 failed!");
    }
    console.log("\n")

    /* Configure */
    EnyaFHE.Configure({
        CLIENT_TOKEN: "f7edB8a8A4D7dff85d2CB7E5",
        algo_name: "sample_algo"
    })

    /*
    Test6
    It is the whole process of FHE compuation.
    It allows you to add indicators during the calculation.
    */
    console.log("EnyaFHE: ------- Test6 --------");
    console.log("EnyaFHE: -- EnyaFHE API Test --")
    console.log("EnyaFHE: ------- Cloud --------")

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
    console.time("EnyaFHE: Encrypt a number");

    var weights = [170, 10, 20, 30, 0, 0, 0, 0];
    var ptxt = EnyaFHE.PackVector(weights);

    /* Encrypt the plaintext */

    var ciphertext = EnyaFHE.EncryptVector(
        ptxt,
        publickey
    );

    console.timeEnd("EnyaFHE: Encrypt a number");
    
    var jsonpayload = EnyaFHE.JSONPayload(
        publickey,
        multikey,
        rotakey,
        ciphertext
    );

    var string_pcr = EnyaFHE.RandomPCR();
    console.log("EnyaFHE: Random PCR: ", string_pcr)

    EnyaFHE.SendData({ pcr: string_pcr, data: jsonpayload })
        .then(function(response) {
            return response.json();
        })
        .then(function(json) {
            if (json.status == true) {
                console.log("EnyaFHE: Sent encryption keys.")
                EnyaFHE.sleep(8000).then(function(){
                EnyaFHE.CheckStatus({ pcr: string_pcr })
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(json) {
                        if (json.API_result_ready == true) {
                            console.log("EnyaFHE: The calculation has finished.");
                            console.log("EnyaFHE: Starting to retrieve encrypted result.");
                            EnyaFHE.GetResult({pcr: string_pcr})
                            .then(function(response){
                                return response.json()
                            })
                            .then(function(json){
                                console.log("EnyaFHE: Starting to decrypt the ciphertext.")
                                var ciphertext = EnyaFHE.ReadCiphertext(json.ciphertext);
                                var text = EnyaFHE.DecryptVector(ciphertext)
                                if (text[0] != 3020850) {
                                    throw new Error("EnyaFHE: Failed Test6")
                                } else {
                                    console.log("EnyaFHE: Passed Test6")
                                    console.log("\n")
                                }

                                /* 
                                Test7
                                It uses the compact EnyaFHE.FHE() function.
                                */
                               
                               console.log("EnyaFHE: ------- Test7 ----------")
                               console.log("EnyaFHE: -- EnyaFHE.FHE() Test --")
                               console.log("EnyaFHE: -------  Cloud  --------")

                               EnyaFHE.FHE([170, 10, 20, 30, 0, 0, 0, 0])
                                .then(function(res){
                                    if ( res != 3020850 ) {
                                        throw new Error("EnyaFHE: Failed Test7")
                                    } else {
                                        console.log("EnyaFHE: Passed Test7")
                                    }
                                })
                                

                            })
                        } else { if (json.API_result_ready == false) {
                            console.log("EnyaFHE: Calculation still in progress") 
                        } else { console.log("EnyaFHE: Error: ", json.API_result_ready, "Failed Test3"); return;}}
                    })
                });
            } else { console.log(json); console.log("EnyaFHE: Failed to send encryption keys. Failed Test3"); return; }
        });
}

Test()