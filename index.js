var KeyGen = require("./dist/encryption/KeyGen");
var Encrypt = require("./dist/encryption/Encrypt");
var Decrypt = require("./dist/encryption/Decrypt");
var APICall = require("./dist/requests/API");
var FHEMath = require("./dist/math/FHEMath");
var EvalSub = require("./dist/eval/EvalSub");

class EnyaFHE {
    /**
     * 
     * Configure the token and algorithm name.
     * 
     * @param {dic} input 
     */
    Configure(input){
        this.Access_token = input["CLIENT_TOKEN"];
        this.Algorithm_name = input["algo_name"];
    }
    /**
     * 
     * Set the token.
     * 
     * @param {String} input
     */
    set Access_token(input) {
        this.token = input;
    }
    /**
     * 
     * Set the algorithm name.
     * 
     * @param {String} input
     */
    set Algorithm_name(input) {
        this.name = input;
    }
    /**
     * 
     * Set a global private key
     * 
     * @param {String} input
     */
    set GlobalPrivatekey(input){
        this.privatekey = input;
    }
    /**
     *
     * Generate a private key.
     *
     * @returns {[bignum(),...]}
     */
    PrivateKeyGen(seed = FHEMath.PRNG()) {
        var privatekey = KeyGen.PrivateKey(seed);
        this.GlobalPrivatekey = privatekey;
        return privatekey;
        
    }
    /**
     *
     * Generate a public key. It returns two parts
     * of the public key.
     *
     * @returns {[[bignum(),...],[bignum(),...],...]}
     * private key
     */
    PublicKeyGen(privatekey = this.privatekey) {
        if (privatekey == undefined) {
            throw new Error("EnyaFHE: No private key found.");
        }
        return KeyGen.PublicKey(privatekey);
    }
    /**
     *
     * Generate a multiplication key. It returns two parts
     * of the multiplication key.
     *
     * @returns {[[bignum(),...],[bignum(),...],...]}
     * multiplication key
     */
    MultiKeyGen(privatekey = this.privatekey) {
        if (privatekey == undefined) {
            throw new Error("EnyaFHE: No private key found.");
        }
        return KeyGen.MultKey(privatekey);
    }
    /**
     *
     * Generate a rotation key. It returns two parts
     * of the rotation key.
     *
     * @returns {[[bignum(),...],[bignum(),...],...]}
     * rotation key
     */
    RotaKeyGen(privatekey = this.privatekey) {
        if (privatekey == undefined) {
            throw new Error("EnyaFHE: No private key found.");
        }
        return KeyGen.RotaKey(privatekey);
    }
    /**
     *
     * RN version
     * Generate a private key.
     *
     */
    async PrivateKeyGenRN(seed = FHEMath.PRNG()) {
        var privatekey = await KeyGen.PrivateKeyRN(seed);
        this.GlobalPrivatekey = privatekey;
        return privatekey;
    }
    /**
     *
     * RN version
     * Generate a public key. It returns two parts
     * of the publick key.
     *
     * @returns {[[bignum(),...],[bignum(),...],...]}
     * private key
     */
    async PublicKeyGenRN(privatekey = this.privatekey) {
        if (privatekey == undefined) {
            throw new Error("EnyaFHE: No private key found.");
        }
        return await KeyGen.PublicKeyRN(privatekey);
    }
    /**
     *
     * RN version
     * Generate a multiplication key. It returns two parts
     * of the multiplication key.
     *
     * @returns {[[bignum(),...],[bignum(),...],...]}
     * multiplication key
     */
    async MultiKeyGenRN(privatekey = this.privatekey) {
        if (privatekey == undefined) {
            throw new Error("EnyaFHE: No private key found.");
        }
        return await KeyGen.MultKeyRN(privatekey);
    }
    /**
     *
     * RN version
     * Generate a rotation key. It returns two parts
     * of the rotation key.
     *
     * @returns {[[bignum(),...],[bignum(),...],...]}
     * rotation key
     */
    async RotaKeyGenRN(privatekey = this.privatekey) {
        if (privatekey == undefined) {
            throw new Error("EnyaFHE: No private key found.");
        }
        return await KeyGen.RotaKeyRN(privatekey);
    }
    /**
     *
     * Generate the plaintext.
     *
     * @param {Array} vector
     *
     * @returns {[[bignum(),...],[bignum(),...]]}
     */
    PackVector(vector) {
        return Encrypt.VectorPacked(vector);
    }
    /**
     *
     * Encrypt the plaintext.
     *
     * @param {[bignum(),...]} plaintext
     * @param {[bignum(),...]} p1 publickey_part1
     * @param {[bignum(),...]} p2 publickey_part2
     *
     * @returns {[bignum(),...]}
     */
    EncryptVector(plaintext, publickey) {
        return Encrypt.VectorEncrypt(plaintext, publickey);
    }
    /**
     *
     * Minus the ciphertext.
     *
     * @param {[bignum(),...]} plaintext
     * @param {[bignum(),...]} p1 publickey_part1
     * @param {[bignum(),...]} p2 publickey_part2
     *
     * @returns {[bignum(),...]}
     */
    EncryptSub(ciphertext1, ciphertext2) {
        return EvalSub.EvalSub(ciphertext1, ciphertext2);
    }
    /**
     *
     * Read the ciphertext.
     *
     * @param {[string,...]} c0 ciphertext_part1
     * @param {[string,...]} c1 ciphertext_part2
     *
     * @returns {[[bignum(),...], [bignum(),...]]}
     */
    ReadCiphertext(ciphertext) {
        return Decrypt.ReadCiphertext(ciphertext);
    }
    /**
     *
     * Decrypt the ciphertext.
     *
     * @param {[bignum(),...]} c0
     * @param {[bignum(),...]} c1
     * @param {[bignum(),...]} privatekey
     *
     * @returns {Array} result
     */
    DecryptVector(ciphertext, privatekey = this.privatekey) {
        if (privatekey == undefined) {
            throw new Error("EnyaFHE: No private key found.");
        }
        return Decrypt.DecryptVector(ciphertext, privatekey);
    }
    /**
     *
     * @param {[bignum(),...]} publickey_part1
     * @param {[bignum(),...]} publickey_part2
     * @param {[bignum(),...]} ciphertext_part1
     * @param {[bignum(),...]} ciphertext_part2
     * @param {[bignum(),...]} multikey_part1
     * @param {[bignum(),...]} multikey_part2
     * @param {[bignum(),...]} rotakey_part1
     * @param {[bignum(),...]} rotakey_part2
     */
    JSONPayload(
        publickey,
        multikey,
        rotakey,
        ciphertext
    ) {
        /* Token and AlgorithnName checking */
        if (this.token == undefined) {
            throw new Error("EnyaFHE: Token does not exist!");
        }
        if (this.name == undefined) {
            throw new Error("EnyaFHE: Algorithm name does not exist!");
        }
        return APICall.JSONPayload(
            publickey,
            multikey,
            rotakey,
            ciphertext,
            this.token,
            this.name
        );
    }
    /**
     *
     * Generate random pcr name
     *
     */
    RandomPCR() {
        return APICall.RandomPCR();
    }
    /**
     *
     * Send encrypted ciphertext and keys
     * to the server.
     *
     * @param {JSON} json_table
     * @param {String} token
     */
    async SendData(json_table) {
        /* Token and AlgorithmName checking */
        if (this.token == undefined) {
            throw new Error("EnyaFHE: Token does not exist!");
        }
        if (this.name == undefined) {
            throw new Error("EnyaFHE: Algorithm name does not exist!");
        }
        return await APICall.SendData(json_table, this.token);
    }
    /**
     *
     * Check whether the computation is
     * finished.
     *
     * @param {JSON} json_table
     * @param {String} token
     */
    async CheckStatus(json_table) {
        /* Token and AlgorithmName checking */
        if (this.token == undefined) {
            throw new Error("EnyaFHE: Token does not exist!");
        }
        if (this.name == undefined) {
            throw new Error("EnyaFHE: Algorithm name does not exist!");
        }
        return await APICall.CheckStatus(json_table, this.token);
    }
    /**
     *
     * Get the computation result back.
     *
     * @param {JSON} json_table
     * @param {String} token
     */
    async GetResult(json_table) {
        /* Token and AlgorithmName checking */
        if (this.token == undefined) {
            throw new Error("EnyaFHE: Token does not exist!");
        }
        if (this.name == undefined) {
            throw new Error("EnyaFHE: Algorithm name does not exist!");
        }
        return await APICall.GetResult(json_table, this.token);
    }
    /**
     *
     * Sleep function.
     *
     * @param {Number} millis
     */
    sleep(millis) {
        return new Promise(resolve => setTimeout(resolve, millis));
    }
    /**
     *
     * Simpler version. Before using FHE([Array]), call
     * configure() first and set a token and algorithm name.
     *
     * @param {String} token
     * @param {String} name
     * @param {Array} weights
     */
    async FHE(weights) {
        /* Token and AlgorithnName checking */
        if (this.token == undefined) {
            throw new Error("EnyaFHE: Token does not exist!");
        }
        if (this.name == undefined) {
            throw new Error("EnyaFHE: Algorithm name does not exist!");
        }
        /* Env check */
        if (
            typeof navigator != "undefined" &&
            navigator.product == "ReactNative"
        ) {
            /* React Native Env */
            /* Generate a private key */
            var privatekey = await this.PrivateKeyGenRN();
            console.log("EnyaFHE: Generated the private key.");
            /* Generate a public key */
            var publickey = await this.PublicKeyGenRN(privatekey);
            console.log("EnyaFHE: Generated the public key.");
            /* Generate a multiplication key */
            var multikey = await this.MultiKeyGenRN(privatekey);
            console.log("EnyaFHE: Generated the multiplication key.");
            /* Generate a rotation key */
            var rotakey = await this.RotaKeyGenRN(privatekey);
            console.log("EnyaFHE: Generated the rotation key.");
        } else {
            /* nodejs Env */
            /* Generate a private key */
            privatekey = this.PrivateKeyGen();
            /* Generate a public key */
            publickey = this.PublicKeyGen(privatekey);
            /* Generate a multiplication key */
            multikey = this.MultiKeyGen(privatekey);
            /* Generate a rotation key */
            rotakey = this.RotaKeyGen(privatekey);
        }
        /* Packed the weight */
        var ptxt = this.PackVector(weights);
        /* Encrypt the plaintext */
        var ciphertext = this.EncryptVector(
            ptxt,
            publickey
        );
        console.log("EnyaFHE: Finished Generating keys.");
        /* Generate the payload */
        var jsonpayload = this.JSONPayload(
            publickey,
            multikey,
            rotakey,
            ciphertext
        );
        /* Generate the random name */
        var string_pcr = this.RandomPCR();
        console.log("EnyaFHE: Unique compute ID", string_pcr);
        /* Send the payload to the server */
        const senddata = await this.SendData(
            { pcr: string_pcr, data: jsonpayload }
        );
        const return_messgae = await senddata.json();
        if (return_messgae.status == true) {
            console.log("EnyaFHE: Sent encryption keys.");
        } else {
            return { status_code: 400 , error: "EnyaFHE: Unable to send keys." };
        }
        var status = false;
        var count = 0;
        while ((status == false) & (count < 5)) {
            await this.sleep(1000);
            /* Check the status of calculation */
            const checkstatus = await this.CheckStatus(
                { pcr: string_pcr}
            );
            const return_message = await checkstatus.json();
            status = return_message.API_result_ready;
            count = count + 1;
        }
        if (status == true) {
            console.log("EnyaFHE: The calculation has finished.");
            console.log("EnyaFHE: Starting to retrieve encrypted result.");
        } else {
            return { status_code: 204 , error: "EnyaFHE: Still computing..." };
        }
        /* Retrieve the calculation result */
        const getresult = await this.GetResult({ pcr: string_pcr });
        const cipher_result = await getresult.json();
        console.log("EnyaFHE: Starting to decrypt the ciphertext.");
        ciphertext = this.ReadCiphertext(cipher_result.ciphertext);
        var text = this.DecryptVector(ciphertext);
        return { status_code: 200, secure_result: text[0] };
    }
}

module.exports = new EnyaFHE();
