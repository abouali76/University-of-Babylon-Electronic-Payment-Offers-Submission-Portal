const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
    try {
        const username = 'admin';
        const password = 'admin123';
        const role = 'admin';
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if user exists
        const [existing] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        
        if (existing.length > 0) {
            console.log('User already exists');
        } else {
            await db.run_async(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role]
            );
            console.log('Admin user created successfully!');
            console.log('Username: admin');
            console.log('Password: admin123');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding user:', error.message);
        process.exit(1);
    }
}

seed();
