export class Order {
    public id: number;
    public orderDate : Date;
    public deliveryDate: Date;
    public orderAmount : number;

    constructor(id: number, orderDate: Date, deliveryDate: Date, orderAmount: number) {
        this.id = id;
        this.orderDate  = orderDate;
        this.deliveryDate = deliveryDate;
        this.orderAmount  = orderAmount;
    }
}