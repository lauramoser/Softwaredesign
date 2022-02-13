import { articleMethods, customerMethods, database, mainMenu } from "../main";
import { Article } from "./Article";
import { Customer } from "./Customer";
import { BigOrder, LittleOrder } from "./Order";
import promptstypes from "prompts";

let prompts = require("prompts");

export class OrderMethods {

    private littleOrders: LittleOrder[] = [];

    public async createOrder(pCustomer?: Customer, pArticle?: Article): Promise<BigOrder> {
        let customer: Customer;
        let article: Article;
        //save given article or/and customer
        if (pArticle) {
            article = pArticle;
        }
        if (pCustomer) {
            customer = pCustomer;
        }
        let addOtherOrders: boolean = true;
        //As long as addOtherOrders = true then choose new item
        while (addOtherOrders) {
            let littleOrder: LittleOrder = await this.createLittleOrder(article);
            this.littleOrders.push(littleOrder);
            article = null;
            let response: promptstypes.Answers<string> = await prompts({
                type: "select",
                name: "value",
                message: "Do you want to add another article?",
                choices: [
                    { title: "Yes", value: 0 },
                    { title: "No", value: 1 }
                ]
            });
            let select: number = response.value;
            if (select == 1) {
                addOtherOrders = false;
            }
        }
        let bigOrder: BigOrder = await this.createBigOrder(customer);
        console.log(bigOrder);
        
        if (!database.saveOrder(bigOrder)) {
            console.log("Create order failed");
            return this.createOrder(customer, article);
        }

        await this.summary(bigOrder);
    }

    public async searchOrder(askToEdit?: boolean): Promise<BigOrder> {
        //if askToEdit = false then user comes from editOrder()
        if (askToEdit == undefined)
            askToEdit = true;
        let returnOrder: BigOrder = undefined;
        //array for all existing orders 
        let choices: { title: string }[] = [];
        let allOrder: BigOrder[] = await database.getAllBigOrders();   
        let response: promptstypes.Answers<string> = await prompts({
            type: "select",
            name: "value",
            message: "Do you want to search for the Order by ID or by description?",
            choices: [
                { title: "by ID", value: 0 },
                { title: "by description", value: 1 }
            ]
        });
        let select: number = response.value;
        if (select == 1) {
            //add all found customer descriptions into the array
            allOrder.forEach(order => {
                choices.push({ title: order.description });
            });
            response = await prompts({
                type: "autocomplete",
                name: "value",
                message: "Enter your desired Order",
                choices: choices
            });
            let desiredOrder: string = response.value;
            //search for the entered description in array 
            allOrder.forEach(order => {
                if (order.description == desiredOrder) {
                    returnOrder = order;
                }
            });
            if (returnOrder == undefined) {
                console.log("description not found");
                return await this.searchOrder(askToEdit);
            }
        }
        else {
            allOrder.forEach(order => {
                choices.push({ title: order.id.toString() });
            });
            response = await prompts({
                type: "autocomplete",
                name: "value",
                message: "Enter your desired order",
                choices: choices
            });
            let desiredOrderString: string = response.value;
            //check if a number has been entered
            console.log(desiredOrderString);
            if (!isNaN(Number(desiredOrderString))) {
                console.log(Number(desiredOrderString));
                allOrder.forEach(order => {
                    if (order.id == Number(desiredOrderString)) {
                        returnOrder = order;
                    }
                });
            } else {
                console.log("ID not found");
                return await this.searchOrder(askToEdit);
            }
        }
        console.log(returnOrder);
        if (askToEdit) {
            response = await prompts({
                type: "select",
                name: "value",
                message: "What do you want to do with this order?",
                choices: [
                    { title: "I want to edit the order", value: 0 },
                    { title: "I want to go back to the main Menu", value: 1 }
                ]
            });
            let select: number = response.value;
            if (select == 0) {
                returnOrder = await this.editOrder(returnOrder);
            } else
                await mainMenu();
        }
        return returnOrder;
    }

    public async editOrder(pOrder?: BigOrder): Promise<BigOrder> {
        let bigorder: BigOrder;
        //when user comes from searchOrder() order is passed in 
        if (pOrder) {
            bigorder = pOrder;
        } else {
            bigorder = await this.searchOrder(false);
        }
        let response: promptstypes.Answers<string> = await prompts({
            type: "select",
            name: "value",
            message: "What would you like to change in this order?",
            choices: [
                { title: "Description", value: 0 }
            ]
        });
        let select: number = response.value;
        if (select == 0) {
            let response: promptstypes.Answers<string> = await prompts({
                type: "text",
                name: "value",
                message: "Enter the new description:"
            });
            let newDescription: string = response.value;
            // check if something was entered
            if (newDescription != undefined) {
                //check if more than just whitespaces were entered
                if (newDescription.trim().length > 0) {
                    //save customer with unchanged and new variable 
                    let newOrder: BigOrder = { id: bigorder.id, description: bigorder.description, customerId: bigorder.customerId, totalprice: bigorder.totalprice, orderDate: bigorder.orderDate, deliveryDate: bigorder.deliveryDate, littleOrders: bigorder.littleOrders, customerDiscountInEuro: bigorder.customerDiscountInEuro };
                    newOrder = await database.changeBigOrder(bigorder, newOrder);
                } else {
                    console.log("Please add more than whitespace characters");
                    return this.editOrder(bigorder);
                }
            } else {
                console.log("You have to enter something");
                return this.editOrder(bigorder);
            }
        }
        console.log("You successfully edited this order");
        await mainMenu();
    }

