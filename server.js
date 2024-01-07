import { conf } from './constaints/config.js';
import TelegramBot  from 'node-telegram-bot-api'
import {Avito}  from './helpers/avito.js'
import {States} from "./helpers/states.js";

class Server {
    bot
    avito
    states
    constructor() {
        this.bot = new TelegramBot(conf.botToken, { polling: true })
        this.bot.setMyCommands([
            {
                command: "menu",
                description: "Меню"
            }
        ]);

        this.avito = new Avito();
        this.states = new States()

        this.bot.on('text', async msg => {
            try {
                if(msg.text.startsWith('/start')) {
                    await this.bot.sendMessage(msg.chat.id, `Вы запустили бота!`);
                    await this.openMenu(msg);
                }
                else if(msg.text === '/menu') {
                    await this.openMenu(msg);
                    this.states.deleteStatesToUser(msg.from.id)
                }
                else if(msg.text === conf.title.mySearches) {
                    let tasks = await this.avito.getTasksToUser(msg.from.id)
                    let reformatTask = tasks.map((task) => {return {text: task.name, url: task.url}})
                    await this.bot.sendMessage(msg.chat.id, "Поиски", {
                            reply_markup:
                                {
                                    inline_keyboard: this.splitTasksToView(reformatTask)
                                }
                        }
                    );
                    this.states.deleteStatesToUser(msg.from.id)
                }
                else if(msg.text === conf.title.deleteSearch) {
                    let tasks = await this.avito.getTasksToUser(msg.from.id)
                    let reformatTask = tasks.map((task) => {return {text: task.name, callback_data: task.id}})
                    await this.bot.sendMessage(msg.chat.id, "Поиски", {
                            reply_markup:
                                {
                                    inline_keyboard: this.splitTasksToView(reformatTask)
                                }
                        }
                    );
                    this.states.addStatesToUser(msg.from.id, conf.title.deleteSearch)
                }
                else if(msg.text === conf.title.addSearch)
                {
                    await this.bot.sendMessage(msg.chat.id, "Введите ссылку для мониторинга:");
                    this.states.addStatesToUser(msg.from.id, conf.title.addSearch)
                }
                else if(msg.text === conf.title.info) {
                    await this.bot.sendMessage(msg.chat.id,
                        `Ваш ID: ${msg.from.id}\nЕсли возникли вопросы - обращаться к @sirllizz`
                    );
                }
                else {
                    let currentUserStates = this.states.getStatesToUser(msg.from.id)
                    if(currentUserStates.length === 1 && currentUserStates[0].state === conf.title.addSearch){
                        if(this.checkAvitoPath(msg.text)){
                            await this.bot.sendMessage(msg.chat.id, conf.title.addSearchName);
                            this.states.addStatesToUser(msg.from.id, conf.title.addSearchName, msg.text)
                        }else{
                            await this.bot.sendMessage(msg.chat.id, "Ссылка некорректна");
                            this.states.deleteStatesToUser(msg.from.id)
                            await this.openMenu(msg)
                        }
                    }
                    else if(currentUserStates.length === 2 && (currentUserStates[0].state === conf.title.addSearch &&
                            currentUserStates[1].state === conf.title.addSearchName && this.checkAvitoPath(currentUserStates[1].value))||
                        (currentUserStates[1].state === conf.title.addSearch &&
                            currentUserStates[0].state === conf.title.addSearchName && this.checkAvitoPath(currentUserStates[0].value))){
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
                        await this.avito.addTasksToUser(task)
                        await this.bot.sendMessage(msg.chat.id, "Ссылка добавлена");
                        this.states.deleteStatesToUser(msg.from.id)
                    }
                    else{
                        await this.bot.sendMessage(msg.chat.id, "Нераспознаная команда");
                        this.states.deleteStatesToUser(msg.from.id)
                    }
                }
            }
            catch(error) {
                console.log(error);
            }
        })

        this.bot.on('callback_query', async ctx => {
            try {
                let currentUserStates = states.getStatesToUser(ctx.from.id)
                if(ctx.data === "closeMenu") {
                    await this.bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
                    this.states.deleteStatesToUser(ctx.from.id)
                }
                else if(currentUserStates.length === 1 && currentUserStates[0].state === conf.title.deleteSearch){
                    await this.avito.deleteTasksToUser(ctx.from.id, ctx.data)
                    await this.bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
                    this.states.deleteStatesToUser(ctx.from.id)
                }
            }
            catch(error) {
                console.log(error);
            }
        })

    }

    async openMenu(msg) {
    await this.bot.sendMessage(msg.chat.id, "Меню открыто", {
            reply_markup: {
                keyboard: [
                    [conf.title.mySearches, conf.title.addSearch],
                    [conf.title.deleteSearch, conf.title.info]
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


    /*
    function notifyUser(data){
        const text = `Появился новый товар ${data.title} c ценой ${data.price} руб
    Ссылка на объявление https://avito.ru${data.url}`;

        for(const id of usersIds) {
            bot.sendMessage(msg.chat.id, text);
        }
    }*/

}


const server = new Server();
export default server;