'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ParsedData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Right, {foreignKey: "rightId"})
    }
  }
  ParsedData.init({
    rightId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ParsedData',
  });
  return ParsedData;
};
