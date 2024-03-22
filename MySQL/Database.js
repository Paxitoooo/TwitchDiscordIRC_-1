const mysql = require('mysql')
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

  countSubscribers(callback) {
    const query = "SELECT COUNT(*) AS subscriberCount FROM sub";
    this.connection.query(query, (error, results) => {
      if (error) {
        callback(error, null);
        return;
      }
      const subscriberCount = results[0].subscriberCount;
      callback(null, subscriberCount);
    });
  }

  getSubscribers(callback) {
    const query = "SELECT userDisplayName FROM sub";
    this.connection.query(query, (error, results) => {
      if (error) {
        callback(error, null);
        return;
      }
      const subscribers = results;
      callback(null, subscribers);
    });
  }

}

module.exports = Database