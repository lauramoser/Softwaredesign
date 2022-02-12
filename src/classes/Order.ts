//small order which inlcudes the data of only one chosen article
export interface LittleOrder {
    articleId: number;
    amount: number;
    price: number;
    associatedDiscountInEuro: number;
}

//All small orders combined as a whole order
export interface BigOrder {
    id: number;
    description: string;
    customerId: number;
    totalprice: number;
    orderDate: Date;
    deliveryDate: Date;
    littleOrders: LittleOrder[];
    customerDiscountInEuro: number;
}


