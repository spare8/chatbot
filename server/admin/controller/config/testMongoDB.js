// server/controller/config/testMongoDB.js
const mongoose = require('mongoose');
const {MONGODB_URI} = require('../../../../config/config');

async function testMongoDB(req, res) {
  const uri = (req.body && req.body.MONGODB_URI) || MONGODB_URI;
  if (!uri) {
    return res.status(400).json({ok: false, error: 'Missing MONGODB_URI'});
  }

  // Use a short-lived separate connection so we don't touch the primary one
  const conn = mongoose.createConnection(uri, {serverSelectionTimeoutMS: 5000});
  try {
    await conn.asPromise(); // connect
    await conn.close();
    return res.json({ok: true});
  } catch (e) {
    await conn.close();
    return res.status(200).json({ok: false, error: e.message});
  }
}

module.exports = {testMongoDB};
