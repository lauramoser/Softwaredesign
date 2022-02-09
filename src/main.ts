import { Database } from "./Database"
import { Login } from "./classes/Login";
import { User } from "./classes/User";
import { Admin } from "./classes/Admin";
import { Article } from "./classes/Article";

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

export async function mainMenu() {
    if (currentUser.role == false) {
        let response = await prompts
            ({
                type: 'select',
                name: 'value',
                message: 'What do you want to do?',
                choices: [
                    { title: 'Create a new customer', value: 0 },
                    { title: 'Search a customer', value: 1 },
                    { title: 'Edit a customer', value: 2 },
                    { title: 'Create a new order', value: 3 },
                    { title: 'Search an order', value: 4 },
                    { title: 'Edit an order', value: 5 },
                    { title: 'Search an article', value: 6 },
                    { title: 'Edit an article', value: 7 },
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
                    { title: 'Create a new customer', value: 0 },
                    { title: 'Search a customer', value: 1 },
                    { title: 'Edit a customer', value: 2 },
                    { title: 'Create a new order', value: 3 },
                    { title: 'Search an order', value: 4 },
                    { title: 'Edit an order', value: 5 },
                    { title: 'Search an article', value: 6 },
                    { title: 'Edit an article', value: 7 },
                    { title: 'Create an article', value: 8 },
                    { title: 'Create a new user', value: 9 },
                    { title: 'Change the role of an user', value: 10 },
                ],
            });
        select = response.value;
    }
    if (select == 0) {
        await currentUser.createCustomer(); // done
    } else if (select == 1) {
        await currentUser.searchCustomer(); // done
    } else if (select == 2) {
        await currentUser.editCustomer();
    } else if (select == 3) {
        await currentUser.createOrder();
    } else if (select == 4) {
        await currentUser.searchOrder(); // done
    } else if (select == 5) {
        await currentUser.editOrder();
    } else if (select == 6) {
        let article: Article = await currentUser.searchArticle(); //TODO
        console.log(article);
    } else if (select == 7) {
        await currentUser.editArticle();
    } else if (select == 8) {
        await currentAdmin.createArticle(); // done
    } else if (select == 9) {
        await currentAdmin.createUser();    // done
    } else if (select == 10) {
        await currentAdmin.changeRole();    // done
    }
}

// TODO
// Statistiken
// Zusammenfassung von Order