"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TimetableLesson extends Model {
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
  TimetableLesson.init(
    {
      weekDay: DataTypes.STRING,
      weekType: DataTypes.STRING,
      format: DataTypes.STRING,
      room: DataTypes.STRING,
      classType: DataTypes.STRING,
      activeFromDate: DataTypes.DATE,
      activeToDate: DataTypes.DATE,
      classTimeId: DataTypes.INTEGER,
      subjectId: DataTypes.INTEGER,
      teacherId: DataTypes.INTEGER,
      campusId: DataTypes.INTEGER,
      timetableId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "TimetableLesson",
    }
  );
  return TimetableLesson;
};
