const {SlashCommandBuilder} = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Replies with World!'),
  async execute(interaction) {
    console.log('test')
    await interaction.reply('World')
  }
}