"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Timetable, { foreignKey: "timetableId" });
      this.hasMany(models.TimetableLesson, { foreignKey: "teacherId" });
    }
  }
  Teacher.init(
    {
      name: DataTypes.STRING,
      timetableId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Teacher",
    }
  );
  return Teacher;
};
