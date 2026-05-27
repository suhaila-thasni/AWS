import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class TemplateItem extends Model {}

TemplateItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    templateType: {
      type: DataTypes.ENUM(
        "demo",
        "custom"
      ),
      defaultValue: "custom",
    },

    type: {
      type: DataTypes.ENUM(
        "text",
        "table",
        "patientInfoGrid"
      ),
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },

    x: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    y: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    width: {
      type: DataTypes.FLOAT,
      defaultValue: 100,
    },

    height: {
      type: DataTypes.FLOAT,
      defaultValue: 40,
    },

    editable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    fontSize: {
      type: DataTypes.STRING,
      defaultValue: "text-base",
    },

    fontWeight: {
      type: DataTypes.STRING,
      defaultValue: "",
    },

    textAlign: {
      type: DataTypes.ENUM(
        "left",
        "center",
        "right"
      ),
      defaultValue: "left",
    },

    textColor: {
      type: DataTypes.STRING,
      defaultValue: "#000000",
    },

    bgColor: {
      type: DataTypes.STRING,
      defaultValue: "transparent",
    },
  },
  {
    sequelize,
    modelName: "TemplateItem",
    tableName: "template_items",
    timestamps: true,
  }
);

export default TemplateItem;
