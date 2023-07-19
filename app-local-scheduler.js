const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const fs = require('fs');
const YAML = require('yaml');
const { spawnSync } = require('child_process');

// Path to the encrypted config file
const configPath = '/path/to/telegram-chat-bot/config.yaml';

// Decrypt the config file using sops
const sopsCommand = spawnSync('sops', ['--decrypt', configPath]);
const decryptedConfig = sopsCommand.stdout.toString();

// Parse the decrypted YAML content
const config_yaml = YAML.parse(decryptedConfig);

// Extract the necessary values from the config
const httpUrl = config_yaml.http_url;

// URL - payload, config
const payload = {
  "entries": {
    "range": {
      "startindex": 1,
      "pagesize": 50
    }
  }
};

const config = {
  headers: {
    'Content-Type': 'application/json',
    'X-ZCSRF-TOKEN': 'zfcpn=db46af52-5525-4d1e-af03-2f275802be07',
    'X-Requested-With': 'XMLHttpRequest'
  }
};

// Telegram Bot setup
const botToken = config_yaml.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

const groupIDs = config_yaml.TELEGRAM_CHAT_ID;
const groupIDsArray = groupIDs.split(',');

// Function to fetch all registered users
const fetchRegisteredUsers = async () => {
  try {
    const response = await axios.post(httpUrl, payload, config);
    return response.data.records;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

let registeredUsers = [];
const cityCounts = {};
let emptyCityCount = 0;
let armWrestlingCount = 0;
let totalUsers = 0;

// Schedule a daily job to post the total users at 5 PM
const rule = new schedule.RecurrenceRule();
rule.hour = 17; // 5 PM
rule.minute = 0;
schedule.scheduleJob(rule, async () => {

  registeredUsers = await fetchRegisteredUsers();
  totalUsers = registeredUsers.length;
  
  let message = 'Citywise Registrations:\n';
  registeredUsers.forEach(user => {
    const city = user.Address.Address_City || 'Unknown';
    let ticketsPaidByuser = user.SubForm1[0].Number1;
    let extraUsers = 0;
    
    if(ticketsPaidByuser > 1){
      extraUsers = (ticketsPaidByuser - 1);
      totalUsers = totalUsers + extraUsers;
    }

    if (city in cityCounts) {
      cityCounts[city]++;
    } else {
      cityCounts[city] = 1;
    }

    if (!user.Address.Address_City) {
      emptyCityCount++;
    }

    if (user.Dropdown === 'Yes') {
      armWrestlingCount++;
      if(ticketsPaidByuser > 1){
        armWrestlingCount = armWrestlingCount + extraUsers;
      }
    }
  });

  for (const city in cityCounts) {
    message += `${city}: ${cityCounts[city]} registrations\n`;
  }
  message += `\nArm Wrestling: ${armWrestlingCount} registrations\n`;
  message += `\nTotal Registrations: ${totalUsers}`;

  groupIDsArray.forEach(groupId => {
    bot.sendMessage(groupId, message);
  });
  

});

const rule2 = new schedule.RecurrenceRule();
rule2.hour = 16; // 4:45 PM
rule2.minute = 45;
schedule.scheduleJob(rule2, async () => {

  // Send Zoom Invite
  let zoomMessage = `Change your Zoom message here\n`;
  groupIDsArray.forEach(groupId => {
    bot.sendMessage(groupId, zoomMessage);
  });

});