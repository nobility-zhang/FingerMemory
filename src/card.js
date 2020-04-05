class Card{
    constructor(array){
        this.id=Card.id;            //自增id
        this.word=array[0];         //单词
        this.describe=array[1];     //翻译
        this.clue=array.slice(2);   //提示
    }
    static cardParse(string,separator){ //解析字符串转换伟Card对象
        let array = string.split(separator);
        Card.id++;
        return JSON.stringify(new Card(array));
    }
}
Card.id=0;

module.exports=Card;