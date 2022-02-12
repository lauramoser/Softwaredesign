import { database, mainMenu, orderMethods } from "../main";
import { Article } from "./Article";
import { LittleOrder } from "./Order";
import promptstypes from "prompts";

let prompts = require("prompts");

export class ArticleMethods {

    public async createArticle(): Promise<Article> {
        let returnArticle: Article = undefined;
        console.log("Please fill in all necessary data for the new article");
        let response: promptstypes.Answers<string> = await prompts({
            type: "number",
            name: "value",
            message: "ID:"
        });
        let id: number = response.value;
        let idAlreadyTaken: boolean = await database.checkArticleId(id);
        if (!idAlreadyTaken) {
            response = await prompts({
                type: "text",
                name: "value",
                message: "Description:"
            });
            let description: string = response.value;

            response = await prompts({
                type: "date",
                name: "value",
                message: "Date of market launch:"
            });
            let dateOfMarketLaunch: Date = response.value;

            response = await prompts({
                type: "number",
                name: "value",
                message: "Price:"
            });
            let price: number = response.value;

            response = await prompts({
                type: "number",
                name: "value",
                message: "Standard delivery time:"
            });
            let standardDeliveryTime: number = response.value;

            response = await prompts({
                type: "number",
                name: "value",
                message: "Minimum order size:"
            });
            let minimumOrderSize: number = response.value;

            response = await prompts({
                type: "number",
                name: "value",
                message: "Maximum order size:"
            });
            let maximumOrderSize: number = response.value;

            response = await prompts({
                type: "number",
                name: "value",
                message: "Discount order size:"
            });
            let discountOrderSize: number = response.value;

            response = await prompts({
                type: "number",
                name: "value",
                message: "Associated discount:"
            });
            let associatedDiscount: number = response.value;

            if (!database.saveArticle(id, description, dateOfMarketLaunch, price, standardDeliveryTime, minimumOrderSize, maximumOrderSize, discountOrderSize, associatedDiscount)) {
                console.log("Create article failed");
                return this.createArticle();
            }
        }
        else {
            console.log("this ID already exists.\nPlease choose another ID!\n");
            return this.createArticle();
        }
        console.log("You successfully created an article!");
        await mainMenu();

    }

