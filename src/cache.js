
const path = require('path');
const fs = require('fs');
const config = require('./parseconfig');
const Card = require('./card');
const {getRandom,shuffle}=require('./tool');
const {
    readFlie,
    unSafeWriteFile,
    deleteDir,
    splitFile
} = require('./clrtfile');

//传入将要生成缓存的文件,生成缓存文件的路径,和分隔符
//生成过渡缓存json文件，并放入缓存路径中
//缓存目录存在就返回
async function interimCache(wordFile,cachePath,separator){
    const wordFileObj = path.parse(wordFile);
    const interimFile = path.join(cachePath,wordFileObj.name+'.json');
    const interimDir = path.join(config.cachePath,wordFileObj.name);
    if(fs.existsSync(interimDir)){  //若缓存目录存在直接返回
        const interim={
            dir:interimDir //拆分缓存文件的目录
        }
        return interim;
    }
    const lineArray = await readFlie(wordFile);
    let lineString=''
    for (const v of lineArray) {
        lineString += Card.cardParse(v,separator)+'\n';
    }
    await unSafeWriteFile(interimFile,lineString);
    const interim={
        path:interimFile,   //临时缓存文件路径
        length:lineArray.length,    //缓存文件行数
        dir:interimDir //拆分缓存文件目录
    }
    return interim;
}
//拆分缓存文件，并且返回缓存文件目录
//默认参数为组元素个数(即拆成几行一为组)
//若缓存文件目录已经存在,直接返回缓存文件目录
async function cache(fragmentNumber){
    const interim = await interimCache(config.wordFile,config.cachePath,config.separator);
    if (typeof(interim.length)=='undefined'){
        return  interim.dir;
    }
    if(typeof(fragmentNumber) === 'undefined'){
        fragmentNumber=Math.ceil(interim.length/config.group);
    }
    await splitFile(interim.path,fragmentNumber);
    return interim.dir;
}
// 清空缓存文件
function clearCache(){
    deleteDir(config.cachePath);
}
// 传入缓存目录文件和要读的缓存块号
// 返回该缓存块的路径，若不存在返回空
// 解析缓存文件名得到具体缓存文件
function cacheParse(dirPath,number){
    return path.join(dirPath,path.basename(dirPath)+'_'+number+'.json');
}
//传入上下文缓存目录
//获取改缓存文件下的,全部缓存文件的绝对路径
function getCacheAll(dirPath){
    return new Promise((resolve,reject)=>{
        fs.readdir(dirPath,(err,files)=>{
            if(err) throw err;
            path.basename(dirPath);
            let cacheFile=[];
            files.forEach(value=>{
                if(new RegExp(`^${path.basename(dirPath)}_`).test(value)) {
                    cacheFile.push(path.join(dirPath,value));
                }
            })
            resolve(cacheFile);
        });
    })
}
//传入上下文缓存目录
// 获取缓存文件总块数
function getCacheNumber(dirPath){
    return new Promise((resolve,reject)=>{
        fs.readdir(dirPath,(err,files)=>{
            if(err) throw err;
            path.basename(dirPath);
            let number=0;
            files.forEach(value=>{
                if(new RegExp(`^${path.basename(dirPath)}_`).test(value)) {
                    number++;
                }
            })
            resolve(number)
        });
    })
}
//传入上下文缓存目录
//获取所有缓存文件内容
async function getAllCacheContent(dirPath){   
    const cacheFiles = await getCacheAll(dirPath)   //获取全部的缓存文件路径
    let allArray=[];
    for(let i = 0 ; i <cacheFiles.length ;i++){
        let interimArray = await readFlie(cacheFiles[i]);  // 读取文件内容    
        allArray.push(...interimArray);
    }
    return allArray;
}
//选择缓存文件
async function selectCacheFile (number){
    const dir =await cache();    //获取缓存文件夹
    const fileNumber = await getCacheNumber(dir);  //获取缓存文件数
    if(typeof (number) == 'undefined'){  //若没有传入第几个则随机抽取
        number = getRandom(1,fileNumber);
    } 
    if(number > fileNumber){ //组号大于文件数量，取最后一个文件
        number = fileNumber;
    }
    let file = cacheParse(dir,number);  //获取具体缓存文件
    before.push(file);  //记录学习该文件次数
    curr = file;    //历史记录当前正在访问的文件
    return file;
}
//随机试卷
async function randomCache(lineNumber=10){
    const dir =await cache();    //获取缓存文件夹
    let testArray = await getAllCacheContent(dir);    //获取全部缓存文件内容
    if(lineNumber>testArray.length){    //若传入内容数组行数大于已有内容取最大值
        lineNumber=testArray.length;
    }
    testArray =shuffle(testArray);  //数组洗牌
    return testArray.slice(0,lineNumber); //截取需要的数组内容并返回
}

module.exports = {
    getCacheAll, //获取全部缓存文件
    cache,  //获取缓存
    clearCache,  //清空缓存
    selectCacheFile, //选择缓存文件
    randomCache //返回随机组成的缓存文件
}

