import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import CreatorForm from "../components/CreatorForm";
import { useNavigate } from "react-router-dom";

type Creator = {
  id: number;
  name: string;
  homepage: string;
};

const CreatorsPage = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const navigate = useNavigate();
  const [editCreator, setEditCreator] = useState<Creator | null>(null);

  const loadCreators = async () => {
    try {
      const result = await invoke<Creator[]>("read_creators");
      setCreators(result);
    } catch (error) {
      console.error("Error loading creators:", error);
    }
  };

  const deleteCreator = async (creatorId: number) => {
    if (window.confirm("Are you sure you want to delete this creator?")) {
      try {
        alert(`Attempting to delete creator ${creatorId}`);
        const result = await invoke("delete_creator", { id: creatorId });
        alert(`Delete result: ${result}`);
        await loadCreators();
      } catch (error) {
        alert(`Error deleting: ${error}`);
        console.error("Error deleting creator:", error);
      }
    }
  };

  useEffect(() => {
    loadCreators();
  }, []);

  return (
    <div className="p-6">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4 hover:bg-blue-600"
        onClick={() => navigate("/")}
      >
        Home
      </button>

      <h1 className="text-2xl font-bold mb-4">Creators CRUD</h1>

      <CreatorForm
        reloadCreators={loadCreators}
        editCreator={editCreator}
        clearEdit={() => setEditCreator(null)}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Creator List</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {creators.map((creator) => (
                <tr key={creator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black-900">
                    {creator.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {creator.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {creator.homepage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditCreator(creator)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCreator(creator.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreatorsPage;
