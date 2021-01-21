/* For test purpose */
var EnyaFHE = require("../index");
var bignum = require("bignumber.js");
var Decrypt = require("../dist/encryption/Decrypt");
var EvalSub = require("../core/eval/EvalSub");
var EvalAdd = require("../core/eval/EvalAdd");

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
  var weights1 = [100, 200, 300, 400, 500];
  var ptxt1 = EnyaFHE.PackVector(weights1);

  /* Encrypt the plaintext */
  var ciphertext1 = EnyaFHE.EncryptVector(
      ptxt1,
      publickey
  );
  var weights2 = [100, -200, 300, 400, 500];
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

  if (text.slice(0,5) === [200, 400, 600, 800, 10000]) {
      throw new Error("EnyaFHE: Test4 failed!");
  } else {
      console.log("EnyaFHE: Passed the Test4");
  }
}

Test()