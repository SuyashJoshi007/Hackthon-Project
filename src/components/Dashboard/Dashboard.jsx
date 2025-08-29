import React from "react";
import TopBar from "./TopBar";
import Grid from "./Grid";
import EquipmentFilter from "./EquipmentFilter";

function Dashboard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-4">
      {/* Header */}
      <TopBar />
      <EquipmentFilter/>
      {/* Content */}
      <Grid />
    </div>
  );
}

export default Dashboard;
