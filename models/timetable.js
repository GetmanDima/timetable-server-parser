'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Timetable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Right, {foreignKey: 'rightId'})
      this.hasMany(models.TimetableDay, {foreignKey: "timetableId"})
    }
  }
  Timetable.init({
    name: DataTypes.STRING,
    creationType: DataTypes.STRING,
    rightId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Timetable',
  });
  return Timetable;
};
