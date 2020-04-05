//读取自定义文件中的内容单词，单词本要求为jsno格式
//模块1：将普通的excl文件导出json格式
//模块2：分段读取json文件10个为一组
//模块3：背诵模式
//模块4：测试模式
//模块5：单词卡模式
const {selectFileMenu,queryMenu,recite,randomQuerys,querys,cardqQuerys,recover}=require('./memory');
const {selectCacheFile,randomCache,cache}=require('./cache');
const {readLastLog} = require('./log')
require('./global'); //全局变量文件
async function nav(number,ln,mod){
    let answer=mod; //模式选择
    let file;
    if(typeof(number)=='undefined'){
        const menus = ['背诵模式','随机提问模式','顺序提问模式','单词卡模式'];
        answer= await queryMenu(menus);
    }
    await cache();  //检查cache是否存在
    model = answer; //记录选择的模式
    switch (answer) {
        case '1':
            if(typeof(number) == 'undefined'){
                number = await selectFileMenu();
            }
            file = await selectCacheFile(number); //可以为undefined，取随机数
            recite(file,ln);
            break;
        case '2':
            const randomFile = await randomCache();  //默认10题
            randomQuerys(randomFile);
            break;
        case '3':
            if(typeof(number) == 'undefined'){
                number = await selectFileMenu();
            }
            file = await selectCacheFile(number); //可以为undefined，取随机数
            querys(file,ln);
            break;
        case '4':
            if(typeof(number) == 'undefined'){
                number = await selectFileMenu();
            }
            file = await selectCacheFile(number); //可以为undefined，取随机数
            cardqQuerys(file);
            break;
        default:
            process.exit();
    }
}
async function check(){
    const history = await readLastLog();
    if(typeof(history) != 'undefined'){
        // console.log(Object.keys(history));
        const input = await recover();  //询问是否恢复
        if(input==''){  //直接回车后恢复
            nav(history.curr,history.line,history.model);
            return
        }
    }
    nav()
}
module.exports={
    check
}