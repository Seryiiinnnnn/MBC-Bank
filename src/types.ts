/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AccountDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  savingsAccountNumber: string;
  savingsBalance: number;
}

export interface RecipientBank {
  id: string;
  name: string;
  code: string;
}

export interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  date: string;
  recipientBank?: string;
  recipientAccount?: string;
  referenceId: string;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
}

export interface TransferFormState {
  recipientName: string;
  recipientAccount: string;
  recipientBankId: string;
  amount: string;
  reference: string;
  transferType: 'Instant' | 'DuitNow' | 'Giro';
}
