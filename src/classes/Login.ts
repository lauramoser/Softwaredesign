import { database } from "../main" //.. heißt ein Ordner drüber also src
import { User } from "./User";
let prompts = require('prompts');

export class Login {
    private username: string = "";
    private password: string = "";

    public async checkLogin(): Promise<User> {
        console.log("Welcome to your own ERCM system\n Log in");
        let proceed: boolean = false;
        let user: User;
        while (!proceed) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter your username?',
            });
            this.username = response.value;
            user = await database.checkUser(this.username);
            if (user) {
                response = await prompts({
                    type: 'password',
                    name: 'value',
                    message: 'Enter your password',
                });
                this.password = response.value;

                user = await database.checkUser(this.username, this.password);
                if (user) {
                    proceed = true;
                } else {
                    console.log("Password is wrong")
                }
            } else {
                console.log("Username doesnt exists");
            }
        }

        let KEYUSERNAME: string = "Username"
        // localStorage.setItem(KEYUSERNAME, this.username);
        console.log("Hello " + this.username + "!")
        // username = localStorage.getItem(KEYUSERNAME);
        return user;
    }

}