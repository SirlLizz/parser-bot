const Database = require('./database');
class Avito {
    constructor() {
        this.db = new Database()
    }
    async getTasksToUser(userId){
        return await this.db.getTasksForUser(userId);
    }

    async addTasksToUser(task){
        await this.db.addTaskForUser(task);
    }

    async deleteTasksToUser(userId, taskId){
        await this.db.deleteTaskForUser(userId, taskId);
    }
}
module.exports = Avito;