'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Right extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.University, {foreignKey: 'rightId'})
      this.hasOne(models.Timetable, {foreignKey: 'rightId'})
      this.belongsToMany(models.Role, {through: models.Role_Right, foreignKey: "rightId"})
    }
  }
  Right.init({
  }, {
    sequelize,
    modelName: 'Right',
    timestamps: false
  });
  return Right;
};
