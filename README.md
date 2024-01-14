# --Avito Parser Bot--
Serverless Telegram bot base on stack NodeJs + node-telegram-bot-api + Firebase and complited to deploy on Vercel(if you add node in .env file(check constaints/telegram.js))

THIS PROJECT WAS NOT POSSIBLE ON THE BASIS OF A FREE DEPLOYMENT ON VERCEL


# Running
### 1. Telegram
````
# Create an Telegram bot
Find @BotFather on Telegram, type /newbot and follow the instructions.

# Credentials
Save your token from @BotFather.
````

### 2. Vercel Deploy
````
# Account
Create an Vercel account on https://vercel.com/.

# Install Vercel CLI
npm install -g vercel

# Vercel CLI login
vercel login

# Deploy
vercel

# Set Vercel environment variables
AUTH_FIREBASE_EMAIL
AUTH_FIREBASE_PASSWORD
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_DATABASE_URL
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
TELEGRAM_API_TOKEN
````

### 3. Setting up the Telegram webhook
````
curl -X POST https://api.telegram.org/bot<YOUR-BOT-TOKEN>/setWebhook -H "Content-type: application/json" -d '{"url": "https://project-name.username.vercel.app/api/webhook"}'
````

# Authors
* [CallNum](https://t.me/sirllizz)
