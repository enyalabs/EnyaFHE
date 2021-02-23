import requests
import yaml
import argparse
import json
import sys

def define_algorithm(secret_token, algo_name, algo_type, coefficient):
    
    import re

    url = 'https://api-fhe.enya.ai'

    # table string formatting
    CRED, CBLUE, CEND = '\033[91m', '\33[34m', '\033[0m'

    #check name here - type string and max_length < something 
    if len(algo_name) > 20: return CRED + """
==================== ERROR ======================
Please shorten your name to fewer than 20 characters.
=================================================
        """ + CEND

    #check coefficient entry here - is is an array with numbers?
    regex = "\s*\[(\s*[+-]?([0-9]*[.])?[0-9]+[\s]*[,]?[\s]?)+\]\s*"
    
    pattern = re.compile(regex)
    
    validCoefficient = bool(pattern.match(coefficient))
    
    if validCoefficient == False:
        print('Incorrect coefficient string - try again')
        return

    re = requests.post(
        url + '/api/compute/addalgo', 
        headers={'Authorization': 'Basic ' + secret_token},
        json={'algo_name': algo_name, 'algo_type': algo_type, 'coefficients': coefficient}
    )

    if re.status_code == 404:
        print(CRED + """
==================== ERROR ====================
ENDPOINT UP BUT SYNTAX OR OTHER ERROR
===============================================
        """.format(re.text) + CEND)
    elif re.status_code == 401:
        print(CRED + """
==================== ERROR ====================
UNAUTHORIZED
===============================================
        """.format(re.text) + CEND)
    else:
        print(re.text)

def parse_args():

    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--master_token", help='Your master access token', required=True)
    parser.add_argument("-n", "--algo_name", help="Algorithm name (e.g. 'test_1')", required=True)
    parser.add_argument("-t", "--algo_type", help="Algorithm type ('smc' or 'fhe')", required=True)
    parser.add_argument("-c", "--coefficient", help="Coefficients of your linear model (e.g. '[0.3, 2, -6.1]')", required=True)

    return parser.parse_args()

if __name__ == '__main__':

    args = parse_args()
    define_algorithm(secret_token=args.master_token,algo_name=args.algo_name, algo_type=args.algo_type, coefficient=args.coefficient)
