const User = require('../models/user');
const AccessControl = require('../models/accesscontrol');

module.exports = {
  checkAccess: async function (req) {
    try {
      const templateName = await User.findOne({
        login: req.session.user,
      }).lean();
      const name = templateName.typeUser;
      const findFlag = await AccessControl.findOne({ name }).lean();
      return findFlag;
    } catch (err) {}
  },
};
