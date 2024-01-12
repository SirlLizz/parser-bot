process.env.NTBA_FIX_319 = 1;

require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const { telegramConfig } = require('../server/configs');
const { Bot } = require('../server/controllers');

module.exports = async (request, response) => {
    try {
        const { body } = request;

        if (!body.message) {
            return;
        }

        const bot = new TelegramBot(telegramConfig.botToken);
        const botController = new Bot(bot, body.message);

        await botController.handle();
    } catch (error) {
        console.error(error);
    } finally {
        response.send();
    }
};