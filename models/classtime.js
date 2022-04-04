'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClassTime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Group, {foreignKey: 'groupId'})
      this.hasMany(models.TimetableDay, {foreignKey: "classTimeId"})
    }
  }
  ClassTime.init({
    number: DataTypes.INTEGER,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    groupId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ClassTime',
  });
  return ClassTime;
};