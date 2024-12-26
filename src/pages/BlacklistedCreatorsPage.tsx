import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import DOMPurify from "dompurify";
import InfoModal from "../components/InfoModal";

type Creator = {
  id: number;
  name: string;
  homepage: string;
  rate: number;
};

type BlacklistedCreator = {
  id: number;
  creator_id: number;
  reason: string;
  date: string;
  name: string;
};

const BlacklistedCreatorsPage = () => {
  const [blacklistedCreators, setBlacklistedCreators] = useState<
    BlacklistedCreator[]
  >([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [creatorId, setCreatorId] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");

  const loadCreators = async () => {
    const creatorList: Creator[] = await invoke("read_creators");
    setCreators(creatorList);
  };

  const loadBlacklistedCreators = async () => {
    try {
      const result = await invoke<BlacklistedCreator[]>(
        "read_blacklisted_creators"
      );

      setBlacklistedCreators(result);
    } catch (error) {
      console.error("Error loading blacklisted creators:", error);
      setInfoModal({
        visible: true,
        message: `Failed to load blacklisted creators: ${error}`,
      });
    }
  };

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invoke("create_blacklisted_creator", {
        creatorId: parseInt(creatorId),
        reason,
        date,
      });
      loadBlacklistedCreators();
    } catch (error) {
      console.error("Error creating blacklisted creator:", error);
    }
  };

  const handleDelete = async (id: number) => {
    await invoke("delete_blacklisted_creator", { id });
    loadBlacklistedCreators();
  };

  useEffect(() => {
    loadBlacklistedCreators();
    loadCreators();
  }, []);

  const onReasonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = DOMPurify.sanitize(e.target.value);
    setReason(sanitizedInput);
  };

  return (
    <div className="p-6">
      {infoModal.visible && (
        <InfoModal
          title="Information"
          message={infoModal.message}
          onOk={() => setInfoModal({ visible: false, message: "" })}
        />
      )}

      <h1 className="text-2xl font-bold mb-4">Blacklisted Creators</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-4 items-center">
          <select
            value={creatorId}
            onChange={(e) => setCreatorId(e.target.value)}
            className="px-4 py-2 border rounded-md"
            required
          >
            <option value="">Select a Creator</option>
            {creators.map((creator) => (
              <option key={creator.id} value={creator.id}>
                {creator.name} ({creator.id})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Reason"
            value={reason}
            onChange={(e) => onReasonInputChange(e)}
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
            Blacklist
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
                Name
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {creator.creator_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{creator.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {creator.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{creator.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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
