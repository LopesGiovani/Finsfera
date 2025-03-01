import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import { CustomerPlan } from "@/types/customer";

// Interface para definir os atributos do Cliente
interface CustomerAttributes {
  id: number;
  organizationId: number; // Relação com a Organização
  name: string;
  document: string; // CPF ou CNPJ
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson?: string;
  notes?: string;
  plan: CustomerPlan;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para definir quais atributos são opcionais na criação
interface CustomerCreationAttributes
  extends Optional<
    CustomerAttributes,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "contactPerson"
    | "notes"
    | "active"
    | "plan"
  > {}

// Classe do modelo de Cliente
class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  public id!: number;
  public organizationId!: number;
  public name!: string;
  public document!: string;
  public email!: string;
  public phone!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public contactPerson?: string;
  public notes?: string;
  public plan!: CustomerPlan;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicializa o modelo no Sequelize
Customer.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plan: {
      type: DataTypes.ENUM("prata", "ouro", "vip"),
      allowNull: false,
      defaultValue: "prata",
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "customers",
  }
);

export default Customer;
