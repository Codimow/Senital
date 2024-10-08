const { SlashCommandBuilder } = require('discord.js');
const { Message } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activity')
        .setDescription('Get server activity statistics.'),
    async execute(interaction) {
        try {
            // Fetching data
            const guild = interaction.guild;
            const channels = guild.channels.cache.filter(channel => channel.type === 'GUILD_TEXT');
            let mostActiveChannel = null;
            let mostActiveUser = null;
            let mostActiveUserMessages = 0;
            let mostActiveChannelMessages = 0;

            for (const channel of channels) {
                const messages = await channel.messages.fetch({ limit: 100 });
                const userMessages = new Map();
                messages.forEach(message => {
                    const user = message.author;
                    if (userMessages.has(user.id)) {
                        userMessages.set(user.id, userMessages.get(user.id) + 1);
                    } else {
                        userMessages.set(user.id, 1);
                    }
                });

                const mostActiveUserInChannel = [...userMessages.entries()].reduce((a, b) => a[1] > b[1] ? a : b);
                if (mostActiveUserInChannel[1] > mostActiveUserMessages) {
                    mostActiveUserMessages = mostActiveUserInChannel[1];
                    mostActiveUser = guild.members.cache.get(mostActiveUserInChannel[0]);
                }

                if (messages.size > mostActiveChannelMessages) {
                    mostActiveChannelMessages = messages.size;
                    mostActiveChannel = channel;
                }
            }

            // Constructing the response
            const response = `
            📦 **Server Activity Report**
            🚀 **Most Active Channel**
            - Channel: ${mostActiveChannel.name}
            - Messages Sent: ${mostActiveChannelMessages} 🎉
            👥 **Most Active User**
            - User: ${mostActiveUser}
            - Messages Sent: ${mostActiveUserMessages} 💬
            `;

            await interaction.reply(response);
        } catch (error) {
            console.error('Error fetching activity data:', error);
            await interaction.reply({ content: 'Failed to fetch activity data.', ephemeral: true });
        }
    },
};
