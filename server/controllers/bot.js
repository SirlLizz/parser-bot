const { telegramConfig } = require('../configs');
const {Avito}  = require('../helpers')
const {States} = require("../helpers");


class Bot {
    constructor(bot, message, callback_query) {
        this.bot = bot;
        this.message = message;
        this.callback_query = callback_query;
    }

    async handleMessage() {
        let avito = new Avito();
        let states = new States();
        if(this.message === null){
            return;
        }
        let msg = this.message;

        try {
            if(msg.text.startsWith('/start')) {
                await this.bot.sendMessage(msg.chat.id, `Вы запустили бота!`);
                await this.openMenu();
            }
            else if(msg.text === '/menu') {
                await this.openMenu();
                await states.deleteStatesToUser(msg.from.id)
            }
            else if(msg.text === telegramConfig.title.mySearches) {
                let tasks = await avito.getTasksToUser(msg.from.id)
                let reformatTask = tasks.map((task) => {return {text: task.name, url: task.url}})
                await this.bot.sendMessage(msg.chat.id, "Поиски", {
                        reply_markup:
                            {
                                inline_keyboard: this.splitTasksToView(reformatTask)
                            }
                    }
                );
                await states.deleteStatesToUser(msg.from.id)
            }
            else if(msg.text === telegramConfig.title.deleteSearch) {
                let tasks = await avito.getTasksToUser(msg.from.id)
                let reformatTask = tasks.map((task) => {return {text: task.name, callback_data: task.id}})
                await this.bot.sendMessage(msg.chat.id, "Поиски", {
                        reply_markup:
                            {
                                inline_keyboard: this.splitTasksToView(reformatTask)
                            }
                    }
                );
                await states.addStatesToUser(msg.from.id, telegramConfig.title.deleteSearch)
            }
            else if(msg.text === telegramConfig.title.addSearch)
            {
                await this.bot.sendMessage(msg.chat.id, "Введите ссылку для мониторинга:");
                await states.addStatesToUser(msg.from.id, telegramConfig.title.addSearch)
            }
            else if(msg.text === telegramConfig.title.info) {
                await this.bot.sendMessage(msg.chat.id,
                    `Ваш ID: ${msg.from.id}\nЕсли возникли вопросы - обращаться к @sirllizz`
                );
            }
            else {
                let currentUserStates = await states.getStatesToUser(msg.from.id)
                if(currentUserStates.length === 1 && currentUserStates[0].state === telegramConfig.title.addSearch){
                    if(this.checkAvitoPath(msg.text)){
                        await this.bot.sendMessage(msg.chat.id, telegramConfig.title.addSearchName);
                        await states.addStatesToUser(msg.from.id, telegramConfig.title.addSearchName, msg.text)
                    }else{
                        await this.bot.sendMessage(msg.chat.id, "Ссылка некорректна");
                        await states.deleteStatesToUser(msg.from.id)
                        await this.openMenu(msg)
                    }
                }
                else if(currentUserStates.length === 2 &&
                    (currentUserStates[0].state === telegramConfig.title.addSearch &&
                        currentUserStates[1].state === telegramConfig.title.addSearchName &&
                        this.checkAvitoPath(currentUserStates[1].value))||
                    (currentUserStates[1].state === telegramConfig.title.addSearch &&
                        currentUserStates[0].state === telegramConfig.title.addSearchName &&
                        this.checkAvitoPath(currentUserStates[0].value))){
                    let task;

                    if(this.checkAvitoPath(currentUserStates[1].value))
                    {
                        task = {
                            user_id: msg.from.id,
                            id: msg.message_id,
                            name: msg.text,
                            url: currentUserStates[1].value
                        }
                    }else{
                        task = {
                            user_id: msg.from.id,
                            id: msg.message_id,
                            name: msg.text,
                            url: currentUserStates[0].value
                        }
                    }
                    await avito.addTasksToUser(task)
                    await this.bot.sendMessage(msg.chat.id, "Ссылка добавлена");
                    await states.deleteStatesToUser(msg.from.id)
                }
                else{
                    await this.bot.sendMessage(msg.chat.id, "Команда не распознана");
                    await states.deleteStatesToUser(msg.from.id)
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    async handleCallbackQuery() {
        let avito = new Avito();
        let states = new States();
        if(this.callback_query === null){
            return;
        }
        let msg = this.callback_query;

        try {
            let currentUserStates = await states.getStatesToUser(msg.from.id)
            if(msg.data === "closeMenu") {
                await this.bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
                await states.deleteStatesToUser(msg.from.id)
            }
            else if(currentUserStates.length === 1 && currentUserStates[0].state === telegramConfig.title.deleteSearch){
                console.log(telegramConfig.title.deleteSearch)
                await avito.deleteTasksToUser(msg.from.id, msg.data)
                await this.bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
                await states.deleteStatesToUser(msg.from.id)
            }
        } catch (error) {
            console.error(error);
        }
    }

    async openMenu() {
        await this.bot.sendMessage(this.message.chat.id, "Меню открыто", {
            reply_markup: {
                keyboard: [
                    [telegramConfig.title.mySearches, telegramConfig.title.addSearch],
                    [telegramConfig.title.deleteSearch, telegramConfig.title.info]
                ],
                resize_keyboard: true
            }
        })
    }

    splitTasksToView(tasks) {
        let chunkSize = 3
        let splitTasks = Array.from({ length: Math.ceil(tasks.length / chunkSize) }, (_, index) =>
            tasks.slice(index * chunkSize, (index + 1) * chunkSize)
        );
        splitTasks.push([{text: 'Закрыть Меню', callback_data: 'closeMenu'}])
        return splitTasks
    }

    checkAvitoPath(url) {
        let pattern = /https:\/\/www\.avito\.ru\/[^\/]+\/[^\/]+/;
        return pattern.test(url)
    }
}

module.exports = Bot;