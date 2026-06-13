/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Customer {
  id: string;
  name: string;
  document: string; // CPF or CNPJ
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export type MaterialType = 'eletrodos' | 'arames_mig' | 'gases' | 'chapas_perfis' | 'abrasivos' | 'outros';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  quantity: number;
  unit: string; // kg, kg (bobina), litro, m³, chapa, unidade, etc.
  unitPrice: number;
  minQuantity: number; // For low-stock alerts
  supplier: string;
}

export interface BudgetItem {
  id: string;
  materialId?: string; // Optional reference to inventory
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Budget {
  id: string;
  customerId: string;
  title: string;
  description: string;
  items: BudgetItem[];
  laborCost: number; // Mão de obra
  marginPercent: number; // Lucro %
  discount: number; // Desconto em valor
  total: number;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  validUntil: string;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  budgetId?: string; // If created from a budget
  customerId: string;
  title: string;
  description: string;
  status: 'fila' | 'em_progresso' | 'concluido' | 'entregue';
  priority: 'baixa' | 'media' | 'alta';
  startDate: string;
  endDate?: string;
  totalValue: number;
  paymentStatus: 'pendente' | 'pago';
  notes?: string;
}
