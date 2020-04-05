const {readFlie} = require('./clrtfile');
const {getCacheAll} = require('./cache');
const {forget,hesitate,answer,know,menu,title,issue,warp,clearScreenDown}=require('./view')
const {reversalCard,requery,query}=require('./console');
const {shuffle} = require('./tool');
const fs = require('fs');
const path = require('path');
const config = require('./parseconfig');
const readline = require('readline');
//恢复询问
function recover(){
    return new Promise((resolve,reject)=>{
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(issue('系统检测出您上次未正常退出，是否恢复？]\n\t[恢复请直接回车]\n\t[否则请输入任意字符后回车')+'\n', (inputAnswer) => {
            inputAnswer.trim();
            rl.close();
            resolve(inputAnswer);
        });
    })
}
// 菜单
function queryMenu(menus){
    return new Promise((resolve,reject)=>{
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(menu(menus)+'\n', (inputAnswer) => {
            inputAnswer.trim();
            rl.close();
            resolve(inputAnswer);
        });
    })
}
//  选择缓存块文件夹菜单
function selectDirMenu(){
    return new Promise((resolve,reject)=>{
        fs.readdir(config.cachePath,(err,files)=>{
            if(err) throw err;
            let cacheDir=[];
            files.forEach(value=>{
                if(fs.statSync(path.join(config.cachePath,value)).isDirectory) {    //将缓存目录文件夹加入到数组中
                    cacheDir.push(value);
                }
            })
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(menu(cacheDir)+'\n', (inputAnswer) => {
                rl.close();
                inputAnswer.trim();
                inputAnswer =  parseInt(inputAnswer);//将输入字符转换成数字
                if(isNaN(inputAnswer)){ //胡乱输入将输入置为1
                    inputAnswer=1;
                }
                if(inputAnswer>cacheDir.length){    //超过输入内容将内容置为最大
                    inputAnswer=cacheDir.length;
                }
                resolve(cacheDir[inputAnswer-1]);
            });
        });
    })
}
//  选择缓存块文件菜单
async function selectFileMenu(){
    const dir = await selectDirMenu();
    const menus = await getCacheAll(path.join(config.cachePath,dir));
    let newmenus = [];
    menus.forEach((v,i)=>{
        newmenus.push(`第${i+1}组`);
    })
    return new Promise((resolve,reject)=>{
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(menu(newmenus)+'\n', (inputAnswer) => {
            rl.close();
            inputAnswer.trim();
            if(inputAnswer==''){
                resolve(undefined);
            }
            resolve(inputAnswer);
        });
    })
}
//题库提问,背诵模式
async function recite(reciteFile,ln){
    const jsonArray = await readFlie(reciteFile);
    if(typeof(ln)=='undefined'){
        ln=0;
    }
    for(let i = ln ; i < jsonArray.length ; i++) {
        let card = JSON.parse(jsonArray[i]);
        await requery(card.word,card.describe,card.clue);
        line++; //每过一个单词行指针下移
        if(line>=jsonArray.length){
            line=0;
        }
    }
}
//随机测试
async function randomQuerys(questionsFile){
    let jsonArray;
    if(Array.isArray(questionsFile)){   //兼容直接传入文件内容,但文件内容必须是数组
        jsonArray = questionsFile;
    }else{
        jsonArray = await readFlie(questionsFile);
    }
    shuffle(jsonArray); //对随机试卷再次洗牌,足够随机
    let card,right=0,index=0;    //暂存卡片对象，错误题数
    for (const v of jsonArray) {
        index++;
        console.log(title(index,jsonArray.length,right));   //标题提示
        card = JSON.parse(v)
        let inputValue = await query(card.word);
        if(inputValue==card.describe){
            console.log(know('正确'));
            right++;
        }else {
            console.log(forget('错误'));
        }
    }
    console.log(title(index,jsonArray.length,right));//结束后总结
    line=-1;    //随机测试模式无效行指针
}
//顺序测试
async function querys(questionsFile,ln){
    const jsonArray = await readFlie(questionsFile);
    if(typeof(ln)=='undefined'){
        ln=0;
    }
    for(let i = ln ; i < jsonArray.length ; i++) {
        let card = JSON.parse(jsonArray[i]);
        let inputValue = await query(card.word);
        if(inputValue==card.describe){
            console.log(know('正确'));
        }else {
            console.log(forget('错误'));
            console.log(answer(card.describe,card.clue));
        }
        line++; //每过一个单词行指针下移
        if(line>=jsonArray.length){
            line=0;
        }
    }
}
//单词卡模式
async function cardqQuerys(reciteFile){
    const jsonArray = await readFlie(reciteFile);
    let word = null;    //暂存提出的单词
    while(jsonArray.length>0){
        for(let i = 0 ; i < jsonArray.length ; i++) {
            let card = JSON.parse(jsonArray[i]);
            let vlaue = await reversalCard(card.word, card.describe);
            switch (vlaue) {
                case '':  
                    console.log(warp(know('熟悉')));
                    word=jsonArray.splice(i,1);  //将单词踢出去
                    break;
                case '？':
                case '?':  
                    console.log(warp(forget('忘记')));
                    break;
                default:
                    console.log(warp(hesitate('犹豫')));
                    break;
            }
            line=-1; //行指针无效
        }
    }
}
module.exports={
    recite, //背诵模式
    randomQuerys,   //随机提问
    querys, //顺序提问
    cardqQuerys, //卡片记忆
    queryMenu,   //呼出菜单
    recover,   //恢复询问
    selectFileMenu  //选择具体那一组
}