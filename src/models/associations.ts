import User from "./User";
import Organization from "./Organization";
import ServiceOrder from "./ServiceOrder";
import ServiceOrderAttachment from "./ServiceOrderAttachment";
import Customer from "./Customer";

// Associações entre User e Organization
User.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
Organization.hasMany(User, { foreignKey: "organizationId", as: "members" });

// Associação de Owner com Organization
Organization.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// Associações entre ServiceOrder e Organization
ServiceOrder.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
Organization.hasMany(ServiceOrder, {
  foreignKey: "organizationId",
  as: "serviceOrders",
});

// Associações entre ServiceOrder e User (assignedTo)
ServiceOrder.belongsTo(User, { foreignKey: "assignedToId", as: "assignedTo" });
User.hasMany(ServiceOrder, {
  foreignKey: "assignedToId",
  as: "assignedServiceOrders",
});

// Associações entre ServiceOrder e User (assignedBy)
ServiceOrder.belongsTo(User, {
  foreignKey: "assignedByUserId",
  as: "assignedBy",
});
User.hasMany(ServiceOrder, {
  foreignKey: "assignedByUserId",
  as: "createdServiceOrders",
});

// Associações entre ServiceOrderAttachment e ServiceOrder
ServiceOrderAttachment.belongsTo(ServiceOrder, {
  foreignKey: "serviceOrderId",
  as: "serviceOrder",
});
ServiceOrder.hasMany(ServiceOrderAttachment, {
  foreignKey: "serviceOrderId",
  as: "attachments",
});

// Associações entre ServiceOrderAttachment e User
ServiceOrderAttachment.belongsTo(User, {
  foreignKey: "uploadedById",
  as: "uploadedBy",
});
User.hasMany(ServiceOrderAttachment, {
  foreignKey: "uploadedById",
  as: "uploadedAttachments",
});

// Associações entre Customer e Organization
Customer.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "organization",
});
Organization.hasMany(Customer, {
  foreignKey: "organizationId",
  as: "customers",
});

export { User, Organization, ServiceOrder, ServiceOrderAttachment, Customer };
