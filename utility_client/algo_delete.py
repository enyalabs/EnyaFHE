import requests
import yaml
import argparse
import sys

def delete_algorithm(secret_token, algo_id):

    #HARDCODE THIS TO PRODUCTION ENDPOINT
    url = 'https://api-fhe.enya.ai'

    CRED, CBLUE, CEND = '\033[91m', '\33[34m', '\033[0m'

    re = requests.delete(
        url + '/api/compute/rmalgo', 
        headers={'Authorization': 'Basic ' + secret_token},
        json={'id': algo_id}
    )

    if re.status_code == 404:
        print(CRED + """
==================== ERROR ====================
{}
===============================================
        """.format(re.text) + CEND)
    else:
        print(re.text)
    

def parse_args():

    parser = argparse.ArgumentParser()

    parser.add_argument("-s", "--master_token", help='Your master access token', required=True)
    parser.add_argument("-i", "--algo_id", help="ID of algorithm to delete", required=True)

    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    delete_algorithm(secret_token=args.master_token,algo_id=args.algo_id)
