import React, { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import CreatorForm from "../components/CreatorForm";
import ConfirmModal from "../components/ConfirmModal";
import "react-toastify/dist/ReactToastify.css";
import InfoModal from "../components/InfoModal";

type Creator = {
  id: number;
  name: string;
  homepage: string;
  rate: number;
};

const CreatorsPage: React.FC = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [modalState, setModalState] = useState<{
    visible: boolean;
    creatorId: number | null;
  }>({ visible: false, creatorId: null });

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: "",
  });

  const loadCreators = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await invoke<Creator[]>("read_creators");

      setCreators(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      setInfoModal({
        visible: true,
        message: `Failed to load creators: ${errorMessage}`,
      });

      console.error("Error loading creators:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  const handleDeleteRequest = useCallback((creatorId: number) => {
    setModalState({ visible: true, creatorId });
  }, []);

  const deleteCreator = useCallback(async () => {
    if (!modalState.creatorId) return;

    setIsLoading(true);
    try {
      await invoke("delete_creator", { id: modalState.creatorId });

      setInfoModal({ visible: true, message: "Creator deleted successfully" });

      await loadCreators();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      setInfoModal({
        visible: true,
        message: `Failed to delete creator: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
      setModalState({ visible: false, creatorId: null });
    }
  }, [modalState.creatorId, loadCreators]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setInfoModal({ visible: true, message: "Copied to clipboard" });
    } catch (error) {
      setInfoModal({ visible: true, message: "Failed to copy to clipboard" });
    }
  }, []);

  return (
    <div className="p-6">
      {modalState.visible && (
        <ConfirmModal
          title="Delete Creator"
          message="Are you sure you want to delete this creator? This action cannot be undone."
          onConfirm={deleteCreator}
          onCancel={() => setModalState({ visible: false, creatorId: null })}
        />
      )}

      {infoModal.visible && (
        <InfoModal
          title="Information"
          message={infoModal.message}
          onOk={() => setInfoModal({ visible: false, message: "" })}
        />
      )}

      <h1 className="text-2xl font-bold mb-4">Creators Management</h1>

      <CreatorForm
        reloadCreators={loadCreators}
        editCreator={editCreator}
        clearEdit={() => setEditCreator(null)}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Creator List</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : creators.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No creators found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Homepage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {creators.map((creator) => (
                  <tr key={creator.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {creator.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {creator.name}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer underline hover:text-blue-800"
                      onClick={() => copyToClipboard(creator.homepage)}
                    >
                      {creator.homepage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {creator.rate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setEditCreator(creator)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(creator.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorsPage;
