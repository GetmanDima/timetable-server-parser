"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Timetable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Right, { foreignKey: "rightId" });
      this.belongsTo(models.Group, { foreignKey: "groupId" });
      this.hasMany(models.TimetableLesson, { foreignKey: "timetableId" });
    }
  }
  Timetable.init(
    {
      name: DataTypes.STRING,
      creationType: DataTypes.STRING,
      groupId: DataTypes.INTEGER,
      rightId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Timetable",
    }
  );
  return Timetable;
};
