const fs = require('fs');
const path = require('path');

const apiSrc = '/workspace/app/TCC-Vitare_2026/apps/api/src';

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

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Fix import paths for infra modules
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/prisma\/prisma\.service['"]/g, "from '@infra/prisma/prisma.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/redis\/redis\.service['"]/g, "from '@infra/redis/redis.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/cache\/cache\.service['"]/g, "from '@infra/cache/cache.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/idempotency\/idempotency\.service['"]/g, "from '@infra/idempotency/idempotency.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/outbox\/outbox\.service['"]/g, "from '@infra/outbox/outbox.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/prisma\/prisma\.module['"]/g, "from '@infra/prisma/prisma.module'");
  
  // Fix import paths for common modules
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/common\/decorators\/current-user\.decorator['"]/g, "from '@common/decorators/current-user.decorator'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/common\/decorators\/public\.decorator['"]/g, "from '@common/decorators/public.decorator'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/config\/configuration['"]/g, "from '@config/configuration'");
  
  // Fix relative imports to use @/ aliases for modules
  content = content.replace(/from ['"]\.\.\/\.\.\/modules\/auth\/auth\.module['"]/g, "from '@modules/auth/auth.module'");
  content = content.replace(/from ['"]\.\.\/\.\.\/modules\/patients\/patients\.module['"]/g, "from '@modules/patients/patients.module'");
  
  // Fix application/use-cases barrel imports
  content = content.replace(/from ['"]\.\/application\/use-cases['"]/g, "from './application/use-cases'");
  content = content.replace(/from ['"]\.\.\/application\/use-cases['"]/g, "from '../application/use-cases'");
  content = content.replace(/from ['"]\.\.\/\.\.\/application\/use-cases['"]/g, "from '../../application/use-cases'");
  
  // Fix presentation/dto imports
  content = content.replace(/from ['"]\.\/presentation\/dto['"]/g, "from './presentation/dto'");
  content = content.replace(/from ['"]\.\.\/presentation\/dto['"]/g, "from '../presentation/dto'");
  
  // Fix application/dto imports
  content = content.replace(/from ['"]\.\/application\/dto['"]/g, "from './application/dto'");
  content = content.replace(/from ['"]\.\.\/application\/dto['"]/g, "from '../application/dto'");
  
  // Fix application/ports imports
  content = content.replace(/from ['"]\.\/application\/ports['"]/g, "from './application/ports'");
  content = content.replace(/from ['"]\.\.\/application\/ports['"]/g, "from '../application/ports'");
  
  // Fix domain/repositories imports
  content = content.replace(/from ['"]\.\/domain\/repositories['"]/g, "from './domain/repositories'");
  content = content.replace(/from ['"]\.\.\/domain\/repositories['"]/g, "from '../domain/repositories'");
  
  // Fix domain/entities imports
  content = content.replace(/from ['"]\.\/domain\/entities['"]/g, "from './domain/entities'");
  content = content.replace(/from ['"]\.\.\/domain\/entities['"]/g, "from '../domain/entities'");
  
  // Fix domain/value-objects imports
  content = content.replace(/from ['"]\.\/domain\/value-objects['"]/g, "from './domain/value-objects'");
  content = content.replace(/from ['"]\.\.\/domain\/value-objects['"]/g, "from '../domain/value-objects'");
  
  // Fix domain/exceptions imports
  content = content.replace(/from ['"]\.\/domain\/exceptions['"]/g, "from './domain/exceptions'");
  content = content.replace(/from ['"]\.\.\/domain\/exceptions['"]/g, "from '../domain/exceptions'");
  
  // Fix domain/services imports
  content = content.replace(/from ['"]\.\/domain\/services['"]/g, "from './domain/services'");
  content = content.replace(/from ['"]\.\.\/domain\/services['"]/g, "from '../domain/services'");
  
  // Fix infrastructure/repositories imports
  content = content.replace(/from ['"]\.\/infrastructure\/repositories['"]/g, "from './infrastructure/repositories'");
  content = content.replace(/from ['"]\.\.\/infrastructure\/repositories['"]/g, "from '../infrastructure/repositories'");
  
  // Fix infrastructure/services imports
  content = content.replace(/from ['"]\.\/infrastructure\/services['"]/g, "from './infrastructure/services'");
  content = content.replace(/from ['"]\.\.\/infrastructure\/services['"]/g, "from '../infrastructure/services'");
  
  // Fix infrastructure/strategies imports
  content = content.replace(/from ['"]\.\/infrastructure\/strategies['"]/g, "from './infrastructure/strategies'");
  content = content.replace(/from ['"]\.\.\/infrastructure\/strategies['"]/g, "from '../infrastructure/strategies'");
  
  // Add import type for constructor parameters (simple pattern)
  // This is a heuristic - we need to be careful
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

walk(apiSrc, fixFile);
console.log('Import fixes applied');
