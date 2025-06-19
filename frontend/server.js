const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database('./croco_notifications.db');

// Initialize database tables
db.serialize(() => {
  // Admins table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    name TEXT,
    email TEXT,
    phone TEXT,
    addresses TEXT,
    preference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Notifications table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    customerId TEXT,
    channel TEXT,
    status TEXT,
    message TEXT,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customerId) REFERENCES customers(id)
  )`);

  // Insert default admin user (username: admin, password: admin123)
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO admins (id, username, password) VALUES (?, ?, ?)`, 
    [uuidv4(), 'admin', hashedPassword]);

  // Insert sample customers
  const sampleCustomers = [
    {
      id: uuidv4(),
      firstName: 'John',
      lastName: 'Doe',
      name: 'John',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      addresses: JSON.stringify([{value: '123 Main St', type: 'home'}]),
      preference: JSON.stringify({smsOptIn: true, emailOptIn: true, promoOptIn: false, preferredChannel: 'EMAIL'})
    },
    {
      id: uuidv4(),
      firstName: 'Jane',
      lastName: 'Smith',
      name: 'Jane',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      addresses: JSON.stringify([{value: '456 Oak Ave', type: 'home'}]),
      preference: JSON.stringify({smsOptIn: false, emailOptIn: true, promoOptIn: true, preferredChannel: 'SMS'})
    }
  ];

  sampleCustomers.forEach(customer => {
    db.run(`INSERT OR IGNORE INTO customers (id, firstName, lastName, name, email, phone, addresses, preference) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer.id, customer.firstName, customer.lastName, customer.name, customer.email, 
       customer.phone, customer.addresses, customer.preference]);
  });

  // Insert sample notifications
  db.all(`SELECT id FROM customers LIMIT 2`, (err, customers) => {
    if (err || !customers.length) return;
    
    const sampleNotifications = [
      {
        id: uuidv4(),
        customerId: customers[0].id,
        channel: 'EMAIL',
        status: 'DELIVERED',
        message: 'Welcome to our service!'
      },
      {
        id: uuidv4(),
        customerId: customers[0].id,
        channel: 'SMS',
        status: 'PENDING',
        message: 'Your order is being processed'
      },
      {
        id: uuidv4(),
        customerId: customers[1] ? customers[1].id : customers[0].id,
        channel: 'EMAIL',
        status: 'FAILED',
        message: 'Monthly newsletter'
      }
    ];

    sampleNotifications.forEach(notification => {
      db.run(`INSERT OR IGNORE INTO notifications (id, customerId, channel, status, message) 
              VALUES (?, ?, ?, ?, ?)`,
        [notification.id, notification.customerId, notification.channel, notification.status, notification.message]);
    });
  });
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Admin login
app.post('/api/admins/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get(`SELECT * FROM admins WHERE username = ?`, [username], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  });
});

// Get all customers
app.get('/api/customers', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM customers ORDER BY created_at DESC`, (err, customers) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const formattedCustomers = customers.map(customer => ({
      ...customer,
      addresses: customer.addresses ? JSON.parse(customer.addresses) : [],
      preference: customer.preference ? JSON.parse(customer.preference) : {}
    }));

    res.json(formattedCustomers);
  });
});

// Search customers
app.get('/api/customers/search', authenticateToken, (req, res) => {
  const { name, email, phone, lastName } = req.query;
  
  let query = 'SELECT * FROM customers WHERE 1=1';
  let params = [];

  if (name) {
    query += ' AND (firstName LIKE ? OR name LIKE ?)';
    params.push(`%${name}%`, `%${name}%`);
  }
  if (email) {
    query += ' AND email LIKE ?';
    params.push(`%${email}%`);
  }
  if (phone) {
    query += ' AND phone LIKE ?';
    params.push(`%${phone}%`);
  }
  if (lastName) {
    query += ' AND lastName LIKE ?';
    params.push(`%${lastName}%`);
  }

  db.all(query, params, (err, customers) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const formattedCustomers = customers.map(customer => ({
      ...customer,
      addresses: customer.addresses ? JSON.parse(customer.addresses) : [],
      preference: customer.preference ? JSON.parse(customer.preference) : {}
    }));

    res.json(formattedCustomers);
  });
});

// Get customer by ID
app.get('/api/customers/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM customers WHERE id = ?`, [id], (err, customer) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const formattedCustomer = {
      ...customer,
      addresses: customer.addresses ? JSON.parse(customer.addresses) : [],
      preference: customer.preference ? JSON.parse(customer.preference) : {}
    };

    res.json(formattedCustomer);
  });
});

// Create customer
app.post('/api/customers', authenticateToken, (req, res) => {
  const { firstName, name, lastName, email, phone, addresses, preference } = req.body;
  const id = uuidv4();

  const addressesJson = JSON.stringify(addresses || []);
  const preferenceJson = JSON.stringify(preference || {});

  db.run(`INSERT INTO customers (id, firstName, lastName, name, email, phone, addresses, preference) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, firstName, lastName, name || firstName, email, phone, addressesJson, preferenceJson],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ 
        id, 
        firstName, 
        lastName, 
        name: name || firstName, 
        email, 
        phone, 
        addresses: addresses || [], 
        preference: preference || {} 
      });
    });
});

// Update customer
app.put('/api/customers/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { firstName, name, lastName, email, phone, addresses, preference } = req.body;

  const addressesJson = JSON.stringify(addresses || []);
  const preferenceJson = JSON.stringify(preference || {});

  db.run(`UPDATE customers 
          SET firstName = ?, lastName = ?, name = ?, email = ?, phone = ?, addresses = ?, preference = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    [firstName, lastName, name || firstName, email, phone, addressesJson, preferenceJson, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({ message: 'Customer updated successfully' });
    });
});

// Delete customer
app.delete('/api/customers/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM customers WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  });
});

// Get all notifications
app.get('/api/notifications', (req, res) => {
  db.all(`SELECT * FROM notifications ORDER BY sentAt DESC`, (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(notifications);
  });
});

// Get notifications by status
app.get('/api/notifications/status/:status', (req, res) => {
  const { status } = req.params;
  
  db.all(`SELECT * FROM notifications WHERE status = ? ORDER BY sentAt DESC`, [status.toUpperCase()], (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(notifications);
  });
});

// Get notifications by customer
app.get('/api/notifications/customer/:customerId', (req, res) => {
  const { customerId } = req.params;
  
  db.all(`SELECT * FROM notifications WHERE customerId = ? ORDER BY sentAt DESC`, [customerId], (err, notifications) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(notifications);
  });
});

// Get notification report
app.get('/api/notifications/report/full', (req, res) => {
  db.all(`SELECT status, COUNT(*) as count FROM notifications GROUP BY status`, (err, statusCounts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.all(`SELECT * FROM notifications ORDER BY sentAt DESC LIMIT 50`, (err, details) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const report = {
        pending: 0,
        failed: 0,
        delivered: 0,
        total: 0,
        details: details
      };

      statusCounts.forEach(item => {
        const status = item.status.toLowerCase();
        report[status] = item.count;
        report.total += item.count;
      });

      res.json(report);
    });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Croco Notification Backend running on http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite (croco_notifications.db)`);
  console.log(`🔐 Default admin credentials: username=admin, password=admin123`);
  console.log(`❤️  Frontend should work seamlessly now!`);
}); 