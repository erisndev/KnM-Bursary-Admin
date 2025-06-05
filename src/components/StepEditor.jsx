import React, { useState } from "react";

// Example icons (replace with your own)
const DummyIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Utility for status styles
const getStepStatus = (status) => {
  switch (status) {
    case "completed":
      return {
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        borderColor: "border-green-400",
        textColor: "text-green-700",
      };
    case "current":
      return {
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        borderColor: "border-blue-400",
        textColor: "text-blue-700",
      };
    default:
      return {
        bgColor: "bg-gray-100",
        iconColor: "text-gray-400",
        borderColor: "border-gray-300",
        textColor: "text-gray-600",
      };
  }
};

const initialSteps = [
  {
    id: 1,
    title: "Personal Info",
    description: "Enter your personal details.",
    details: "Full name, date of birth, etc.",
    status: "completed",
    icon: DummyIcon,
  },
  {
    id: 2,
    title: "Academic Info",
    description: "Provide your academic background.",
    details: "School, grades, etc.",
    status: "current",
    icon: DummyIcon,
  },
  {
    id: 3,
    title: "Supporting Docs",
    description: "Upload required documents.",
    details: "ID, transcripts, etc.",
    status: "pending",
    icon: DummyIcon,
  },
];

const StepEditor = () => {
  const [steps, setSteps] = useState(initialSteps);
  const [editingId, setEditingId] = useState(null);
  const [newStep, setNewStep] = useState({
    title: "",
    description: "",
    details: "",
    status: "pending",
  });

  const handleEdit = (id) => setEditingId(id);

  const handleChange = (id, field, value) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const handleSave = () => setEditingId(null);

  const handleRemove = (id) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const handleAdd = () => {
    if (!newStep.title.trim()) return;
    setSteps((prev) => [
      ...prev,
      {
        ...newStep,
        id: prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1,
        icon: DummyIcon,
      },
    ]);
    setNewStep({ title: "", description: "", details: "", status: "pending" });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Step Editor</h2>
      <div className="space-y-4 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          const { bgColor, iconColor, borderColor, textColor } = getStepStatus(
            step.status
          );
          return (
            <div
              key={step.id}
              className="flex items-start space-x-4 border p-4 rounded-lg"
            >
              <div
                className={`w-10 h-10 rounded-full ${bgColor} border-2 ${borderColor} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              {editingId === step.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    className="border px-2 py-1 rounded w-full"
                    value={step.title}
                    onChange={(e) =>
                      handleChange(step.id, "title", e.target.value)
                    }
                  />
                  <input
                    className="border px-2 py-1 rounded w-full"
                    value={step.description}
                    onChange={(e) =>
                      handleChange(step.id, "description", e.target.value)
                    }
                  />
                  <input
                    className="border px-2 py-1 rounded w-full"
                    value={step.details}
                    onChange={(e) =>
                      handleChange(step.id, "details", e.target.value)
                    }
                  />
                  <select
                    className="border px-2 py-1 rounded w-full"
                    value={step.status}
                    onChange={(e) =>
                      handleChange(step.id, "status", e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="current">Current</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{step.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-md border text-xs ${borderColor} ${textColor}`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <div className="text-gray-700">{step.description}</div>
                  <div className="text-gray-500 text-sm">{step.details}</div>
                  <div className="mt-2 space-x-2">
                    <button
                      className="bg-yellow-400 text-white px-2 py-1 rounded"
                      onClick={() => handleEdit(step.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleRemove(step.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="border p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Add New Step</h3>
        <input
          className="border px-2 py-1 rounded w-full mb-2"
          placeholder="Title"
          value={newStep.title}
          onChange={(e) => setNewStep((s) => ({ ...s, title: e.target.value }))}
        />
        <input
          className="border px-2 py-1 rounded w-full mb-2"
          placeholder="Description"
          value={newStep.description}
          onChange={(e) =>
            setNewStep((s) => ({ ...s, description: e.target.value }))
          }
        />
        <input
          className="border px-2 py-1 rounded w-full mb-2"
          placeholder="Details"
          value={newStep.details}
          onChange={(e) =>
            setNewStep((s) => ({ ...s, details: e.target.value }))
          }
        />
        <select
          className="border px-2 py-1 rounded w-full mb-2"
          value={newStep.status}
          onChange={(e) =>
            setNewStep((s) => ({ ...s, status: e.target.value }))
          }
        >
          <option value="pending">Pending</option>
          <option value="current">Current</option>
          <option value="completed">Completed</option>
        </select>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={handleAdd}
        >
          Add Step
        </button>
      </div>
    </div>
  );
};

export default StepEditor;
