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

function createFolderDist_and_Delete() {
  fs.access(pathDist, fs.constants.F_OK, (err) => {
    if (err) {
      createFolder();
    }
    if (!err) {
      delitFolder();
    }
  });
}

async function delitFolder() {
  await fs.promises.rm(pathDist, { recursive: true }, (err) => {
    if (err) throw err;
  });
  createFolder();
}

createFolderDist_and_Delete();

function createFolder() {
  fs.mkdir(pathDist, { recursive: true, force: true }, (err) => {
    if (err) throw err;
    console.log('Создана новая папка project-dist');
    fs.mkdir(pathDistAssets, { recursive: true, force: true }, (err) => {
      if (err) throw err;
      copyRecursive(srcAssets, pathDistAssets);
      console.log('Скопирована папка assets');
      createBundCss(srcStyles, pathBundleFileCss);
    });
  });
  createFileIndexHtml();
}

function createFileIndexHtml() {
  fs.open(pathDistHTML, 'w', (errOpen) => {
    if (errOpen) throw errOpen;
  });
  fs.promises.readdir(componentsFolder).then((files) => {
    fs.readFile(pathHtml_Old, 'utf-8', async (err, data) => {
      if (err) throw err;
      data = data.split('\n');
      for (const item of data) {
        let counter = 0;
        for (const file of files) {
          if (item.includes(file.split('.')[0])) {
            await fs.promises.readFile(`${componentsFolder}/${file.split('.')[0]}.html`, 'utf-8')
              .then(async (itemComponent) => {
                await fs.promises.appendFile(pathDistHTML, `${itemComponent}\n`);
              });
            counter = 1;
          }
        }
        if (counter === 0) {
          await fs.promises.appendFile(pathDistHTML, `${item}\n`);
        }
      }
    });
  });
  console.log('Создан  файл index.html');
}

function copyRecursive(src, dest) {
  fs.mkdir(dest, { recursive: true }, (err) => {
    if (err) throw err;
  });
  fs.readdir(src, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    files.forEach(function (result) {
      let name = result.name;
      let srcs = path.join(src, name);
      let dests = path.join(dest, name);
      if (result.isFile()) {
        fs.copyFile(srcs, dests, (err) => {
          if (err) throw err;
        });
      }
      if (result.isDirectory()) {
        copyRecursive(srcs, dests);
      }
    });
  });
}

function createBundCss(src, pathBundleFile) {
  let pathFileCss = [];
  //читаем папку styles и создаём массив pathFileCss с адресами css файлов//
  fs.readdir(src, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    files.forEach(function (result) {
      if (result.isFile()) {
        let name = result.name;
        let pathFile = path.join(src, name);
        let typeFile = path.extname(pathFile);
        if (typeFile === '.css') {
          pathFileCss.push(pathFile); //массив с адресами Сss файлов
          fs.readFile(pathFile, 'utf8', (err, data) => {
            if (err) throw err;
            fs.open(pathBundleFile, 'a+', (err) => {
              if (err) throw err;
              fs.appendFile(pathBundleFile, `${data} \n `, (err) => {
                if (err) throw err;
              });
            });
          });
        }
      }
    });
  });
  console.log('Создан общий файл style.css');
}
