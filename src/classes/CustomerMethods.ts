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
        //checks if id is already taken because id must be unique
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
            //if saving in database failed go back to beginning
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
        //if askToEdit = false then user comes from editCustomer()
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
            //array for all existing customers 
            let choices: { title: string }[] = [];
            let allCustomer: Customer[] = await database.getAllCustomer();
             //add all found customer descriptions into the array
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
            //search for the entered name in array 
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
            //check if a number has been entered
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
        //when user comes from searchCustomer() customer is passed in 
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
            // check if something was entered
            if (newName != undefined) {
                //check if more than just whitespaces were entered
                if (newName.trim().length > 0) {
                    //save customer with unchanged and new variable 
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
        //get all BigOrders from this customer
        let allBigOrdersFromCustomer: BigOrder[] = await database.getAllBigOrdersFromCustomer(customer.id);
        // all little Orders from this customer
        let allLittleOrderFromCustomer: LittleOrder[] = [];
        // string for console.log
        let bigString: string = "";
        // all articles this customer has ever ordered with right values
        let articlesWithEverything: ArticleWithEverything[] = [];

        // store all small orders of the customer in array
        for (let i: number = 0; i < allBigOrdersFromCustomer.length; i++) {
            let bigOrder: BigOrder = allBigOrdersFromCustomer[i];
            for (let j: number = 0; j < bigOrder.littleOrders.length; j++) {
                let littleOrder: LittleOrder = bigOrder.littleOrders[j];
                allLittleOrderFromCustomer.push(littleOrder);
            }
        }
        // needed if customer ordered the same Article in multiple littleOrders in one bigOrder
        let found: boolean = false;

        // go through all littleOrders from customer
        for (let i: number = 0; i < allLittleOrderFromCustomer.length; i++) {
            found = false;
            let littleOrder: LittleOrder = allLittleOrderFromCustomer[i];
            // go through all ordered articles to check if this article was already counted
            for (let j: number = 0; j < articlesWithEverything.length; j++) {
                let articleWithEverything: ArticleWithEverything = articlesWithEverything[j];
                if (articleWithEverything.articleId == littleOrder.articleId) {
                    // if article was already counted, only increase the values from article and replace article values in array
                    articleWithEverything.completeAmount = articleWithEverything.completeAmount + littleOrder.amount;
                    articleWithEverything.price = articleWithEverything.price + littleOrder.price;
                    articlesWithEverything.splice(j, 1);
                    articlesWithEverything.push(articleWithEverything);
                    found = true;
                    break;
                }
            }
            if (!found) {
                // if article wasnt found already push article with right values in array
                let article: Article = await database.getArticle(littleOrder.articleId);
                let articleWithEverything: ArticleWithEverything = { articleId: article.id, article: article, completeAmount: littleOrder.amount, price: littleOrder.price };
                articlesWithEverything.push(articleWithEverything);
            }
        }
        // complete money made with customer through all orders
        let completeAmountPrice: number = 0;
        // loop through all ordered articles and create a string to log the values for this specific article
        articlesWithEverything.forEach(articleWithEverything => {
            completeAmountPrice = completeAmountPrice + articleWithEverything.price;
            bigString = bigString + "Article: " + articleWithEverything.article.description + ", Amount of article: " + articleWithEverything.completeAmount + ", Money made with this Article:" + articleWithEverything.price + "€\n";
        });
        let givenDiscount: number = 0;
        //loop through all Orders and calculate the complete received discount
        for (let i: number = 0; i < allLittleOrderFromCustomer.length; i++) {
            let littleOrder: LittleOrder = allLittleOrderFromCustomer[i];
            givenDiscount = givenDiscount + littleOrder.associatedDiscountInEuro;
        }
        for (let i: number = 0; i < allBigOrdersFromCustomer.length; i++) {
            let bigOrder: BigOrder = allBigOrdersFromCustomer[i];
            givenDiscount = Math.round(givenDiscount + bigOrder.customerDiscountInEuro);

        }
        bigString = bigString + "Complete discount given to the customer " + givenDiscount + "€\n";
        bigString = bigString + "Complete Money made with customer: " + completeAmountPrice + "€";
        console.log(bigString);

        await mainMenu();
    }
}