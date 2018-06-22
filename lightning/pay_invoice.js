const {payInvoice} = require('ln-service');

const daemon = require('./daemon');

/** Pay an invoice

  {
    invoice: <BOLT 11 Encoded Lightning Network Invoice String>
  }

  @returns via cbk
  {
    
  }
*/
module.exports = ({invoice}, cbk) => {
  if (!invoice) {
    return cbk([400, 'ExpectedInvoiceToPay']);
  }

  let lnd;

  try {
    lnd = daemon({});
  } catch (e) {
    return cbk([500, 'FailedToGetLightningDaemonForPayment', e]);
  }

  return payInvoice({invoice, lnd}, (err, res) => {
    if (!!err) {
      return cbk(err);
    }

    return cbk(null, {tokens: res.tokens});
  });
};

