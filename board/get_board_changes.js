const GameOfLife = require('game-of-life-logic');
const {PNG} = require('pngjs');

const whitePixelValue = 'ffffffff';

/** Get board changes given the current grid

  {
    height: <Game Board Height Number>
    pixel_data: <Pixel Data Base 64 Encoded String>
    width: <Game Board Width Number>
  }

  @returns via cbk
  {
    changes: [{
      color: <Color Value String>
      coordinates: [<X Coordinate Number>, <Y Coordinate Number>]
    }]
  }
*/
module.exports = (args, cbk) => {
  if (!args.height) {
    return cbk([400, 'ExpectedGameHeight']);
  }

  if (!args.pixel_data) {
    return cbk([400, 'ExpectedPixelData']);
  }

  if (!args.width) {
    return cbk([400, 'ExpectedGameWidth']);
  }

  const image = Buffer.from(args.pixel_data, 'base64');

  new PNG({}).parse(image, (err, board) => {
    if (!!err) {
      return cbk([500, 'FailedToParseBoard', err]);
    }

    const changes = [];
    const current = [];
    const heightLimit = args.height;
    const map = [];
    const pixels = board.data.toString('hex').match(/.{1,8}/g);
    const widthLimit = args.width;

    // Assign pixels to 2 dimensional array
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        map[y] = map[y] || [];

        map[y][x] = pixels[x + y * board.width];
      }
    }

    // Crop the board to the section we care about
    const crop = map.slice(0, widthLimit);

    for (let i = 0; i < crop.length; i++) {
      crop[i] = crop[i].slice(0, heightLimit);

      crop[i].forEach((pixel, x) => {
        current[i] = current[i] || [];

        current[i][x] = pixel !== whitePixelValue ? 1 : 0;
      });
    }

    // Map the current grid into the next iteration of a game of life
    const gameOfLife = new GameOfLife(widthLimit, heightLimit);

    gameOfLife.matrix = current;

    gameOfLife.tick();

    // Map the iteration into required changes
    gameOfLife.matrix.forEach((row, y) => {
      row.forEach((isOn, x) => {
        if (current[y][x] === isOn) {
          return;
        }

        changes.push({
          color: isOn ? '#222222' : '#ffffff',
          coordinates: [x, y],
        });
      });

      return;
    });

    return cbk(null, {changes});
  });
};

