import * as Mongo from "mongodb";
import { User } from "./classes/User"
import { Admin } from "./classes/Admin";

export class Database {

    private readonly dbName: string = "ERCM-System";
    private mongoClient!: Mongo.MongoClient;
    private dbCustomer!: Mongo.Collection;
    private dbUser!: Mongo.Collection;
    private dbArticle!: Mongo.Collection;


    private readonly dbCustomerCollectionName: string = "Customer";
    private readonly dbUserCollectionName: string = "User";
    private readonly dbArticleCollectionName: string = "Article";

    public async connect(): Promise<boolean> {
        const uri: string = "mongodb+srv://MyMongoDBUser:Studium2019@gis-ist-geil.zqrzt.mongodb.net/ERCM-System?retryWrites=true&w=majority";
        this.mongoClient = new Mongo.MongoClient(uri, {});
        await this.mongoClient.connect();
        this.dbCustomer = this.mongoClient.db(this.dbName).collection(this.dbCustomerCollectionName);
        this.dbUser = this.mongoClient.db(this.dbName).collection(this.dbUserCollectionName);
        this.dbArticle = this.mongoClient.db(this.dbName).collection(this.dbArticleCollectionName);
        console.log("Database connection", this.dbCustomer != undefined);
        return this.dbCustomer != undefined;
    }

    public async checkUser(username: string, password?: string): Promise<boolean> {
        let user: User;
        if (password)
            user = <User>await this.dbUser.findOne({ $and: [{ username: username}, {password: password }]});
        else
            user = <User>await this.dbUser.findOne({ username: username });

        if (user) {
            return true;
        }
        return false;
    }

    public async saveUser(username: string, password: string, gender: string, role: boolean): Promise<boolean> {
        let userdb: User = await this.dbUser.insertOne({ username: username, password: password, gender: gender, role: role });
        let user: User = undefined;
        if (userdb) {
            return true;
            // Neuer User erzeugen und Werte umspeichern damit alle Werte die nur in der Datenbank vorhanden sind auch gespeichert werden
            // (z.B. nicht nur username und passwort sondern auch Profilbild (bisher nur in der DB))
            // und alle Methoden aufrufbar sind (nur bei dem Nutzer aus der DB kann man nicht user.methode() aufrufen)
            // if(userdb.role){
            //     user = new Admin(userdb.username, userdb.password, userdb.role, userdb.gender);
            // } else {
            //     user = new User(userdb.username, userdb.password, userdb.role, userdb.gender);
            // }
        }
        return false;
        // return user;
    }
}
