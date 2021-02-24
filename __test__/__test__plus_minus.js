var EnyaFHE = require("../index");
var bignum = require("bignumber.js");
var EvalSub = require("../core/eval/EvalSub")
var EvalAdd = require("../core/eval/EvalAdd")

function Test() {

  console.time("EnyaFHE: key generation");
  var privatekey = EnyaFHE.PrivateKeyGen();

  /* Generate public key */
  var publickey = EnyaFHE.PublicKeyGen();

  /* Generate multi key */
  var multikey = EnyaFHE.MultiKeyGen();

  /* Generate rotation key */
  var rotakey = EnyaFHE.RotaKeyGen();
  console.timeEnd("EnyaFHE: key generation");

  /* Pack the weight */
  console.time("EnyaFHE: Encrypting two vectors");
  var weights1 = [2, 30, 100];
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
  console.timeEnd("EnyaFHE: Encrypting two vectors");

  /* Subtract the two encrypted vectors */
  console.time("EnyaFHE: Running Calculation: Adding and Subtracting the two encrypted vectors");

  var ciphertextSub = EvalSub.EvalSub(ciphertext1, ciphertext2)
  var ciphertextAdd = EvalAdd.EvalAdd(ciphertext1, ciphertext2)
  console.timeEnd("EnyaFHE: Running Calculation: Adding and Subtracting the two encrypted vectors");

  /* Decrypt the ciphertext */
  console.time("EnyaFHE: Decrypting the result");
  
  var resultArraySub = EnyaFHE.DecryptVector(
      EnyaFHE.ReadCiphertext(ciphertextSub)
  );
  var resultArrayAdd = EnyaFHE.DecryptVector(
      EnyaFHE.ReadCiphertext(ciphertextAdd)
  );
  console.timeEnd("EnyaFHE: Decrypting the result");

  console.log("Result Sub correct: [7, 3030, 300]");
  console.log("Result Sub actual :",resultArraySub.slice(0,3));
  console.log("Result Add correct: [-3, -2970, -100]");
  console.log("Result Add actual :",resultArrayAdd.slice(0,3));
}

Test()