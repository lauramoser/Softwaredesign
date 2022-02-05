import { database } from "../main" //.. heißt ein Ordner drüber also src
let prompts = require('prompts');

export class Login {
    private username: string = "";
    private password: string = "";

    public async handleCheck(): Promise<void> {
        console.log("Welcome to your own ERCM system\n Log in");
        let proceed: boolean = false;
        while (!proceed) {
            let response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Enter your username?',
            });
            this.username = response.value;
            let userExist: boolean = await database.checkUser(this.username);
            if (userExist) {
                response = await prompts({
                    type: 'password',
                    name: 'value',
                    message: 'Enter your password',
                });
                this.password = response.value;

                if (await database.checkUser(this.username, this.password)) {
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
        console.log("Hello " + this.username)
        // username = localStorage.getItem(KEYUSERNAME);
    }

}