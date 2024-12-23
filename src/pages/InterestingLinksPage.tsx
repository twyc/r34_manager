import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

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
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const loadInterestingLinks = async () => {
    const links: InterestingLink[] = await invoke("read_interesting_links");
    setInterestingLinks(links);
    setFilteredLinks(links);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    const filtered = interestingLinks.filter((link) =>
      [link.url, link.source, link.date]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query.toLowerCase()))
    );

    setFilteredLinks(filtered);
  };

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
      });
    } else {
      await invoke("create_interesting_link", {
        url,
        source,
        downloaded,
        date,
      });
    }
    setUrl("");
    setSource("");
    setDownloaded(false);
    setDate("");
    setEditLink(null);
    loadInterestingLinks();
  };

  const handleEdit = (link: InterestingLink) => {
    setEditLink(link);
    setUrl(link.url);
    setSource(link.source || "");
    setDownloaded(link.downloaded);
    setDate(link.date || "");
  };

  const handleDelete = async (id: number) => {
    await invoke("delete_interesting_link", { id });
    loadInterestingLinks();
  };

  useEffect(() => {
    loadInterestingLinks();
  }, []);

  return (
    <div className="p-6">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md mb-4 hover:bg-blue-600"
        onClick={() => navigate("/")}
      >
        Home
      </button>

      <h1 className="text-2xl font-bold mb-4">Manage Interesting Links</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search links..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-4 py-2 border rounded-md w-full"
        />
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-4 items-center">
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="px-4 py-2 border rounded-md"
            required
          />
          <input
            type="text"
            placeholder="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
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
                ID
              </th>
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
                <td className="px-6 py-4 whitespace-nowrap">{link.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{link.url}</td>
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
