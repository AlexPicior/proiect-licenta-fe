import Modeller from "@/components/modeller/Modeller";
import FormCreationModal from "@/components/form-creation/FormCreationModal";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Modeller></Modeller>
      {/* <FormCreationModal></FormCreationModal> */}
    </div>
  );
}
