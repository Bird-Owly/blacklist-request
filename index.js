const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, ModalBuilder, ActionRowBuilder, GatewayIntentBits, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}



client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'MULTI EXECUTION OR PROGRAMMER ERROR (ERROR_100)', ephemeral: true });
		} else {
			await interaction.reply({ content: 'MULTI EXECUTION OR PROGRAMMING ERROR (ERROR_100)', ephemeral: true });
		}
	}
	console.log(interaction);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'request_blacklist') {
		const blacklistUserRequestModal = new ModalBuilder()
			.setCustomId('blacklistRequestModal')
			.setTitle('Request a Blacklist');

			// Add components to modal

		// Create the text input components
		const userModalInput = new TextInputBuilder()
		.setCustomId('userInput')
		// The label is the prompt the user sees for this input
		.setLabel("User you want to blacklist")
		// Short means only a single line of text
		.setStyle(TextInputStyle.Short);

	const reasonModalInput = new TextInputBuilder()
		.setCustomId('reasonInput')
		.setLabel("Reason for requesting the blacklist")
		// Paragraph means multiple lines of text.
		.setStyle(TextInputStyle.Paragraph);

	const evidenceModalInput = new TextInputBuilder()
		.setCustomId('evidenceInput')
		.setLabel("Link to a screenshot or video")
		.setStyle(TextInputStyle.Paragraph);

	// An action row only holds one text input,
	// so you need one action row per text input.
	const firstActionRow = new ActionRowBuilder().addComponents(userModalInput);
	const secondActionRow = new ActionRowBuilder().addComponents(reasonModalInput);
	const thirdActionRow = new ActionRowBuilder().addComponents(evidenceModalInput);

	// Add inputs to the modal
	blacklistUserRequestModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

	// Show the modal to the user
	await interaction.showModal(blacklistUserRequestModal);

		// TODO: Add components to modal...
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId === 'blacklistRequestModal') {

		const requestedUser = interaction.fields.getTextInputValue('userInput');
		const requestedReason = interaction.fields.getTextInputValue('reasonInput');
		const requestedEvidence = interaction.fields.getTextInputValue('evidenceInput');
		const separatorEmoji = String.fromCodePoint(0x26AA);
		const blacklistRequestChannel = client.channels.cache.get('1195159892638568571');
		
		const blacklistRequestEmbed = new EmbedBuilder()
			.setThumbnail('https://cdn.discordapp.com/attachments/1194823171099066500/1194824560567140352/Sweet_Tools_Logo.png?ex=65b1c216&is=659f4d16&hm=218e9ae3f1193cf35095b6c88f959579377bffa5fc1536c0824377fc8d60965d&')
			.setTitle('New Blacklist Request')
			.setDescription('A new blacklist request has been submitted. More information is located below:')
			.addFields(
				{ name: 'User who Submitted the Request:', value: `${interaction.member.displayName}`, inline: false },
				{ name: 'Reported User:', value: `${requestedUser}`, inline: false },
				{ name: 'Reason for Reporting the User:', value: `${requestedReason}`, inline: false },
				{ name: 'Submitted Evidence:', value: `${requestedEvidence}`, inline: false },
			);

		blacklistRequestEmbed.setFooter({
			iconURL: 'https://cdn.discordapp.com/attachments/1194823171099066500/1194824560567140352/Sweet_Tools_Logo.png?ex=65b1c216&is=659f4d16&hm=218e9ae3f1193cf35095b6c88f959579377bffa5fc1536c0824377fc8d60965d&',
			text: `Sweet Tools v1 ${separatorEmoji} Operated by Sweet Tooth Corporation`,
		});

		if (interaction.guildId === '1153504629804515428') {
				await interaction.reply({ content: 'UNABLE TO RUN COMMAND IN THIS SERVER (ERR_200)', ephemeral: true });
		  } else {

				await interaction.reply({ content: 'Your request has been submitted, you will recieve a response within 24 hours.', ephemeral: true });
				await blacklistRequestChannel.send({ embeds: [blacklistRequestEmbed] });
		  }
	}
});




const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}






// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on('ready', () => {
	client.user.setActivity('JavaScript Development');
  });


// Log in to Discord with your client's token
client.login(token); 