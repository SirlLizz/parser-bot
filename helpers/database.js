import { initializeApp } from 'firebase/app';
import { getDatabase, set, ref, get, child, onChildAdded, onChildMoved, onChildRemoved, onChildChanged } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { conf } from '../constaints/config.js';
class DatabaseService {
    app
    db
    constructor() {
        try {
            this.app = initializeApp({
                ...conf.firebase
            });
            const auth = getAuth();
            signInWithEmailAndPassword(auth, conf.authFirebase.email, conf.authFirebase.password).catch(function (error) {
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
}

const db = new DatabaseService();
export default db;
