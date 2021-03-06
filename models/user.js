'use strict';
const {
  Model, Sequelize
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Group, {foreignKey: "groupId"})
      this.belongsTo(models.University, {foreignKey: "universityId"})
      this.belongsToMany(models.Role, {through: models.User_Role, foreignKey: "userId"})
    }
  }

  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    type: DataTypes.STRING,
    groupId: DataTypes.INTEGER,
    universityId: DataTypes.INTEGER
  }, {
    sequelize,
  });

  return User;
};
