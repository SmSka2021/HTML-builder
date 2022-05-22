const fs = require('fs');
const path = require('path');

let pathDist = path.resolve(__dirname, 'project-dist'); 
let srcAssets = path.resolve(__dirname, 'assets');
let pathDistAssets = path.resolve(pathDist, 'assets'); 
let srcStyles = path.resolve(__dirname, 'styles');
let pathBundleFileCss = path.resolve(pathDist, 'style.css');
let pathHtml_Old = path.resolve(__dirname, 'template.html');
let componentsFolder = path.resolve(__dirname, 'components');
let pathDistHTML = path.resolve(pathDist, 'index.html'); 

function createFolderDist_and_Delete(){
  fs.access(pathDist, fs.constants.F_OK, (err) => {
    if (err) {
      createDist();
    }     
    fs.rm(pathDist, { recursive: true }, (err) => {
      if (err) throw err;
      createDist(); 
    });
    
  });
}
/*function createFolderDist_and_Delete(){
  fs.stat(pathDist, function(err) {
    if (!err) {
      fs.promises.rm(pathDist, { recursive: true }).then(createDist()).catch((err)=> console.log(err));
    }
    else if (err.code === 'ENOENT') {
      createDist();
    }
  });
}*/

/*
function createFolderDist_and_Delete(){
  fs.access(pathDist, fs.constants.F_OK, (err) => {
    if (err) {
      createDist();
    } else {
      fs.promises.rm(pathDist, { recursive: true }).then(createDist()).catch((err)=> console.log(err));
    }    
  });
}
*/

createFolderDist_and_Delete();

const createDist = ()=>{
  fs.mkdir(pathDist, { recursive: true }, (err) => {
    if (err) throw err;
    console.log('Создана новая папка project-dist');
    fs.open(pathDistHTML, 'a+', (err) => {//создаем файл index.html в папке project-dist
      if (err) throw err;
    });
    fs.mkdir(pathDistAssets, { recursive: true }, (err) => {
      if (err) throw err;             
      copyRecursive(srcAssets, pathDistAssets);
      console.log('Скопирована папка assets');
      createBundCss(srcStyles, pathBundleFileCss);
    });
  });
  readHtmlFile();
};

let strTemplate_HTML = '';
const readHtmlFile =()=>{ 
  const stream = fs.createReadStream(pathHtml_Old, 'utf-8');  
  stream.on('data', chunk => strTemplate_HTML += chunk);
  stream.on('end', () => correctString(strTemplate_HTML));    
};


const correctString=(str)=>{
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
  readerComponentFolder(arrTags, arrIndx_chunk);
};


const readerComponentFolder =(arrTags, arrIndx_chunk)=>{ 
  let TextHTML_file= strTemplate_HTML.slice(0, arrIndx_chunk[0][0]);
  fs.appendFile(pathDistHTML, TextHTML_file, (err) => {
    if (err) throw err;         
    for(let i =0; i<arrTags.length; i++){
      let start= +arrIndx_chunk[i][3] + 1;
      let pathHtmlFile = path.join(componentsFolder, arrTags[i]+'.html');//patch HTML файлов 
      let strHTMLcomponent = '';
      const stream = fs.createReadStream(pathHtmlFile, 'utf-8');  
      stream.on('data', chunk => strHTMLcomponent += chunk);
      stream.on('end', () => {
        if(arrTags[i+1]){            
          let finish = +arrIndx_chunk[i+1][0];
          let readComponent =  strHTMLcomponent + strTemplate_HTML.slice(start, finish );
          fs.appendFile(pathDistHTML, readComponent, (err) => {
            if(err) throw err;
          });
        } else {                   
          let component = strHTMLcomponent + strTemplate_HTML.slice(start);
          fs.appendFile(pathDistHTML, component, (err) => {
            if(err) throw err;     
          });            
        }          
      });
    } 
  });  
};

const copyRecursive =(src, dest)=> {
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
  
};
const  createBundCss=(src, pathBundleFile)=>{
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
              fs.appendFile(pathBundleFile, data + '/n', (err) => {
                if(err) throw err;               
              });
            });
          });
        }
      }
    }); 
  });
};

