const mysql = require('mysql');

class Database {
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }

  connect() {
    this.connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
      }
      console.log('Connected to MySQL as id ' + this.connection.threadId);
    });
  }

  saveSubscription(broadcasterName, userDisplayName, months, callback) {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = `INSERT INTO sub (broadcasterName, userDisplayName, months, timestamp) VALUES (?, ?, ?, ?)`;
    this.connection.query(query, [broadcasterName, userDisplayName, months, timestamp], (error, results, fields) => {
      if (error) {
        console.error('Error saving subscription:', error);
        callback(error);
        return;
      }
      console.log('Subscription saved successfully:', results);
      callback(null, results);
    });
  }
}

module.exports = Database;