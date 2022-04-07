'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class University extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Right, {foreignKey: "rightId"})
    }
  }
  University.init({
    name: DataTypes.STRING,
    fullName: DataTypes.STRING,
    address: DataTypes.STRING,
    rightId: DataTypes.INTEGER
  }, {
    sequelize,
  });
  return University;
};
