import requests
import yaml
import sys
import argparse

def list_algorithms(secret_token):
    
    #HARDCODE THIS TO PRODUCTION ENDPOINT
    url = 'https://api-fhe.enya.ai'

    # string formatting
    CRED, CBLUE, CEND = '\033[91m', '\33[34m', '\033[0m'

    re = requests.get(
        url + '/api/compute/listalgos', 
        headers={'Authorization': 'Basic ' + secret_token}
    )

    if re.status_code == 404:
        print(CRED + """
==================== ERROR ====================
{}
===============================================
        """.format(re.text) + CEND)
    else:
        print(CBLUE + "\n{:<22} | {:<9} | {:<9} | {:<15}".format("********* id *********", "algo_type", "algo_name", "coefficients") + CEND)
        print(CBLUE + "-----------------------------------------------------------------------" + CEND)
        for row in re.json():
            print("{:<22} | {:<9} | {:<9} | {:<15}".format(row['id'], row['algo_type'], row['algo_name'], row['coefficients']))
        print(CBLUE + "-----------------------------------------------------------------------" + CEND + '\n')

def parse_args():

    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--master_token", help='Your master access token', required=True)

    return parser.parse_args()

# main function
if __name__ == '__main__':
    args = parse_args()
    list_algorithms(secret_token=args.master_token)
