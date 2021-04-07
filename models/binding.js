const { Schema, model } = require('mongoose');

const bindingSchema = new Schema({
  login: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
    default: '',
  },
});

module.exports = model('Binding', bindingSchema);
