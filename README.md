# Event Registration Telegram Bot

This project implements a Telegram chat bot that retrieves registration data for the Event and sends it to a specified chat group. The bot fetches the total number of registrations and the details of registered users from a specific URL and posts them in the Telegram group at a scheduled time.

## Project Structure

- `app.js`: The main script file that fetches registration data, calculates the total count, and sends messages to the Telegram group.
- `app-local-schedule`: The script file schedules to rollout telegram messages locally.
- `app-console-test.js`: The script file to test locally uses console.log.
- `config.yaml`: The encrypted configuration file that stores sensitive data.

## Prerequisites

Before setting up the Telegram chat bot, make sure you have the following:

- Node.js installed on your machine.
- A Telegram account.

## Setting Up the Telegram Chat Bot

To set up the Telegram chat bot and run the script, follow these steps:

1. Clone or download this repository to your local machine.

2. Install the dependencies by running the following command:

```
npm install
```

3. Create a Telegram Bot using BotFather:
- Open the Telegram app and search for BotFather.
- Start a chat with BotFather and follow the instructions to create a new bot.
- Once the bot is created, BotFather will provide you with a unique token. Make sure to keep this token secure.

4. Create a Telegram group and add the bot to the group:
- Create a new group in Telegram or use an existing one.
- Add the Telegram bot to the group by inviting it via the group's members settings.

5. Obtain the Telegram group ID:
- Add the bot to the group as an administrator.
- Temporarily disable the privacy settings for the bot by going to the bot's settings and disabling the "Group Privacy" option.
- Send a message to the group using the bot.
- Open a web browser and enter the following URL, replacing `<bot_token>` with your actual bot token:

  ```
  https://api.telegram.org/bot<bot_token>/getUpdates
  ```

  This will return a JSON response containing information about recent messages received by your bot.
- Look for the "chat" object within the JSON response and find the "id" value. This is the chat ID for the group chat.

6. Encrypt the configuration file:
- Create a new `config.yaml` file.
- Replace the placeholder values in the `config.yaml` file with your actual sensitive data.
- Encrypt the `config.yaml` file using `sops` by running the following command:

  ```
  # Encrypt the file for very first time
  sops --encrypt --in-place config.yaml

  # If config already set up, use sops -d and -e options for decrypting and encrypting config.yaml
  sops -d -i config.yaml
  sops -e -i config.yaml
  ```

  Make sure you have `sops` installed and configured properly.

7. Schedule locally: Start the script by running the following command:

```
node app-local-scheduler.js # Rolls out as local scheduler

```

The script will fetch registration data, calculate the total count, and send messages to the Telegram group at the scheduled time.

8. To Automate with GHA
```
# See app.js, schedule.yaml 
node app.js
```

9. You can modify the schedule and other settings by editing the code in `app.js` according to your requirements.

## License

This project is licensed under the [MIT License](LICENSE).

Feel free to modify and use it according to your needs.  

Make sure to replace the placeholders (YOUR_TELEGRAM_BOT_TOKEN and YOUR_TELEGRAM_CHAT_ID) with your actual Telegram Bot token and group ID. Also, ensure that you provide accurate instructions for the steps to create a Telegram bot, get the group ID, and encrypt the configuration file using sops.
