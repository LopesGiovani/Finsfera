import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";

// Interface para definir os atributos do Anexo da OS
interface ServiceOrderAttachmentAttributes {
  id: number;
  serviceOrderId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedById: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para definir quais atributos são opcionais na criação
interface ServiceOrderAttachmentCreationAttributes
  extends Optional<
    ServiceOrderAttachmentAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

// Classe do modelo de Anexo da OS
class ServiceOrderAttachment
  extends Model<
    ServiceOrderAttachmentAttributes,
    ServiceOrderAttachmentCreationAttributes
  >
  implements ServiceOrderAttachmentAttributes
{
  public id!: number;
  public serviceOrderId!: number;
  public filename!: string;
  public originalName!: string;
  public mimeType!: string;
  public size!: number;
  public path!: string;
  public uploadedById!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicializa o modelo no Sequelize
ServiceOrderAttachment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    serviceOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "service_orders",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploadedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "service_order_attachments",
  }
);

export default ServiceOrderAttachment;
