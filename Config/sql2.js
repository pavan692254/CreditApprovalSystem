const mysql = require('mysql2/promise');

const handleDb = async (query, param) => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'loan',
  });

  try {
    if (param) {
      const [rows, fields] = await connection.execute(query, param);
      console.log('Query result:', rows);
      return rows;
    } else {
      const [rows, fields] = await connection.execute(query);
      console.log('Query result:', rows);
      return rows;
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}


module.exports = {
  handleDb,
}
