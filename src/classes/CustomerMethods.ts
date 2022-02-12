import { database, mainMenu, orderMethods } from "../main";
import { Article } from "./Article";
import { Customer } from "./Customer";
import { BigOrder, LittleOrder } from "./Order";
import { ArticleWithEverything } from "./Statistic";
import promptstypes from "prompts";

let prompts = require("prompts");

export class CustomerMethods {

    public async createCustomer(): Promise<Customer> {
        console.log("Please fill in all necessary data for the new customer");
        let response: promptstypes.Answers<string> = await prompts({
            type: "number",
            name: "value",
            message: "ID:"
        });
        let id: number = response.value;
        let idAlreadyTaken: boolean = await database.checkCustomerId(id);
        if (!idAlreadyTaken) {
            response = await prompts({
                type: "text",
                name: "value",
                message: "Name:"
            });
            let name: string = response.value;

            response = await prompts({
                type: "text",
                name: "value",
                message: "address (Street with No. Postal code City):"
            });
            let address: string = response.value;

            response = await prompts({
                type: "number",
                name: "value",
                message: "Customer Discount in percent:"
            });
            let customerDiscount: number = response.value;

            if (!database.saveCustomer(id, name, address, customerDiscount)) {
                console.log("Create article failed");
                return this.createCustomer();
            }

        }
        else {
            console.log("this ID already exists.\nPlease choose another ID!\n");
            return this.createCustomer();
        }
        console.log("You successfully created a customer");
        await mainMenu();
    }

    public async searchCustomer(askToEdit?: boolean): Promise<Customer> {
        if (askToEdit == undefined)
            askToEdit = true;
        let returnCustomer: Customer = undefined;
        let response: promptstypes.Answers<string> = await prompts({
            type: "select",
            name: "value",
            message: "Do you want to search for the Customer by ID or by name?",
            choices: [
                { title: "by ID", value: 0 },
                { title: "by name", value: 1 }
            ]
        });
        let select: number = response.value;
        if (select == 1) {
            let choices: { title: string }[] = [];
            let allCustomer: Customer[] = await database.getAllCustomer();
            allCustomer.forEach(customer => {
                choices.push({ title: customer.name });
            });
            response = await prompts({
                type: "autocomplete",
                name: "value",
                message: "Enter your desired customer",
                choices: choices
            });
            let desiredCustomer: string = response.value;
            allCustomer.forEach(customer => {
                if (customer.name == desiredCustomer) {
                    returnCustomer = customer;
                }
            });
            if (returnCustomer == undefined) {
                console.log("Name not found");
                return await this.searchCustomer(askToEdit);
            }
        }
        else {
            let choices: { title: string }[] = [];
            let allCustomer: Customer[] = await database.getAllCustomer();
            allCustomer.forEach(customer => {
                choices.push({ title: customer.id.toString() });
            });
            response = await prompts({
                type: "autocomplete",
                name: "value",
                message: "Enter your desired customer",
                choices: choices
            });
            let desiredCustomerString: string = response.value;
            console.log(desiredCustomerString);
            if (!isNaN(Number(desiredCustomerString))) {
                console.log(Number(desiredCustomerString));
                allCustomer.forEach(customer => {
                    if (customer.id == Number(desiredCustomerString)) {
                        returnCustomer = customer;
                    }
                });
            } else {
                console.log("ID not found");
                return await this.searchCustomer(askToEdit);
            }
        }
        console.log(returnCustomer);
        if (askToEdit) {
            response = await prompts({
                type: "select",
                name: "value",
                message: "What do you want to do with this customer?",
                choices: [
                    { title: "I want to edit the customer", value: 0 },
                    { title: "I want to make an order", value: 1 },
                    { title: "I want to view the customer statistics ", value: 2 },
                    { title: "I want to go back to the main Menu", value: 3 }
                ]
            });
            let select: number = response.value;
            if (select == 0) {
                returnCustomer = await this.editCustomer(returnCustomer);
            } else if (select == 1) {
                await orderMethods.createOrder(returnCustomer);
            } else if (select == 2) {
                await this.statisticCustomer(returnCustomer);
            } else if (select == 3) {
                await mainMenu();
            }
        }
        return returnCustomer;
    }

