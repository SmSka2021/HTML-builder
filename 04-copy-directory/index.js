const fs = require('fs');
const path = require('path');


function copyDir(){
  let adress = path.resolve(__dirname, 'files-copy'); 

  fs.access(adress, fs.constants.F_OK, (err) => {
    if (err) {
      copyRecursive();
    } else {
      fs.readdir(adress, {withFileTypes: true}, (err, files) => {
        files.forEach(function(result) {  
          if(result.isFile()){
            let name = result.name;         
            let dests = path.join(__dirname, 'files-copy', name);   
            fs.unlink(dests, (err) => {
              if (err) throw err;           
            });
          }});
      });
      setTimeout(()=> {fs.rmdir(adress, (err) => {
        if (err) throw 'not Удалили папку';             
      });}, 100 );
      setTimeout(()=> {copyRecursive();}, 300 ); 
    }});       
} 

copyDir(); 

let src = path.join(__dirname, 'files');
let dest = path.join(__dirname, 'files-copy');

function copyRecursive() {
  
  fs.mkdir(dest, { recursive: true }, (err) => {
    if (err) throw err;  
    console.log('Создана новая папка files-copy');
  });
  fs.readdir(src, {withFileTypes: true}, (err, files) => {
    if (err) throw err;    
    files.forEach(function(result) {  
      if(result.isFile()){
        let name = result.name;
        let srcs = path.join(__dirname, 'files', name);
        let dests = path.join(__dirname, 'files-copy', name);            
        fs.copyFile(srcs, dests, (err) => {
          if (err) throw err;  
          console.log('Файл успешно копирован');
        });
      }});  
  });   
  
}
