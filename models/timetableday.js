"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TimetableDay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.ClassTime, { foreignKey: "classTimeId" });
      this.belongsTo(models.Subject, { foreignKey: "subjectId" });
      this.belongsTo(models.Teacher, { foreignKey: "teacherId" });
      this.belongsTo(models.Campus, { foreignKey: "campusId" });
      this.belongsTo(models.Timetable, { foreignKey: "timetableId" });
    }
  }
  TimetableDay.init(
    {
      weekDay: DataTypes.STRING,
      format: DataTypes.STRING,
      subjectType: DataTypes.STRING,
      weekType: DataTypes.STRING,
      classNumber: DataTypes.STRING,
      classTimeId: DataTypes.INTEGER,
      subjectId: DataTypes.INTEGER,
      teacherId: DataTypes.INTEGER,
      campusId: DataTypes.INTEGER,
      timetableId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "TimetableDay",
    }
  );
  return TimetableDay;
};
