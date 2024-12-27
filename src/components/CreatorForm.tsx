import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import DOMPurify from "dompurify";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "./ConfirmModal"; // Import your custom modal

type Creator = {
  id: number;
  name: string;
  homepage: string;
  rate: number;
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
  const [rate, setRate] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  const isSafe = false;

  useEffect(() => {
    if (editCreator) {
      setName(editCreator.name);
      setHomepage(editCreator.homepage);
      setRate(editCreator.rate);
    } else {
      setName("");
      setHomepage("");
      setRate(0);
    }
  }, [editCreator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editCreator) {
        await invoke("update_creator", {
          id: editCreator.id,
          name,
          homepage,
          rate,
          safe: isSafe,
        });
        toast.success("Creator updated successfully!");
      } else {
        await invoke("create_creator", { name, homepage, rate, safe: isSafe });
        toast.success("Creator added successfully!");
      }
      reloadCreators();
      clearEdit();
      setName("");
      setHomepage("");
      setRate(0);
    } catch (error) {
      toast.error(`Failed to submit creator: ${error}`);
    }
  };

  const handleCancelEdit = () => {
    setModalVisible(true);
  };

  const confirmCancelEdit = () => {
    setModalVisible(false);
    clearEdit();
  };

  const onNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = DOMPurify.sanitize(e.target.value);
    setName(sanitizedInput);
  };

  const onHomepageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = DOMPurify.sanitize(e.target.value);
    setHomepage(sanitizedInput);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-4 bg-white shadow-md rounded"
    >
      <ToastContainer />
      {isModalVisible && (
        <ConfirmModal
          title="Cancel Edit"
          message="Are you sure you want to cancel editing this creator?"
          onConfirm={confirmCancelEdit}
          onCancel={() => setModalVisible(false)}
        />
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameInputChange(e)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Homepage
        </label>
        <input
          type="text"
          value={homepage}
          onChange={(e) => onHomepageInputChange(e)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <label className="block text-gray-700 text-sm font-bold mb-2">Rate</label>
      <input
        type="number"
        value={rate}
        onChange={(e) =>
          setRate(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))
        }
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
        required
      />
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {editCreator ? "Update" : "Create"}
        </button>
        {editCreator && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default CreatorForm;
