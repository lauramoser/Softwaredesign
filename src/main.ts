import { Database } from "./Database";
import { Login } from "./classes/Login";
import { User } from "./classes/User";
import { Admin } from "./classes/Admin";
import promptstypes from "prompts";
import { OrderMethods } from "./classes/OrderMethods";
import { ArticleMethods } from "./classes/ArticleMethods";
import { CustomerMethods } from "./classes/CustomerMethods";

export let database: Database = Database.getInstance();
export let orderMethods: OrderMethods = new OrderMethods();
export let articleMethods: ArticleMethods = new ArticleMethods();
export let customerMethods: CustomerMethods = new CustomerMethods();

main();
// let x: boolean = Admin.testPasswordSecurity("Abcd!234");
// console.log(x);

let prompts = require("prompts");
let currentUser: User;
let currentAdmin: Admin;
let select: number;

//connects the database, redirects to the login and stores the user's role for further use
async function main(): Promise<void> {
    await database.connect();
    let login: Login = new Login();
    currentUser = await login.checkLogin();
    if (currentUser.role) {
        currentAdmin = new Admin(currentUser.username, currentUser.password, currentUser.role, currentUser.gender);
    }
    await mainMenu();
}

//Menu selection for admin and normal user 
export async function mainMenu(): Promise<void> {
    if (currentUser.role == false) {
        let response: promptstypes.Answers<string> = await prompts
            ({
                type: "select",
                name: "value",
                message: "What do you want to do?",
                choices: [
                    { title: "Create a new customer", value: 0 },
                    { title: "Search a customer", value: 1 },
                    { title: "Edit a customer", value: 2 },
                    { title: "Create a new order", value: 3 },
                    { title: "Search an order", value: 4 },
                    { title: "Edit an order", value: 5 },
                    { title: "Search an article", value: 6 },
                    { title: "Edit an article", value: 7 }
                ]
            });
        select = response.value;
    }
    else {
        let response: promptstypes.Answers<string> = await prompts
            ({
                type: "select",
                name: "value",
                message: "What do you want to do?",
                choices: [
                    { title: "Create a new customer", value: 0 },
                    { title: "Search a customer", value: 1 },
                    { title: "Edit a customer", value: 2 },
                    { title: "Create a new order", value: 3 },
                    { title: "Search an order", value: 4 },
                    { title: "Edit an order", value: 5 },
                    { title: "Search an article", value: 6 },
                    { title: "Edit an article", value: 7 },
                    { title: "Create an article", value: 8 },
                    { title: "Create a new user", value: 9 },
                    { title: "Change the role of an user", value: 10 }
                ]
            });
        select = response.value;
    }
    if (select == 0) {
        await customerMethods.createCustomer();
    } else if (select == 1) {
        await customerMethods.searchCustomer();
    } else if (select == 2) {
        await customerMethods.editCustomer();
    } else if (select == 3) {
        await orderMethods.createOrder();
    } else if (select == 4) {
        await orderMethods.searchOrder();
    } else if (select == 5) {
        await orderMethods.editOrder();
    } else if (select == 6) {
        await articleMethods.searchArticle();
    } else if (select == 7) {
        await articleMethods.editArticle();
    } else if (select == 8) { // If Abfrage entfernen, da User nie auf create Article kommt
        if (currentAdmin) {
            await articleMethods.createArticle();
        }
    } else if (select == 9) {
        await currentAdmin.createUser();
    } else if (select == 10) {
        await currentAdmin.changeRole();
    }
}
