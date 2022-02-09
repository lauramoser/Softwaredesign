export class Order {
    public id: number;
    public orderDate? : Date;
    public amountOfArticle: number; //minimaler und maximaler Bestellanzahl!
    public deliveryDate?: Date;
    public orderprice? : number; //Preis * Menge

    constructor(id: number, amountOfArticle: number, orderDate?: Date, deliveryDate?: Date, orderprice?: number) {
        this.id = id;
        this.orderDate  = orderDate;
        this.amountOfArticle = amountOfArticle;
        this.deliveryDate = deliveryDate;
        this.orderprice  = orderprice;
    }
}
