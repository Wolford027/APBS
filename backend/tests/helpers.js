import express from 'express';

/** Mount a router on a bare express app, mirroring how server.js mounts it. */
export function makeApp(router) {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
}

/**
 * Route handlers call db.query with either (sql, cb) or (sql, params, cb).
 * Normalizes both shapes and hands them to the test's handler.
 */
export function stubQuery(queryMock, handler) {
  queryMock.mockImplementation((...args) => {
    const cb = args[args.length - 1];
    const sql = args[0];
    const params = args.length > 2 ? args[1] : undefined;
    handler({ sql, params, cb });
  });
}
