const fs = require('fs');
const path = require('path');

let adress = path.resolve(__dirname, 'secret-folder');

let sort = [];
let res =[];
fs.readdir(adress, {withFileTypes: true},  (err, files) => {
  if (err) throw err;  
  files.forEach(function(result) {  
    if(result.isFile()){
      let name = result.name;
      sort.push(name);
      let replasName= name.replace('.', '-') + '-';
      res.push(replasName);     
    }     
  });

  for(let i=0; i<res.length; i++){
    let adr = path.resolve(__dirname, 'secret-folder',`${sort[i]}`);
    //console.log(adr);  
    fs.stat(adr, (err, stats) => {
      if (err) throw err;      
      let siz = stats.size;     
      let result = res[i] + siz/1000 + 'kb';
      let str= result.toString(); 
      console.log(str);    
    });
  }  
});






