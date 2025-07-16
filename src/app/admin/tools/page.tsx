"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
// import { Dialog } from "@headlessui/react";
// import { Fragment } from "react";

// Tool type definition
interface Tool {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  status: string;
  usage?: number;
}

const emptyTool: Omit<Tool, "_id"> = {
  name: "",
  slug: "",
  description: "",
  category: "",
  icon: "",
  status: "online",
};

export default function AdminToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [modal, setModal] = useState<null | { type: "add" | "edit" | "details"; tool: Tool | null }>(null);
  const [form, setForm] = useState<Omit<Tool, "_id">>(emptyTool);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch tools
  const fetchTools = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tools");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch tools");
      setTools(data.tools || []);
    } catch (e: any) {
      setError(e.message || "Failed to load tools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    if (session.user?.role !== "admin") {
      setError("Access denied. Admin privileges required.");
      return;
    }
    fetchTools();
  }, [session, status, router]);

  // CRUD Handlers
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    let icon = form.icon;
    try {
      if (!icon) {
        // Fetch suggested icon from API
        const res = await fetch('/api/admin/tools/suggest-icon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, category: form.category })
        });
        const data = await res.json();
        icon = data.icon || '🔧';
      }
      const res = await fetch("/api/admin/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, icon }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to add tool");
      setTools((prev) => [data.tool, ...prev]);
      setModal(null);
      setForm(emptyTool);
    } catch (e: any) {
      setFormError(e.message || "Failed to add tool");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal?.tool) return;
    setFormLoading(true);
    setFormError(null);
    let icon = form.icon;
    try {
      if (!icon) {
        // Fetch suggested icon from API
        const res = await fetch('/api/admin/tools/suggest-icon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, category: form.category })
        });
        const data = await res.json();
        icon = data.icon || '🔧';
      }
      const res = await fetch(`/api/admin/tools/${modal.tool._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, icon }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update tool");
      setTools((prev) => prev.map((t) => (t._id === modal.tool!._id ? data.tool : t)));
      setModal(null);
      setForm(emptyTool);
    } catch (e: any) {
      setFormError(e.message || "Failed to update tool");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this tool?")) return;
    setDeleteId(id);
    try {
      const res = await fetch(`/api/admin/tools/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete tool");
      setTools((prev) => prev.filter((t) => t._id !== id));
    } catch (e: any) {
      setError(e.message || "Failed to delete tool");
    } finally {
      setDeleteId(null);
    }
  };

  // Filtered tools
  const filtered = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || tool.category === category;
    return matchesSearch && matchesCategory;
  });
  const categories = ["all", ...Array.from(new Set(tools.map((t) => t.category)))];

  // Modal form handlers
  const openAdd = () => {
    setForm(emptyTool);
    setModal({ type: "add", tool: null });
    setFormError(null);
  };
  const openEdit = (tool: Tool) => {
    setForm({ ...tool });
    setModal({ type: "edit", tool });
    setFormError(null);
  };
  const openDetails = (tool: Tool) => setModal({ type: "details", tool });
  const closeModal = () => {
    setModal(null);
    setForm(emptyTool);
    setFormError(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="inline-block w-6 h-6 bg-indigo-600 rounded-full mr-2" />Tools
        </h1>
        <p className="text-gray-600 mt-2">Monitor and manage all AI and utility tools.</p>
      </div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={openAdd}
        >
          Add Tool
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tool Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading tools...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-gray-700 font-semibold">Tool Name</th>
                    <th className="py-2 px-4 text-gray-700 font-semibold">Category</th>
                    <th className="py-2 px-4 text-gray-700 font-semibold">Usage</th>
                    <th className="py-2 px-4 text-gray-700 font-semibold">Status</th>
                    <th className="py-2 px-4 text-gray-700 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">No tools found.</td>
                    </tr>
                  ) : (
                    filtered.map((tool) => (
                      <tr key={tool._id} className="border-b border-gray-200">
                        <td className="py-2 px-4 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-xl">
                              {tool.icon || "🔧"}
                            </span>
                            {tool.name}
                          </div>
                        </td>
                        <td className="py-2 px-4 text-gray-600">{tool.category || "General"}</td>
                        <td className="py-2 px-4">{tool.usage ?? 0}</td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tool.status === "online"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {tool.status || "offline"}
                          </span>
                        </td>
                        <td className="py-2 px-4 flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            onClick={() => openDetails(tool)}
                          >
                            View
                          </button>
                          <button
                            className="text-yellow-600 hover:text-yellow-800 text-sm"
                            onClick={() => openEdit(tool)}
                          >
                            Edit
                          </button>
                          <button
                            className={`text-red-600 hover:text-red-800 text-sm ${deleteId === tool._id ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => handleDelete(tool._id)}
                            disabled={deleteId === tool._id}
                          >
                            {deleteId === tool._id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {!!modal && modal.type === "add" && (
        <div className="fixed z-50 inset-0 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
            <div className="text-lg font-bold mb-4">Add New Tool</div>
            <form onSubmit={handleAdd} className="space-y-4">
              <input name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Name" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <input name="slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required placeholder="Slug" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Description" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <input name="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required placeholder="Category" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <input name="icon" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} required placeholder="Icon (emoji or text)" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <select name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border rounded bg-gray-100">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  {formLoading ? "Adding..." : "Add Tool"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal (simple overlay) */}
      {!!modal && modal.type === "details" && modal.tool && (
        <div className="fixed z-50 inset-0 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
            <div className="text-lg font-bold mb-4">Tool Details</div>
            <div className="space-y-3">
              <div><span className="font-semibold">Name:</span> {modal.tool.name}</div>
              <div><span className="font-semibold">Category:</span> {modal.tool.category}</div>
              <div><span className="font-semibold">Description:</span> {modal.tool.description}</div>
              <div><span className="font-semibold">Status:</span> {modal.tool.status}</div>
              <div><span className="font-semibold">Usage:</span> {modal.tool.usage ?? 0}</div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (simple overlay, if you want to keep it) */}
      {!!modal && modal.type === "edit" && modal.tool && (
        <div className="fixed z-50 inset-0 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
            <div className="text-lg font-bold mb-4">Edit Tool</div>
            <form onSubmit={handleEdit} className="space-y-4">
              <input name="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Name" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <input name="slug" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required placeholder="Slug" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Description" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <input name="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required placeholder="Category" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <input name="icon" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} required placeholder="Icon (emoji or text)" className="w-full px-3 py-2 border rounded bg-gray-100" />
              <select name="status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border rounded bg-gray-100">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  {formLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 