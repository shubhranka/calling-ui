import fs from 'fs';

const srcFolder = './';
const promptTextFile = `./prompt.txt`;
const serverFolder = './server';
const foldersToIgnore = ['node_modules', 'dist', 'build', 'package-lock.json'];

const getFile = (path) => {
  // If path is a folder, go inside

  const fileOrFolder = fs.statSync(path);
  const folderName = path.split('/').pop();
  if (foldersToIgnore.includes(folderName)) return;
  if (fileOrFolder.isDirectory()) {
    // get the files in the folder
    const files = fs.readdirSync(path);
    return files.map(file => getFile(`${path}/${file}`));
  }else{
    // add content to prompt.txt with the path and content like
    // src/components/IntentNode.tsx
    // <content>

    fs.appendFileSync(promptTextFile, `${path}\n`);
    fs.appendFileSync(promptTextFile, fs.readFileSync(path, 'utf8'));
    fs.appendFileSync(promptTextFile, '\n');
    fs.appendFileSync(promptTextFile, '\n');
  }
}

fs.appendFileSync(promptTextFile, "I will give you some code files of my project, then I will ask you some modifications to do in the project. Please do the modification and send only the code files that have been modified (complete files) in a code block.\n")

fs.appendFileSync(promptTextFile, 'These are the ui files that I have made.\n');
getFile(srcFolder);

fs.appendFileSync(promptTextFile, 'These are the server files that I have made.\n');
getFile(serverFolder);
