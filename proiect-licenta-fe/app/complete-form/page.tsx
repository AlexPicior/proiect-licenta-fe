import React from 'react';
import FormRecordModal from '@/components/form-record-creation/FormRecordModal';

export default function CompleteFormPage() {
    return (
      <div className="flex items-center justify-center">
        <FormRecordModal
          formRecordData={null}
          isForFormRecordCreation={true}
          isReadOnly={false}
          isForApproval={false}
        />
      </div>
    );
}