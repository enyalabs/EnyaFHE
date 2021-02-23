/* For testing */
var EnyaFHE = require("../index");
var bignum = require("bignumber.js");
var Decrypt = require("../core/encryption/Decrypt");

function Test() {

    /* Configure */
    EnyaFHE.Configure({
        CLIENT_TOKEN: "f7edB8a8A4D7dff85d2CB7E5",
        algo_name: "sample_algo"
    })

    console.log("\nEnyaFHE: ------- Test1 ----------");
    console.log("EnyaFHE: -- EnyaFHE Encryption --")
    console.log("EnyaFHE: ----- Local Test -------")
    
    /* Generate private key */
    console.time("EnyaFHE: Key generation");
    var privatekey = EnyaFHE.PrivateKeyGen();
    
    /* Generate public key */
    var publickey = EnyaFHE.PublicKeyGen();

    /* Generate multi key */
    var multikey = EnyaFHE.MultiKeyGen();

    /* Generate rotation key */
    var rotakey = EnyaFHE.RotaKeyGen();
    console.timeEnd("EnyaFHE: Key generation");

    /* Pack the weight */
    console.time("EnyaFHE: Encrypt the number 170");
    var weights = [170];
    var ptxt = EnyaFHE.PackVector(weights);

    /* Encrypt the plaintext */
    var ciphertext = EnyaFHE.EncryptVector(
        ptxt,
        publickey
    );
    console.timeEnd("EnyaFHE: Encrypt the number 170");
    
    /* Decrypt the ciphertext */
    console.time("EnyaFHE: Decrypting");
    
    var text = EnyaFHE.DecryptVector(
        EnyaFHE.ReadCiphertext(ciphertext)
    );
    console.timeEnd("EnyaFHE: Decrypting");

    if (text[0] === weights[0]) {
        console.log("EnyaFHE: Passed Test1");
    } else {
        throw new Error("EnyaFHE: Test1 failed!");
    }

    console.log("\nEnyaFHE: ------- Test2 ----------");
    console.log("EnyaFHE: -- EnyaFHE Decryption --")
    console.log("EnyaFHE: ----- Local Test -------")
    
    /* Load demo data */
    var demo = require("./demo");
    console.time("EnyaFHE: Loading demo data and keys");
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
    console.timeEnd("EnyaFHE: Loading demo data and keys");
    
    /* Decrypt demo data*/
    console.time("EnyaFHE: Decrypting");
    text = Decrypt.DecryptVector(ciphertext, demo_privatekey);
    console.timeEnd("EnyaFHE: Decrypting");

    if (text[0] === 131785) {
        console.log("EnyaFHE: Passed Test2");
    } else {
        throw new Error("EnyaFHE: Test2 failed!");
    }

    /*
    Test3
    The whole process of FHE compuation.
    It allows you to add indicators during the calculation.
    */
    console.log("\nEnyaFHE: -------- Test3 --------");
    console.log("EnyaFHE: --- EnyaFHE API Test --")
    console.log("EnyaFHE: ------ Online Test ----")
    
    /* Generate private key */
    console.time("EnyaFHE: Key generation");
    var privatekey = EnyaFHE.PrivateKeyGen();

    /* Generate public key */
    var publickey = EnyaFHE.PublicKeyGen();

    /* Generate multi key */
    var multikey = EnyaFHE.MultiKeyGen();

    /* Generate rotation key */
    var rotakey = EnyaFHE.RotaKeyGen();
    console.timeEnd("EnyaFHE: Key generation");
    
    /* Pack the weight */
    console.time("EnyaFHE: Encrypting vector");
    var weights = [170, 10, 20, 30, 0, 0, 0, 0];
    var ptxt = EnyaFHE.PackVector(weights);

    /* Encrypt the plaintext */
    var ciphertext = EnyaFHE.EncryptVector(
        ptxt,
        publickey
    );
    console.timeEnd("EnyaFHE: Encrypting vector");
    
    var jsonpayload = EnyaFHE.JSONPayload(
        publickey,
        multikey,
        rotakey,
        ciphertext
    );

    var string_pcr = EnyaFHE.RandomPCR();
    console.log("EnyaFHE: Unique compute ID", string_pcr)

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
                                    throw new Error("EnyaFHE: Failed Test3")
                                } else {
                                    console.log("EnyaFHE: Passed Test3")
                                }

                                /* 
                                Test4
                                Uses the compact EnyaFHE.FHE() function.
                                */
                               
                               console.log("\nEnyaFHE: ------- Test4 ----------")
                               console.log("EnyaFHE: -- EnyaFHE.FHE() Test --")
                               console.log("EnyaFHE: ----- Online Test ------")
                               EnyaFHE.FHE([170, 10, 20, 30, 0, 0, 0, 0])
                                .then(function(res){
                                    if ( res.status_code == 200 ){
                                        console.log("EnyaFHE: Passed Test4\n")
                                    } else {
                                        throw new Error("EnyaFHE: Failed Test4\n")
                                    }
                                })
                                

                            })
                        } else { if (json.API_result_ready == false) {
                            console.log("EnyaFHE: The calculation is still in progress") 
                        } else { console.log("EnyaFHE: Error: ", json.API_result_ready, "Failed Test3"); return;}}
                    })
                });
            } else { console.log(json); console.log("EnyaFHE: Failed to send encryption keys. Failed Test3"); return; }
        });
}

Test()