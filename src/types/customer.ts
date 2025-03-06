// Enum para os planos de consumo
export enum CustomerPlan {
  PRATA = "prata",
  OURO = "ouro",
  VIP = "vip",
}

// Interface para os dados do cliente
export interface CustomerData {
  id: number;
  organizationId: number;
  name: string;
  document: string;
  email: string;
  phone: string;
  mobile?: string;
  company?: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
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

// Tipo para o formulário de criação/edição de cliente
export interface CustomerFormData {
  name: string;
  document: string;
  email: string;
  phone: string;
  mobile: string;
  company: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  notes: string;
  plan: CustomerPlan;
}
