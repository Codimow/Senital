// bot.js
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path'); // Ensure this line is present

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', 'server-analytics')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/server-analytics/${file}`);
    client.commands.set(command.data.name, command);
}

// Event listener for when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event listener for slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
    }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);