import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GraduationCap, ChevronDown, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

function SchoolCard({ school, onDeleteSchool, onAddProgram, onEditProgram, onDeleteProgram }) {
  const [expanded, setExpanded] = useState(false);
  const [programs, setPrograms] = useState(school.programs || []);
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({ program_name: "", description: "" });
  const [editingProgram, setEditingProgram] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await api.get(`/schools/${school.school_code}`);
      setPrograms(res.data.data.programs || []);
    } catch (err) {
      console.error("Failed to fetch programs");
    }
  };

  const handleAddProgram = async (e) => {
    e.preventDefault();
    if (!newProgram.program_name.trim()) return;
    setSaving(true);
    try {
      await api.post(`/schools/${school.school_code}/programs`, newProgram);
      setNewProgram({ program_name: "", description: "" });
      setShowAddProgram(false);
      fetchPrograms();
    } catch (err) {
      console.error("Failed to add program");
    } finally {
      setSaving(false);
    }
  };

  const handleEditProgram = async (e) => {
    e.preventDefault();
    if (!editingProgram.program_name.trim()) return;
    setSaving(true);
    try {
      await api.put(`/schools/${school.school_code}/programs/${editingProgram.id}`, {
        program_name: editingProgram.program_name,
        description: editingProgram.description,
      });
      setEditingProgram(null);
      fetchPrograms();
    } catch (err) {
      console.error("Failed to edit program");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!confirm("Delete this program?")) return;
    try {
      await api.delete(`/schools/${school.school_code}/programs/${programId}`);
      fetchPrograms();
    } catch (err) {
      console.error("Failed to delete program");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(expanded === school.school_code ? null : school.school_code)}
      >
        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded">
          {school.school_code}
        </span>
        <span className="font-medium text-gray-800 flex-1">{school.full_name}</span>
        <span className="text-xs text-gray-400">{programs.length} programs</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${expanded === school.school_code ? "rotate-180" : ""}`}
        />
      </div>

      {expanded === school.school_code && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase">
                <th className="pb-2">Program</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id} className="border-t border-gray-50">
                  <td className="py-2 font-medium text-gray-800">{p.program_name}</td>
                  <td className="py-2 text-gray-500 text-xs">{p.description}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingProgram(p)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(p.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-400 text-xs">
                    No programs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {!showAddProgram && (
            <button
              onClick={() => setShowAddProgram(true)}
              className="mt-3 text-xs text-purple-600 hover:underline flex items-center gap-1"
            >
              <Plus size={12} /> Add program
            </button>
          )}
          {showAddProgram && (
            <form onSubmit={handleAddProgram} className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
              <input
                type="text"
                placeholder="Program name"
                value={newProgram.program_name}
                onChange={(e) => setNewProgram({ ...newProgram, program_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <textarea
                placeholder="Description"
                value={newProgram.description}
                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddProgram(false); setNewProgram({ program_name: "", description: "" }); }}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {editingProgram && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Program</h3>
              <button onClick={() => setEditingProgram(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditProgram} className="space-y-3">
              <input
                type="text"
                placeholder="Program name"
                value={editingProgram.program_name}
                onChange={(e) => setEditingProgram({ ...editingProgram, program_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <textarea
                placeholder="Description"
                value={editingProgram.description}
                onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [newSchool, setNewSchool] = useState({ school_code: "", full_name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.get("/schools");
      setSchools(res.data.data);
    } catch (err) {
      console.error("Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async (e) => {
    e.preventDefault();
    if (!newSchool.school_code.trim() || !newSchool.full_name.trim()) return;
    setSaving(true);
    try {
      await api.post("/schools", newSchool);
      setNewSchool({ school_code: "", full_name: "" });
      setShowAddSchool(false);
      fetchSchools();
    } catch (err) {
      console.error("Failed to add school");
      alert(err.response?.data?.error || "Failed to add school");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchool = async (schoolCode) => {
    if (!confirm(`Delete school "${schoolCode}"? All programs under this school will also be deleted.`)) return;
    try {
      await api.delete(`/schools/${schoolCode}`);
      fetchSchools();
    } catch (err) {
      console.error("Failed to delete school");
      alert(err.response?.data?.error || "Failed to delete school");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Schools & Programs</h1>
          <p className="text-gray-500 mt-1">Manage RVU schools and their academic programs.</p>
        </div>
        <Button onClick={() => setShowAddSchool(true)} className="gap-2">
          <Plus size={16} />
          Add School
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : schools.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No schools yet</h3>
          <p className="text-gray-500 text-sm">Add your first school to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schools.map((school) => (
            <SchoolCard
              key={school.school_code}
              school={school}
              onDeleteSchool={handleDeleteSchool}
            />
          ))}
        </div>
      )}

      {showAddSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add School</h3>
              <button
                onClick={() => { setShowAddSchool(false); setNewSchool({ school_code: "", full_name: "" }); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSchool} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">School Code</label>
                <input
                  type="text"
                  placeholder="e.g. SOCSE"
                  value={newSchool.school_code}
                  onChange={(e) => setNewSchool({ ...newSchool, school_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. School of Computer Science and Engineering"
                  value={newSchool.full_name}
                  onChange={(e) => setNewSchool({ ...newSchool, full_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddSchool(false); setNewSchool({ school_code: "", full_name: "" }); }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
