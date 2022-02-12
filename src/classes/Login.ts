import { database } from "../main"; 
import { User } from "./User";
import promptstypes from "prompts";

let prompts = require("prompts");

export class Login {
    private username: string = "";
    private password: string = "";

    //checks if the entered username and password are stored in the database
    public async checkLogin(): Promise<User> {
        console.log("Welcome to your own ERCM system\nPlease Log in");
        let proceed: boolean = false;
        let user: User;
        while (!proceed) {
            let response: promptstypes.Answers<string> = await prompts({
                type: "text",
                name: "value",
                message: "Enter your username?"
            });
            this.username = response.value;
            user = await database.checkUser(this.username);
            if (user) {
                response = await prompts({
                    type: "password",
                    name: "value",
                    message: "Enter your password"
                });
                this.password = response.value;

                user = await database.checkUser(this.username, this.password);
                if (user) {
                    proceed = true;
                } else {
                    console.log("Password is wrong");
                }
            } else {
                console.log("Username doesnt exists");
            }
        }
        console.log("Hello " + this.username + "!");
        return user;
    }
}