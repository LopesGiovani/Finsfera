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
  status: "pendente" | "em_andamento" | "concluida" | "reprovada" | "encerrada";
  priority: "baixa" | "alta" | "urgente";
  assignedToId: number; // ID do usuário designado
  assignedByUserId: number; // ID de quem criou a OS
  scheduledDate: Date; // Data programada
  customerId?: number; // ID do cliente relacionado à OS
  closingLink?: string;
  closingReason?: string; // Motivo do fechamento
  reopenReason?: string; // Motivo da reabertura
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
    | "closingReason"
    | "reopenReason"
    | "rejectionReason"
    | "leaveOpenReason"
    | "transferHistory"
    | "customerId"
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
  public status!:
    | "pendente"
    | "em_andamento"
    | "concluida"
    | "reprovada"
    | "encerrada";
  public priority!: "baixa" | "alta" | "urgente";
  public assignedToId!: number;
  public assignedByUserId!: number;
  public scheduledDate!: Date;
  public customerId?: number;
  public closingLink?: string;
  public closingReason?: string;
  public reopenReason?: string;
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
        "reprovada",
        "encerrada"
      ),
      defaultValue: "pendente",
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("baixa", "alta", "urgente"),
      defaultValue: "baixa",
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
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "customers",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    closingLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    closingReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reopenReason: {
      type: DataTypes.TEXT,
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
