import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

type Creator = {
  id: number;
  name: string;
  homepage: string;
};

interface CreatorFormProps {
  reloadCreators: () => void;
  editCreator: Creator | null;
  clearEdit: () => void;
}

const CreatorForm = ({
  reloadCreators,
  editCreator,
  clearEdit,
}: CreatorFormProps) => {
  const [name, setName] = useState("");
  const [homepage, setHomepage] = useState("");

  useEffect(() => {
    if (editCreator) {
      setName(editCreator.name);
      setHomepage(editCreator.homepage);
    } else {
      setName("");
      setHomepage("");
    }
  }, [editCreator]);

  // In CreatorsPage.tsx

  // Also add logging to your form submission
  // In CreatorForm.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Submitting form with:", { name, homepage }); // Add this
      if (editCreator) {
        const result = await invoke("update_creator", {
          id: editCreator.id,
          name,
          homepage,
        });
        console.log("Update result:", result); // Add this
      } else {
        const result = await invoke("create_creator", { name, homepage });
        console.log("Create result:", result); // Add this
      }
      reloadCreators();
      clearEdit();
      setName("");
      setHomepage("");
    } catch (error) {
      console.error("Failed to submit creator", error);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-4 bg-white shadow-md rounded"
    >
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Homepage
        </label>
        <input
          type="text"
          value={homepage}
          onChange={(e) => setHomepage(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit
      </button>
    </form>
  );
};

export default CreatorForm;
