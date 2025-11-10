import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/index.js";

// Định nghĩa interface cho attributes
export interface StudentAttributes {
    id: number;
    email: string;
    isSuspended: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Định nghĩa interface cho creation
export interface StudentCreationAttributes extends Optional<StudentAttributes, "id" | "isSuspended"> { }

// Extend Model class với types
export class Student extends Model<StudentAttributes, StudentCreationAttributes>
    implements StudentAttributes {
    public id!: number;
    public email!: string;
    public isSuspended!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Student.init(
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
        isSuspended: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: "is_suspended",
        },
    },
    {
        sequelize,
        tableName: "students",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["email"],
            },
            {
                fields: ["is_suspended"],
            },
        ],
    }
);

export default Student;
