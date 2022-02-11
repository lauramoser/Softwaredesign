import { database, mainMenu } from "../main";
import { Article } from "./Article";
import { Customer } from "./Customer";
import { LittleOrder, BigOrder } from "./Order";
import { StatisticArticle, StatisticCustomer } from "./Statistic";

let prompts = require('prompts');

export class User {
    public username: string;
    public password: string;
    public role: boolean;
    public gender: string;

    private littleOrders: LittleOrder[] = []; // Array von ArticleOrders

    constructor(username: string, password: string, role: boolean, gender: string) {
        this.username = username;
        this.password = password;
        this.gender = gender;
        this.role = role;
    }

    private async createLittleOrder(article?: Article): Promise<LittleOrder> {
        if (!article) {
            article = await this.searchArticle(false);
        }
        if (article.dateOfMarketLaunch > new Date()) {
            console.log("this article has not had a market lauch yet\nPlease specify another item");
            return this.createLittleOrder();
        }
        let response = await prompts({
            type: 'number',
            name: 'value',
            message: 'Amount of article:',
        });
        let amountOfArticle = response.value; //TODO check if number & >mindestbestellmenge & < maxMenge
        //TODO preis ausrechnen evtl mit mengenrabatt
        let price: number = 5;
        let littleOrder: LittleOrder = {
            articleId: article.id, amount: amountOfArticle, price: price
        }
        return littleOrder;
    }

    private async createBigOrder(customer?: Customer): Promise<BigOrder> {
        if (!customer) {
            customer = await this.searchCustomer(false);
        }
        let response = await prompts({
            type: 'number',
            name: 'value',
            message: 'ID:',
        });
        let id = response.value;
        let idAlreadyTaken: boolean = await database.checkOrderId(id);
        if (!idAlreadyTaken) {
            response = await prompts({
                type: 'string',
                name: 'value',
                message: 'Description:',
            })
            let description = response.value;
            let price: number = 0;
            let deliveryDate: Date = new Date();
            let orderDate: Date = deliveryDate;
            let standardDeliveryTime: number = 0;
            this.littleOrders.forEach(littleOrder => {
                price = price + littleOrder.price;
                let article: Article = await database.getArticle(littleOrder.articleId);
                if(article){
                if(article.standardDeliveryTime>standardDeliveryTime) {
                    standardDeliveryTime = article.standardDeliveryTime;
                }
            } else {
                console.log("This Id doesn't exist, id: " + article.id);
            }
            });
            deliveryDate.setDate(deliveryDate.getDate() + standardDeliveryTime);
            let bigOrder: BigOrder = { id: id, description: description, customerId: customer.id, totalprice: price, orderDate: orderDate, deliveryDate: deliveryDate, littleOrders: this.littleOrders };
            return bigOrder;
        } else {
            console.log("this ID already exists.\nPlease choose another ID!\n")
            return this.createBigOrder(customer);
        }
    }

    public async createOrder(pCustomer?: Customer, pArticle?: Article): Promise<BigOrder> {
        let customer: Customer;
        let article: Article;
        if (pArticle) {
            article = pArticle;
        }
        if (pCustomer) {
            customer = pCustomer;
        }
        console.log("Please fill in all necessary data for the new Order");
        let addOtherOrders: boolean = true;
        while (addOtherOrders) {
            let littleOrder: LittleOrder = await this.createLittleOrder(article);
            this.littleOrders.push(littleOrder);
            article = null;
            let response = await prompts({
                type: 'select',
                name: 'value',
                message: 'Do you want to add another article?',
                choices: [
                    { title: 'Yes', value: 0 },
                    { title: 'No', value: 1 },
                ],
            });
            let select = response.value;
            if (select == 1) {
                addOtherOrders = false;
            }
        }
        let bigOrder: BigOrder = await this.createBigOrder(customer);

        if (!database.saveOrder(bigOrder)) {
            console.log("Create order failed");
            return this.createOrder(customer, article);
        }
    }

