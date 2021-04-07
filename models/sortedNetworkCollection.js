var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var queuelogSchema = new Schema({
  count: Number,
  array: {
    type: Array,
    required: false,
    IpTo: String,
    IpFrom: String,
    Protocol: String,
  },
  Size: Number,
  date: Number,
});

module.exports = mongoose.model(
  'SortedNetwork_collection',
  queuelogSchema,
  'SortedNetwork_collection'
);
