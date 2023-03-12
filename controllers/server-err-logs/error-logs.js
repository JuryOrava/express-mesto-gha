const fs = require('fs');

module.exports.writeTextToFile = (filename, text) => {
  fs.writeFile(filename, text + "\r\n", function (err, res) {
      console.log(`fs.writeFile завершилась с таким результатом: ${res}`)
  })
}
