import { database, mainMenu } from "../main";
import { User } from "./User";
import promptstypes from "prompts";
import { testPasswordSecurity } from "./TestMethods";

let prompts = require("prompts");

export class Admin extends User {

    //constructor to create new user
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
        let newUsername: string = response.value;
        //checks if username is already taken because name must be unique
        let usernameAlreadyTaken: User = await database.checkUser(newUsername);
        if (!usernameAlreadyTaken) {
            response = await prompts({
                type: "password",
                name: "value",
                message: "Password (Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character):",
                min: 5,
                max: 10
            });
            let newPassword: string = response.value;
            //checks if password is secure
            if (testPasswordSecurity(newPassword)) {
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
                let newgender: string = response.value;

                response = await prompts({
                    type: "select",
                    name: "value",
                    message: "What role has the user?",
                    choices: [
                        { title: "Admin" },
                        { title: "User" }
                    ]
                });
                let newrole: boolean = response.value;
                //if saving in database failed
                if (!database.saveUser(newUsername, newPassword, newgender, newrole)) {
                    console.log("Create user failed");
                    return this.createUser();
                }
            } else {
                console.log("Please type in a safe password");
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

