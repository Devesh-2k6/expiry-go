const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

const BLOB_STORE_FILENAME = 'expirygo_db_v1.json';
const BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  'vercel_blob_rw_ntKd7vsAVWrEywtx_ibzEnUJNAegcuyfZhRLRYBHJ4jPyfb';

const cleanStore = {
  users: {
    'devpant2006@gmail.com': {
      id: 'admin_devesh_001',
      email: 'devpant2006@gmail.com',
      name: 'Devesh Admin',
      role: 'ADMIN',
      is_shop_owner: false,
      email_verified: true,
      created_at: '2026-11-01T00:00:00.000Z'
    }
  },
  shops: {},
  products: [],
  otps: {},
  reservations: [],
  orders: []
};

async function wipe() {
  console.log('Writing clean store to Vercel Blob...');
  const blob = await put(BLOB_STORE_FILENAME, JSON.stringify(cleanStore, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    token: BLOB_TOKEN,
  });
  console.log('Vercel Blob wiped successfully. URL:', blob.url);

  // Update local temp file if exists
  const tempFiles = [
    path.join(process.env.TEMP || '', 'expirygo_serverless_store.json'),
    path.join(process.env.TMPDIR || '', 'expirygo_serverless_store.json'),
    '/tmp/expirygo_serverless_store.json'
  ];
  for (const f of tempFiles) {
    if (f && fs.existsSync(f)) {
      fs.writeFileSync(f, JSON.stringify(cleanStore, null, 2), 'utf-8');
      console.log('Updated local temp store:', f);
    }
  }

  // Check SQLite
  const { DatabaseSync } = require('node:sqlite');
  for (const dbPath of ['backend/expirygo_local_dev.db', 'expirygo_local_dev.db']) {
    try {
      if (fs.existsSync(dbPath)) {
        const db = new DatabaseSync(dbPath);
        db.exec("DELETE FROM users WHERE role != 'ADMIN'");
        db.exec("DELETE FROM shops");
        db.exec("DELETE FROM products");
        db.exec("DELETE FROM orders");
        db.exec("DELETE FROM reservations");
        const remaining = db.prepare("SELECT id, email, role FROM users").all();
        console.log('Remaining users in SQLite', dbPath, ':', remaining);
        db.close();
      }
    } catch (e) {
      console.log('SQLite error:', e.message);
    }
  }
}

wipe().catch(err => {
  console.error('Wipe failed:', err);
  process.exit(1);
});
