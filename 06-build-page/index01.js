const fs = require('fs');
const path = require('path');
const projectPath = path.join(__dirname, 'project-dist');
const styleFile = path.join(projectPath, 'style.css');
const assetsSrc = path.join(__dirname, 'assets');
const assetsDst = path.join(projectPath, 'assets');
const stylesPath = path.join(__dirname, 'styles');
//create directories './project-dist' & './project-dist/assets'
makeFolder(projectPath);
makeFolder(assetsDst);
//read directory './project-dist/assets'
fs.readdir(assetsSrc, (err, list) => {
  if (err) throw err;
  //create subdirectories './project-dist/assets/fonts .../img .../svg'
  list.forEach(item => {
    const folderSrcPath = path.join(assetsSrc, item);
    const folderDestPath = path.join(assetsDst, item);
    makeFolder(folderDestPath);
    //read subdirectories './assets/fonts .../img .../svg'
    fs.readdir(folderSrcPath, (err, list) => {
      if (err) throw err;
      //copy files from './assets/fonts .../img .../svg' into './project-dist/assets/fonts .../img .../svg'
      list.forEach(item => {
        const srcFile = path.join(folderSrcPath, item);
        const destFile = path.join(folderDestPath, item);
        fs.copyFile(srcFile, destFile, err => {
          if (err) throw err;
        });
      });
    });
  });
});
//create empty file './project-dist/style.css'
fs.writeFile(styleFile, '', (err) => {
  if (err) throw err;
});
//read directory './style'
fs.readdir(stylesPath, (err, list) => {
  if (err) throw err;
  //check extentions of files '.css' & read them
  list.forEach(item => {
    if (path.extname(item).trim() === '.css') {
      const fileName = path.join(stylesPath, item);
      fs.readFile(fileName, (err, data) => {
        if (err) throw err;
        //add reading files into './project-dist/style.css'
        fs.appendFile(styleFile, data, err => {
          if (err) throw err;
        });
      });
    }    
  });
});
//read file 'template.html' & content encoding to string
const templateFile = path.join(__dirname, 'template.html');
const componetsPath = path.join(__dirname, 'components');
fs.readFile(templateFile, {encoding: 'utf-8'}, (err, string) => {
  if (err) throw err;
  //read directory './components'
  fs.readdir(componetsPath, (err, list) => {
    if (err) throw err;
    //from names of files create search template and ...
    list.forEach(item => {      
      const extFile = path.extname(item);
      const nameFile = path.basename(item, extFile);
      const templateName = '{{' + nameFile + '}}';      
      //... read files with these names
      fs.readFile(path.join(componetsPath, item), {encoding: 'utf-8'}, (err, subString) => {
        if (err) throw err;
        //into string from 'template.html' replacing the templates with the contents of the files
        string = string.replace(templateName, subString);
        //write the received string to './project-dist/index.html'
        fs.writeFile(path.join(projectPath, 'index.html'), string, err => {
          if (err) throw err;
        });
      });
    });
  });  
});

function makeFolder (path) {
  fs.mkdir(path, {recursive: true}, (err) => {
    if (err) throw err;
  });
}