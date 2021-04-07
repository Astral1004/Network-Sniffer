var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var queuelogSchema = new Schema({
  Name: String,
  Ip: String,
  CertificatedName: String,
});

module.exports = mongoose.model('Servers', queuelogSchema, 'Servers');
