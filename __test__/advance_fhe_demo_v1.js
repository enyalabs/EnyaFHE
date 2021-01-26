/*not checked JTL*/

/* import main js */
var EnyaFHE = require("../index");

/* Configure */
EnyaFHE.Configure({
    CLIENT_TOKEN: "f7edB8a8A4D7dff85d2CB7E5",
    algo_name: "sample_algo"
})

console.time("key gen");

/* Generate private key */
var privatekey = EnyaFHE.PrivateKeyGen();

/* Generate public key */
var publickey = EnyaFHE.PublicKeyGen();

/* Generate multi key */
var multikey = EnyaFHE.MultiKeyGen();

/* Generate rotation key */
var rotakey = EnyaFHE.RotaKeyGen();
console.timeEnd("key gen");

/* Pack the weight */
console.time("Encrypt a number");
var weights = [170, 10, 20, 30, 0, 0, 0, 0];
var plaintext = EnyaFHE.PackVector(weights);

/* Encrypt the plaintext */

var ciphertext = EnyaFHE.EncryptVector(
    plaintext,
    publickey
);

console.timeEnd("Encrypt a number");

var jsonpayload = EnyaFHE.JSONPayload(
    publickey,
    multikey,
    rotakey,
    ciphertext
);

/* 
Each individual should have a different
calculation id
 */
var string_pcr = EnyaFHE.RandomPCR();
console.log("Random PCR: ", string_pcr)

EnyaFHE.SendData({ pcr: string_pcr, data: jsonpayload })
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        if (json.status == true) {
            console.log("Sent encryption keys.")
            EnyaFHE.sleep(8000).then(function(){
            EnyaFHE.CheckStatus({ pcr: string_pcr })
                .then(function(response) {
                    return response.json();
                })
                .then(function(json) {
                    if (json.API_result_ready == true) {
                        console.log("The calculation was finished.");
                        console.log("Start to retrieve encrypted result.");
                        EnyaFHE.GetResult({pcr: string_pcr})
                        .then(function(response){
                            return response.json()
                        })
                        .then(function(json){
                            console.log("Start to decrypt the ciphertext.")
                            var ciphertext = EnyaFHE.ReadCiphertext(json.ciphertext);
                            var text = EnyaFHE.DecryptVector(ciphertext)
                            console.log("The calculation result is: ");
                            console.log(text[0]);
                        })
                    } else { if (json.API_result_ready == false) {
                        throw new Error("The calculation is still in progress") 
                    } else { throw new Error("Error: ", json.API_result_ready) }}
                })
            });
        } else { throw new Error("Failed to send encryption keys. Failed Test3"); }
    });