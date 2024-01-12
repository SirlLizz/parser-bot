const { initializeApp } = require('firebase/app');
const { getDatabase, set, ref, get, child } = require("firebase/database");
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { firebaseConfig } = require('../configs');
class DatabaseService {
    app
    db
    constructor() {
        try {
            this.app = initializeApp({
                ...firebaseConfig.firebase
            });
            const auth = getAuth();
            signInWithEmailAndPassword(auth, firebaseConfig.authFirebase.email, firebaseConfig.authFirebase.password).catch(function (error) {
                const { code, message } = error;
                console.log(`${code} - ${message}`);
            });
            this.db = getDatabase(this.app);
            console.log('Инициализированно');
        } catch (err) {
            console.log(err);
            console.error('Application works without database!!');
        }
    }

    getTasksForUser(userId) {
        return new Promise((resolve, reject) => {
            get(child(ref(this.db), 'tasks')).then((snapshot) => {
                const tasks = snapshot.val() || {};
                const userTasks = Object.values(tasks).filter(task => task.user_id === userId);
                resolve(userTasks);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    addTaskForUser(task) {
        return new Promise((resolve, reject) => {
            set(ref(this.db, 'tasks/' + task.id), task).then(() => resolve(''))
                .catch((error) => {
                    reject(error)
                });
        })
    }

    deleteTaskForUser(userId, taskId) {
        return new Promise((resolve, reject) => {
            const tasksRef = ref(this.db, 'tasks');
            get(child(tasksRef, taskId)).then((snapshot) => {
                const task = snapshot.val();
                if (task && task.user_id === userId) {
                    return set(child(tasksRef, taskId), null);
                } else {
                    reject("Task not found or does not belong to the user");
                }
            }).then(() => {
                resolve('Task deleted successfully');
            }).catch((error) => {
                reject(error);
            });
        });
    }

    async getStatesToUser(userId) {
        return new Promise((resolve, reject) => {
            get(child(ref(this.db), 'state')).then((snapshot) => {
                const states = snapshot.val() || {};
                const userStates = Object.values(states).filter(state => state.userId === userId);
                resolve(userStates);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    async addStatesToUser(userId, state, value) {
        return new Promise((resolve, reject) => {
            set(ref(this.db, 'state/' + userId), {state: state, value: value}).then(() => resolve(''))
                .catch((error) => {
                    reject(error)
                });
        })
    }

    async deleteStatesToUser(userId) {
        return new Promise((resolve, reject) => {
            const tasksRef = ref(this.db, 'tasks');
            get(child(tasksRef, userId)).then((snapshot) => {
                const state = snapshot.val();
                if (state) {
                    return set(child(tasksRef, userId), null);
                } else {
                    reject("Task not found or does not belong to the user");
                }
            }).then(() => {
                resolve('Task deleted successfully');
            }).catch((error) => {
                reject(error);
            });
        });
    }
}

module.exports = DatabaseService;
