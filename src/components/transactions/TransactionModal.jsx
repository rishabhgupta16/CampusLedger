import React from 'react';
import Modal from '../common/Modal';
import TransactionForm from './TransactionForm';

export default function TransactionModal({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : 'Record New Transaction'}
      subtitle={
        isEditing
          ? 'Modify existing expense or income entry details'
          : 'Keep everyday college expenses and pocket money accurate'
      }
      maxWidth="max-w-md"
    >
      <TransactionForm
        initialData={initialData}
        onSubmitSuccess={(msg) => {
          if (onSuccess) onSuccess(msg);
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
