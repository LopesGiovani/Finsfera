import { Model, DataTypes, Optional, JSON } from "sequelize";
import sequelize from "@/lib/db";

// Interface para definir transferência de OS
interface TransferRecord {
  date: Date;
  fromUserId: number;
  toUserId: number;
  reason: string;
}

// Interface para definir os atributos da Ordem de Serviço
interface ServiceOrderAttributes {
  id: number;
  organizationId: number;
  title: string;
  description: string;
  status: "pendente" | "em_andamento" | "concluida" | "reprovada";
  priority: "baixa" | "media" | "alta" | "urgente";
  assignedToId: number; // ID do usuário designado
  assignedByUserId: number; // ID de quem criou a OS
  scheduledDate: Date; // Data programada
  closingLink?: string;
  rejectionReason?: string;
  leaveOpenReason?: string;
  transferHistory?: TransferRecord[];
  createdAt?: Date;
  updatedAt?: Date;
  closedAt?: Date;
}

// Interface para definir quais atributos são opcionais na criação
interface ServiceOrderCreationAttributes
  extends Optional<
    ServiceOrderAttributes,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "closedAt"
    | "closingLink"
    | "rejectionReason"
    | "leaveOpenReason"
    | "transferHistory"
  > {}

// Classe do modelo de Ordem de Serviço
class ServiceOrder
  extends Model<ServiceOrderAttributes, ServiceOrderCreationAttributes>
  implements ServiceOrderAttributes
{
  public id!: number;
  public organizationId!: number;
  public title!: string;
  public description!: string;
  public status!: "pendente" | "em_andamento" | "concluida" | "reprovada";
  public priority!: "baixa" | "media" | "alta" | "urgente";
  public assignedToId!: number;
  public assignedByUserId!: number;
  public scheduledDate!: Date;
  public closingLink?: string;
  public rejectionReason?: string;
  public leaveOpenReason?: string;
  public transferHistory?: TransferRecord[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public closedAt?: Date;
}

// Inicializa o modelo no Sequelize
ServiceOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pendente",
        "em_andamento",
        "concluida",
        "reprovada"
      ),
      defaultValue: "pendente",
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("baixa", "media", "alta", "urgente"),
      defaultValue: "media",
      allowNull: false,
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    assignedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    closingLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    leaveOpenReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transferHistory: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "service_orders",
    hooks: {
      // Hook para atualizar a data de fechamento quando o status muda para 'concluida'
      beforeUpdate: async (serviceOrder: ServiceOrder) => {
        if (
          serviceOrder.changed("status") &&
          serviceOrder.status === "concluida" &&
          !serviceOrder.closedAt
        ) {
          serviceOrder.closedAt = new Date();
        }
      },
    },
  }
);

export default ServiceOrder;
