const fs = require('fs');
const path = require('path');
const readline = require('readline');

let adress = path.resolve(__dirname, 'text.txt');
fs.open(adress, 'w', (err) => {
  if(err) throw err;
});

let rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('Добрый день. 👋 Как дела?\n');
rl.prompt();
rl.on('line', function(line) {
  if (line === 'exit') rl.close();
  fs.appendFile(adress, line, (err) => {
    if(err) throw err; 
  }); 
}).on('close',function(){
  process.exit();
});

process.on('exit', (code) => {
  if(code === 0) {
    console.log('Удачи! 👋');
  }});

process.on('SIGINT', () => {
  console.log('Удачи! 👋');
  process.exit();
});  
    
