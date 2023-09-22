const TelegramBot = require('node-telegram-bot-api');
const YAML = require('yaml');
const { spawnSync } = require('child_process');

const configPath = process.argv[2] + '/config.yaml';
const sopsCommand = spawnSync('sops', ['--decrypt', configPath]);
const decryptedConfig = sopsCommand.stdout.toString();
const config_yaml = YAML.parse(decryptedConfig);

const botToken = config_yaml.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken);

const groupId = config_yaml.TELEGRAM_CHAT_ID;
  
const message = config_yaml.GROUP_RULES_MESSAGE;
bot.sendMessage(groupId, message);


// Listen for any new chat members joining the group
bot.on('new_chat_members', (msg) => {
    const newMembers = msg.new_chat_members;
    
    // Construct a welcome message
    let welcomeMessage = config_yaml.WELCOME_MESSAGE;
    welcomeMessage += newMembers.map(user => '@' + (user.username || user.first_name)).join(', ') + '!';

    // Send the welcome message to the group
    bot.sendMessage(groupId, welcomeMessage);
});