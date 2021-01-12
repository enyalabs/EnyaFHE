/* import main js */
var EnyaFHE = require("../index");

/* Configure */
EnyaFHE.Configure({
    CLIENT_TOKEN: "f7edB8a8A4D7dff85d2CB7E5",
    algo_name: "sample_algo"
})

/* Run the model */
EnyaFHE.FHE([170, 10, 20, 30, 0, 0, 0, 0])