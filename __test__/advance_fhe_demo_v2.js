/* import main js */
var EnyaFHE = require("../index");

EnyaFHE.Configure({
    CLIENT_TOKEN: "f7edB8a8A4D7dff85d2CB7E5",
    algo_name: "sample_algo"
})

async function demo(){
    /* Generate private key */
    var privatekey = EnyaFHE.PrivateKeyGen()
    console.log("Generated private key.")

    /* Generate public key */
    var publickey = EnyaFHE.PublicKeyGen()
    console.log("Generated public key.")

    /* Generate multi key */
    var multikey = EnyaFHE.MultiKeyGen(privatekey);
    console.log("Generated multiplication key.")

    /* Generate rotation key */
    var rotakey = EnyaFHE.RotaKeyGen(privatekey);
    console.log("Generated rotation key.")
    console.log("Finished key generation!")

    /* Pack the weight */
    var plaintext = EnyaFHE.PackVector([170, 10, 20, 30, 0, 0, 0, 0]);
        
    /* Encrypt the plaintext */
    var ciphertext= EnyaFHE.EncryptVector(plaintext, publickey);

    /* Create JSON payload */
    var jsonpayload = EnyaFHE.JSONPayload(
        publickey,
        multikey,
        rotakey,
        ciphertext
    );

    /* Random String */
    var string_pcr = EnyaFHE.RandomPCR();
    console.log("Random PCR:", string_pcr)

    /* Send the payload to the server */
    var senddata = await EnyaFHE.SendData({ pcr: string_pcr, data: jsonpayload })
    const return_messgae = await senddata.json();
    if (return_messgae.status == true) { 
        console.log("Sent encryption keys.");

        var status = false;
        var count = 0;
        while ((status == false) & (count < 5)) {
            await EnyaFHE.sleep(1000);
            /* Check the status of calculation */
            const checkstatus = await EnyaFHE.CheckStatus(
                { pcr: string_pcr, data: jsonpayload },
            );
            const return_message = await checkstatus.json();
            status = return_message.API_result_ready;
            count = count + 1;
        }
        if (status == true) {
            console.log("The calculation has finished.");
            console.log("Starting to retrieve the encrypted result.");
            /* Retrieve the calculation result */
            var getresult = await EnyaFHE.GetResult({pcr: string_pcr});
            const cipher_result = await getresult.json();

            console.log("Starting to decrypt the ciphertext.");
            var ciphertext = EnyaFHE.ReadCiphertext(cipher_result.ciphertext);
            var text = EnyaFHE.DecryptVector(ciphertext)[0];
            console.log(text)
        } else {
            /* Computation failed */
            if (__DEV__) console.log("Error: ", status);
            dispatch( secureComputeProgress({ 
                SMC_compute_progress: 0,
                SMC_computing: false 
            }));
        }
    }
}

demo()