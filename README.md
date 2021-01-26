# EnyaFHE

EnyaFHE provides an API and SDK for using **Fully Homomorphic Encryption (FHE)** in your app. With FHE, you can privately compute on sensitive data. This means that, depending on how you set things up, only the data source (e.g. the consumer) can see the results of the computation. Use cases include secure surveys and financial products.

# Support

For more information and support, please visit [**www.enya.ai**](https://www.enya.ai) or contact [**support@enya.ai**](mailto:support@enya.ai).

# Tests

*Simple FHE demo* This computes the inner product of a vector (`[170, 10, 20, 30, 0, 0, 0, 0]`) with another vector (as configured in `sample_algo`). The `sample_algo` has been preconfigured to be `[5,1000,500,100000,100000,50000,50000]`.

```
$ node ./__test__/simple_fhe_demo.js
```

This should return return `{ status_code: 200, secure_result: 3020850 }`, since (170*5)+(10*1000)+(20*500)+(30*100000) = 3020850.

*__test__.js* This is a more comprehensive test suite that looks at basic encryption (Test 1), basic decryption (Test 2), the full API (Test 3), and the full API as accessed via a wrapper function (Test 4).

```
$ node ./__test__/__test__.js
```

This will perform the four tests and give timing data.