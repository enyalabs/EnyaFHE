var EnyaFHE = require("../index");
var bignum = require("bignumber.js");
var Decrypt = require("../dist/encryption/Decrypt");

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
console.log(text);