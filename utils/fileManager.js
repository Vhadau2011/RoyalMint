const fs = require("fs");

function readJSON(path) {
  try {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (err) {
    console.error(`❌ Failed to read ${path}`, err);
    return {};
  }
}

function writeJSON(path, data) {
  try {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ Failed to write ${path}`, err);
  }
}

module.exports = {
  readJSON,
  writeJSON
};
