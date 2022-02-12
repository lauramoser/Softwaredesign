import { database, mainMenu } from "../main";
import { User } from "./User";
import { Article } from "./Article";
import promptstypes from "prompts";

let prompts = require("prompts");

export class Admin extends User {

    //Save data of the logged in user
    constructor(username: string, password: string, role: boolean, gender: string) {
        super(username, password, role, gender);
    }
    
    public async createUser(): Promise<User> {
        console.log("Please fill in all necessary data for the new User");
        let response: promptstypes.Answers<string> = await prompts({
            type: "text",
            name: "value",
            message: "Username:"
        });
        this.username = response.value;
        //checks if username is already taken because name must be unique
        let usernameAlreadyTaken: User = await database.checkUser(this.username);
        if (!usernameAlreadyTaken) {
            response = await prompts({
                type: "password",
                name: "value",
                message: "Password:",
                min: 5,
                max: 10
            });
            this.password = response.value;

            response = await prompts({
                type: "select",
                name: "value",
                message: "What gender has the user?",
                choices: [
                    { title: "female" },
                    { title: "male" },
                    { title: "diverse" }
                ]
            });
            this.gender = response.value;

            response = await prompts({
                type: "select",
                name: "value",
                message: "What role has the user?",
                choices: [
                    { title: "Admin" },
                    { title: "User" }
                ]
            });
            this.role = response.value;

            if (!database.saveUser(this.username, this.password, this.gender, this.role)) {
                console.log("Create user failed");
                return this.createUser();
            }
        } else {
            console.log("this username already exists.\nPlease choose another username!\n");
            return this.createUser();
        }
        console.log("You have created an user");
        await mainMenu();
    }

    public async changeRole(): Promise<boolean> {
        console.log("From which user do you want to change the role?");
        let response: promptstypes.Answers<string> = await prompts({
            type: "text",
            name: "value",
            message: "Username:"
        });
        let username: string = response.value;
        //check if the username exists
        let founduser: User = await database.checkUser(username);
        if (founduser) {
            //reverse boolean of the role 
            founduser.role = !founduser.role;
            if (await database.changeUsersRole(username, founduser)) {
                console.log("You successfully changed the role of this user");
                await mainMenu();
                return true;
            }
            else
                return false;
        } else {
            console.log("This user doesn't exist");
            return this.changeRole();
        }
    }
}

