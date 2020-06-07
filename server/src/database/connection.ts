import knew from 'knex';
import path from 'path';

const connection = knew({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'),
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn: any, cb: any) => {
      conn.run('PRAGMA foreign_keys = ON', cb);
    }
  }
});

export default connection;