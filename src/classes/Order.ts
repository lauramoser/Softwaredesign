export interface LittleOrder {
    articleId: number,
    amount: number,
    price: number
}

export interface BigOrder {
    id: number,
    description: string,
    customerId: number,
    totalprice: number,
    orderDate: Date,
    deliveryDate: Date,
    littleOrders: LittleOrder[]
}


