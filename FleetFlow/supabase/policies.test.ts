import { spawnSync } from 'node:child_process';
import { describe, it, beforeAll, expect } from 'vitest';
import { resolve } from 'node:path';

const run = (cmd: string, args: string[], opts = {}) => {
  const result = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return result;
};

beforeAll(() => {
  // ensure postgres is running
  spawnSync('pg_ctlcluster', ['16', 'main', 'start']);

  // recreate test database
  run('sudo', ['-u', 'postgres', 'psql', '-c', 'DROP DATABASE IF EXISTS fleetflow_test;']);
  run('sudo', ['-u', 'postgres', 'psql', '-c', 'CREATE DATABASE fleetflow_test;']);

  // minimal table structure
  run('sudo', ['-u', 'postgres', 'psql', '-d', 'fleetflow_test', '-c', `
    CREATE TABLE external_hires(id serial primary key);
    CREATE TABLE allocations(id serial primary key);
    CREATE TABLE operator_assignments(id serial primary key);
    INSERT INTO external_hires DEFAULT VALUES;
  `]);

  // apply policies
  run('sudo', ['-u', 'postgres', 'psql', '-d', 'fleetflow_test', '-f', resolve(__dirname, 'policies.sql')]);

  // create unauthorized role
  run('sudo', ['-u', 'postgres', 'psql', '-c', `
    DROP ROLE IF EXISTS authenticated;
    CREATE ROLE authenticated LOGIN PASSWORD 'secret';
    GRANT CONNECT ON DATABASE fleetflow_test TO authenticated;
  `]);
});

describe('RLS policies', () => {
  it('prevents direct table reads for unauthorised roles', () => {
    const result = spawnSync('psql', ['-h', 'localhost', '-U', 'authenticated', '-d', 'fleetflow_test', '-c', 'select * from external_hires;'], {
      env: { ...process.env, PGPASSWORD: 'secret' },
      encoding: 'utf8'
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('permission denied');
  });
});
