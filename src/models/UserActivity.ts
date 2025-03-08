import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";

// Interface para definir os atributos da Atividade do Usuário
interface UserActivityAttributes {
  id: number;
  userId: number;
  action: string;
  entityType?: string; // tipo de entidade relacionada (OS, Cliente, etc.)
  entityId?: number; // ID da entidade relacionada
  details?: object; // detalhes adicionais em formato JSON
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

// Interface para definir quais atributos são opcionais na criação
interface UserActivityCreationAttributes
  extends Optional<
    UserActivityAttributes,
    | "id"
    | "entityType"
    | "entityId"
    | "details"
    | "ipAddress"
    | "userAgent"
    | "createdAt"
  > {}

// Classe do modelo de Atividade do Usuário
class UserActivity
  extends Model<UserActivityAttributes, UserActivityCreationAttributes>
  implements UserActivityAttributes
{
  public id!: number;
  public userId!: number;
  public action!: string;
  public entityType?: string;
  public entityId?: number;
  public details?: object;
  public ipAddress?: string;
  public userAgent?: string;
  public readonly createdAt!: Date;
}

// Inicializa o modelo no Sequelize
UserActivity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "user_activities",
    timestamps: true,
    updatedAt: false, // Não precisamos de updatedAt para atividades
  }
);

export default UserActivity;
