const { Schema, model } = require('mongoose');

const accesscontrolShema = new Schema({
  name: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    required: true,
  },

  view: {
    viewStatistics: {
      flag: {
        type: Boolean,
        required: false,
        default: false,
      },
      description: {
        type: String,
        required: false,
        default: 'Статистика',
      },
    },
    viewUsers: {
      flag: {
        type: Boolean,
        required: false,
        default: false,
      },
      description: {
        type: String,
        required: false,
        default: 'Пользователи',
      },
    },
    viewMatrix: {
      flag: {
        type: Boolean,
        required: false,
        default: false,
      },
      description: {
        type: String,
        required: false,
        default: 'Матрица разграничения доступа',
      },
    },
    viewServers: {
      flag: {
        type: Boolean,
        required: false,
        default: false,
      },
      description: {
        type: String,
        required: false,
        default: 'Управление комплексами',
      },
    },
    viewOpenVPN: {
      flag: {
        type: Boolean,
        required: false,
        default: false,
      },
      description: {
        type: String,
        required: false,
        default: 'Open VPN',
      },
    },
  },
});

module.exports = model('AccessControl', accesscontrolShema);
