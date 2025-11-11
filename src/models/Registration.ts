import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/index.js";

export interface RegistrationAttributes {
    id: number;
    teacherId: number;
    studentId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RegistrationCreationAttributes extends Optional<RegistrationAttributes, "id"> { }

export class Registration extends Model<RegistrationAttributes, RegistrationCreationAttributes>
    implements RegistrationAttributes {
    public id!: number;
    public teacherId!: number;
    public studentId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Registration.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        teacherId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "teacher_id",
            references: {
                model: "teachers",
                key: "id",
            },
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: "student_id",
            references: {
                model: "students",
                key: "id",
            },
        },
    },
    {
        sequelize,
        tableName: "registrations",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["teacher_id", "student_id"],
            },
            {
                fields: ["teacher_id"],
            },
            {
                fields: ["student_id"],
            },
        ],
    }
);

export default Registration;
