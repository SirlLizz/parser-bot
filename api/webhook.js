require('dotenv').config();

process.env.NTBA_FIX_319 = 1;

const TelegramBot = require('node-telegram-bot-api');

const { telegramConfig } = require('../server/configs');
const { Bot } = require('../server/controllers');

module.exports = async (request, response) => {
    try {
        const { body } = request;
        const bot = new TelegramBot(telegramConfig.botToken);

        if (body.message) {
            const botController = new Bot(bot, body.message, undefined);
            await botController.handleMessage();
        }
        else if (body.callback_query) {
            const botController = new Bot(bot, undefined, body.callback_query);
            await botController.handleCallbackQuery();
        }

    } catch (error) {
        console.error(error);
    } finally {
        response.send();
    }
};