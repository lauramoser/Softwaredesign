import { database, mainMenu } from "../main";
import { User } from "./User";
import { Article } from "./Article";


let prompts = require('prompts');

export class Admin extends User {

    constructor(username: string, password: string, role: boolean, gender: string) {
        super(username, password, role, gender);
    }

    public async createUser(): Promise<User> {
        console.log("Please fill in all necessary data for the new User")
        let response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Username:',
        });
        this.username = response.value;
        let usernameAlreadyTaken: User = await database.checkUser(this.username);
        if (!usernameAlreadyTaken) {
            response = await prompts({
                type: 'password',
                name: 'value',
                message: 'Password:',
                min: 5,
                max: 10
            });
            this.password = response.value;

            response = await prompts({
                type: 'select',
                name: 'value',
                message: 'What gender has the user?',
                choices: [
                    { title: 'female' },
                    { title: 'male' },
                    { title: 'diverse' },
                ],
            });
            this.gender = response.value;

            response = await prompts({
                type: 'select',
                name: 'value',
                message: 'What role has the user?',
                choices: [
                    { title: 'Admin' },
                    { title: 'User' },
                ],
            });
            this.role = response.value;

            if (!database.saveUser(this.username, this.password, this.gender, this.role)) {
                console.log("Create user failed");
                return this.createUser();
            }
        } else {
            console.log("this username already exists.\nPlease choose another username!\n")
            return this.createUser();
        }
        console.log("You have created an user")
        await mainMenu();
    }

    public async changeRole(): Promise<boolean> {
        console.log("From which user do you want to change the role?")
        let response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Username:',
        });
        let username = response.value;
        let founduser: User = await database.checkUser(username);
        if (founduser) {
            founduser.role = !founduser.role;
            if (await database.changeUser(username, founduser)){
                console.log("You successfully changed the role of this user")
                await mainMenu()
                return true;
            }
            else
                return false;
        } else {
            console.log("This user doesn't exist")
            return this.changeRole();
        }
    }

    public async createArticle(): Promise<Article> {
        let returnArticle: Article = undefined;
        console.log("Please fill in all necessary data for the new article")
        let response = await prompts({
            type: 'number',
            name: 'value',
            message: 'ID:',
        });
        let id: number = response.value;
        let idAlreadyTaken: boolean = await database.checkArticleId(id);
        if (!idAlreadyTaken) {
            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Description:',
            });
            let description: string = response.value;

            response = await prompts({
                type: 'date',
                name: 'value',
                message: 'Date of market launch:',
            });
            let dateOfMarketLaunch: Date = response.value;

            response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Price:',
            });
            let price: number = response.value;

            response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Standard delivery time:',
            });
            let standardDeliveryTime: number = response.value;

            response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Minimum order size:',
            });
            let minimumOrderSize: number = response.value;

            response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Maximum order size:',
            });
            let maximumOrderSize: number = response.value;

            response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Discount order size:',
            });
            let discountOrderSize: number = response.value;

            response = await prompts({
                type: 'number',
                name: 'value',
                message: 'Associated discount:',
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
        console.log("You successfully created an article!")
        await mainMenu();
       
    }
}

