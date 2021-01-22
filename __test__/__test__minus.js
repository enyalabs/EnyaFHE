/* For test purpose */
var EnyaFHE = require("../index");
var bignum = require("bignumber.js");

function Test() {

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
  var weights1 = [2, 30, 100];;
  var ptxt1 = EnyaFHE.PackVector(weights1);
  
  /* Encrypt the plaintext */
  var ciphertext1 = EnyaFHE.EncryptVector(
      ptxt1,
      publickey
  );
  var weights2 = [-5, -3000, -200];
  var ptxt2 = EnyaFHE.PackVector(weights2);

  /* Encrypt the plaintext */
  var ciphertext2 = EnyaFHE.EncryptVector(
      ptxt2,
      publickey
  );
 
  var ciphertext = EnyaFHE.EncryptSub(ciphertext1, ciphertext2)
  console.timeEnd("EnyaFHE: Encrypt two vectors");
  
  /* Decrypt the ciphertext */
  console.time("EnyaFHE: Decrypt");
  
  var text = EnyaFHE.DecryptVector(
      EnyaFHE.ReadCiphertext(ciphertext)
  );
  console.timeEnd("EnyaFHE: Decrypt");

  console.log(text);
}

Test()