"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class WeekType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Timetable, { foreignKey: "timetableId" });
      this.hasMany(models.TimetableLesson, { foreignKey: "weekTypeId" });
    }
  }
  WeekType.init(
    {
      name: DataTypes.STRING,
      activePeriods: {
        type: DataTypes.JSON,
      },
      timetableId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "WeekType",
    }
  );
  return WeekType;
};
