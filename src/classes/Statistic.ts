import { Article } from "./Article";

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

//Article data which must be outputed and calculated in the customer statistics
export interface ArticleWithEverything {
    articleId: number;
    article: Article;
    completeAmount: number;
    price: number;
}
