const readline = require('readline');
const fs = require('fs');
const path = require('path');
//传如文件路径
//以行为单位包装成数组并返回
function readFlie(filePath){
    return new Promise((resolve,reject)=>{
        if(typeof (filePath) === 'undefined'){  //若没传如参数
            reject('filePath is not defined');
        }
        if(!fs.existsSync(filePath)){   //若文件不存在
            reject('filePath is not exists');
        }
        fs.stat(filePath,(err,stats)=>{
            if(err) throw err;
            if(!stats.isDirectory){   //若路径是目录
                reject('filePath must be a file'); 
            }
            const readlineFile = readline.createInterface({
                input: fs.createReadStream(filePath)    //逐行读取文件流
            });
            const lineArray=[]; //存放行的数组
            readlineFile.on('line',lineString=>{
                lineArray.push(lineString);
            });
            readlineFile.on('close',()=>{
                resolve(lineArray);
            });
        })
    })
}
//读取行数据
function read(filePath,line){
    return new Promise((resolve,reject)=>{
        if(typeof (filePath) === 'undefined'){  //若没传如参数
            reject('filePath is not defined');
        }
        if(!fs.existsSync(filePath)){   //若文件不存在
            reject('filePath is not exists');
        }
        if(typeof (line) === 'undefined'){  //若没传如参数
            line = 1;
        }
        fs.stat(filePath,(err,stats)=>{
            if(err) throw err;
            if(!stats.isDirectory){   //若路径是目录
                reject('filePath must be a file'); 
            }
            const readlineFile = readline.createInterface({
                input: fs.createReadStream(filePath)    //逐行读取文件流
            });
            let i = 1;
            readlineFile.on('line',lineString=>{
                if(i==line){
                    line=lineString;
                    readlineFile.close();
                }
            });
            readlineFile.on('close',()=>{
                resolve(line);
            });
        })
    })
}
//传如文件路径和要写入的数据
//安全写入不会覆盖已有文件内容
function safeWriteFile(filePath,data){
    return new Promise((resolve,reject)=>{
        if(typeof(data) === 'undefined'){  //若没传如参数
            reject('data is not defined');
        }
        if(fs.existsSync(filePath)){   //若文件已存在
            reject('filePath is exists');
        }
        unSafeWriteFile(filePath,data).then(value=>{
            resolve(value);
        }).catch(err=>{
            throw err;
        })
    })
}
//传如文件路径和要写入的数据
//非安全写入，会覆盖文件内容
function unSafeWriteFile(filePath,data){
    return new Promise((resolve,reject)=>{
        if(typeof(filePath) === 'undefined'){  //若没传如参数
            reject('filePath is not defined');
        }
        fs.writeFile(filePath,data,err => {
            if (err) throw err;
            resolve(true);
        });
    })
}
//传如文件路径和要写入的数据
//追加写入，不会覆盖文件内容
function appendWriteFile(filePath,data){
    return new Promise((resolve,reject)=>{
        if(typeof(filePath) === 'undefined'){  //若没传如参数
            reject('filePath is not defined');
        }
        fs.appendFile(filePath,data,err => {
            if (err) throw err;
            resolve(true);
        });
    })
}
//删除文件夹
function deleteDir(dirPath){
    let files = [];
    if(fs.existsSync(dirPath)){
        files = fs.readdirSync(dirPath);
        files.forEach(file => {
            let filePath = path.join(dirPath,file);
            if(fs.statSync(filePath).isDirectory()){
                deleteDir(filePath);    //递归删除文件夹
            } else {
                fs.unlinkSync(filePath);    //删除文件
            }
        });
        fs.rmdirSync(dirPath);
    }
}
//传入要拆分的文件路径和拆分的份数
//将文件分隔成多个碎片文件
async function splitFile(filePath,fragmentNumber){
    const lineArray = await readFlie(filePath);
    const pathParse = path.parse(filePath);
    const fragmentDir=path.join(pathParse.dir,pathParse.name);  //存放碎片的文件夹
    fs.mkdir(fragmentDir,{recursive:true},err=>{  //创建碎片文件目录
        if(err) throw err;
    });
    let step = 1;
    const stepSize = Math.ceil(lineArray.length/fragmentNumber);
    let fragmentName = path.join(fragmentDir,pathParse.name+'_'+step+pathParse.ext);    //初始化碎片文件名
    for(let i = 0; i<lineArray.length; i++){
        if(i%stepSize==0){
        fragmentName = path.join(fragmentDir,pathParse.name+'_'+step+pathParse.ext);
        step++;
        }
        appendWriteFile(fragmentName,lineArray[i]+'\n');
    }
    fs.unlinkSync(filePath);
}
//传入文件路径
//获取文件的行数
function getFileLine(filePath){
    return new Promise((resolve,reject)=>{
        if(typeof (filePath) === 'undefined'){  //若没传如参数
            reject('filePath is not defined');
        }
        if(!fs.existsSync(filePath)){   //若文件不存在
            reject('filePath is not exists');
        }
        fs.stat(filePath,(err,stats)=>{
            if(err) throw err;
            if(!stats.isDirectory){   //若路径是目录
                reject('filePath must be a file'); 
            }
            const readlineFile = readline.createInterface({
                input: fs.createReadStream(filePath)    //逐行读取文件流
            });
            let line = 0;
            readlineFile.on('line',lineString=>{
                line++;
            });
            readlineFile.on('close',()=>{
                resolve(line);
            });
        })
    })
}
module.exports={
    deleteDir,  //删除文件夹
    readFlie,   //逐行读取文件
    read,   //读取一行数据
    getFileLine,    //获取文件行数
    safeWriteFile,  //安全写入文件
    unSafeWriteFile,    //覆盖写入文件
    appendWriteFile,    //追加写入文件
    splitFile   //文件拆分
};