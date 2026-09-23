import React from 'react';
import TransactionItem from './TransactionItem';
import EmptyState from '../common/EmptyState';
import { ReceiptText } from 'lucide-react';

export default function TransactionList({
  transactions = [],
  onEdit,
  onDelete,
  onAddNew,
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No transactions found"
        description="No expenses or income entries matched your current search and filter criteria."
        actionText={onAddNew ? 'Record Transaction' : undefined}
        onAction={onAddNew}
      />
    );
  }

  // Sort descending by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-2.5">
      {sortedTransactions.map((tx) => (
        <TransactionItem
          key={tx.id}
          transaction={tx}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
