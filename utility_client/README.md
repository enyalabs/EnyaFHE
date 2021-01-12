# Configure your own algorithm

**Use your master token to configure**

* List your algorithm(s)

```bash
python3 algo_list.py -s [secret token]
```
for example,
```bash
python3 algo_list.py -s '5b745EDBb3f55ab7A12F9bf7'
```

* Add your new algorithm. There are currently two algorithm types, 'smc' and 'fhe'.

```bash
python3 algo_add.py -s [secret token] -n [name] -t [type] -c [coefficients]
```
for example,
```bash
python3 algo_add.py -s '5b745EDBb3f55ab7A12F9bf7' -n 'test_8' -t 'fhe' -c '[0,1,9,4,1,6,0,123]'
```

The format of coefficients should follow `[int, int, int, int, int, ...]`.

* Delete your algorithm

```bash
python3 algo_delete.py -s [secret token] -i [algo_id]
```
for example, 
```bash
python3 algo_delete.py -s '5b745EDBb3f55ab7A12F9bf7' -i '1581966285575-52abd00f'
```

