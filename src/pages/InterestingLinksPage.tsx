import React, { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import DOMPurify from "dompurify";
import InfoModal from "../components/InfoModal";

type InterestingLink = {
  id: number;
  url: string;
  source: string | null;
  downloaded: boolean;
  date: string | null;
};

const InterestingLinksPage = () => {
  const [interestingLinks, setInterestingLinks] = useState<InterestingLink[]>(
    []
  );
  const [filteredLinks, setFilteredLinks] = useState<InterestingLink[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editLink, setEditLink] = useState<InterestingLink | null>(null);
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [showDownloaded, setShowDownloaded] = useState(false);
  const [date, setDate] = useState(() => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
      today.getMonth() + 1
    ).padStart(2, "0")}/${today.getFullYear()}`;
    return formattedDate;
  });

  const isSafe = false;
  const urlInputRef = useRef<HTMLInputElement>(null);

  const loadInterestingLinks = async () => {
    const links: InterestingLink[] = await invoke("read_interesting_links");
    setInterestingLinks(links);
    setFilteredLinks(links);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const filtered = interestingLinks
      .filter((link) => (showDownloaded ? true : !link.downloaded))
      .filter((link) =>
        [link.url, link.source, link.date]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(query.toLowerCase()))
      );

    setFilteredLinks(filtered);
  };

  const handleToggleDownloaded = () => {
    setShowDownloaded((prev) => !prev);
  };

  useEffect(() => {
    setFilteredLinks(
      interestingLinks.filter((link) =>
        showDownloaded ? true : !link.downloaded
      )
    );
  }, [showDownloaded, interestingLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      alert("URL is required.");
      return;
    }
    if (editLink) {
      await invoke("update_interesting_link", {
        id: editLink.id,
        url,
        source,
        downloaded,
        date,
        safe: isSafe,
      });
    } else {
      await invoke("create_interesting_link", {
        url,
        source,
        downloaded,
        date,
        safe: isSafe,
      });
    }
    setUrl("");
    setSource("");
    setDownloaded(false);
    setEditLink(null);
    loadInterestingLinks();
    urlInputRef.current?.focus();
    setDate(
      `${String(new Date().getDate()).padStart(2, "0")}/${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}/${new Date().getFullYear()}`
    );
  };

  const handleEdit = (link: InterestingLink) => {
    setEditLink(link);
    setUrl(link.url);
    setSource(link.source || "");
    setDownloaded(link.downloaded);
    setDate(link.date || "");
    setTimeout(() => {
      urlInputRef.current?.focus();
    }, 100);
  };

  const handleDelete = async (id: number) => {
    await invoke("delete_interesting_link", { id });
    loadInterestingLinks();
  };

  useEffect(() => {
    loadInterestingLinks();
  }, []);

  const onQueryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = DOMPurify.sanitize(e.target.value);
    handleSearch(sanitizedInput);
  };

  const onUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = DOMPurify.sanitize(e.target.value);
    setUrl(sanitizedInput);
  };

  const onSourceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedInput = DOMPurify.sanitize(e.target.value);
    setSource(sanitizedInput);
  };

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: "",
  });

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
      {infoModal.visible && (
        <InfoModal
          title="Information"
          message={infoModal.message}
          onOk={() => setInfoModal({ visible: false, message: "" })}
        />
      )}

      <h1 className="text-2xl font-bold mb-4">Manage Interesting Links</h1>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => onQueryInputChange(e)}
          className="px-4 py-2 border rounded-md w-full"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showDownloaded}
            onChange={handleToggleDownloaded}
          />
          <span>Show Downloaded</span>
        </label>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-4 items-center">
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={(e) => onUrlInputChange(e)}
            className="px-4 py-2 border rounded-md"
            required
            ref={urlInputRef}
          />
          <input
            type="text"
            placeholder="Source"
            value={source}
            onChange={(e) => onSourceInputChange(e)}
            className="px-4 py-2 border rounded-md"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={downloaded}
              onChange={(e) => setDownloaded(e.target.checked)}
            />
            <span>Downloaded</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            {editLink ? "Update" : "Add"} Link
          </button>
        </div>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Downloaded
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
            {filteredLinks.map((link) => (
              <tr key={link.id}>
                <td
                  className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-blue-600"
                  onClick={() => copyToClipboard(link.url)}
                >
                  {link.url}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {link.source || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {link.downloaded ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {link.date || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(link)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded-md mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
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

export default InterestingLinksPage;
