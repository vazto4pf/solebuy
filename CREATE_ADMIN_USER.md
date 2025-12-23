# Creating an Admin User

Since authentication is now handled with a custom users table, you need to manually create an admin user in the database.

## Steps to Create Admin User:

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run this SQL command (replace the email and password with your desired credentials):

```sql
-- Create an admin user
-- Note: The password 'admin123' will be hashed using SHA-256
-- You should use a stronger password in production
INSERT INTO users (email, password_hash, full_name, is_admin)
VALUES (
  'admin@example.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- SHA-256 hash of 'admin123'
  'Admin User',
  true
);
```

## To hash your own password:

You can use this JavaScript code in the browser console:

```javascript
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Example usage:
hashPassword('your-password-here').then(hash => console.log(hash));
```

Or use an online SHA-256 hash generator.

## Default Test Admin Credentials:
- Email: `admin@example.com`
- Password: `admin123`

**IMPORTANT:** Change these credentials immediately after first login in production!
