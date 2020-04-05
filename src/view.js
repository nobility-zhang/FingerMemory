
const QUOTE={
    NORMAL:'0m',
    HIGHLIGHT:'1m',
    UNDERLINE:'4m',
    SELECTED:'7m'
}
const COLOR={
    BLACK:'0',
    RED:'1',
    GREEN:'2',
    YELLOW:'3',
    BLUE:'4',
    PURPLE:'5',
    DARKGREEN:'6',
    WHITE:'7'
}
const {NORMAL,HIGHLIGHT,UNDERLINE,SELECTED}=QUOTE;
const {BLACK,RED,GREEN,YELLOW,BLUE,PURPLE,DARKGREEN,WHITE}=COLOR;
const {toPercent} = require('./tool')
//传入参数可以是：
//字符串，字体颜色
//字符串，背景颜色，字体颜色
//字符串，字体样式
//字符串，字体样式，字体颜色
//字符串，字体样式，背景颜色，字体颜色
function fontPlant(string='',quote='0m',backgroundColor,color){
    if(quote.indexOf('m')==-1){ //兼容只传入两个参数，第二个参数是字体颜色
        if(typeof(backgroundColor)=='undefined'){
            color=quote;
            backgroundColor='0',
            quote='0m';
        }else{
            color=backgroundColor;
            backgroundColor=quote;
            quote='0m';
        }
    }
    if(typeof(backgroundColor)==='undefined'){  //兼容只传入两个参数，第二个参数不是字体颜色，用默认的颜色搭配
        backgroundColor='0';
        color='7'
    }
    if(typeof(color)=='undefined'){ //兼容只传入三个参数时，第三个参数是字体颜色
        color=backgroundColor;
        backgroundColor='0';
    }
    return '\033['+quote+'\033[4'+backgroundColor+';3'+color+'m'+string+'\033[0m'
}
//包裹成卡片形式
function warp(string){
    function warpLine(string){
        string='\t'+string+'\t';
        let line='+';
        string=string.replace(/\[[0-7]m|\[[4][0-7];3[0-7]m/g,'');   //将特殊符号去除
        const strArr = string.split('');
        for(let i = 0 ; i <string.length ; i++){
            if(string[i]=='\t'){
                line+='----';
            }else if(/[\u4E00-\u9FA5]+/.test(strArr[i])){   //中文
                line+='--';
            }else if(/[a-zA-Z0-9]+/.test(strArr[i])){   //英文和数字
                line+='-';
            }else{
                line+='';
            }
        }
        line+='+';
        return line
    }
    function MaxWarpLine(string){
        const strArr = string.split('\n');
        const lenArr = [];
        for (const v of strArr) {
            lenArr.push(v.length);
        }
        const len = Math.max(...lenArr);
        for (const v of strArr) {
            if(v.length==len){
                var line = warpLine(v);
                break
            }
        }
        string=strArr.join('\t\n')
        return line
    }
    function tabTospace(string){
        const strArr = string.split('\t');
        string = strArr.join('    ');
        return string;
    }
    string = tabTospace(string);
    const line = MaxWarpLine(string);
    const strArr = string.split('\n')
    for (let i = 0; i < strArr.length; i++) {
        let space = line.length-10-strArr[i].length    //要补的空格数量
        if(space>0){    //补充空格
            for(let j = 0 ; j < space ; j++){
                strArr[i]+=' ';
            }
        }
        strArr[i] = '|    '+strArr[i]+'    |';
    }
    string = strArr.join('\n');
    return line+'\n'+string+'\n'+line;
}
// 清屏
function clearScreenDown(){
    process.stdout.write('\033[2J'); //清屏光标不动
    process.stdout.write('\033[0f'); //清屏后光标移入行首
}
// 帮助信息
function help(info){
    let string=''
    for(let i=0;i<info.length;i++){
        let number = i+1+'.';
        if(info[i].indexOf(number)==0){ //兼容已经添加上标号的帮助信息
            number='';
        }
        info[i]= `${number}${info[i]}`
    }
    string =  info.join('\n\n');
    return string;
}
//加tab
function tab(string){
    let array = string.split('\n');
    let newString='';
    array.forEach((v,i) => {
        if(i==0){   //第一个是标题
            newString+=v+'\n';
        }else{
            newString+='\t'+v+'\n';
        }
    });
    return newString
}
// 菜单
function menu(menus){
    let string=''
    let newmeus = [...menus]; //为了不破坏原数组
    const header=fontPlant('请选择模式\n按回车或输入非菜单内容退出:\n',DARKGREEN);
    for(let i=0;i<newmeus.length;i++){
        let number = i+1+'.';
        newmeus[i]= `\t${number}${newmeus[i]}`
    }
    string =  newmeus.join('\n');
    string = fontPlant(string,YELLOW)
    return header+string;
}
// 问题，[选项],兼容选择题
function issue(string,options){
    const header=fontPlant('提问:\n',PURPLE);
    string=`\t[${string}] \n\n`
    string=fontPlant(string,HIGHLIGHT,RED);
    if(typeof(options)=='undefined'){
        return header+string;
    }
    let footer='';
    options.forEach((v,i) => { 
        let letters = String.fromCharCode(i+65)+'.';
        if(v.indexOf(letters)==0){
            letters='';
        }
        if(i%2==0){
            footer+=`\t${letters}${v}\t`
        }else{
            footer+=`\t${letters}${v}\t\n\n`
        }
    });
    footer = fontPlant(footer,HIGHLIGHT,GREEN);
    return header+string+footer;
}
//提示信息是数组
function hint(hints){
    const header=fontPlant('提示:\n',DARKGREEN);
    let string = help(hints);
    string = fontPlant(string,YELLOW)
    return header+string;
}
//回答，[备注]，兼容添加备注是数组或字符串
function answer(string,ps){
    const header=fontPlant('回答:\n',BLUE);
    string=`\t${string} \n\n`
    string=fontPlant(string,HIGHLIGHT,DARKGREEN);
    if(typeof(ps)=='undefined'){
        return header+string;
    }
    let footer;
    if(Array.isArray(ps)&&ps.length>0){
        footer = help(ps);
        footer = tab(footer);
    }else{
        return header+string;
    }
    footer = `\t${fontPlant(footer,UNDERLINE,GREEN)}\n\n`
    return header+string+footer;
}
//犹豫
function hesitate(string){
    return fontPlant(string,SELECTED,BLUE);
}
//忘记
function forget(string){
    return fontPlant(string,SELECTED,RED);
}
//熟悉
function know(string){
    return fontPlant(string,SELECTED,GREEN);
}
//标题
function title(index,length,right){
    let string = `\n\t当前进度${index}/${length}\t已完成${toPercent(index/length)}\t\t正确率${toPercent(right/length)}\n`;
    //当前进度10/100    已完成%10     正确率
    return fontPlant(string,HIGHLIGHT,WHITE);
}
module.exports={
    warp,   //包裹
    title,  //加上标题
    tab,    //加tab
    menu,   //菜单
    issue,  //提问
    hint,   //提示
    answer, //答复
    hesitate,   //犹豫
    know,   //熟悉
    forget, //忘记
    clearScreenDown,    //清屏
}