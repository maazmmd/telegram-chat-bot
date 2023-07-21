const TelegramBot = require('node-telegram-bot-api');
const YAML = require('yaml');
const { spawnSync } = require('child_process');

const configPath = process.argv[2] + '/config.yaml';
const sopsCommand = spawnSync('sops', ['--decrypt', configPath]);
const decryptedConfig = sopsCommand.stdout.toString();
const config_yaml = YAML.parse(decryptedConfig);

const botToken = config_yaml.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken);

const groupId = config_yaml.TEST_GROUP_CHAT_ID;
const groupIDs = config_yaml.TELEGRAM_CHAT_ID;
const groupIDsArray = groupIDs.split(',');
  
const message = config_yaml.ZOOM_MESSAGE;
// groupIDsArray.forEach(groupId => {
    bot.sendMessage(groupId, message);
// });