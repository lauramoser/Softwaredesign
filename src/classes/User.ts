import { database } from "../main";
import { Customer } from "./Customer";
import { Order } from "./Order";

let prompts = require('prompts');

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

    public async createCustomer(): Promise<Customer> {
        console.log("Please fill in all necessary data for the new customer");
        let response = await prompts({
            type: 'number',
            name: 'value',
            message: 'ID:',
        });
        let id = response.value;

        response = await prompts({
            type: 'string',
            name: 'value',
            message: 'Name:',
        });
        let name = response.value;

        response = await prompts({
            type: 'string',
            name: 'value',
            message: 'address:',
        });
        let address = response.value;

        response = await prompts({
            type: 'number',
            name: 'value',
            message: 'Customer Discount:',
        });
        let customerDiscount = response.value;

        if (!database.saveCustomer(id, name, address, customerDiscount)){
            console.log("Create article failed");
            return this.createCustomer();
        }  
    }

    public async createOrder(): Promise<Order> {
        console.log("Please fill in all necessary data for the new customer");
        let response = await prompts({
            type: 'number',
            name: 'value',
            message: 'ID:',
        });
        let id = response.value;

        response = await prompts({
            type: 'date',
            name: 'value',
            message: 'Order date:',
        });
        let orderDate = response.value;

        response = await prompts({
            type: 'date',
            name: 'value',
            message: 'Delivery date:',
        });
        let deliveryDate = response.value;

        response = await prompts({
            type: 'number',
            name: 'value',
            message: 'Order amount:',
        });
        let orderAmount = response.value;

        if (!database.saveOrder(id, orderDate, deliveryDate, orderAmount)){
            console.log("Create Order failed");
            return this.createOrder();
        }  
    }
}



