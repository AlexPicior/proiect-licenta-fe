import Modeller from "@/components/modeller/Modeller";
import FormCreationModal from "@/components/form-creation/FormCreationModal";
import TestRabbitMq from "@/components/modeller/TestRabbitMq";
import FormRecordModal from "@/components/form-record-creation/FormRecordModal";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      {/* <Modeller></Modeller> */}
      {/* <FormCreationModal></FormCreationModal> */}
      <FormRecordModal></FormRecordModal>
      {/* <TestRabbitMq></TestRabbitMq> */}
    </div>
  );
}
