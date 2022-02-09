import { Article } from "./Article";

export class StatisticArticle {
    public amountOfOrders: number;
    public amountOFOrderedArticles: number;
    public moneyMadeArticle: number;
    public averageOfMoneyMade : number;

    constructor(amountOfOrders: number, amountOFOrderedArticles: number, moneyMadeArticle: number, averageOfMoneyMade : number) {
        this.amountOfOrders = amountOfOrders;
        this.amountOFOrderedArticles = amountOFOrderedArticles;
        this.moneyMadeArticle = moneyMadeArticle;
        this.averageOfMoneyMade = averageOfMoneyMade;
    }
}

export class StatisticCustomer {
    public orderedArticles: Article;
    public orderedQuantityOfEachArticle: number;
    public moneyMadeCustomer: number;
    public givenDiscount: number;

    constructor(orderedArticles: Article, orderedQuantityOfEachArticle: number, moneyMadeCustomer: number, givenDiscount: number) {
        this.orderedArticles = orderedArticles;
        this.orderedQuantityOfEachArticle = orderedQuantityOfEachArticle;
        this.moneyMadeCustomer = moneyMadeCustomer;
        this.givenDiscount = givenDiscount;
    }
}

