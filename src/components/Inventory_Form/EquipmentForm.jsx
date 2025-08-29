import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// MessageBox component for non-intrusive feedback
const MessageBox = ({ message, type, onClose }) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";
  const icon = type === "success" ? "✅" : "⚠️";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`p-4 rounded-md shadow-lg border-l-4 ${bgColor} flex items-center max-w-sm w-full`}
      >
        <span className="text-xl mr-2">{icon}</span>
        <p className="flex-grow text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 px-3 py-1 bg-violet-500 text-white rounded-md text-sm hover:bg-violet-600 transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

// Initial state for the form data
const initialFormData = {
  equipmentId: "",
  type: "",
  siteId: "",
  checkOutDate: "",
  checkInDate: "",
  engineHoursPerDay: "",
  idleHours: "",
  operatingDays: "",
  fuelUsagePerDay: "",
  cumulativeEngineHours: "",
  cumulativeFuel: "",
  loadFactor: "",
  maintenanceCount: "",
  lastMaintenanceDate: "",
  siteConditionIndex: "",
  cycleCount: "",
  ageInYears: "",
  failureProbability: "",
  rulDays: "",
  rulClass: "",
};

const App = () => {
  // 🔒 Auth removed — use a local, persistent pseudo user id
  const [userId, setUserId] = useState(null);

  // Form data and validation states
  const [formData, setFormData] = useState(initialFormData);
  const [messageBox, setMessageBox] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create or load a stable pseudo user id (no Firebase Auth)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pseudo_user_id");
      if (stored) {
        setUserId(stored);
      } else {
        const id = (typeof crypto !== "undefined" && crypto.randomUUID)
          ? crypto.randomUUID()
          : `anon_${Date.now()}`;
        localStorage.setItem("pseudo_user_id", id);
        setUserId(id);
      }
    } catch (e) {
      // Fallback if localStorage unavailable
      const id = `anon_${Date.now()}`;
      setUserId(id);
    }
  }, []);

  // Client-side validation function
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Required fields
    const requiredFields = [
      "equipmentId",
      "type",
      "siteId",
      "checkOutDate",
      "engineHoursPerDay",
      "operatingDays",
      "fuelUsagePerDay",
      "cumulativeEngineHours",
      "cumulativeFuel",
      "rulClass",
      "cycleCount",
      "ageInYears",
      "failureProbability",
      "rulDays",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required.";
        isValid = false;
      }
    });

    // Date validation
    if (
      formData.checkOutDate &&
      formData.checkInDate &&
      formData.checkInDate < formData.checkOutDate
    ) {
      newErrors.checkInDate = "Check-in date cannot be before check-out date.";
      isValid = false;
    }

    // Numeric validations
    const numericFields = [
      { name: "engineHoursPerDay", min: 0, step: 0.1 },
      { name: "idleHours", min: 0, step: 0.1 },
      { name: "operatingDays", min: 0 },
      { name: "fuelUsagePerDay", min: 0, step: 0.1 },
      { name: "cumulativeEngineHours", min: 0, step: 0.1 },
      { name: "cumulativeFuel", min: 0, step: 0.1 },
      { name: "loadFactor", min: 0, max: 1, step: 0.01 },
      { name: "maintenanceCount", min: 0 },
      { name: "siteConditionIndex", min: 1, max: 5 },
      { name: "cycleCount", min: 0 },
      { name: "ageInYears", min: 0 },
      { name: "failureProbability", min: 0, max: 1, step: 0.01 },
      { name: "rulDays", min: 0 },
    ];

    numericFields.forEach((field) => {
      const value = parseFloat(formData[field.name]);
      if (formData[field.name] !== "" && isNaN(value)) {
        newErrors[field.name] = "Must be a valid number.";
        isValid = false;
      } else if (formData[field.name] !== "" && value < field.min) {
        newErrors[field.name] = `Must be at least ${field.min}.`;
        isValid = false;
      } else if (
        formData[field.name] !== "" &&
        field.max !== undefined &&
        value > field.max
      ) {
        newErrors[field.name] = `Cannot exceed ${field.max}.`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleBlur = () => {
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formIsValid = validateForm();
    if (!formIsValid) {
      setIsSubmitting(false);
      setMessageBox({
        message: "⚠️ Please correct the errors in the form before submitting.",
        type: "error",
      });
      return;
    }

    if (!db) {
      setMessageBox({ message: "⚠️ Firestore not available.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
      const uid = userId || "anon";
      const collectionPath = `artifacts/${appId}/users/${uid}/failureData`;

      // Coerce numeric strings to numbers before saving
      const dataToSave = { ...formData };
      for (const key in dataToSave) {
        if (
          [
            "engineHoursPerDay",
            "idleHours",
            "operatingDays",
            "fuelUsagePerDay",
            "cumulativeEngineHours",
            "cumulativeFuel",
            "loadFactor",
            "maintenanceCount",
            "siteConditionIndex",
            "cycleCount",
            "ageInYears",
            "failureProbability",
            "rulDays",
          ].includes(key) &&
          dataToSave[key] !== ""
        ) {
          dataToSave[key] = parseFloat(dataToSave[key]);
        }
      }

      await addDoc(collection(db, collectionPath), {
        ...dataToSave,
        timestamp: serverTimestamp(),
      });

      setMessageBox({ message: "✅ Failure data submitted successfully!", type: "success" });
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      console.error("❌ Error adding document: ", error);
      setMessageBox({
        message: `❌ Failed to submit data. Please try again. Error: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setMessageBox(null);
  };

  const fieldClasses =
    "p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-300 hover:border-gray-400 transition transform duration-200";
  const errorClass = "border-red-500 focus:ring-red-200";
  const errorMessageClass = "text-red-500 text-xs mt-1";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-8 border border-gray-100 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-stone-800 mb-2 text-center">📉 Equipment Failure Data</h2>
        <p className="text-gray-600 mb-6 text-center text-md">
          Record essential data points related to equipment health and potential failures.
        </p>

        {userId && (
          <p className="text-sm text-gray-700 mb-5 text-center bg-gray-50 p-2 rounded-md border border-gray-200">
            Your User ID: <span className="font-mono text-gray-800 font-semibold">{userId}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Equipment ID */}
          <div>
            <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 mb-1">Equipment ID</label>
            <input
              type="text"
              name="equipmentId"
              id="equipmentId"
              placeholder="e.g., EQX00002"
              value={formData.equipmentId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.equipmentId ? errorClass : ''} w-full`}
              required
            />
            {errors.equipmentId && <p className={errorMessageClass}>{errors.equipmentId}</p>}
          </div>

          {/* Equipment Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Equipment Type</label>
            <select
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.type ? errorClass : ''} w-full bg-white`}
              required
            >
              <option value="">Select Type</option>
              <option value="Excavator">Excavator</option>
              <option value="Crane">Crane</option>
              <option value="Bulldozer">Bulldozer</option>
              <option value="Grader">Grader</option>
              <option value="Loader">Loader</option>
            </select>
            {errors.type && <p className={errorMessageClass}>{errors.type}</p>}
          </div>

          {/* Site ID */}
          <div>
            <label htmlFor="siteId" className="block text-sm font-medium text-gray-700 mb-1">Site ID</label>
            <input
              type="text"
              name="siteId"
              id="siteId"
              placeholder="e.g., S879"
              value={formData.siteId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.siteId ? errorClass : ''} w-full`}
              required
            />
            {errors.siteId && <p className={errorMessageClass}>{errors.siteId}</p>}
          </div>

          {/* Check-out Date */}
          <div>
            <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
            <input
              type="date"
              name="checkOutDate"
              id="checkOutDate"
              value={formData.checkOutDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.checkOutDate ? errorClass : ''} w-full`}
              required
            />
            {errors.checkOutDate && <p className={errorMessageClass}>{errors.checkOutDate}</p>}
          </div>

          {/* Check-in Date */}
          <div>
            <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
            <input
              type="date"
              name="checkInDate"
              id="checkInDate"
              value={formData.checkInDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.checkInDate ? errorClass : ''} w-full`}
            />
            {errors.checkInDate && <p className={errorMessageClass}>{errors.checkInDate}</p>}
          </div>

          {/* Engine Hours/Day */}
          <div>
            <label htmlFor="engineHoursPerDay" className="block text-sm font-medium text-gray-700 mb-1">Engine Hours/Day</label>
            <input
              type="number"
              name="engineHoursPerDay"
              id="engineHoursPerDay"
              placeholder="e.g., 8.3"
              value={formData.engineHoursPerDay}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.engineHoursPerDay ? errorClass : ''} w-full`}
              step="0.1"
              min="0"
              required
            />
            {errors.engineHoursPerDay && <p className={errorMessageClass}>{errors.engineHoursPerDay}</p>}
          </div>

          {/* Idle Hours/Day */}
          <div>
            <label htmlFor="idleHours" className="block text-sm font-medium text-gray-700 mb-1">Idle Hours/Day</label>
            <input
              type="number"
              name="idleHours"
              id="idleHours"
              placeholder="e.g., 7.6"
              value={formData.idleHours}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.idleHours ? errorClass : ''} w-full`}
              step="0.1"
              min="0"
            />
            {errors.idleHours && <p className={errorMessageClass}>{errors.idleHours}</p>}
          </div>

          {/* Operating Days */}
          <div>
            <label htmlFor="operatingDays" className="block text-sm font-medium text-gray-700 mb-1">Operating Days</label>
            <input
              type="number"
              name="operatingDays"
              id="operatingDays"
              placeholder="e.g., 137"
              value={formData.operatingDays}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.operatingDays ? errorClass : ''} w-full`}
              min="0"
              required
            />
            {errors.operatingDays && <p className={errorMessageClass}>{errors.operatingDays}</p>}
          </div>

          {/* Fuel Usage (L/Day) */}
          <div>
            <label htmlFor="fuelUsagePerDay" className="block text-sm font-medium text-gray-700 mb-1">Fuel Usage (L/Day)</label>
            <input
              type="number"
              name="fuelUsagePerDay"
              id="fuelUsagePerDay"
              placeholder="e.g., 30.5"
              value={formData.fuelUsagePerDay}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.fuelUsagePerDay ? errorClass : ''} w-full`}
              step="0.1"
              min="0"
              required
            />
            {errors.fuelUsagePerDay && <p className={errorMessageClass}>{errors.fuelUsagePerDay}</p>}
          </div>

          {/* Cumulative Engine Hours */}
          <div>
            <label htmlFor="cumulativeEngineHours" className="block text-sm font-medium text-gray-700 mb-1">Cumulative Engine Hours</label>
            <input
              type="number"
              name="cumulativeEngineHours"
              id="cumulativeEngineHours"
              placeholder="e.g., 1137.1"
              value={formData.cumulativeEngineHours}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.cumulativeEngineHours ? errorClass : ''} w-full`}
              step="0.1"
              min="0"
              required
            />
            {errors.cumulativeEngineHours && <p className={errorMessageClass}>{errors.cumulativeEngineHours}</p>}
          </div>

          {/* Cumulative Fuel (L) */}
          <div>
            <label htmlFor="cumulativeFuel" className="block text sm font-medium text-gray-700 mb-1">Cumulative Fuel (L)</label>
            <input
              type="number"
              name="cumulativeFuel"
              id="cumulativeFuel"
              placeholder="e.g., 4178.5"
              value={formData.cumulativeFuel}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.cumulativeFuel ? errorClass : ''} w-full`}
              step="0.1"
              min="0"
              required
            />
            {errors.cumulativeFuel && <p className={errorMessageClass}>{errors.cumulativeFuel}</p>}
          </div>

          {/* Load Factor */}
          <div>
            <label htmlFor="loadFactor" className="block text-sm font-medium text-gray-700 mb-1">Load Factor</label>
            <input
              type="number"
              name="loadFactor"
              id="loadFactor"
              placeholder="e.g., 0.52 (0-1)"
              value={formData.loadFactor}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.loadFactor ? errorClass : ''} w-full`}
              step="0.01"
              min="0"
              max="1"
            />
            {errors.loadFactor && <p className={errorMessageClass}>{errors.loadFactor}</p>}
          </div>

          {/* Maintenance Count */}
          <div>
            <label htmlFor="maintenanceCount" className="block text-sm font-medium text-gray-700 mb-1">Maintenance Count</label>
            <input
              type="number"
              name="maintenanceCount"
              id="maintenanceCount"
              placeholder="e.g., 11"
              value={formData.maintenanceCount}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.maintenanceCount ? errorClass : ''} w-full`}
              min="0"
            />
            {errors.maintenanceCount && <p className={errorMessageClass}>{errors.maintenanceCount}</p>}
          </div>

          {/* Last Maintenance Date */}
          <div>
            <label htmlFor="lastMaintenanceDate" className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance Date</label>
            <input
              type="date"
              name="lastMaintenanceDate"
              id="lastMaintenanceDate"
              value={formData.lastMaintenanceDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.lastMaintenanceDate ? errorClass : ''} w-full`}
            />
            {errors.lastMaintenanceDate && <p className={errorMessageClass}>{errors.lastMaintenanceDate}</p>}
          </div>

          {/* Site Condition Index */}
          <div>
            <label htmlFor="siteConditionIndex" className="block text-sm font-medium text-gray-700 mb-1">Site Condition Index</label>
            <input
              type="number"
              name="siteConditionIndex"
              id="siteConditionIndex"
              placeholder="e.g., 3 (1-5)"
              value={formData.siteConditionIndex}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.siteConditionIndex ? errorClass : ''} w-full`}
              min="1"
              max="5"
            />
            {errors.siteConditionIndex && <p className={errorMessageClass}>{errors.siteConditionIndex}</p>}
          </div>

          {/* Cycle Count */}
          <div>
            <label htmlFor="cycleCount" className="block text-sm font-medium text-gray-700 mb-1">Cycle Count</label>
            <input
              type="number"
              name="cycleCount"
              id="cycleCount"
              placeholder="e.g., 1200"
              value={formData.cycleCount}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.cycleCount ? errorClass : ''} w-full`}
              min="0"
              required
            />
            {errors.cycleCount && <p className={errorMessageClass}>{errors.cycleCount}</p>}
          </div>

          {/* Age in Years */}
          <div>
            <label htmlFor="ageInYears" className="block text-sm font-medium text-gray-700 mb-1">Age in Years</label>
            <input
              type="number"
              name="ageInYears"
              id="ageInYears"
              placeholder="e.g., 5"
              value={formData.ageInYears}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.ageInYears ? errorClass : ''} w-full`}
              min="0"
              required
            />
            {errors.ageInYears && <p className={errorMessageClass}>{errors.ageInYears}</p>}
          </div>

          {/* Failure Probability */}
          <div>
            <label htmlFor="failureProbability" className="block text-sm font-medium text-gray-700 mb-1">Failure Probability</label>
            <input
              type="number"
              name="failureProbability"
              id="failureProbability"
              placeholder="e.g., 0.05 (0-1)"
              value={formData.failureProbability}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.failureProbability ? errorClass : ''} w-full`}
              step="0.01"
              min="0"
              max="1"
              required
            />
            {errors.failureProbability && <p className={errorMessageClass}>{errors.failureProbability}</p>}
          </div>

          {/* RUL (Remaining Useful Life in days) */}
          <div>
            <label htmlFor="rulDays" className="block text-sm font-medium text-gray-700 mb-1">RUL (days)</label>
            <input
              type="number"
              name="rulDays"
              id="rulDays"
              placeholder="e.g., 156"
              value={formData.rulDays}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.rulDays ? errorClass : ''} w-full`}
              min="0"
              required
            />
            {errors.rulDays && <p className={errorMessageClass}>{errors.rulDays}</p>}
          </div>

          {/* RUL Class */}
          <div>
            <label htmlFor="rulClass" className="block text-sm font-medium text-gray-700 mb-1">RUL Class</label>
            <select
              name="rulClass"
              id="rulClass"
              value={formData.rulClass}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${fieldClasses} ${errors.rulClass ? errorClass : ''} w-full bg-white`}
              required
            >
              <option value="">Select RUL Class</option>
              <option value="High Risk">High Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="Low Risk">Low Risk</option>
              <option value="No Risk">No Risk</option>
            </select>
            {errors.rulClass && <p className={errorMessageClass}>{errors.rulClass}</p>}
          </div>

          {/* Action Buttons */}
          <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-5 py-2 text-md rounded-md border border-gray-300 text-gray-700 bg-white shadow-sm hover:bg-gray-100 transition duration-200"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-md rounded-md shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 transition duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Submit Failure Data"}
            </button>
          </div>
        </form>
        {messageBox && (
          <MessageBox
            message={messageBox.message}
            type={messageBox.type}
            onClose={() => setMessageBox(null)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
