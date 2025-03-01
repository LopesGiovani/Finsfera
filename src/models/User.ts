import { Model, DataTypes, Optional } from "sequelize";
import bcrypt from "bcrypt";
import sequelize from "@/lib/db";

// Interface para definir os atributos do Usuário
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "system_admin" | "owner" | "manager" | "technician" | "assistant";
  organizationId: number | null; // Relação com a Organização (null para system_admin)
  canSeeAllOS: boolean; // Permissão para ver todas as OS dentro da organização
  active: boolean; // Status do usuário
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para definir quais atributos são opcionais na criação
interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "createdAt" | "updatedAt" | "canSeeAllOS" | "active"
  > {}

// Classe do modelo de Usuário
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!:
    | "system_admin"
    | "owner"
    | "manager"
    | "technician"
    | "assistant";
  public organizationId!: number | null;
  public canSeeAllOS!: boolean;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Método para verificar se a senha está correta
  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

// Inicializa o modelo no Sequelize
User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        "system_admin",
        "owner",
        "manager",
        "technician",
        "assistant"
      ),
      allowNull: false,
      defaultValue: "assistant",
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Pode ser null para system_admin
      references: {
        model: "organizations",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    canSeeAllOS: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "users",
    hooks: {
      // Hook para criptografar a senha antes de salvar no banco
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hook para criptografar a senha antes de atualizar no banco
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
