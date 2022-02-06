import { Database } from "./Database"
import { Login } from "./classes/Login";
import { User } from "./classes/User";
import { Admin } from "./classes/Admin";

export let database: Database = new Database();
main();

let prompts = require('prompts');
let currentUser: User;
let currentAdmin: Admin;
let select: number;

async function main() {
    await database.connect();
    let login: Login = new Login();
    currentUser = await login.checkLogin();
    if (currentUser.role) {
        currentAdmin = new Admin(currentUser.username, currentUser.password, currentUser.role, currentUser.gender);
    }
    await mainMenu();
}

async function mainMenu() {
    if (currentUser.role == false) {
        let response = await prompts
            ({
                type: 'select',
                name: 'value',
                message: 'What do you want to do?',
                choices: [
                    { title: 'search a customer', value: 0 },
                    { title: 'create a new customer', value: 1 },
                    { title: 'search an order', value: 2 },
                    { title: 'create a new order', value: 3 },
                    { title: 'search an article', value: 4 },
                ],
            });
        select = response.value;
    }
    else {
        let response = await prompts
            ({
                type: 'select',
                name: 'value',
                message: 'What do you want to do?',
                choices: [
                    { title: 'search a customer', value: 0 },
                    { title: 'create a new customer', value: 1 },
                    { title: 'search an order', value: 2 },
                    { title: 'create a new order', value: 3 },
                    { title: 'search an article', value: 4 },
                    { title: 'create an article', value: 5 },
                    { title: 'create a new user', value: 6 },
                    { title: 'change the role of an user', value: 7 },
                ],
            });
        select = response.value;
    }
    if(select == 1) {
        await currentAdmin.createCustomer();
    }
    if(select == 3) {
        await currentAdmin.createOrder();
    }
    if(select == 5) {
        await currentAdmin.createArticle();
    }
    if (select == 6) {
        await currentAdmin.createUser();
    }
    if(select == 7) {
        await currentAdmin.changeRole();
    }
}
