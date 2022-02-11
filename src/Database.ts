import * as Mongo from "mongodb";
import { User } from "./classes/User"
import { Article } from "./classes/Article";
import { Customer } from "./classes/Customer";
import { LittleOrder, BigOrder } from "./classes/Order";

export class Database {

    private readonly dbName: string = "ERCM-System";
    private mongoClient!: Mongo.MongoClient;
    private dbCustomer!: Mongo.Collection;
    private dbUser!: Mongo.Collection;
    private dbArticle!: Mongo.Collection;
    private dbOrder!: Mongo.Collection;

    private readonly dbCustomerCollectionName: string = "Customer";
    private readonly dbUserCollectionName: string = "User";
    private readonly dbArticleCollectionName: string = "Article";
    private readonly dbOrderCollectionName: string = "Order";

    public async connect(): Promise<boolean> {
        const uri: string = "mongodb+srv://MyMongoDBUser:Studium2019@gis-ist-geil.zqrzt.mongodb.net/ERCM-System?retryWrites=true&w=majority";
        this.mongoClient = new Mongo.MongoClient(uri, {});
        await this.mongoClient.connect();
        this.dbCustomer = this.mongoClient.db(this.dbName).collection(this.dbCustomerCollectionName);
        this.dbUser = this.mongoClient.db(this.dbName).collection(this.dbUserCollectionName);
        this.dbArticle = this.mongoClient.db(this.dbName).collection(this.dbArticleCollectionName);
        this.dbOrder = this.mongoClient.db(this.dbName).collection(this.dbOrderCollectionName);
        console.log("Database connection", this.dbCustomer != undefined);
        return this.dbCustomer != undefined;
    }

    public async saveOrder(bigOrder: BigOrder): Promise<void> {
        await this.dbOrder.insertOne(bigOrder);
    }

    public async getAllBigOrders(): Promise<BigOrder[]> {
        let allBigOrder: BigOrder[] = <BigOrder[]><unknown>await this.dbOrder.find({}).toArray();
        return allBigOrder;
    }

    public async deleteBigOrder(id: number): Promise<void> {
        await this.dbOrder.deleteOne({ id: id });
    }

    public async changeOrder(bigOrderOld: BigOrder, bigOrderNew: BigOrder): Promise<void> {
        await this.deleteBigOrder(bigOrderOld.id);
        await this.saveOrder(bigOrderNew);
    }

    public async checkOrderId(id: number): Promise<boolean> {
        let bigOrderdb: BigOrder = <BigOrder><unknown>await this.dbOrder.findOne({ id: id });
        if (bigOrderdb) {
            return true;
        }
        return false;
    }

    public async saveCustomer(id: number, name: string, address: string, customerDiscount: number): Promise<Customer> {
        let customerdb: Customer = <Customer><unknown>await this.dbCustomer.insertOne({ id: id, name: name, address: address, customerDiscount: customerDiscount })
        let customer: Customer = undefined;
        if (customerdb) {
            customer = new Customer(customerdb.id, customerdb.name, customerdb.address, customerdb.customerDiscount);
        }
        return customer;
    }

    public async getAllCustomer(): Promise<Customer[]> {
        let allCustomer: Customer[] = <Customer[]><unknown>await this.dbCustomer.find({}).toArray();
        //TODO evtl in richtige Artikel konvertieren (new Article(...))
        return allCustomer;
    }

    public async deleteCustomer(id: number): Promise<void> {
        await this.dbCustomer.deleteOne({ id: id });
    }

    public async changeCustomer(customerOld: Customer, customerNew: Customer): Promise<Customer> {
        await this.deleteCustomer(customerOld.id);
        let customer: Customer = await this.saveCustomer(customerNew.id, customerNew.name, customerNew.address, customerNew.customerDiscount);
        return customer;
    }

    public async checkCustomerId(id: number): Promise<boolean> {
        let customerdb: Customer = <Customer><unknown>await this.dbCustomer.findOne({ id: id });
        if (customerdb) {
            return true;
        }
        return false;
    }

    public async checkArticleId(id: number): Promise<boolean> {
        let articledb: Article = <Article><unknown>await this.dbArticle.findOne({ id: id });
        if (articledb) {
            return true;
        }
        return false;
    }

    public async getArticle(id:number): Promise<Article> {
        let articledb: Article = <Article><unknown>await this.dbArticle.findOne({ id: id });
        if(articledb)
        return articledb;
        return null;
    }

    public async getAllArticle(): Promise<Article[]> {
        let allArticle: Article[] = <Article[]><unknown>await this.dbArticle.find({}).toArray();
        //TODO evtl in richtige Artikel konvertieren (new Article(...))
        return allArticle;
    }

    public async saveArticle(id: number, description: string, dateOfMarketLaunch: Date, price: number, standardDeliveryTime: number, minimumOrderSize: number, maximumOrderSize: number, discountOrderSize: number, associatedDiscount: number): Promise<Article> {
        let articledb: Article = <Article><unknown>await this.dbArticle.insertOne({ id: id, description: description, dateOfMarketLaunch: dateOfMarketLaunch, price: price, standardDeliveryTime: standardDeliveryTime, minimumOrderSize: minimumOrderSize, maximumOrderSize: maximumOrderSize, discountOrderSize: discountOrderSize, associatedDiscount: associatedDiscount });
        let article: Article = undefined;
        if (articledb) {
            article = new Article(articledb.id, articledb.description, articledb.dateOfMarketLaunch, articledb.price, articledb.standardDeliveryTime, articledb.minimumOrderSize, articledb.maximumOrderSize, articledb.discountOrderSize, articledb.associatedDiscount);
        }
        return article;
    }

    public async deleteArticle(id: number): Promise<void> {
        await this.dbArticle.deleteOne({ id: id });
    }

    public async changeArticle(articleOld: Article, articleNew: Article): Promise<Article> {
        await this.deleteArticle(articleOld.id);
        let article: Article = await this.saveArticle(articleNew.id, articleNew.description, articleNew.dateOfMarketLaunch, articleNew.price, articleNew.standardDeliveryTime, articleNew.minimumOrderSize, articleNew.maximumOrderSize, articleNew.discountOrderSize, articleNew.associatedDiscount);
        return article;
    }

    public async checkUser(username: string, password?: string): Promise<User> {
        let userdb: User;
        let user: User;
        if (password)
            userdb = <User><unknown>await this.dbUser.findOne({ $and: [{ username: username }, { password: password }] });
        else
            userdb = <User><unknown>await this.dbUser.findOne({ username: username });

        if (userdb) {
            user = new User(userdb.username, userdb.password, userdb.role, userdb.gender);

        }
        return user;
    }

    public async saveUser(username: string, password: string, gender: string, role: boolean): Promise<User> {
        let userdb: User = <User><unknown>await this.dbUser.insertOne({ username: username, password: password, gender: gender, role: role });
        let user: User = undefined;
        if (userdb) {
            // Neuer User erzeugen und Werte umspeichern damit alle Werte die nur in der Datenbank vorhanden sind auch gespeichert werden
            // (z.B. nicht nur username und passwort sondern auch Profilbild (bisher nur in der DB))
            // und alle Methoden aufrufbar sind (nur bei dem Nutzer aus der DB kann man nicht user.methode() aufrufen)
            user = new User(userdb.username, userdb.password, userdb.role, userdb.gender);
        }
        return user;
    }

    public async changeUser(username: string, user: User): Promise<boolean> {
        let successfull: Mongo.ModifyResult<Mongo.Document> = await this.dbUser.findOneAndReplace({ username: username }, user);
        if (successfull)
            return true;
        return false;
    }
}
