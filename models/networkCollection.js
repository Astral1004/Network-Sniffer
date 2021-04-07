var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var queuelogSchema = new Schema({
  Time: String,
  Interface: String,
  IpTo: String,
  IpFrom: String,
  Protocol: String,
  Size: Number,
 
});

module.exports = mongoose.model('Network_collection', queuelogSchema, 'Network_collection');
