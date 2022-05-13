const fs = require('fs');
const path = require('path');

let src = path.join(__dirname, 'styles');
let pathBundleFile = path.join(__dirname, 'project-dist', 'bundle.css');


let pathFileCss =[];


function correctBundScc(){
  fs.access(pathBundleFile, fs.constants.F_OK, (err) => {
    if (err) {
      createBundCss();
    } else {
      fs.unlink(pathBundleFile, (err) => {
        if (err) throw err;           
      });
      setTimeout(()=> {createBundCss();}, 100 );   
    } 
  });
}
  
correctBundScc(); 


function createBundCss(){
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
              fs.appendFile(pathBundleFile, data, (err) => {
                if(err) throw err;
                console.log('Данные из файла css добавлены!');
              });
            });
         
          });
        }
      }
    }); 
  });
}
