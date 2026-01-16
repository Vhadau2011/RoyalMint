module.exports = (client) => {

  client.once("ready", () => {
    console.log(`👑 RoyalMint is online as ${client.user.tag}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`❌ Error in command ${interaction.commandName}`, error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "❌ An error occurred while executing this command.",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "❌ An error occurred while executing this command.",
          ephemeral: true
        });
      }
    }
  });

};
