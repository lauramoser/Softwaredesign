
import { Database } from "./Database"
import { Login } from "./classes/Login";

export let database: Database = new Database();
main();

async function main() {
    await database.connect();
    let login: Login = new Login();
    // await database.saveUser("Jannik", "1234", "male", true);
    login.handleCheck();
}
async function changeRole(): Promise<void> {

}