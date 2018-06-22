# Lightning Satoshi's Place Conway Game of Life

An implementation of streaming game of life turns to the satoshis place grid.

## Install

Configure environment variables

    export GRPC_SSL_CIPHER_SUITES="HIGH+ECDSA"
    export LNSL_LND_CERT="base64 lnd tls cert"
    export LNSL_LND_MACAROON="base64 lnd admin macaroon"
    export LNSL_LND_RPC_HOST="lnd ip/domain:rpc-port"

Start service

    $ npm install
    $ npm start