    public async editCustomer(pCustomer?: Customer): Promise<Customer> {
        let customer: Customer;
        console.log(customer);
        if (pCustomer) {
            customer = pCustomer;
        } else {
            customer = await this.searchCustomer(false);
        }
        let response: promptstypes.Answers<string> = await prompts({
            type: "select",
            name: "value",
            message: "What would you like to change for this customer?",
            choices: [
                { title: "Name", value: 0 },
                { title: "Address", value: 1 },
                { title: "Customer discount", value: 2 }
            ]
        });
        let select: number = response.value;
        if (select == 0) {
            console.log("Name: " + customer.name);
            response = await prompts({
                type: "text",
                name: "value",
                message: "Enter the new name:"
            });
            let newName: string = response.value;
            if (newName != undefined) {
                if (newName.trim().length > 0) {
                    let newCustomer: Customer = new Customer(customer.id, newName, customer.address, customer.customerDiscount);
                    newCustomer = await database.changeCustomer(customer, newCustomer);
                } else {
                    console.log("Please add more than whitespace characters");
                    return this.editCustomer(customer);
                }
            } else {
                console.log("You have to enter something");
                return this.editCustomer(customer);
            }
        } else if (select == 1) {
            console.log("Address: " + customer.address);
            let response: promptstypes.Answers<string> = await prompts({
                type: "text",
                name: "value",
                message: "Enter the new address:"
            });
            let newAddress: string = response.value;
            if (newAddress != undefined) {
                if (newAddress.trim().length > 0) {
                    let newCustomer: Customer = new Customer(customer.id, customer.name, newAddress, customer.customerDiscount);
                    newCustomer = await database.changeCustomer(customer, newCustomer);
                } else {
                    console.log("Please add more than whitespace characters");
                    return this.editCustomer(customer);
                }
            } else {
                console.log("You have to enter something");
                return this.editCustomer(customer);
            }
        } else if (select == 2) {
            console.log("Customer discount: " + customer.customerDiscount);
            let response: promptstypes.Answers<string> = await prompts({
                type: "number",
                name: "value",
                message: "Enter the new customer discount:"
            });
            let newCustomerDiscount: number = response.value;
            if (newCustomerDiscount != undefined) {
                if (newCustomerDiscount.toString().trim().length > 0) {
                    let newCustomer: Customer = new Customer(customer.id, customer.name, customer.address, newCustomerDiscount);
                    newCustomer = await database.changeCustomer(customer, newCustomer);
                } else {
                    console.log("Please type in a number");
                    return this.editCustomer(customer);
                }
            } else {
                console.log("You have to enter something");
                return this.editCustomer(customer);
            }
        }
        console.log("You successfully edited this customer");
        await mainMenu();
    }

    public async statisticCustomer(customer: Customer): Promise<void> {
        let allBigOrdersFromCustomer: BigOrder[] = await database.getAllBigOrdersFromCustomer(customer.id);
        let allLittleOrderFromCustomer: LittleOrder[] = [];
        let bigString: string = "";
        let articlesWithEverything: ArticleWithEverything[] = [];

        // Alle Kleinen Bestellungen des Kunden in Array speichern
        for (let i: number = 0; i < allBigOrdersFromCustomer.length; i++) {
            let bigOrder: BigOrder = allBigOrdersFromCustomer[i];
            for (let j: number = 0; j < bigOrder.littleOrders.length; j++) {
                let littleOrder: LittleOrder = bigOrder.littleOrders[j];
                allLittleOrderFromCustomer.push(littleOrder);
            }
        }
        let found: boolean = false;


        for (let i: number = 0; i < allLittleOrderFromCustomer.length; i++) {
            found = false;
            let littleOrder: LittleOrder = allLittleOrderFromCustomer[i];
            for (let j: number = 0; j < articlesWithEverything.length; j++) {
                let articleWithEverything: ArticleWithEverything = articlesWithEverything[j];
                if (articleWithEverything.articleId == littleOrder.articleId) {
                    articleWithEverything.completeAmount = articleWithEverything.completeAmount + littleOrder.amount;
                    articleWithEverything.price = articleWithEverything.price + littleOrder.price;
                    articlesWithEverything.splice(j, 1);
                    articlesWithEverything.push(articleWithEverything);
                    found = true;
                }
            }
            if (!found) {
                let article: Article = await database.getArticle(littleOrder.articleId);
                let articleWithEverything: ArticleWithEverything = { articleId: article.id, article: article, completeAmount: littleOrder.amount, price: littleOrder.price };
                articlesWithEverything.push(articleWithEverything);
            }
        }
        articlesWithEverything.forEach(articleWithEverything => {
            bigString = bigString + "Article: " + articleWithEverything.article.description + ", Amount of article: " + articleWithEverything.completeAmount + ", Money made with customer:" + articleWithEverything.price + "€";
        });
        let givenDiscount: number = 0;
        for (let i: number = 0; i < allLittleOrderFromCustomer.length; i++) {
            let littleOrder: LittleOrder = allLittleOrderFromCustomer[i];
            givenDiscount = givenDiscount + littleOrder.associatedDiscountInEuro;
        }
        for (let i: number = 0; i < allBigOrdersFromCustomer.length; i++) {
            let bigOrder: BigOrder = allBigOrdersFromCustomer[i];
            givenDiscount = givenDiscount + bigOrder.customerDiscountInEuro;

        }
        let roundedGivenDiscount: number = Math.round((givenDiscount + Number.EPSILON) * 100) / 100;
        bigString = bigString + "\nComplete discount given to the customer " + roundedGivenDiscount + "€";
        console.log(bigString);

        await mainMenu();
    }
}