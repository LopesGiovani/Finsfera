import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";

// Interface para definir os atributos da Organização
interface OrganizationAttributes {
  id: number;
  name: string;
  document: string; // CNPJ ou similar
  ownerId: number; // ID do usuário dono
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para definir quais atributos são opcionais na criação
interface OrganizationCreationAttributes
  extends Optional<OrganizationAttributes, "id" | "createdAt" | "updatedAt"> {}

// Classe do modelo de Organização
class Organization
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes
{
  public id!: number;
  public name!: string;
  public document!: string;
  public ownerId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicializa o modelo no Sequelize
Organization.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "organizations",
  }
);

export default Organization;
