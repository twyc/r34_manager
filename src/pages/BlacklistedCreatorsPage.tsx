import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

type BlacklistedCreator = {
  id: number;
  creator_id: number;
  reason: string;
  date: string;
};

const BlacklistedCreatorsPage = () => {
  const [blacklistedCreators, setBlacklistedCreators] = useState<
    BlacklistedCreator[]
  >([]);
  const [editCreator, setEditCreator] = useState<BlacklistedCreator | null>(
    null
  );
  const [creatorId, setCreatorId] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const loadBlacklistedCreators = async () => {
    const creators: BlacklistedCreator[] = await invoke(
      "read_blacklisted_creators"
    );
    setBlacklistedCreators(creators);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCreatorId = parseInt(creatorId);
    if (parsedCreatorId <= 0) {
      alert("Creator ID must be a positive number.");
      return;
    }
    if (editCreator) {
      await invoke("update_blacklisted_creator", {
        id: editCreator.id,
        creator_id: parsedCreatorId,
        reason,
        date,
      });
    } else {
      await invoke("create_blacklisted_creator", {
        creator_id: parsedCreatorId,
        reason,
        date,
      });
    }
    setCreatorId("");
    setReason("");
    setDate("");
    setEditCreator(null);
    loadBlacklistedCreators();
  };

  const handleEdit = (creator: BlacklistedCreator) => {
    setEditCreator(creator);
    setCreatorId(creator.creator_id.toString());
    setReason(creator.reason);
    setDate(creator.date);
  };

  const handleDelete = async (id: number) => {
    await invoke("delete_blacklisted_creator", { id });
    loadBlacklistedCreators();
  };

  useEffect(() => {
    loadBlacklistedCreators();
  }, []);

  return (
    <div className="p-6">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4 hover:bg-blue-600"
        onClick={() => navigate("/")}
      >
        Home
      </button>

      <h1 className="text-2xl font-bold mb-4">Blacklisted Creators</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-4 items-center">
          <input
            type="number"
            placeholder="Creator ID"
            value={creatorId}
            onChange={(e) => setCreatorId(e.target.value)}
            className="px-4 py-2 border rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="px-4 py-2 border rounded-md"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border rounded-md"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            {editCreator ? "Update" : "Add"} Blacklisted Creator
          </button>
        </div>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creator ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blacklistedCreators.map((creator) => (
              <tr key={creator.id}>
                <td className="px-6 py-4 whitespace-nowrap">{creator.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {creator.creator_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {creator.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{creator.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(creator)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded-md mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(creator.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlacklistedCreatorsPage;
