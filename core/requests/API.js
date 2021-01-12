var fetch = require("node-fetch");
var src = require("../src/src");

class apicall {
    constructor() {
        this.url = "https://api-fhe.enya.ai/api/compute/";
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
        ciphertext,
        token_value,
        name_value
    ) {
        var Payload = {
            publickey_part1: [],
            publickey_part2: [],
            ciphertext_part1: [],
            ciphertext_part2: [],
            multikey_part1: [],
            multikey_part2: [],
            rotakey_part1: [],
            rotakey_part2: [],
            token: token_value,
            name: name_value
        };
        for (var i = 0; i < src.modulus.length; i++) {
            Payload["publickey_part1"].push(publickey[i].toString());
            Payload["publickey_part2"].push(publickey[i + 3].toString());
            Payload["ciphertext_part1"].push(ciphertext[i].toString());
            Payload["ciphertext_part2"].push(ciphertext[i + 3].toString());
        }
        for (i = 0; i < src.modulus.length * 3; i++) {
            Payload["multikey_part1"].push(multikey[i].toString());
            Payload["multikey_part2"].push(multikey[i + 9].toString());
            Payload["rotakey_part1"].push(rotakey[i].toString());
            Payload["rotakey_part2"].push(rotakey[i + 9].toString());
        }
        return Payload;
    }
    /**
     * 
     */
    RandomPCR() {
        return (
            Math.random()
                .toString(36)
                .substring(2, 15) +
            Math.random()
                .toString(36)
                .substring(2, 15)
        );
    }
    /**
     *
     * @param {JSON} input_json
     * @param {string} token
     */
    async SendData(input_json, token) {
        try {
            return await fetch(this.url + "payload", {
                method: "POST",
                headers: {
                    authorization: "Basic " + token,
                    "content-type": "application/json",
                    master: "false"
                },
                body: JSON.stringify(input_json)
            });
        } catch (error) {
            return error;
        }
    }
    /**
     *
     * @param {JSON} input_json
     * @param {String} token
     */
    async CheckStatus(input_json, token) {
        try {
            return await fetch(this.url + "status", {
                method: "POST",
                headers: {
                    authorization: "Basic " + token,
                    "content-type": "application/json",
                    master: "false"
                },
                body: JSON.stringify(input_json)
            });
        } catch (error) {
            return error;
        }
    }
    /**
     *
     * @param {JSON} input_json
     * @param {String} token
     */
    async GetResult(input_json, token) {
        try {
            return await fetch(this.url + "result", {
                method: "POST",
                headers: {
                    authorization: "Basic " + token,
                    "content-type": "application/json",
                    master: "false"
                },
                body: JSON.stringify(input_json)
            });
        } catch (error) {
            return error;
        }
    }
}

module.exports = new apicall();
