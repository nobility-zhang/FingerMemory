//记录学习的缓存文件

const config = require('./parseconfig');
const path = require('path');
const fs = require('fs');
const {read} =require('./clrtfile');
//读取上一次的退出时的缓存文件
//返回上一次文件的路径和行指针
//文件不存在什么也不做
async function readLastLog(){
    const logFile = path.join(config.logPath,'history.log');
    if(fs.existsSync(logFile)){
        let history = await read(logFile);
        history = JSON.parse(history);
        fs.unlinkSync(logFile);
        return history; 
    } 
}
//生成历史记录
function lastLog(){
    if(curr == null) return;
    let map={};
    // path.basename(curr,'.json').split('_')[1]
    map.curr=path.basename(curr,'.json').split('_')[1];
    map.line=line;  //行指针
    map.model=model;    //模式
    map = JSON.stringify(map);   

    const logFile = path.join(config.logPath,'history.log');
    fs.writeFileSync(logFile,map); //必须使用同步模式否则程序会优先终止
}
module.exports={
    lastLog,
    readLastLog
}