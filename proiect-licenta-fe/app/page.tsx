import Modeller from "@/components/modeller/Modeller";
import FormCreationModal from "@/components/form-creation/FormCreationModal";
import TestRabbitMq from "@/components/modeller/TestRabbitMq";
import FormRecordModal from "@/components/form-record-creation/FormRecordModal";
import LoginModal from "@/components/login/LoginModal";

export default function Home() {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      {/* <Modeller></Modeller> */}
      <FormCreationModal></FormCreationModal>
      {/* <FormRecordModal
        formRecordData={null}
        isForFormRecordCreation={true}
        isReadOnly={false}
        isForApproval={false}
      ></FormRecordModal> */}
      {/* <TestRabbitMq></TestRabbitMq> */}
      {/* <LoginModal></LoginModal> */}
    </div>
  );
}
