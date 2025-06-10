import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getApplicationById,
  updateApplicationStep,
  updateApplicationStatus,
} from "../api/Api";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Users,
  DollarSign,
  FileText,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Save,
  X,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Edit2,
} from "lucide-react";
import baseAPI from "../../env";
import toast from "react-hot-toast";

const applicationSteps = [
  {
    id: 1,
    title: "Application Submitted",
    description:
      "Your bursary application has been successfully received and is in our system",
    icon: FileText,
    details: "Application form completed with all required information",
  },
  {
    id: 2,
    title: "Document Verification",
    description:
      "We are verifying all submitted documents and checking eligibility requirements",
    icon: CheckCircle,
    details:
      "Academic transcripts, financial documents, and ID verification completed",
  },
  {
    id: 3,
    title: "Academic Review",
    description:
      "Academic performance and course enrollment are being assessed by our team",
    icon: GraduationCap,
    details: "GPA verification and academic standing confirmed",
  },
  {
    id: 4,
    title: "Financial Assessment",
    description:
      "Evaluating financial need based on submitted income and expense documentation",
    icon: DollarSign,
    details:
      "Financial aid office is reviewing your family's financial situation",
  },
  {
    id: 5,
    title: "Committee Review",
    description:
      "Bursary selection committee will review your complete application",
    icon: Users,
    details: "Committee meets weekly to review applications",
  },
  {
    id: 6,
    title: "Decision Notification",
    description:
      "Final decision will be communicated via email and student portal",
    icon: AlertCircle,
    details: "You will receive notification within 24 hours of decision",
  },
  {
    id: 7,
    title: "Fund Disbursement",
    description:
      "Approved bursary funds will be transferred to your student account",
    icon: DollarSign,
    details:
      "Funds typically disbursed within 5-7 business days after approval",
  },
];

// --- API functions for admin notes ---
const addAdminNote = async (applicationId, note) => {
  const token = localStorage.getItem("adminToken");
  const response = await fetch(
    `${baseAPI}/applications/${applicationId}/notes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ note }),
    }
  );
  if (!response.ok) throw new Error("Failed to add note");
  return await response.json();
};

const updateAdminNote = async (applicationId, noteId, note) => {
  const token = localStorage.getItem("adminToken");
  const response = await fetch(
    `${baseAPI}/applications/${applicationId}/notes/${noteId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ note }),
    }
  );
  if (!response.ok) throw new Error("Failed to update note");
  return await response.json();
};

