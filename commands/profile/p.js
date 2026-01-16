const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../../data/users.json");

// ENV IDS
const OWNER_ID = process.env.OWNER_ID;
const MOD_IDS = process.env.GUARD_IDS?.split(",") || [];
const TESTER_ROLE_NAME = "Tester";

function loadUsers() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

function getUserRole(member) {
  if (member.id === OWNER_ID) return "👑 OWNER";
  if (MOD_IDS.includes(member.id)) return "🛡️ MOD";
  if (member.roles.cache.some(r => r.name === TESTER_ROLE_NAME)) return "🧪 TESTER";
  return "👤 USER";
}

module.exports = {
  name: "p",
  aliases: ["profile"],
  category: "Profile",

  async execute(message) {
    const target =
      message.mentions.members.first() || message.member;

    const users = loadUsers();

    if (!users[target.id]) {
      users[target.id] = {
        wallet: 5000,
        bank: 0
      };
      saveUsers(users);
    }

    const { wallet, bank } = users[target.id];
    const role = getUserRole(target);

    const embed = new EmbedBuilder()
      .setColor("#FFD700") // GOLD
      .setTitle("『 RE:ZERO PROFILE 』")
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(
        "```yaml\n" +
        `NAME   : ${target.user.tag}\n` +
        `ROLE   : ${role}\n` +
        "```\n" +
        "```fix\n" +
        `WALLET : ${wallet}\n` +
        `BANK   : ${bank}\n` +
        "```"
      )
      .setFooter({
        text: "RoyalMint • Re:Zero Profile System"
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
