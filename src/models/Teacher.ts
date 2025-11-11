import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/index.js";

export interface TeacherAttributes {
    id: number;
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface TeacherCreationAttributes extends Optional<TeacherAttributes, "id"> { }

export class Teacher extends Model<TeacherAttributes, TeacherCreationAttributes>
    implements TeacherAttributes {
    public id!: number;
    public email!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Teacher.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
    },
    {
        sequelize,
        tableName: "teachers",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["email"],
            },
        ],
    }
);

export default Teacher;