const deleteAdminNote = async (applicationId, noteId) => {
  const token = localStorage.getItem("adminToken");
  const response = await fetch(
    `${baseAPI}/applications/${applicationId}/notes/${noteId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to delete note");
  return await response.json();
};

// --- AdminNotesSection with improved state management ---
const AdminNotesSection = ({ applicant, onNotesUpdate }) => {
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const response = await addAdminNote(applicant._id, newNote.trim());
      setNewNote("");
      setShowAddNote(false);
      if (response.application) {
        onNotesUpdate(response.application);
      } else if (response.adminNotes) {
        onNotesUpdate({ ...applicant, adminNotes: response.adminNotes });
      } else {
        const updatedApp = await getApplicationById(applicant._id);
        onNotesUpdate(updatedApp.data);
      }
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note. Please try again.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note._id);
    setEditingNoteValue(note.note);
  };

  const handleUpdateNote = async () => {
    if (!editingNoteValue.trim()) return;
    setIsUpdatingNote(true);
    try {
      const response = await updateAdminNote(
        applicant._id,
        editingNoteId,
        editingNoteValue.trim()
      );

      setEditingNoteId(null);
      setEditingNoteValue("");

      if (response.application) {
        onNotesUpdate(response.application);
      } else if (response.adminNotes) {
        onNotesUpdate({ ...applicant, adminNotes: response.adminNotes });
      } else {
        const updatedNotes = applicant.adminNotes.map((note) =>
          note._id === editingNoteId
            ? {
                ...note,
                note: editingNoteValue.trim(),
                updatedAt: new Date().toISOString(),
              }
            : note
        );
        onNotesUpdate({ ...applicant, adminNotes: updatedNotes });
      }

      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note. Please try again.");
      setEditingNoteId(null);
      setEditingNoteValue("");
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    setDeletingNoteId(noteId);
    try {
      const response = await deleteAdminNote(applicant._id, noteId);

      if (response.application) {
        onNotesUpdate(response.application);
      } else if (response.adminNotes) {
        onNotesUpdate({ ...applicant, adminNotes: response.adminNotes });
      } else {
        const updatedNotes = applicant.adminNotes.filter(
          (note) => note._id !== noteId
        );
        onNotesUpdate({ ...applicant, adminNotes: updatedNotes });
      }

      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Please try again.");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteValue("");
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Admin Notes</h3>
        {!showAddNote && (
          <button
            onClick={() => setShowAddNote(true)}
            className="flex items-center px-3 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Note
          </button>
        )}
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note here..."
            className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <div className="flex items-center justify-end space-x-2 mt-3">
            <button
              onClick={() => {
                setShowAddNote(false);
                setNewNote("");
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={isAddingNote || !newNote.trim()}
              className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isAddingNote ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Add Note
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {applicant.adminNotes && applicant.adminNotes.length > 0 ? (
          applicant.adminNotes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((note, index) => (
              <div
                key={note._id || index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-cyan-700">
                        {getInitials(note.createdBy?.name)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {note.createdBy?.name || "Admin"}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">
                          {formatDateTime(note.createdAt)}
                        </p>
                        {note.updatedAt &&
                          note.updatedAt !== note.createdAt && (
                            <span className="text-xs text-gray-400">
                              (edited)
                            </span>
                          )}
                      </div>
                    </div>
                    {editingNoteId === note._id ? (
                      <div>
                        <textarea
                          value={editingNoteValue}
                          onChange={(e) => setEditingNoteValue(e.target.value)}
                          className="w-full h-20 p-2 border border-gray-300 rounded-md resize-none mb-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateNote}
                            disabled={
                              isUpdatingNote || !editingNoteValue.trim()
                            }
                            className="flex items-center px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdatingNote ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isUpdatingNote}
                            className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs disabled:opacity-50"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {note.note}
                      </p>
                    )}
                  </div>
                  {/* Edit/Delete buttons */}
                  {editingNoteId !== note._id && (
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="text-cyan-600 hover:text-cyan-800 p-1 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                        title="Delete"
                        disabled={deletingNoteId === note._id}
                      >
                        {deletingNoteId === note._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No admin notes yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Add notes to track progress and communications.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- StepManagementModal ---
const StepManagementModal = ({
  isOpen,
  onClose,
  applicant,
  onStepUpdate,
  onStatusUpdate,
}) => {
  const [selectedStep, setSelectedStep] = useState(applicant?.currentStep || 1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(applicant?.status || "pending");

  useEffect(() => {
    setStatus(applicant?.status || "pending");
    setSelectedStep(applicant?.currentStep || 1);
  }, [applicant]);

  if (!isOpen) return null;

  const handleStepUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApplicationStep(applicant._id, { step: selectedStep });
      onStepUpdate(selectedStep);

      if (selectedStep === 6 || selectedStep === 7) {
        if (status !== applicant.status) {
          await updateApplicationStatus(applicant._id, { status });
          onStatusUpdate(status);
        }
      } else {
        if (applicant.status !== "pending") {
          await updateApplicationStatus(applicant._id, { status: "pending" });
          onStatusUpdate("pending");
          setStatus("pending");
        }
      }

      onClose();
    } catch (error) {
      console.error("Failed to update step or status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStepStatus = (stepId) => {
    if (stepId < selectedStep) return "completed";
    if (stepId === selectedStep) return "current";
    return "pending";
  };

  const showStatusSelector = selectedStep === 6 || selectedStep === 7;

  return (
    <div className="fixed inset-0 bg-cyan-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Manage Application Steps - {applicant?.fullName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {applicationSteps.map((step, index) => {
              const status = getStepStatus(step.id);
              const IconComponent = step.icon;

              return (
                <div
                  key={step.id}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedStep === step.id
                      ? "ring-2 ring-cyan-500 bg-cyan-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedStep(step.id)}
                >
                  <div className="p-3 sm:p-4 rounded-lg border">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                            status === "completed"
                              ? "bg-green-500 text-white"
                              : status === "current"
                              ? "bg-cyan-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {status === "completed" ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <IconComponent className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <h3
                            className={`text-base sm:text-lg font-medium ${
                              status === "current"
                                ? "text-cyan-700"
                                : "text-gray-900"
                            }`}
                          >
                            {step.title}
                          </h3>
                          <span
                            className={`mt-1 sm:mt-0 px-2 py-1 text-xs font-medium rounded-full ${
                              status === "completed"
                                ? "bg-green-100 text-green-800"
                                : status === "current"
                                ? "bg-cyan-100 text-cyan-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {status === "completed"
                              ? "Completed"
                              : status === "current"
                              ? "Current"
                              : "Pending"}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{step.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {step.details}
                        </p>
                      </div>
                    </div>
                    {index < applicationSteps.length - 1 && (
                      <div
                        className={`absolute left-7 sm:left-9 top-14 sm:top-16 w-0.5 h-6 ${
                          step.id < selectedStep
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {showStatusSelector && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Application Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { value: "pending", label: "Pending", color: "yellow" },
                  {
                    value: "under_review",
                    label: "Under Review",
                    color: "cyan",
                  },
                  { value: "approved", label: "Approved", color: "green" },
                  { value: "rejected", label: "Rejected", color: "red" },
                  { value: "waitlisted", label: "Waitlisted", color: "purple" },
                ].map((statusOption) => (
                  <label
                    key={statusOption.value}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                      status === statusOption.value
                        ? `border-${statusOption.color}-300 bg-${statusOption.color}-50`
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={statusOption.value}
                      checked={status === statusOption.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        status === statusOption.value
                          ? `border-${statusOption.color}-500 bg-${statusOption.color}-500`
                          : "border-gray-300"
                      }`}
                    >
                      {status === statusOption.value && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">
                      {statusOption.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm text-gray-600">
                Current step: <strong>{selectedStep}</strong> -{" "}
                {applicationSteps.find((s) => s.id === selectedStep)?.title}
              </div>
              {showStatusSelector && (
                <div className="text-sm text-gray-600">
                  Status:{" "}
                  <strong className="capitalize">
                    {status.replace("_", " ")}
                  </strong>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStepUpdate}
                disabled={isUpdating}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 flex items-center"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update {showStatusSelector ? "Step & Status" : "Step"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ApplicantDetails ---
const ApplicantDetails = () => {
  const { id } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const res = await getApplicationById(id);
        setApplicant(res.data);
      } catch (error) {
        console.error("Failed to fetch applicant:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicant();
  }, [id]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      under_review: "bg-cyan-100 text-cyan-800 border-cyan-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      waitlisted: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      under_review: <Eye className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      waitlisted: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const handleDocumentDownload = (documentPath, fileName) => {
    if (!documentPath) return;
    const downloadUrl = `${documentPath}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStepUpdate = (newStep) => {
    setApplicant((prev) => ({
      ...prev,
      currentStep: newStep,
    }));
  };

  const handleStatusUpdate = (newStatus) => {
    setApplicant((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  const handleNotesUpdate = (updatedApplication) => {
    if (!updatedApplication || !updatedApplication.adminNotes) return;
    setApplicant((prev) => ({
      ...prev,
      adminNotes: updatedApplication.adminNotes,
    }));
  };

  const getCurrentStepInfo = () => {
    const currentStep = applicant?.currentStep || 1;
    const stepInfo = applicationSteps.find((step) => step.id === currentStep);
    return stepInfo;
  };

  const InfoCard = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      <div className="flex items-center mb-3 sm:mb-4">
        {Icon && <Icon className="w-5 h-5 text-cyan-600 mr-2" />}
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value, fullWidth = false }) => (
    <div
      className={`${fullWidth ? "col-span-1 sm:col-span-2" : ""} mb-2 sm:mb-3`}
    >
      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
        {label}
      </dt>
      <dd className="text-xs sm:text-sm text-gray-900 bg-gray-50 px-2 sm:px-3 py-2 rounded-md break-words">
        {value || "Not provided"}
      </dd>
    </div>
  );

  const DocumentCard = ({ title, fileName, onDownload, available }) => (
    <div
      className={`border rounded-lg p-3 sm:p-4 ${
        available
          ? "border-green-200 bg-green-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start min-w-0 flex-1">
          <FileText
            className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${
              available ? "text-green-600" : "text-gray-400"
            }`}
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
            {fileName && (
              <p className="text-xs text-gray-500 truncate" title={fileName}>
                {fileName}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {available ? (
            <button
              onClick={onDownload}
              className="flex items-center px-3 py-1 bg-cyan-600 text-white text-sm rounded-md hover:bg-cyan-700 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          ) : (
            <span className="text-xs text-gray-500 px-3 py-1 bg-gray-200 rounded-md whitespace-nowrap">
              Not submitted
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applicant details...</p>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Applicant Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested applicant could not be found.
          </p>
          <Link to="/admin" className="text-cyan-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentStepInfo = getCurrentStepInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Link
                to="/admin"
                className="text-cyan-600 hover:text-cyan-700 mr-4 flex items-center"
              >
                <span className="mr-2">←</span>
                Back to Dashboard
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsStepModalOpen(true)}
                className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Manage Steps
              </button>
              <div
                className={`flex items-center px-4 py-2 rounded-full border ${getStatusColor(
                  applicant.status
                )}`}
              >
                {getStatusIcon(applicant.status)}
                <span className="ml-2 font-medium capitalize">
                  {applicant.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-6">
        {/* Application Overview */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg text-white p-4 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words">
                {applicant.fullName}
              </h2>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-cyan-100">
                <div className="flex items-center break-all">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">{applicant.email}</span>
                </div>
                <div className="flex items-center break-all">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">{applicant.phone}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">
                    Applied:{" "}
                    {new Date(applicant.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right w-full md:w-auto">
              <p className="text-cyan-100 text-xs sm:text-sm">Application ID</p>
              <p className="font-mono text-base sm:text-lg break-all">
                {applicant._id?.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout - Left and Right Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Takes 2/3 of the space */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <InfoCard title="Personal Information" icon={User}>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <InfoRow label="Full Name" value={applicant.fullName} />
                <InfoRow label="Email Address" value={applicant.email} />
                <InfoRow label="Phone Number" value={applicant.phone} />
                <InfoRow label="ID Number" value={applicant.idNumber} />
                <InfoRow
                  label="Date of Birth"
                  value={new Date(applicant.dob).toLocaleDateString()}
                />
                <InfoRow label="Gender" value={applicant.gender} />
                <InfoRow label="Nationality" value={applicant.nationality} />
                <InfoRow label="Country" value={applicant.country} />
                <InfoRow label="City" value={applicant.city} />
                <InfoRow label="State/Province" value={applicant.state} />
                <InfoRow label="Postal Code" value={applicant.postalCode} />
                <InfoRow
                  label="Address"
                  value={`${applicant.address1}${
                    applicant.address2 ? ", " + applicant.address2 : ""
                  }`}
                  fullWidth
                />
              </dl>
            </InfoCard>

            {/* Education Information */}
            <InfoCard title="Education Information" icon={GraduationCap}>
              <div className="space-y-6">
                {/* High School */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                    High School Education
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    <InfoRow
                      label="School Name"
                      value={applicant.highSchoolName}
                    />
                    <InfoRow
                      label="Matric Year"
                      value={applicant.highSchoolMatricYear}
                    />
                    <InfoRow
                      label="Current Education Level"
                      value={applicant.currentEducationLevel}
                      fullWidth
                    />
                  </dl>
                </div>

                {/* Subjects and Grades */}
                {applicant.subjects && applicant.subjects.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      Subjects & Grades
                    </h3>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                      {applicant.subjects.map((subject, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                        >
                          <span className="font-medium text-gray-900">
                            {subject.name}
                          </span>
                          <span
                            className={`mt-2 sm:mt-0 px-2 py-1 rounded text-sm font-semibold ${
                              subject.grade >= 80
                                ? "bg-green-100 text-green-800"
                                : subject.grade >= 70
                                ? "bg-cyan-100 text-cyan-800"
                                : subject.grade >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subject.grade}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Higher Education */}
                {applicant.institutionName && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      Current Higher Education
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      <InfoRow
                        label="Institution"
                        value={applicant.institutionName}
                      />
                      <InfoRow
                        label="Degree Type"
                        value={applicant.institutionDegreeType}
                      />
                      <InfoRow
                        label="Degree Name"
                        value={applicant.institutionDegreeName}
                      />
                      <InfoRow
                        label="Major"
                        value={applicant.institutionMajor}
                      />
                      <InfoRow
                        label="Start Year"
                        value={applicant.institutionStartYear}
                      />
                      <InfoRow
                        label="End Year"
                        value={applicant.institutionEndYear}
                      />
                      <InfoRow label="GPA" value={applicant.institutionGPA} />
                    </dl>
                  </div>
                )}

                {/* Previous Education */}
                {applicant.previousEducations &&
                  applicant.previousEducations.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        Previous Education
                      </h3>
                      <div className="space-y-4">
                        {applicant.previousEducations.map((edu, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <h4 className="font-medium text-gray-900 mb-2">
                              {edu.institutionName}
                            </h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <InfoRow
                                label="Degree Type"
                                value={edu.institutionDegreeType}
                              />
                              <InfoRow
                                label="Degree Name"
                                value={edu.institutionDegreeName}
                              />
                              <InfoRow
                                label="Major"
                                value={edu.institutionMajor}
                              />
                              <InfoRow label="GPA" value={edu.institutionGPA} />
                            </dl>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </InfoCard>

            {/* Household Information */}
            <InfoCard title="Household & Family Information" icon={Users}>
              <div className="space-y-6">
                <InfoRow
                  label="Number of Household Members"
                  value={applicant.numberOfMembers}
                />

                {/* Parent 1 */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                    Parent/Guardian 1
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    <InfoRow
                      label="First Name"
                      value={applicant.parent1FirstName}
                    />
                    <InfoRow
                      label="Last Name"
                      value={applicant.parent1LastName}
                    />
                    <InfoRow label="Gender" value={applicant.parent1Gender} />
                    <InfoRow
                      label="Relationship"
                      value={applicant.parent1Relationship}
                    />
                    <InfoRow
                      label="Employment Status"
                      value={applicant.parent1EmploymentStatus}
                    />
                    <InfoRow
                      label="Occupation"
                      value={applicant.parent1Occupation}
                    />
                    <InfoRow
                      label="Monthly Income"
                      value={
                        applicant.parent1MonthlyIncome
                          ? `$${applicant.parent1MonthlyIncome.toLocaleString()}`
                          : "Not provided"
                      }
                    />
                    <InfoRow
                      label="Other Income"
                      value={
                        applicant.parent1OtherIncome
                          ? `$${applicant.parent1OtherIncome.toLocaleString()}`
                          : "Not provided"
                      }
                    />
                  </dl>
                </div>

                {/* Parent 2 */}
                {applicant.parent2FirstName && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                      Parent/Guardian 2
                    </h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      <InfoRow
                        label="First Name"
                        value={applicant.parent2FirstName}
                      />
                      <InfoRow
                        label="Last Name"
                        value={applicant.parent2LastName}
                      />
                      <InfoRow label="Gender" value={applicant.parent2Gender} />
                      <InfoRow
                        label="Relationship"
                        value={applicant.parent2Relationship}
                      />
                      <InfoRow
                        label="Employment Status"
                        value={applicant.parent2EmploymentStatus}
                      />
                      <InfoRow
                        label="Occupation"
                        value={applicant.parent2Occupation}
                      />
                      <InfoRow
                        label="Monthly Income"
                        value={
                          applicant.parent2MonthlyIncome
                            ? `$${applicant.parent2MonthlyIncome.toLocaleString()}`
                            : "Not provided"
                        }
                      />
                      <InfoRow
                        label="Other Income"
                        value={
                          applicant.parent2OtherIncome
                            ? `$${applicant.parent2OtherIncome.toLocaleString()}`
                            : "Not provided"
                        }
                      />
                    </dl>
                  </div>
                )}
              </div>
            </InfoCard>
          </div>

          {/* RIGHT COLUMN - Takes 1/3 of the space */}
          <div className="space-y-6">
            <InfoCard title="Application Progress" icon={CheckCircle}>
              <div>
                <div className="flex items-center mb-2">
                  {currentStepInfo && (
                    <currentStepInfo.icon className="w-5 h-5 text-cyan-600 mr-2" />
                  )}
                  <span className="font-semibold text-cyan-800">
                    Step {applicant.currentStep || 1}: {currentStepInfo?.title}
                  </span>
                </div>
                <p className="text-sm text-cyan-700">
                  {currentStepInfo?.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
                  <span>Progress:</span>
                  <span className="font-medium">
                    {applicant.currentStep || 1} of {applicationSteps.length}{" "}
                    steps
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((applicant.currentStep || 1) /
                          applicationSteps.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Application Status" icon={AlertCircle}>
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border ${getStatusColor(
                    applicant.status
                  )}`}
                >
                  <div className="flex items-center justify-center">
                    {getStatusIcon(applicant.status)}
                    <span className="ml-2 font-semibold text-lg capitalize">
                      {applicant.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {new Date(applicant.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(applicant.updatedAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Notification Status:</strong>{" "}
                    {applicant.isNotified ? "Notified" : "Pending notification"}
                  </p>
                </div>
              </div>
            </InfoCard>

            {/* Admin Notes Section */}
            <AdminNotesSection
              applicant={applicant}
              onNotesUpdate={handleNotesUpdate}
            />

            <InfoCard title="Submitted Documents" icon={FileText}>
              <div className="space-y-3">
                <DocumentCard
                  title="Transcript"
                  fileName={applicant.documents?.transcript}
                  available={!!applicant.documents?.transcript}
                  onDownload={() =>
                    handleDocumentDownload(
                      applicant.documents?.transcript,
                      "transcript.pdf"
                    )
                  }
                />
                <DocumentCard
                  title="National ID Card"
                  fileName={applicant.documents?.nationalIdCard}
                  available={!!applicant.documents?.nationalIdCard}
                  onDownload={() =>
                    handleDocumentDownload(
                      applicant.documents?.nationalIdCard,
                      "national_id.pdf"
                    )
                  }
                />
                <DocumentCard
                  title="Proof of Residence"
                  fileName={applicant.documents?.proofOfResidence}
                  available={!!applicant.documents?.proofOfResidence}
                  onDownload={() =>
                    handleDocumentDownload(
                      applicant.documents?.proofOfResidence,
                      "proof_of_residence.pdf"
                    )
                  }
                />
                <DocumentCard
                  title="Letter of Recommendation"
                  fileName={applicant.documents?.letterOfRecommendation}
                  available={!!applicant.documents?.letterOfRecommendation}
                  onDownload={() =>
                    handleDocumentDownload(
                      applicant.documents?.letterOfRecommendation,
                      "recommendation_letter.pdf"
                    )
                  }
                />
                <DocumentCard
                  title="Proof of Bank Account"
                  fileName={applicant.documents?.proofOfBankAccount}
                  available={!!applicant.documents?.proofOfBankAccount}
                  onDownload={() =>
                    handleDocumentDownload(
                      applicant.documents?.proofOfBankAccount,
                      "proofOfBankAccount.pdf"
                    )
                  }
                />
                <DocumentCard
                  title="Cover Letter"
                  fileName={applicant.documents?.coverLetter}
                  available={!!applicant.documents?.coverLetter}
                  onDownload={() =>
                    handleDocumentDownload(
                      applicant.documents?.coverLetter,
                      "cover_letter.pdf"
                    )
                  }
                />
                <DocumentCard
                  title="Payslip"
                  fileName={applicant.documents?.payslip}
                  available={!!applicant.documents?.payslip}
                  onDownload={() =>
                    handleDocumentDownload(
                      applicant.documents?.payslip,
                      "payslip.pdf"
                    )
                  }
                />
                {/* Additional Documents */}
                {applicant.documents?.additionalDocs &&
                  applicant.documents.additionalDocs.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 mt-4">
                        Additional Documents
                      </h4>
                      {applicant.documents.additionalDocs.map((doc, index) => (
                        <DocumentCard
                          key={index}
                          title={`Additional Document ${index + 1}`}
                          fileName={doc}
                          available={!!doc}
                          onDownload={() =>
                            handleDocumentDownload(
                              doc,
                              `additional_doc_${index + 1}.pdf`
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
              </div>
            </InfoCard>
          </div>
        </div>

        {/* Step Management Modal */}
        <StepManagementModal
          isOpen={isStepModalOpen}
          onClose={() => setIsStepModalOpen(false)}
          applicant={applicant}
          onStepUpdate={handleStepUpdate}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default ApplicantDetails;
