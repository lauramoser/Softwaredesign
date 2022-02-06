export class Article {
    public id: number;
    public description: string;
    public dateOfMarketLaunch: Date;
    public price: number;
    public standardDeliveryTime: number;
    public minimumOrderSize: number;
    public maximumOrderSize: number;
    public discountOrderSize: number;
    public associatedDiscount: number;

    constructor(id: number, description: string, dateOfMarketLaunch: Date, price: number, standardDeliveryTime: number, minimumOrderSize: number, maximumOrderSize: number, discountOrderSize: number, associatedDiscount: number) {
        this.id = id;
        this.description = description;
        this.dateOfMarketLaunch = dateOfMarketLaunch;
        this.price = price;
        this.standardDeliveryTime = standardDeliveryTime;
        this.minimumOrderSize = minimumOrderSize;
        this.maximumOrderSize = maximumOrderSize;
        this.discountOrderSize = discountOrderSize;
        this.associatedDiscount = associatedDiscount;
    }
} 