const {log} = console;

const io = require('socket.io-client');
const walnutCheck = require('walnut').check;

const {getBoardChanges} = require('./board');
const {payInvoice} = require('./lightning');

const gameHeight = 500;
const gameWidth = 500;
const gotInvoiceEvent = 'NEW_ORDER_RESULT';
const getLatestPixelsCmd = 'GET_LATEST_PIXELS';
const gotLatestPixelsEvent = 'GET_LATEST_PIXELS_RESULT';
const orderDelayMs = 1000 * 30;
const requestChangesInvoice = 'NEW_ORDER';
const testnetApiEndpoint = 'https://testnet-api.satoshis.place';

const socket = io(testnetApiEndpoint);

// Wait for connection to open before setting up event listeners
socket.on('connect', _ => {
  log('StartedSocketConnection');

  // Received latest pixels
  socket.on(gotLatestPixelsEvent, latestPixels => {
    if (!latestPixels) {
      return log([503, 'ExpectedLatestPixels']);
    }

    if (!latestPixels.data) {
      return log([503, 'ExpectedLatestPixelsData']);
    }

    const [,base64ImageData] = latestPixels.data.split(',');

    if (!base64ImageData) {
      return log([503, 'ExpectedBase64ImageData']);
    }

    return getBoardChanges({
      height: gameHeight,
      pixel_data: base64ImageData,
      width: gameWidth,
    },
    (err, order) => {
      if (!!err) {
        return log(err);
      }

      // Exit early when there are no changes to make
      if (!order.changes.length) {
        return setTimeout(() => socket.emit(getLatestPixelsCmd), orderDelayMs);
      }

      socket.emit(requestChangesInvoice, order.changes);

      return;
    });
  });

  // Received an invoice, always pay any & all invoices Lord Koala gives to us.
  socket.on(gotInvoiceEvent, newOrderResult => {
    if (!newOrderResult || !newOrderResult.data) {
      return log([503, 'ExpectedNewOrderResult', newOrderResult]);
    }

    const {paymentRequest} = newOrderResult.data;

    if (!paymentRequest) {
      return log([503, 'ExpectedPaymentRequest']);
    }

    return payInvoice({invoice: paymentRequest}, (err, res) => {
      // Delay for next turn, ignoring payment errors
      setTimeout(() => socket.emit(getLatestPixelsCmd), orderDelayMs);

      if (!!err) {
        return log(err);
      }

      log('GamePurchase', res.tokens);

      return;
    });
  });
});

// Listen for errors
socket.on('error', err => log([503, 'SocketIoError', err]));

// Start the game
socket.emit(getLatestPixelsCmd);

// Check dependencies
walnutCheck(require('./package'));

