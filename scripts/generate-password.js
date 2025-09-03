const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  const password = 'admin123';
  const saltRounds = 12;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nSQL to update admin user:');
    console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE username = 'admin';`);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generatePasswordHash(); 