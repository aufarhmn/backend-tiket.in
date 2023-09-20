const mongoose = require('mongoose');

function mongoConnect() {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on('connected', () => {
    console.log(`Connected to MongoDB Database!`);
  });

  db.on('error', (err) => {
    console.error(`MongoDB Connection Error!`);
  });

  db.on('disconnected', () => {
    console.log('MongoDB Disconnected!');
  });

  return mongoose;
}

module.exports = mongoConnect;