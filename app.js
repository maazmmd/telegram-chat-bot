const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const YAML = require('yaml');
const { spawnSync } = require('child_process');

const configPath = process.argv[2] + '/config.yaml';
const sopsCommand = spawnSync('sops', ['--decrypt', configPath]);
const decryptedConfig = sopsCommand.stdout.toString();
const config_yaml = YAML.parse(decryptedConfig);
const httpUrl = config_yaml.http_url;

const payload = {
  "entries": {
    "range": {
      "startindex": 1,
      "pagesize": 200
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

const botToken = config_yaml.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken);

const groupIDs = config_yaml.TELEGRAM_CHAT_ID;
const groupIDsArray = groupIDs.split(',');

(async () => {
  
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

  const event = config_yaml.EVENT;
  message += `\n${event} Total Registrations: ${totalUsers}`;

  groupIDsArray.forEach(groupId => {
    bot.sendMessage(groupId, message);
  });

  // Function to stop the program execution
  const stopExecution = () => {

    console.log('Stopping program execution...');
    process.exit(0);
  };

  // Set a timeout to stop the program after 5 minutes (3 * 60 * 1000 milliseconds)
  setTimeout(stopExecution, 3 * 60 * 1000);

})();