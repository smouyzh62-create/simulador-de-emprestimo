/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LoanSimulationConfig {
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  telegramLink: string;
}

export interface UserFormData {
  hasCNPJ: boolean;
  cnpj: string;
  companyName: string;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
  monthlyIncome: string; // Will store raw and formatted values (Faturamento/Renda)
  desiredAmount: number;
  installments: number;
  loanReason: string;
}

export interface SimulationResult {
  approvedAmount: number;
  installments: number;
  installmentValue: number;
  interestRate: number;
  firstDueDate: string;
  score: number;
}
