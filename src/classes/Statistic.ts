import { Article } from "./Article";

//Article data which must be outputed and calculated in the customer statistic
export interface ArticleWithEverything {
    articleId: number;
    article: Article;
    completeAmount: number;
    price: number;
}
