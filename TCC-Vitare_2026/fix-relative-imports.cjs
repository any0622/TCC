const fs = require('fs');
const path = require('path');

const apiSrc = '/workspace/app/TCC-Vitare_2026/apps/api/src';
const projectRoot = '/workspace/app/TCC-Vitare_2026/apps/api';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      callback(fullPath);
    }
  });
}

function getRelativeImport(fromFile, toModule) {
  // toModule is like '@infra/prisma/prisma.service'
  // fromFile is the absolute path of the file doing the import
  
  let match = toModule.match(/^@infra\/(.+)$/);
  if (match) {
    let targetPath = path.join(projectRoot, 'src/infra', match[1]);
    if (!targetPath.endsWith('.ts')) {
      targetPath = targetPath + '.ts';
    }
    let relative = path.relative(path.dirname(fromFile), targetPath);
    return relative.replace(/\\/g, '/').replace(/\.ts$/, '');
  }
  
  match = toModule.match(/^@common\/decorators\/(.+)$/);
  if (match) {
    let targetPath = path.join(projectRoot, 'src/common/decorators', match[1]);
    if (!targetPath.endsWith('.ts')) {
      targetPath = targetPath + '.ts';
    }
    let relative = path.relative(path.dirname(fromFile), targetPath);
    return relative.replace(/\\/g, '/').replace(/\.ts$/, '');
  }
  
  match = toModule.match(/^@config\/(.+)$/);
  if (match) {
    let targetPath = path.join(projectRoot, 'src/config', match[1]);
    if (!targetPath.endsWith('.ts')) {
      targetPath = targetPath + '.ts';
    }
    let relative = path.relative(path.dirname(fromFile), targetPath);
    return relative.replace(/\\/g, '/').replace(/\.ts$/, '');
  }
  
  return null;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace @infra/* imports with relative paths
  const infraImportRegex = /from\s+['"]@infra\/([^'"]+)['"]/g;
  content = content.replace(infraImportRegex, (match, modulePath) => {
    let relative = getRelativeImport(filePath, '@infra/' + modulePath);
    if (relative) {
      return 'from \'' + relative + '\'';
    }
    return match;
  });
  
  // Replace @common/decorators/* imports
  const commonImportRegex = /from\s+['"]@common\/decorators\/([^'"]+)['"]/g;
  content = content.replace(commonImportRegex, (match, modulePath) => {
    let relative = getRelativeImport(filePath, '@common/decorators/' + modulePath);
    if (relative) {
      return 'from \'' + relative + '\'';
    }
    return match;
  });
  
  // Replace @config/* imports
  const configImportRegex = /from\s+['"]@config\/([^'"]+)['"]/g;
  content = content.replace(configImportRegex, (match, modulePath) => {
    let relative = getRelativeImport(filePath, '@config/' + modulePath);
    if (relative) {
      return 'from \'' + relative + '\'';
    }
    return match;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      callback(fullPath);
    }
  });
}

walk(apiSrc, fixFile);
console.log('Relative import fixes applied');
