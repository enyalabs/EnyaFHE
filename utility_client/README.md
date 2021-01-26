# Configure your own algorithm

**Please replace all instances of '5b745EDBb3f55ab7A12F9220' with your master token to configure**

The example master token will not work - functions will return:

```
$ python3 ./utility_client/algo_list.py -s '5b745EDBb3f55ab7A12F9220'

==================== ERROR ====================
UNAUTHORIZED
===============================================

```

* List your algorithm(s)

```bash
python3 algo_list.py -s [secret token]
```
for example,
```bash
python3 algo_list.py -s '5b745EDBb3f55ab7A12F9220'
```

If your token is correct, and you have configured algoerithms, you will see an output like
```
$ python3 algo_list.py -s '5b745EDBb3f55ab7A12F9220'

********* id ********* | algo_type | algo_name | coefficients
-----------------------------------------------------------------------
1581966903690-3ea6CAEB | fhe       | sample_algo | [5,1000,500,100000,100000,50000,50000]
1581970301891-dDFeDCb5 | smc       | sample_algo | [0.00005,0.01,0.005,1,1,0.5,0.5]
-----------------------------------------------------------------------
```

* Add your new algorithm. There are currently two algorithm types, 'smc' and 'fhe'.

```bash
python3 algo_add.py -s [secret token] -n [name] -t [type] -c [coefficients]
```
for example,
```bash
python3 algo_add.py -s '5b745EDBb3f55ab7A12F9220' -n 'test_8' -t 'fhe' -c '[0,1,9,4,1,6,0,123]'
```

The format of coefficients should follow `[int, int, int, int, int, ...]`.

* Delete your algorithm

```bash
python3 algo_delete.py -s [secret token] -i [algo_id]
```
for example, 
```bash
python3 algo_delete.py -s '5b745EDBb3f55ab7A12F9220' -i '1581966285575-52abd00f'
```
