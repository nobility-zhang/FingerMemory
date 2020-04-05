//随机数
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
//洗牌
function shuffle(array) {
    let newArr = [];
    newArr = array.slice(0);
    for (let i = 0; i < newArr.length; i++) {
        let j = getRandom(0, i)
        let temp = newArr[i]
        newArr[i] = newArr[j]
        newArr[j] = temp
    }
    return newArr
}
//数组元素出现次数记录
function getMap(array){
    //映射关系对象
    const map = {};
    //循环查找
    for (let i = 0; i < array.length; i++) {
         //数组里的i个元素
        let v = array[i];
        //将数组的i个元素作为map对象的属性查看其属性值
        let counts = map[v];
        //如果map对象没有该属性，则设置该属性的值为1，有的话在其基础上再+1
        if (counts) {
            map[v] += 1;
        } else {
            map[v] = 1;
        }
    }
    return map;
};
//小数转换为百分比并且保留两位小数
function toPercent(point){
    let str=Number(point*100).toFixed(2);
    str+="%";
    return str;
}
module.exports={
    getRandom,  //获取随机数
    shuffle,    //洗牌
    getMap, //数组映射
    toPercent   //小数转百分比
}