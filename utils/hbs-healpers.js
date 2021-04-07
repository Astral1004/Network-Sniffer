module.exports = {
  counter: function (value) {
    value++;
    return value;
  },
  searchAdmin: function (user) {
    if (user === 'Admin') {
      return true;
    }
  },
  searchOperator: function (user) {
    if (user === 'Operator') {
      return true;
    }
  },
  searchPr: function (user) {
    if (user === 'Pr') {
      return true;
    }
  },
  searchRuck: function (user) {
    if (user === 'Ruck') {
      return true;
    }
  },
  isAdminAPK: function (value) {
    if (value === 'Админ') {
      return true;
    }
  },
  isAdminOperator: function (value) {
    if (value === 'Админ (оператор)') {
      return true;
    }
  },
  checked: function (currentValue) {
    return currentValue == true ? 'checked' : '';
  },
  checkFlag: function (currentValue) {
    if (currentValue === true) {
      return true;
    } else {
      return false;
    }
  },
};