    public async summary(order: BigOrder): Promise<void> {
        //get Id of the customer from the database 
        let customer: Customer = await database.getCustomer(order.customerId);
        //declaration of string where all purchased items will be filled in
        let articleString: string = "";
        // go through all littleOrders and get the complete article from the database using the ID  
        for (let i: number = 0; i < order.littleOrders.length; i++) {
            let littleOrder: LittleOrder = order.littleOrders[i];
            let article: Article = await database.getArticle(littleOrder.articleId);
            articleString = articleString + article.description + ", Anzahl: " + littleOrder.amount + ", Preis: " + littleOrder.price + "€" + "\n";
        }
        console.log("Order ID: " + order.id + "\nCustomer: " + customer.name + "\nOrder date: " + order.orderDate + "\nDelivery date: " + order.deliveryDate + "\nTotalPrice: " + order.totalprice + "€" + "\n\nOrdered article: " + articleString);
        await mainMenu();
    }

    private async createLittleOrder(article?: Article): Promise<LittleOrder> {
        //if no article is passed search for article 
        if (!article) {
            article = await articleMethods.searchArticle(false);
        }
        //checking if the market launch has already taken place
        if (article.dateOfMarketLaunch > new Date()) {
            console.log("this article has not had a market launch yet\nPlease specify another item");
            return this.createLittleOrder();
        }
        let response: promptstypes.Answers<string> = await prompts({
            type: "number",
            name: "value",
            message: "Amount of article:"
        });
        let amountOfArticle: number = response.value;
        let price: number;
        //checking max and min order size and discount order size
        if (amountOfArticle >= article.minimumOrderSize && amountOfArticle <= article.maximumOrderSize) {
            if (amountOfArticle >= article.discountOrderSize) {
                price = (article.price * amountOfArticle) - (article.price * amountOfArticle * (article.associatedDiscount / 100));
            }
            //Calculate price for only this article
            else {
                price = article.price * amountOfArticle;
            }
        } else {
            console.log("your desired quantity is above or below the order value");
            return await this.createLittleOrder(article);
        }
        //calculate the given discount in € for statistic
        let associatedDiscountInEuro: number = (article.price * amountOfArticle) - price;
        //save littleOrder 
        let littleOrder: LittleOrder = {
            articleId: article.id, amount: amountOfArticle, price: price, associatedDiscountInEuro: associatedDiscountInEuro
        };
        return littleOrder;
    }

    private async createBigOrder(customer?: Customer): Promise<BigOrder> {
        //if no customer is passed search for customer 
        if (!customer) {
            customer = await customerMethods.searchCustomer(false);
        }
        let response: promptstypes.Answers<string> = await prompts({
            type: "number",
            name: "value",
            message: "Give this order an ID:"
        });
        let id: number = response.value;
        let idAlreadyTaken: boolean = await database.checkOrderId(id);
        if (!idAlreadyTaken) {
            response = await prompts({
                type: "text",
                name: "value",
                message: "Description:"
            });
            //declaration of required variables 
            let description: string = response.value;
            let price: number = 0;
            let deliveryDate: Date = new Date();
            let orderDate: Date = new Date();
            let standardDeliveryTime: number = 0;
            //add up the price of all Little Orders 
            for (let i: number = 0; i < this.littleOrders.length; i++) {
                let littleOrder: LittleOrder = this.littleOrders[i];
                price = price + littleOrder.price;
                let article: Article = await database.getArticle(littleOrder.articleId);
                //if the deliverday is higher than the current one then take the new one 
                if (article) {
                    if (article.standardDeliveryTime > standardDeliveryTime) {
                        standardDeliveryTime = article.standardDeliveryTime;
                    }
                }
            }
            //convert customerdiscount from % to € customerdiscount 
            let customerDiscountInEuro: number = price * (customer.customerDiscount / 100);
            // calculate total price
            let totalPrice: number = Math.round(price - customerDiscountInEuro);
            // calculate today + deliverytime
            let newDate: number = deliveryDate.getDate() + standardDeliveryTime;
            deliveryDate.setDate(newDate); 
            let bigOrder: BigOrder = { id: id, description: description, customerId: customer.id, totalprice: totalPrice, orderDate: orderDate, deliveryDate: deliveryDate, littleOrders: this.littleOrders, customerDiscountInEuro: customerDiscountInEuro };
            return bigOrder;
        } else {
            console.log("this ID already exists.\nPlease choose another ID!\n");
            return this.createBigOrder(customer);
        }
    }
}