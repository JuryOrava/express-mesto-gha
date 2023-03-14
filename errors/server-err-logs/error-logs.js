const fs = require('fs');

module.exports.writeTextToFile = (filename, text) => {
  fs.writeFileSync(
    filename,
    text,
  );
};
