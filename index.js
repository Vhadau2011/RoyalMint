require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const PREFIX = process.env.PREFIX || ".";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== COLLECTIONS =====
client.slashCommands = new Collection();
client.prefixCommands = new Collection();

// ===== LOAD COMMANDS =====
const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

const slashCommandsJSON = [];

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs
    .readdirSync(folderPath)
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);

    // ===== SLASH COMMAND =====
    if (command.data && command.execute) {
      client.slashCommands.set(command.data.name, command);
      slashCommandsJSON.push(command.data.toJSON());
    }

    // ===== PREFIX COMMAND =====
    if (command.name && command.execute) {
      client.prefixCommands.set(command.name, command);

      if (command.aliases && Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          client.prefixCommands.set(alias, command);
        }
      }
    }
  }
}

// ===== REGISTER SLASH COMMANDS =====
client.once("ready", async () => {
  console.log(`👑 RoyalMint logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: slashCommandsJSON }
    );
    console.log("✅ Slash commands registered");
  } catch (err) {
    console.error("❌ Error registering slash commands:", err);
  }
});

// ===== HANDLE SLASH COMMANDS =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ An error occurred while executing this command.",
        ephemeral: true
      });
    }
  }
});

// ===== HANDLE PREFIX COMMANDS =====
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/\s+/);

  const commandName = args.shift().toLowerCase();

  const command = client.prefixCommands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("❌ An error occurred while executing this command.");
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
