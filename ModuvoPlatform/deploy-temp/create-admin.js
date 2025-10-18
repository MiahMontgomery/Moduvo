#!/usr/bin/env node

import { createAdminUser } from '../server/adminSetup.js';

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password>');
    process.exit(1);
  }

  try {
    await createAdminUser(email, password);
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  }
}

main();