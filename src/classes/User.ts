export class User {
    public username: string;
    public password: string;
    public role: boolean;
    public gender: string;

    constructor(username: string, password: string, role: boolean, gender: string) {
        this.username = username;
        this.password = password;
        this.gender = gender;
        this.role = role;
    }


}