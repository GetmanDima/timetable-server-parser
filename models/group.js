"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.User, { foreignKey: "groupId" });
      this.hasMany(models.ClassTime, { foreignKey: "groupId" });
      this.hasMany(models.Timetable, { foreignKey: "groupId" });
    }
  }
  Group.init(
    {
      name: DataTypes.STRING,
      courseNumber: DataTypes.INTEGER,
      admissionYear: DataTypes.INTEGER,
    },
    {
      sequelize,
    }
  );
  return Group;
};
