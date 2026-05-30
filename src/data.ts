/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecipientBank, Transaction } from './types';

export const MALAYSIAN_BANKS: RecipientBank[] = [
  { id: 'mbb', name: 'Maybank', code: 'MBB' },
  { id: 'cimb', name: 'CIMB Bank', code: 'CIMB' },
  { id: 'pbb', name: 'Public Bank', code: 'PBB' },
  { id: 'rhb', name: 'RHB Bank', code: 'RHB' },
  { id: 'hlb', name: 'Hong Leong Bank', code: 'HLB' },
  { id: 'amb', name: 'AmBank', code: 'AMB' },
  { id: 'uob', name: 'UOB Bank', code: 'UOB' },
  { id: 'hsbc', name: 'HSBC Bank', code: 'HSBC' },
  { id: 'scb', name: 'Standard Chartered', code: 'SCB' },
  { id: 'bim', name: 'Bank Islam', code: 'BIM' },
  { id: 'afb', name: 'Affin Bank', code: 'AFFIN' },
  { id: 'all', name: 'Alliance Bank', code: 'ALLIANCE' },
  { id: 'ocbc', name: 'OCBC Bank', code: 'OCBC' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-001',
    title: 'Salary Credit',
    description: 'MBC CORP SDN BHD',
    amount: 8500.00,
    type: 'credit',
    date: '2026-05-28 10:30 AM',
    referenceId: 'MBB2026052800129',
    status: 'SUCCESSFUL',
  },
  {
    id: 'TXN-002',
    title: 'Transfer to Ahmad Tan',
    description: 'Dinner Split',
    amount: 120.00,
    type: 'debit',
    date: '2026-05-28 08:45 PM',
    recipientBank: 'Maybank',
    recipientAccount: '164283948529',
    referenceId: 'MBB2026052809424',
    status: 'SUCCESSFUL',
  },
  {
    id: 'TXN-003',
    title: 'DuitNow to GrabPay',
    description: 'E-Wallet Reload',
    amount: 15.00,
    type: 'debit',
    date: '2026-05-29 11:15 AM',
    recipientBank: 'CIMB Bank',
    recipientAccount: '800429481234',
    referenceId: 'MBB2026052901928',
    status: 'SUCCESSFUL',
  },
  {
    id: 'TXN-004',
    title: 'Transfer to Lee Siew Min',
    description: 'Office Gift',
    amount: 50.00,
    type: 'debit',
    date: '2026-05-29 03:22 PM',
    recipientBank: 'Public Bank',
    recipientAccount: '3192834571',
    referenceId: 'MBB2026052904831',
    status: 'SUCCESSFUL',
  },
  {
    id: 'TXN-005',
    title: 'Grocery Purchase',
    description: 'AEON BIG SUBANG',
    amount: 245.50,
    type: 'debit',
    date: '2026-05-30 09:10 AM',
    referenceId: 'MBB2026053049182',
    status: 'SUCCESSFUL',
  },
];
