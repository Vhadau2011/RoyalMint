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

    // Group commands by category
    const categories = {};

    for (const cmd of commands.values()) {
      const category = cmd.category || "Other";
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd.data.name);
    }

    let description = "";

    for (const [category, cmds] of Object.entries(categories)) {
      let lockNote = "";

      if (category === "Gambling") {
        lockNote = " *(🎰 Gambling Channel Only)*";
      } else if (category === "Economy") {
        lockNote = " *(💰 Economy Rules Apply)*";
      }

      description +=
        `\n**📂 ${category}${lockNote}**\n` +
        cmds.map(c => `• \`/${c}\``).join("\n") +
        "\n";
    }

    const embed = new EmbedBuilder()
      .setTitle("👑 RoyalMint • Command Menu")
      .setDescription(description)
      .setColor("#A855F7")
      .setFooter({
        text: "RoyalMint • Economy & Gambling protected | General commands everywhere"
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
