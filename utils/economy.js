const path = require("path");
const { readJSON, writeJSON } = require("./fileManager");

const USERS_PATH = path.join(__dirname, "../data/users.json");

function getUser(userId) {
  const users = readJSON(USERS_PATH);

  if (!users[userId]) {
    users[userId] = { coins: 0, bank: 0 };
    writeJSON(USERS_PATH, users);
  }

  return users[userId];
}

function addCoins(userId, amount) {
  const users = readJSON(USERS_PATH);
  if (!users[userId]) users[userId] = { coins: 0, bank: 0 };
  users[userId].coins += amount;
  writeJSON(USERS_PATH, users);
}

function removeCoins(userId, amount) {
  const users = readJSON(USERS_PATH);
  if (!users[userId]) return false;
  if (users[userId].coins < amount) return false;
  users[userId].coins -= amount;
  writeJSON(USERS_PATH, users);
  return true;
}

function deposit(userId, amount) {
  const users = readJSON(USERS_PATH);
  if (!users[userId] || users[userId].coins < amount) return false;
  users[userId].coins -= amount;
  users[userId].bank += amount;
  writeJSON(USERS_PATH, users);
  return true;
}

function withdraw(userId, amount) {
  const users = readJSON(USERS_PATH);
  if (!users[userId] || users[userId].bank < amount) return false;
  users[userId].bank -= amount;
  users[userId].coins += amount;
  writeJSON(USERS_PATH, users);
  return true;
}

module.exports = {
  getUser,
  addCoins,
  removeCoins,
  deposit,
  withdraw
};
