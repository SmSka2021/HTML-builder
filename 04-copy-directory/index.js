const fs = require('fs');
const path = require('path');

let adress = path.resolve(__dirname, 'files-copy'); 
let src = path.join(__dirname, 'files');


function copyDir_and_clean(adress){
  fs.access(adress, fs.constants.F_OK, (err) => {
    if (err) {
      setTimeout(()=> {copyRecursive(src, adress);}, 500 ); 
    } else {
      fs.rm(adress, { recursive: true }, (err) => {
        if (err) {
          throw err; }
      });
      setTimeout(()=> {copyRecursive(src, adress);}, 500 ); 
    }});       
} 
copyDir_and_clean(adress); 



const copyRecursive =(src, dest)=> {  
  fs.mkdir(dest, { recursive: true }, (err) => {
    if (err) throw err;  
    console.log('Создана новая папка');
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
