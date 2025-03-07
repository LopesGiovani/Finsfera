import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/lib/db";
import User from "./User";

// Interface para definir os atributos do Evento da Timeline
interface TimelineEventAttributes {
  id: number;
  serviceOrderId: number; // Referência à OS
  userId: number; // Usuário que realizou a ação
  eventType: string; // Tipo do evento: 'criacao', 'status', 'comentario', 'atribuicao', 'reabertura', etc.
  description: string; // Descrição textual do evento
  metadata?: any; // Metadados adicionais em formato JSON (status anterior/novo, motivos, etc.)
  createdAt?: Date;
  updatedAt?: Date;
  user?: any; // Adicionado para suportar o relacionamento com User
}

// Interface para definir quais atributos são opcionais na criação
interface TimelineEventCreationAttributes
  extends Optional<
    TimelineEventAttributes,
    "id" | "createdAt" | "updatedAt" | "metadata"
  > {}

// Classe do modelo de Evento da Timeline
class TimelineEvent
  extends Model<TimelineEventAttributes, TimelineEventCreationAttributes>
  implements TimelineEventAttributes
{
  public id!: number;
  public serviceOrderId!: number;
  public userId!: number;
  public eventType!: string;
  public description!: string;
  public metadata!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicializa o modelo no Sequelize
TimelineEvent.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    eventType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
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
  },
  {
    sequelize,
    tableName: "timeline_events",
    indexes: [
      {
        fields: ["serviceOrderId"],
        name: "idx_timeline_events_service_order_id",
      },
      {
        fields: ["userId"],
        name: "idx_timeline_events_user_id",
      },
      {
        fields: ["eventType"],
        name: "idx_timeline_events_event_type",
      },
    ],
  }
);

// Definir associação com o modelo User
TimelineEvent.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default TimelineEvent;
