import { database } from "../main";
import { User } from "./User";

let prompts = require('prompts');

export class Admin extends User {

    constructor(username: string, password: string, role: boolean, gender: string) {
        super(username, password, role, gender);
    }


    public async changeRole(): Promise<void> {

    }

    private async createArticle(): Promise<void> {

    }
    private async createUser(): Promise<void> {
        let response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Username:',
        });
        this.username = response.value;
        let usernameAlreadyTaken: boolean = await database.checkUser(this.username);
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
                type: 'text',
                name: 'value',
                message: 'Gender:',
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

            if(!database.saveUser(this.username, this.password, this.gender, this.role)){
                console.log("User erstellen fehlgeschlagen");
                return this.createUser();
            }
        } else {
            return this.createUser();
        }
    }

}