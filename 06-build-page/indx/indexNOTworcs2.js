const fs = require('fs');
const path = require('path');


let pathDist = path.join(__dirname, 'project-dist'); 
let srcAssets = path.join(__dirname, 'assets');
let pathDistAssets = path.join(pathDist, 'assets'); 
let srcStyles = path.join(__dirname, 'styles');
let pathBundleFileCss = path.join(pathDist, 'style.css');
let pathHtml_Old = path.join(__dirname, 'template.html');
let componentsFolder = path.join(__dirname, 'components');
let pathDistHTML = path.join(pathDist, 'index.html'); 


function createFolderDist_and_Delete(){
  fs.access(pathDist, fs.constants.F_OK, (err)=> { 
    if (err) {
      createFolder();
    }
    if (!err) {
      delitFolder();
    }    
  });
}

async function delitFolder(){
  await fs.promises.rm(pathDist, { recursive: true }, (err) => {
    if (err) throw err;}); 
  createFolder();   
}

createFolderDist_and_Delete();


function createFolder() {
  fs.mkdir(pathDist, { recursive: true, force: true},  (err) => {
    if (err) throw err;    
    console.log('Создана новая папка project-dist');
    fs.mkdir(pathDistAssets, { recursive: true, force: true }, (err) => {
      if (err) throw err;             
      fs.copyFile(pathHtml_Old, pathDistHTML, (err) => {
        if (err) throw err;
      });  
      copyRecursive(srcAssets, pathDistAssets);
      console.log('Скопирована папка assets');
      createBundCss(srcStyles, pathBundleFileCss);
      
    });
  });
  readHtmlFile();
}

let strTemplate_HTML = '';
function readHtmlFile() { 
  const stream = fs.createReadStream(pathHtml_Old, 'utf-8');  
  stream.on('data', chunk => strTemplate_HTML += chunk);
  stream.on('end', () => {
    correctString(strTemplate_HTML);
  });
}


function correctString(str){
  let arrTags=[];  //['header', 'articles', 'footer']
  let arrIndx=[];//[ 393, 394, 401, 402, 436, 437, 446, 447, 467, 468, 475, 476 ] индексы скобок
  let arrIndx_chunk = [];//[[ 393, 394, 401, 402 ],[ 436, 437, 446, 447 ],[ 467, 468, 475, 476 ]] 
 
  for(let i =0; i<str.length; i++){
    if((str[i]==='{' && str[i+1] === '{' ) || (str[i]==='}' && str[i+1] === '}' )){
      arrIndx.push(i, i+1); //[ 393, 394, 401, 402, 436, 437, 446, 447, 467, 468, 475, 476 ] индексы: {{component}}
    }
  }
  while(arrIndx.length>0){
    let miniArr = arrIndx.splice(0, 4);
    arrIndx_chunk.push(miniArr); //[[ 393, 394, 401, 402 ],[ 436, 437, 446, 447 ],[ 467, 468, 475, 476 ]]
  }  
  for(let a of arrIndx_chunk){
    let strTag = str.slice(a[1]+1, a[2]);    
    arrTags.push(strTag); //['header', 'articles', 'footer']       
  }
  console.log(`Добавлены блоки: ${arrTags}`);
  readerComponentFolder(arrTags);  
}



function readerComponentFolder(arrTags) {
  let newItemComponent = strTemplate_HTML;  
  for (const item of arrTags) {
    let nameNewComponent = `{{${item}}}`;  
    let pathHtmlFile = path.join(componentsFolder, item +'.html');//patch HTML файлов 
    
    fs.readFile(pathDistHTML, 'utf8', async (err)=>{
      if (err) throw err;     
      await fs.promises.readFile(pathHtmlFile, 'utf8',(err, data)=>{
        if (err) throw err;
        let newItem = data.toString(); 
        newItemComponent.replace(nameNewComponent, newItem);
      });  
      fs.writeFile(pathDistHTML, newItemComponent, (err) => {
        if (err) throw err;                 
      }); 
    });  
  }
}
/*
async function delitFolder(){
  await fs.promises.rm(pathDist, { recursive: true }, (err) => {
    if (err) throw err;}); 
  createFolder();   
}*/



/*const stream =  fs.createReadStream(pathHtml_Old, 'utf-8');  
  stream.on('data', chunk => item += chunk);
  stream.on('end', () => {
    item.replace(nameNewComponent, itemNewComponent);
    return item;});
  /*await fs.promises.readFile(pathDistHTML, 'utf8', (err, data) => {
    if(err) throw err;
    console.log(data);
    item += data.toString();          
  });*/

 





/*async function writeHTMLnew(newHTML){
  await fs.promises.writeFile(pathDistHTML, newHTML, (err) => {
    if (err) throw err;
  });   
}*/
  

  

function copyRecursive(src, dest) {  
  fs.mkdir(dest, { recursive: true }, (err) => {
    if (err) throw err;      
  });
  fs.readdir(src, {withFileTypes: true}, (err, files) => {
    if (err) throw err;    
    files.forEach(function(result) { 
      let name = result.name;
      let srcs = path.join(src, name);
      let dests = path.join(dest, name);    
      if(result.isFile()){                 
        fs.copyFile(srcs, dests, (err) => {
          if (err) throw err;  
        });
      }
      if(result.isDirectory()){
        copyRecursive(srcs, dests);
      }  
    });  
  });   
}

function  createBundCss(src, pathBundleFile){
  let pathFileCss =[];
  //читаем папку styles и создаём массив pathFileCss с адресами css файлов//
  fs.readdir(src,{withFileTypes: true}, (err, files) => {
    if(err) throw err; 
    files.forEach(function(result) {  
      if(result.isFile()){
        let name = result.name;         
        let pathFile = path.join(src, name);
        let typeFile = path.extname(pathFile);
        if(typeFile ==='.css'){
          pathFileCss.push(pathFile);//массив с адресами Сss файлов
          fs.readFile(pathFile, 'utf8', (err, data) => {
            if(err) throw err;
            fs.open(pathBundleFile, 'a+', (err) => {
              if(err) throw err;           
              fs.appendFile(pathBundleFile, `${data} \n `, (err) => {
                if(err) throw err;                
              });
            });         
          });
        }
      }
    }); 
  });
  console.log('Создан общий файл style.css');
}

