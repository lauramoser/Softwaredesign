export class Customer {
    public id: number;
    public name: string;
    public address: string;
    public customerDiscount: number;

    constructor(id: number, name: string, address: string, customerDiscount: number) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.customerDiscount = customerDiscount;
    }
}