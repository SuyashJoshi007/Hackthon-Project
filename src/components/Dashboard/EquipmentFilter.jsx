import React, { useState } from "react";

const EquipmentFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    equipmentType: "",
    siteId: "",
    operatorId: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  // 🔥 Shared field style
  const fieldClasses =
    "p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-200  hover:border-black hover:shadow-md transition transform duration-200";

  return (
    <div className="col-span-10 lg:col-span-4 bg-white rounded-sm p-4 m-4 border border-gray-400">
      <h2 className="text-base font-semibold text-stone-700 mb-3">
        Filter Equipment
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-3">
        {/* Equipment Type */}
        <select
          name="equipmentType"
          value={filters.equipmentType}
          onChange={handleChange}
          className={fieldClasses}
        >
          <option value="">All Types</option>
          <option value="Excavator">Excavator</option>
          <option value="Crane">Crane</option>
          <option value="Bulldozer">Bulldozer</option>
          <option value="Grader">Grader</option>
        </select>

        {/* Site ID */}
        <input
          type="text"
          name="siteId"
          placeholder="Site ID"
          value={filters.siteId}
          onChange={handleChange}
          className={fieldClasses}
        />

        {/* Operator ID */}
        <input
          type="text"
          name="operatorId"
          placeholder="Operator ID"
          value={filters.operatorId}
          onChange={handleChange}
          className={fieldClasses}
        />

        <button
          type="submit"
          className="w-[150px] px-6 bg-violet-500 text-white py-2 text-sm rounded-md shadow-sm hover:bg-violet-400 transition"
        >
          APPLY
        </button>
      </form>
    </div>
  );
};

export default EquipmentFilter;
