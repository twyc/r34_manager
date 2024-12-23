import React from "react";

interface InfoModalProps {
  title: string;
  message: string;
  onOk: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ title, message, onOk }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <p className="text-gray-700 mb-4">{message}</p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onOk}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Ok
        </button>
      </div>
    </div>
  </div>
);

export default InfoModal;
