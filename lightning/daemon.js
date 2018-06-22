const {lightningDaemon} = require('ln-service');
const {subscribeToInvoices} = require('ln-service');

let daemon;
const {LNSL_LND_CERT} = process.env;
const {LNSL_LND_MACAROON} = process.env;
const {LNSL_LND_RPC_HOST} = process.env;

/** Get Lightning daemon connection

  {}

  @throws
  <Error> when necessary environment variables are missing;

  @returns
  <Lightning Daemon Object>
*/
module.exports = ({}) => {
  // Exit early when LND connection is cached
  if (!!daemon && daemon.lnd) {
    return daemon.lnd;
  }

  if (!LNSL_LND_CERT) {
    throw new Error('MissingLndCertEnvironmentVariable');
  }

  if (!LNSL_LND_MACAROON) {
    throw new Error('MissingLndMacaroonEnvironmentVariable');
  }

  if (!LNSL_LND_RPC_HOST) {
    throw new Error('MissingLndRpcHostEnvironmentVariable');
  }

  const lnd = lightningDaemon({
    cert: LNSL_LND_CERT,
    host: LNSL_LND_RPC_HOST,
    macaroon: LNSL_LND_MACAROON,
  });

  const sub = subscribeToInvoices({lnd});

  daemon = {lnd, sub};

  // Clear daemon cache on errors or end of subscription
  daemon.sub.on('end', () => daemon = null);
  daemon.sub.on('error', ({}) => daemon = null);

  return lnd;
};

