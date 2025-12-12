# Telegram Configuration

Add these environment variables to your `.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## How to get Telegram Bot Token and Chat ID

### 1. Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided by BotFather

### 2. Get Chat ID

1. Add your bot to the Telegram group
2. Send a message in the group
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find the `chat` object in the response and copy the `id` field

Example response:

```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "chat": {
          "id": -1001234567890, // This is your TELEGRAM_CHAT_ID
          "title": "Your Group Name"
        }
      }
    }
  ]
}
```

## Features

- ✅ Global Telegram module for sending messages to specified group
- ✅ Cron job runs every minute to check for new params
- ✅ Sends notifications sequentially for unnotified params
- ✅ Tracks notification status to avoid duplicates
- ✅ Formatted messages with HTML support
- ✅ Error handling and logging

## Notification Format

When a new param is added, the notification will look like:

```
🔔 New Param Notification

ID: 123
Param: [decoded base64 param]
Time: 12/12/2025, 10:30:00
```
