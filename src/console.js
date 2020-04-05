const readline = require('readline');
const {issue,hint,answer,tab,warp} = require('./view');
const {lastLog} = require('./log');
//提问
function query(question){
    return new Promise((resolve,reject)=>{
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        onCtrlC(rl);
        rl.question(issue(question)+'\n', (inputAnswer) => {
            inputAnswer.trim();
            rl.close();
            resolve(inputAnswer);
        });
    })
}
//错题重问和提示
async function requery(question,answer,clue){
    if(typeof (clue) === 'undefined'||clue.length === 0){
        clue=['没有提示'];
    }
    const inputAnswer = await query(question+':]\n\n\t['+answer);
    if(question==inputAnswer){
        return  true;
    }else if('?'===inputAnswer||'？'===inputAnswer) {
        let string = hint(clue);
        console.log(tab(string));   //给字符串加tab
        await requery(question,answer,clue);  //提示后重新显示问题
    }else{
        await requery(question,answer,clue);  //回答错误重复回答
    }    
}
//翻转单词卡
async function reversalCard(front ,back,PS=[]){ //默认注释为空
    const inputAnswer= await query(front);
    console.log(answer(back,PS));
    return  inputAnswer.trim();
}
//监听ctrl+c
function onCtrlC(rl){
    rl.on('SIGINT',()=>{
        lastLog();
        console.log('\n退出');
        process.exit();
    })
}
module.exports={
    reversalCard,   //翻转卡片
    requery,        //重复提问
    query   //提问
}