    public async summary(order: BigOrder): Promise<void> {
        //TODO
    }

    public async searchOrder(askToEdit?: boolean): Promise<BigOrder> {
        if (askToEdit == undefined)
            askToEdit = true;
        let returnOrder: BigOrder = undefined;
        let choices: { title: string }[] = [];
        let allOrder: BigOrder[] = await database.getAllBigOrders();
        allOrder.forEach(order => {
            choices.push({ title: order.id.toString() })
        });
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Do you want to search for the Order by ID or by description?',
            choices: [
                { title: 'by ID', value: 0 },
                { title: 'by description', value: 1 },
            ],
        });
        let select = response.value;
        if (select == 1) {
            let choices: { title: string }[] = [];
            let allOrder: BigOrder[] = await database.getAllBigOrders();
            allOrder.forEach(order => {
                choices.push({ title: order.description });
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired Order',
                choices: choices,
            });
            let desiredOrder = response.value;
            allOrder.forEach(order => {
                if(order.description == desiredOrder) {
                    returnOrder = order;
                }
            });
            if (returnOrder == undefined) {
                console.log("description not found");
                return await this.searchOrder(askToEdit);
            }
        }
        else {
            let choices: { title: string }[] = [];
            let allOrder: BigOrder[] = await database.getAllBigOrders();
            allOrder.forEach(order => {
                choices.push({ title: order.id.toString() })
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired order',
                choices: choices,
            });
            let desiredOrderString: string = response.value;
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
                type: 'select',
                name: 'value',
                message: 'What do you want to do with this order?',
                choices: [
                    { title: 'I want to edit the order', value: 0 },
                    { title: 'I want to go back to the main Menu', value: 1 },
                ],
            });
            let select = response.value;
            if (select == 0) {
                returnOrder = await this.editOrder(returnOrder);
            } else
                await mainMenu();
        }
        return returnOrder;
    }

    public async editOrder(pOrder?: BigOrder): Promise<BigOrder> { // TODO edit order bullshit
        let bigorder: BigOrder;
        if (pOrder) {
            bigorder = pOrder;
        } else {
            bigorder = await this.searchOrder(false);
        }
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'What would you like to change in this order?',
            choices: [
                { title: 'Amount of Article', value: 0 },
                { title: 'Description', value: 1 },
            ],
        });
        let select = response.value;
        if (select == 0) { 
            let response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Enter the new order amount:',
            });
            let newAmountOfArticle: number = response.value;
            if (newAmountOfArticle != undefined) {
                if (newAmountOfArticle.toString().trim().length > 0) {
                    let newOrder: BigOrder = {id: bigorder.id};
                    newOrder = await database.changeOrder(bigorder, newOrder);
                } else {
                    console.log("You have to enter something");
                    return this.editOrder(bigorder);
                }
            }
        } else if (select == 1) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new description:',
            });
            let newDescription: string = response.value;
            if (newDescription != undefined) {
                if (newDescription.trim().length > 0) {
                    let newOrder: BigOrder = {id: bigorder.id,};
                    newOrder = await database.changeOrder(bigorder, newOrder);
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

    public async createCustomer(): Promise<Customer> {
        console.log("Please fill in all necessary data for the new customer");
        let response = await prompts({
            type: 'number',
            name: 'value',
            message: 'ID:',
        });
        let id = response.value;
        let idAlreadyTaken: boolean = await database.checkCustomerId(id);
        if (!idAlreadyTaken) {
            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Name:',
            });
            let name = response.value;

            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'address:',
            });
            let address = response.value;

            response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Customer Discount:',
            });
            let customerDiscount = response.value;

            if (!database.saveCustomer(id, name, address, customerDiscount)) {
                console.log("Create article failed");
                return this.createCustomer();
            }
        }
        else {
            console.log("this ID already exists.\nPlease choose another ID!\n");
            return this.createCustomer();
        }
        console.log("You successfully created a customer")
        await mainMenu();
    }

    public async searchCustomer(askToEdit?: boolean): Promise<Customer> {
        if (askToEdit == undefined)
            askToEdit = true;
        let returnCustomer: Customer = undefined;
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Do you want to search for the Customer by ID or by name?',
            choices: [
                { title: 'by ID', value: 0 },
                { title: 'by name', value: 1 },
            ],
        });
        let select = response.value;
        if (select == 1) {
            let choices: { title: string }[] = [];
            let allCustomer: Customer[] = await database.getAllCustomer();
            allCustomer.forEach(customer => {
                choices.push({ title: customer.name });
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired customer',
                choices: choices,
            });
            let desiredCustomer = response.value;
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
                choices.push({ title: customer.id.toString() })
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired customer',
                choices: choices,
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
                type: 'select',
                name: 'value',
                message: 'What do you want to do with this customer?',
                choices: [
                    { title: 'I want to edit the customer', value: 0 },
                    { title: 'I want to make an order', value: 1 },
                    { title: 'I want to view the customer statistics ', value: 2 },
                    { title: 'I want to go back to the main Menu', value: 3 },
                ],
            });
            let select = response.value;
            if (select == 0) {
                returnCustomer = await this.editCustomer(returnCustomer);
            } else if (select == 1) {
                await this.createOrder(returnCustomer);
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
        console.log(customer)
        if (pCustomer) {
            customer = pCustomer;
        } else {
            customer = await this.searchCustomer(false);
        }
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'What would you like to change for this customer?',
            choices: [
                { title: 'Name', value: 0 },
                { title: 'Address', value: 1 },
                { title: 'Customer discount', value: 2 },
            ],
        });
        let select = response.value;
        if (select == 0) {
            console.log("Name: " + customer.name);
            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new name:',
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
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new address:',
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
            console.log("Customer discount: " + customer.customerDiscount)
            let response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Enter the new customer discount:',
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

    }

    public async searchArticle(askToEdit?: boolean): Promise<Article> {
        if (askToEdit == undefined)
            askToEdit = true;
        let returnArticle: Article = undefined;
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'Do you want to search for the article by ID or by description?',
            choices: [
                { title: 'by ID', value: 0 },
                { title: 'by description', value: 1 },
            ],
        });
        let select = response.value;
        if (select == 1) {
            let choices: { title: string }[] = [];
            let allArticle: Article[] = await database.getAllArticle();
            allArticle.forEach(article => {
                choices.push({ title: article.description });
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired article',
                choices: choices,
            });
            let desiredArticle = response.value;
            allArticle.forEach(article => {
                if (article.description == desiredArticle) {
                    returnArticle = article;
                }
            });
            if (returnArticle == undefined) {
                console.log("Description not found");
                return await this.searchArticle(askToEdit);
            }
        }
        else {
            let choices: { title: string }[] = [];
            let allArticle: Article[] = await database.getAllArticle();
            allArticle.forEach(article => {
                choices.push({ title: article.id.toString() })
            });
            response = await prompts({
                type: 'autocomplete',
                name: 'value',
                message: 'Enter your desired article',
                choices: choices,
            });
            let desiredArticleString: string = response.value;
            console.log(desiredArticleString);
            if (!isNaN(Number(desiredArticleString))) {
                console.log(Number(desiredArticleString));
                allArticle.forEach(article => {
                    if (article.id == Number(desiredArticleString)) {
                        returnArticle = article;
                    }
                });
            } else {
                console.log("ID not found");
                return await this.searchArticle(askToEdit);
            }
        }
        console.log(returnArticle);
        if (askToEdit) {
            response = await prompts({
                type: 'select',
                name: 'value',
                message: 'What do you want to do with this article?',
                choices: [
                    { title: 'I want to edit the article', value: 0 },
                    { title: 'I want to make an order', value: 1 },
                    { title: 'I want to view the article statistics ', value: 2 },
                    { title: 'I want to go back to the main Menu', value: 3 },
                ],
            });
            let select = response.value;
            if (select == 0) {
                returnArticle = await this.editArticle(returnArticle);
            } else if (select == 1) {
                await this.createOrder();
            } else if (select == 2) {
                await this.statisticArticle(returnArticle);
            } else if (select == 3) {
                await mainMenu();
            }
        }
        return returnArticle;
    }

    public async editArticle(pArticle?: Article): Promise<Article> {
        let article: Article;
        if (pArticle) {
            article = pArticle;
        } else {
            article = await this.searchArticle(false);
        }
        let response = await prompts({
            type: 'select',
            name: 'value',
            message: 'What would you like to change in this article?',
            choices: [
                { title: 'Description', value: 0 },
                { title: 'Date of market launch', value: 1 },
                { title: 'Price', value: 2 },
                { title: 'Standard delivery time', value: 3 },
                { title: 'Minimum order size', value: 4 },
                { title: 'Maximum order size', value: 5 },
                { title: 'Discount order size', value: 6 },
                { title: 'Associated discount', value: 7 },
            ],
        });
        let select = response.value;
        if (select == 0) {
            console.log("Description: " + article.description)
            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new description:',
            });
            let newDescription: string = response.value;
            if (newDescription != undefined) {
                if (newDescription.trim().length > 0) {
                    console.log(newDescription);
                    let newArticle: Article = new Article(article.id, newDescription, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle);
                } else {
                    console.log("Please add more than whitespace characters");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 1) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter the new date of market launch:',
            });
            let newDateOfMarketLaunchString: string = response.value;
            let timestamp: number = Date.parse(newDateOfMarketLaunchString);
            if (!isNaN(timestamp) && !undefined && newDateOfMarketLaunchString.match(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/)) {
                let newDateOfMarketLaunch: Date = new Date(timestamp);
                let newArticle: Article = new Article(article.id, article.description, newDateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                newArticle = await database.changeArticle(article, newArticle);
            } else {
                console.log("This is not a date. Try again");
                return this.editArticle(article);
            }
        } else if (select == 2) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Price:',
            });
            let newPriceString: string = response.value;
            let newPrice: number = Number.parseFloat(newPriceString);
            if (!isNaN(newPrice) && !undefined) {
                let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, newPrice, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                newArticle = await database.changeArticle(article, newArticle)
            } else {
                console.log("This is not a number. Try again");
                return this.editArticle(article);
            }
        } else if (select == 3) {
            let response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Standard delivery time:',
            });
            let newStandardDeliveryTime: number = response.value;
            if (newStandardDeliveryTime != undefined) {
                if (newStandardDeliveryTime.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, newStandardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle)
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 4) {
            let response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Minimum order size:',
            });
            let newMinimumOrderSize: number = response.value;
            if (newMinimumOrderSize != undefined) {
                if (newMinimumOrderSize.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, newMinimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle)
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 5) {
            let response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Maximum order size:',
            });
            let newMaximumOrderSize: number = response.value;
            if (newMaximumOrderSize != undefined) {
                if (newMaximumOrderSize.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, newMaximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle)
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 6) {
            let response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Discount order size:',
            });
            let newDiscountOrderSize: number = response.value;
            if (newDiscountOrderSize != undefined) {
                if (newDiscountOrderSize.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, newDiscountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle)
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 7) {
            let response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Associated discount:',
            });
            let newAssociatedDiscount: number = response.value;
            if (newAssociatedDiscount != undefined) {
                if (newAssociatedDiscount.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, newAssociatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle)
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        }
        console.log("You successfully edited this article");
        await mainMenu();
    }

    public async statisticArticle(article: Article): Promise<void> {

    }
}



