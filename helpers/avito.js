import db from "./database.js";
export class Avito {
    async getTasksToUser(userId){
        return await db.getTasksForUser(userId);
    }

    async addTasksToUser(task){
        await db.addTaskForUser(task);
    }

    async deleteTasksToUser(userId, taskId){
        await db.deleteTaskForUser(userId, taskId);
    }
}