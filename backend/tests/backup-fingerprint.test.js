import { beforeEach, describe, expect, test, vi } from 'vitest';
import request from 'supertest';

vi.mock('mysqldump', () => ({
  default: vi.fn(),
}));

vi.mock('../db.js', () => ({
  dbConfig: { host: 'localhost', user: 'root', database: 'apbs_db' },
  db: { query: vi.fn() },
  dbNew: { query: vi.fn(), execute: vi.fn() },
}));

vi.mock('../upload.js', () => ({
  upload: { single: () => (req, res, next) => next() },
  uploadDB: { single: () => (req, res, next) => next() },
}));

import mysqldump from 'mysqldump';
import backupRoutes from '../routes/backup.js';
import fingerprintRoutes from '../routes/fingerprint.js';
import { makeApp } from './helpers.js';

const backupApp = makeApp(backupRoutes);
const fingerprintApp = makeApp(fingerprintRoutes);

describe('backup routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BACKUP_FILE_PATH = '/tmp/apbs-test-backup.sql';
  });

  test('GET /backup returns success when mysqldump completes', async () => {
    mysqldump.mockResolvedValue(undefined);

    const res = await request(backupApp).get('/backup');

    expect(res.status).toBe(200);
    expect(res.text).toBe('Backup created successfully!');
    expect(mysqldump).toHaveBeenCalledWith({
      connection: { host: 'localhost', user: 'root', database: 'apbs_db' },
      dumpToFile: '/tmp/apbs-test-backup.sql',
    });
  });

  test('GET /backup returns a 500 when mysqldump fails', async () => {
    mysqldump.mockRejectedValue(new Error('disk full'));

    const res = await request(backupApp).get('/backup');

    expect(res.status).toBe(500);
    expect(res.text).toBe('Error creating backup: disk full');
  });
});

describe('fingerprint routes', () => {
  test('POST /fingerprint/scan rejects missing images', async () => {
    const res = await request(fingerprintApp)
      .post('/fingerprint/scan')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'No image provided' });
  });

  test('POST /fingerprint/scan accepts a png data URL and reports decoded bytes', async () => {
    const image = `data:image/png;base64,${Buffer.from('fingerprint').toString('base64')}`;

    const res = await request(fingerprintApp)
      .post('/fingerprint/scan')
      .send({ image });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: 11 });
  });
});
