/*not checked JTL*/

var EnyaFHE = require("../index");
var bignum = require("bignumber.js");
var Decrypt = require("../dist/encryption/Decrypt");

/* Generate private key */
console.time("EnyaFHE: key generation");
var privatekey = EnyaFHE.PrivateKeyGen();
    
/* Generate public key */
var publickey = EnyaFHE.PublicKeyGen();

/* Generate multiplication key */
var multikey = EnyaFHE.MultiKeyGen();

/* Generate rotation key */
var rotakey = EnyaFHE.RotaKeyGen();
console.timeEnd("EnyaFHE: key generation");

/* Specify a number with a decimal point, in this case, 17.5 */
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

// ReadCiphertext()
const ciphertext_bignumber = EnyaFHE.ReadCiphertext(ciphertext);
console.log(ciphertext_bignumber);

// DecryptVector()
const text2 = EnyaFHE.DecryptVector(ciphertext_bignumber);
console.log(text2);