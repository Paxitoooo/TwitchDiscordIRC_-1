const mysql = require('mysql')
const Sentry = require('@sentry/node')

Sentry.init({
  dsn: 'https://71fb760f959e4a02fa630b10d0255626@o4506773084045312.ingest.sentry.io/4506773086404608'
})
class Database {
  constructor(config) {
    this.connection = mysql.createConnection(config)
  }

  connect() {
    this.connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return
      }
      console.log('Database 🟢 ' + this.connection.threadId);
    })
  }


  getLatestSubscriptionByUser(userDisplayName, callback) {
    const query = "SELECT broadcasterName, userDisplayName, months, timestamp FROM sub WHERE userDisplayName = ? ORDER BY timestamp DESC LIMIT 1";
    this.connection.query(query, [userDisplayName], (error, results) => {
      if (error) {
        callback(error, null);
        return;
      }
      const latestSubscription = results[0];
      callback(null, latestSubscription);
    });
  }

  saveSubscription(broadcasterName, userDisplayName, months, callback) {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const query = `INSERT INTO sub (broadcasterName, userDisplayName, months, timestamp) VALUES (?, ?, ?, ?)`

    this.connection.query(query, [broadcasterName, userDisplayName, months, timestamp], (error, results, fields) => {
      if (error) {
        console.error('Error saving subscription:', error)
        Sentry.captureException(error);
        callback(error);
        return
      }
      callback(null, results || {});
    })
  }
}

module.exports = Database