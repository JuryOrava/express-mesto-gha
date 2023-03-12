const fs = require('fs');

module.exports.writeTextToFile = (filename, text) => {
  fs.writeFile(
    filename,
    text,
  );
};
