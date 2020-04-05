const config = require('../config');
const path = require('path');
const fs = require('fs');
function parsePath(configPath) {
    return path.join(__dirname, '../', configPath);
}

// console.log(Object.keys(config));
const propertys = [ 'wordFile', 'wordPath', 'separator', 'cachePath', 'group' ,'logPath'];
//检查config文件是否健全
for (let i = 0; i < propertys.length; i++) {
    let property = config[propertys[i]];
    if (typeof (property) === 'undefined') {
        throw new Error('config is not intact');
    }
}
if(config.separator=='\t'){
    config.separator='    '
}
config.cachePath = parsePath(config.cachePath);
config.wordPath = parsePath(config.wordPath);
config.logPath = parsePath(config.logPath);
config.wordFile = path.join(config.wordPath, config.wordFile);

// if(!fs.existsSync(config.cachePath)){   //若缓存文件目录不存在
//     // throw new Error('filePcachePathath is not exists');
//     fs.mkdirSync(config.cachePath);
// }
fs.mkdir(config.cachePath,{recursive:true},err=>{   //创建缓存文件夹
    if(err){
        throw err ;
    }
});
fs.mkdir(config.logPath,{recursive:true},err=>{ //创建日志文件夹
    if(err){
        throw err ;
    }
})

module.exports = config;