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
  
  // Fix infra imports to use @infra alias
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/prisma\/prisma\.service['"]/g, "from '@infra/prisma/prisma.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/redis\/redis\.service['"]/g, "from '@infra/redis/redis.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/cache\/cache\.service['"]/g, "from '@infra/cache/cache.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/idempotency\/idempotency\.service['"]/g, "from '@infra/idempotency/idempotency.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/outbox\/outbox\.service['"]/g, "from '@infra/outbox/outbox.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/email\/email\.service['"]/g, "from '@infra/email/email.service'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/prisma\/prisma\.module['"]/g, "from '@infra/prisma/prisma.module'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/redis\/redis\.module['"]/g, "from '@infra/redis/redis.module'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/cache\/cache\.module['"]/g, "from '@infra/cache/cache.module'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/idempotency\/idempotency\.module['"]/g, "from '@infra/idempotency/idempotency.module'");
  content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/infra\/outbox\/outbox\.module['"]/g, "from '@infra/outbox/outbox.module'");
  
  // Fix common decorators import
  content = content.replace(/from ['"]@common\/decorators\/current-user\.decorator['"]/g, "from '@common/decorators/current-user.decorator'");
  content = content.replace(/from ['"]@common\/decorators\/public\.decorator['"]/g, "from '@common/decorators/public.decorator'");
  
  // Fix config import
  content = content.replace(/from ['"]@config\/configuration['"]/g, "from '@config/configuration'");
  
  // Add import type for constructor parameters (simple heuristic)
  // Match constructor(private readonly xxx: Type) and add import type
  const constructorRegex = /constructor\s*\(\s*(private\s+readonly\s+\w+:\s*(\w+)(?:\s*,\s*private\s+readonly\s+\w+:\s*\w+)*)\s*\)/g;
  
  // Find all imports and check if we need to add import type
  // This is complex - let's do a simpler approach: add import type for known types
  
  // For now, let's just fix the PrismaService import path issue
  // and the dto imports
  
  // Fix dto imports
  content = content.replace(/from ['"]\.\/dto\/([^'"]+)['"]/g, "from './presentation/dto/$1'");
  content = content.replace(/from ['"]\.\/application\/use-cases['"]/g, "from './application/use-cases'");
  content = content.replace(/from ['"]\.\.\/application\/use-cases['"]/g, "from '../application/use-cases'");
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

walk(apiSrc, fixFile);
console.log('Additional fixes applied');
