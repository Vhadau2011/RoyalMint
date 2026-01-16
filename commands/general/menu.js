
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  category: "General",

  data: new SlashCommandBuilder()
    .setName("menu")
    .setDescription("View all RoyalMint commands"),

  async execute(interaction) {
    const commands = interaction.client.commands;

    if (!commands || commands.size === 0) {
      return interaction.reply({
        content: "❌ No commands loaded.",
        ephemeral: true
      });
    }

    // Group slash commands by category
    const categories = {};

    for (const cmd of commands.values()) {
      const category = cmd.category || "Other";
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd.data.name);
    }

    let description = "";

    for (const [category, cmds] of Object.entries(categories)) {
      let note = "";

      if (category === "Gambling") {
        note = " *(🎰 Gambling Channel • ENV Locked)*";
      } else if (category === "Economy") {
        note = " *(💰 Economy System)*";
      } else if (category === "General") {
        note = " *(🌐 Global)*";
      }

      description +=
        `\n**📂 ${category}${note}**\n` +
        cmds.map(c => `• \`/${c}\``).join("\n") +
        "\n";
    }

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Command Menu")
      .setColor("#A855F7")
      .setDescription(description)
      .setFooter({
        text: "Message commands use PREFIX from .env | Gambling is channel-locked"
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
