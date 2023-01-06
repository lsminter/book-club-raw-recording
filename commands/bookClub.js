const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('book-club')
    .setDescription('Creates a new book club!')
    .addStringOption(op => 
      op.setName('book')
        .setDescription('The book the club is on.')
        .setRequired(true))
    .addIntegerOption(op => 
      op.setName('people')
        .setDescription('The number of people you want in your club.')
        .setRequired(true))
    .addIntegerOption(op => 
      op.setName('hours')
        .setDescription('In how many hours you want submissions closed.')
        .setRequired(true)),
  async execute(interaction) {
    const book = interaction.options.getString('book');
    const bookClubDate = book + ' Book Club ' + moment().format('MMM Do YYYY')

    const numOfPeople = interaction.options.getInteger('people');

    const hours = interaction.options.getInteger('hours');
    const waitTimeInSeconds = (hours * 60) * 60
    const today = new Date()
    const TodayUNIX = Math.floor(today.getTime() / 1000)
    const timeExpiresAt = TodayUNIX + waitTimeInSeconds

    const author = interaction.member.user.username

    const embedMessage = {
      title: `book club for ${book}.`,
      description: `${author} is going to run a book club on the book ${book}`,
      fields: [
        {
          name: 'Amount of people wanted',
          value: numOfPeople
        },
        {
          name: `Submission expires in`,
          value: `<t:${timeExpiresAt}:R>`
        }
      ]
    }

    const customButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('primary')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('👍')
      )

    await interaction.channel.send({ embeds: [embedMessage], components: [customButton]})

    await interaction.guild.roles.create({
      name: bookClubDate,
      permissions: [
        PermissionsBitField.Flags.SendMessages
      ]
    })

    const bookClubRoleId = await interaction.guild.roles.cache.find(r => r.name === bookClubDate).id

    await interaction.guild.channels.create({
      name: bookClubDate,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: bookClubRoleId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    })

    const userById = await interaction.guild.members.cache.get(interaction.user.id)

    const filter = i => {
      if(userById.roles.cache.has(bookClubRoleId) === false){
        interaction.member.roles.add(bookClubRoleId)
        i.reply({content: `${i.user.username} has been added to the book club!`})
      } else {
        i.reply({content: 'You are already added to the book club.', ephemeral: true})
      }
    }

    const waitTimeInMilliseconds = waitTimeInSeconds * 1000
    await interaction.channel.createMessageComponentCollector({filter, max: numOfPeople, time: waitTimeInMilliseconds})
  }
}