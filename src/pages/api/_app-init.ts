// Este arquivo é responsável por inicializar as associações entre modelos
// Deve ser importado apenas uma vez e em um local que não cause importações circulares

// Primeiro importamos todos os modelos
import User from "@/models/User";
import Organization from "@/models/Organization";
import ServiceOrder from "@/models/ServiceOrder";
import ServiceOrderAttachment from "@/models/ServiceOrderAttachment";
import Customer from "@/models/Customer";

// Defina as associações
// User e Organization
User.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
Organization.hasMany(User, { foreignKey: "organizationId", as: "members" });
Organization.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// ServiceOrder e Organization
ServiceOrder.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
Organization.hasMany(ServiceOrder, {
  foreignKey: "organizationId",
  as: "serviceOrders",
});

// ServiceOrder e User
ServiceOrder.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
User.hasMany(ServiceOrder, {
  foreignKey: "assignedToId",
  as: "assignedServiceOrders",
});

ServiceOrder.belongsTo(User, {
  foreignKey: "assignedByUserId",
  as: "assignedBy",
});
User.hasMany(ServiceOrder, {
  foreignKey: "assignedByUserId",
  as: "createdServiceOrders",
});

// ServiceOrderAttachment e ServiceOrder
ServiceOrderAttachment.belongsTo(ServiceOrder, {
  foreignKey: "serviceOrderId",
  as: "serviceOrder",
});
ServiceOrder.hasMany(ServiceOrderAttachment, {
  foreignKey: "serviceOrderId",
  as: "attachments",
});

// ServiceOrderAttachment e User
ServiceOrderAttachment.belongsTo(User, {
  foreignKey: "uploadedById",
  as: "uploadedBy",
});
User.hasMany(ServiceOrderAttachment, {
  foreignKey: "uploadedById",
  as: "uploadedAttachments",
});

// Customer e Organization
Customer.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
Organization.hasMany(Customer, {
  foreignKey: "organizationId",
  as: "customers",
});

// ServiceOrder e Customer
ServiceOrder.belongsTo(Customer, {
  foreignKey: "customerId",
  as: "customer",
});
Customer.hasMany(ServiceOrder, {
  foreignKey: "customerId",
  as: "serviceOrders",
});

// Exporta todos os modelos inicializados para uso
export { User, Organization, ServiceOrder, ServiceOrderAttachment, Customer };
