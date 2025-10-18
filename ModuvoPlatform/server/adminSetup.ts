import { storage } from './storage';
import { hashPassword } from './auth';

export async function createAdminUser(email: string, password: string) {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByEmail(email);
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const passwordHash = await hashPassword(password);
    const adminUser = await storage.createUser({
      email,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    });

    console.log(`Admin user created successfully: ${email}`);
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Script to create admin user from environment variables
export async function setupAdminFromEnv() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('ADMIN_EMAIL and ADMIN_PASSWORD not set, skipping admin setup');
    return;
  }

  try {
    await createAdminUser(adminEmail, adminPassword);
  } catch (error) {
    console.error('Failed to setup admin user:', error);
  }
}