import { conf } from './constaints/config.js';
import TelegramBot  from 'node-telegram-bot-api'
import {Avito}  from './helpers/avito.js'

const bot = new TelegramBot(conf.botToken, { polling: true })
bot.setMyCommands([
    {
        command: "menu",
        description: "Меню"
    }
]);

let lastCommand = '';
let avito = new Avito();

bot.on('text', async msg => {
    try {
        if(msg.text.startsWith('/start')) {
            await bot.sendMessage(msg.chat.id, `Вы запустили бота!`);
            await openMenu(msg);
        }
        else if(msg.text === '/menu') {
            await openMenu(msg);
        }
        else if(msg.text === conf.title.mySearches) {
            let tasks = await avito.getTasksToUser(msg.from.id)
            let reformatTask = tasks.map((task, index) => {return {text: index+1, url: task.url}})
            await bot.sendMessage(msg.chat.id, "Поиски", {
                    reply_markup:
                        {
                            inline_keyboard: [
                                reformatTask,
                                    [{text: 'Закрыть Меню', callback_data: 'closeMenu'}]]
                        }
                }
            );
        }
        else if(msg.text === conf.title.deleteSearch) {
            let tasks = await avito.getTasksToUser(msg.from.id)
            let reformatTask = tasks.map((task, index) => {return {text: index+1, callback_data: task.id}})
            await bot.sendMessage(msg.chat.id, "Поиски", {
                    reply_markup:
                        {
                            inline_keyboard: [
                                reformatTask,
                                [{text: 'Закрыть Меню', callback_data: 'closeMenu'}]]
                        }
                }
            );
            lastCommand = conf.title.deleteSearch
        }
        else if(msg.text === conf.title.addSearch)
        {
            await bot.sendMessage(msg.chat.id, "Введите ссылку для мониторинга:");
            lastCommand = conf.title.addSearch;
        }
        else if(msg.text === conf.title.info) {
            await bot.sendMessage(msg.chat.id,
                `Ваш ID: ${msg.from.id}\nЕсли возникли вопросы - обращаться к @sirllizz`
            );
        }
        else {
            if(lastCommand === conf.title.addSearch){
                if(checkAvitoPath(msg.text)){
                    let task = {
                        user_id: msg.from.id,
                        id: msg.message_id,
                        url: msg.text
                    };
                    await avito.addTasksToUser(task)
                    await bot.sendMessage(msg.chat.id, "Ссылка добавлена");
                }else{
                    await bot.sendMessage(msg.chat.id, "Ссылка некорректна");
                }
                lastCommand = '';
            }
            else{
                await bot.sendMessage(msg.chat.id, "Нераспознаная комманда");
            }

        }
    }
    catch(error) {
        console.log(error);
    }
})

bot.on('callback_query', async ctx => {
    try {
        if(ctx.data === "closeMenu") {
            await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
        }
        else if(lastCommand === conf.title.deleteSearch){
            await avito.deleteTasksToUser(ctx.from.id, ctx.data)
            await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
        }
    }
    catch(error) {
        console.log(error);
    }
})

async function openMenu(msg) {
    await bot.sendMessage(msg.chat.id, "Меню открыто", {
        reply_markup: {
            keyboard: [
                [conf.title.mySearches, conf.title.addSearch],
                [conf.title.deleteSearch, conf.title.info]
            ],
            resize_keyboard: true
        }
    })
}

async function removeMenu(msg) {
    await bot.sendMessage(msg.chat.id, `Меню закрыто`, {
        reply_markup: {
            remove_keyboard: true
        }
    })
}

function checkAvitoPath(url) {
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