    public async searchArticle(askToEdit?: boolean): Promise<Article> {
        if (askToEdit == undefined)
            askToEdit = true;
        let returnArticle: Article = undefined;
        let response: promptstypes.Answers<string> = await prompts({
            type: "select",
            name: "value",
            message: "Do you want to search for the article by ID or by description?",
            choices: [
                { title: "by ID", value: 0 },
                { title: "by description", value: 1 }
            ]
        });
        let select: number = response.value;
        if (select == 1) {
            let choices: { title: string }[] = [];
            let allArticle: Article[] = await database.getAllArticle();
            allArticle.forEach(article => {
                choices.push({ title: article.description });
            });
            response = await prompts({
                type: "autocomplete",
                name: "value",
                message: "Enter your desired article",
                choices: choices
            });
            let desiredArticle: string = response.value;
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
                choices.push({ title: article.id.toString() });
            });
            response = await prompts({
                type: "autocomplete",
                name: "value",
                message: "Enter your desired article",
                choices: choices
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
                type: "select",
                name: "value",
                message: "What do you want to do with this article?",
                choices: [
                    { title: "I want to edit the article", value: 0 },
                    { title: "I want to make an order", value: 1 },
                    { title: "I want to view the article statistics ", value: 2 },
                    { title: "I want to go back to the main Menu", value: 3 }
                ]
            });
            let select: number = response.value;
            if (select == 0) {
                returnArticle = await this.editArticle(returnArticle);
                return returnArticle;
            } else if (select == 1) {
                await orderMethods.createOrder(null, returnArticle);
            } else if (select == 2) {
                await this.statisticArticle(returnArticle);
                return returnArticle;
            } else if (select == 3) {
                await mainMenu();
            }
            return null;
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
        let response: promptstypes.Answers<string> = await prompts({
            type: "select",
            name: "value",
            message: "What would you like to change in this article?",
            choices: [
                { title: "Description", value: 0 },
                { title: "Date of market launch", value: 1 },
                { title: "Price", value: 2 },
                { title: "Standard delivery time", value: 3 },
                { title: "Minimum order size", value: 4 },
                { title: "Maximum order size", value: 5 },
                { title: "Discount order size", value: 6 },
                { title: "Associated discount", value: 7 }
            ]
        });
        let select: number = response.value;
        if (select == 0) {
            console.log("Description: " + article.description);
            response = await prompts({
                type: "text",
                name: "value",
                message: "Enter the new description:"
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
            let response: promptstypes.Answers<string> = await prompts({
                type: "text",
                name: "value",
                message: "Enter the new date of market launch:"
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
            let response: promptstypes.Answers<string> = await prompts({
                type: "text",
                name: "value",
                message: "Price:"
            });
            let newPriceString: string = response.value;
            let newPrice: number = Number.parseFloat(newPriceString);
            if (!isNaN(newPrice) && !undefined) {
                let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, newPrice, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                newArticle = await database.changeArticle(article, newArticle);
            } else {
                console.log("This is not a number. Try again");
                return this.editArticle(article);
            }
        } else if (select == 3) {
            let response: promptstypes.Answers<string> = await prompts({
                type: "number",
                name: "value",
                message: "Standard delivery time:"
            });
            let newStandardDeliveryTime: number = response.value;
            if (newStandardDeliveryTime != undefined) {
                if (newStandardDeliveryTime.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, newStandardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle);
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 4) {
            let response: promptstypes.Answers<string> = await prompts({
                type: "number",
                name: "value",
                message: "Minimum order size:"
            });
            let newMinimumOrderSize: number = response.value;
            if (newMinimumOrderSize != undefined) {
                if (newMinimumOrderSize.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, newMinimumOrderSize, article.maximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle);
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 5) {
            let response: promptstypes.Answers<string> = await prompts({
                type: "number",
                name: "value",
                message: "Maximum order size:"
            });
            let newMaximumOrderSize: number = response.value;
            if (newMaximumOrderSize != undefined) {
                if (newMaximumOrderSize.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, newMaximumOrderSize, article.discountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle);
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 6) {
            let response: promptstypes.Answers<string> = await prompts({
                type: "number",
                name: "value",
                message: "Discount order size:"
            });
            let newDiscountOrderSize: number = response.value;
            if (newDiscountOrderSize != undefined) {
                if (newDiscountOrderSize.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, newDiscountOrderSize, article.associatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle);
                } else {
                    console.log("Please type in a number");
                    return this.editArticle(article);
                }
            } else {
                console.log("You have to enter something");
                return this.editArticle(article);
            }
        } else if (select == 7) {
            let response: promptstypes.Answers<string> = await prompts({
                type: "number",
                name: "value",
                message: "Associated discount:"
            });
            let newAssociatedDiscount: number = response.value;
            if (newAssociatedDiscount != undefined) {
                if (newAssociatedDiscount.toString().trim().length > 0) {
                    let newArticle: Article = new Article(article.id, article.description, article.dateOfMarketLaunch, article.price, article.standardDeliveryTime, article.minimumOrderSize, article.maximumOrderSize, article.discountOrderSize, newAssociatedDiscount);
                    newArticle = await database.changeArticle(article, newArticle);
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
        //check allLittleOrders wo die ID von mitgeshcicktem Artikel dirn ist.
        let allLittleOrderFromArticle: LittleOrder[] = await database.getAllLittlOrderFromArticle(article.id);
        let littleOrder: LittleOrder[] = [];
        for (let i: number = 0; i < allLittleOrderFromArticle.length; i++) {
            let sizeof = require("sizeof");
            let amountOfOrders: number = sizeof( allLittleOrderFromArticle);
            
        }
        //     let amountOfOrders: number;
        //     let allOrder: BigOrder[] = await database.getAllBigOrders(article.id);
        //     allOrder.forEach(allBigOrder[] => {
        //         choices.push({ title: bigOrder.amountOfArticle }); // alle Anzahlen zusammenrechnen 
        //     });
        //     let moneyMadeArticle: LittleOrder;
        //     let averageOfMoneyMade: number = moneyMadeArticle / ;//? durch was?

        await mainMenu();
    }


}