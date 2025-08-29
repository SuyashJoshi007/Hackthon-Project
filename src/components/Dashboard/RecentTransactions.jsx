import React, { useEffect, useMemo, useState } from "react";
import { FiArrowUpRight, FiMoreHorizontal, FiTool } from "react-icons/fi";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot, // live updates; swap to getDocs if you prefer one-off
} from "firebase/firestore";
import { db } from "../../firebase"; // adjust if needed

const formatDate = (v) => {
  if (!v) return "—";
  // Strings like "2025-09-06" or a Firestore Timestamp
  if (typeof v === "string") return v;
  if (v?.toDate) return v.toDate().toISOString().slice(0, 10);
  return String(v);
};

const RecentTransactions = ({ pageSize = 10 }) => {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null });

  // Resolve appId & userId the same way your form does
  const { appId, userId } = useMemo(() => {
    const appId =
      typeof __app_id !== "undefined" && __app_id ? __app_id : "default-app-id";
    const userId =
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("pseudo_user_id")) ||
      "anon";
    return { appId, userId };
  }, []);

  useEffect(() => {
    const colPath = `artifacts/${appId}/users/${userId}/failureData`;
    const colRef = collection(db, colPath);
    const q = query(colRef, orderBy("timestamp", "desc"), limit(pageSize));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRecords(rows);
        setStatus({ loading: false, error: null });
      },
      (err) => {
        console.error("Error fetching records:", err);
        setStatus({ loading: false, error: err.message || "Failed to load" });
      }
    );

    return () => unsub();
  }, [appId, userId, pageSize]);

  return (
    <div className="col-span-12 p-4 rounded-2xl border border-stone-200 bg-white/70 backdrop-blur shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-semibold text-stone-800">
          <FiTool /> Recent Failure Data
        </h3>
        <button className="text-sm text-violet-600 hover:underline">See all</button>
      </div>

      {status.loading ? (
        <div className="py-10 text-center text-stone-500 text-sm">Loading…</div>
      ) : status.error ? (
        <div className="py-10 text-center text-red-600 text-sm">⚠️ {status.error}</div>
      ) : records.length === 0 ? (
        <div className="py-10 text-center text-stone-500 text-sm">
          No records found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHead />
            <tbody>
              {records.map((rec, idx) => (
                <TableRow
                  key={rec.id}
                  order={idx}
                  path={`artifacts/${appId}/users/${userId}/failureData/${rec.id}`}
                  equipmentId={rec.equipmentId}
                  type={rec.type}
                  siteId={rec.siteId}
                  checkOutDate={formatDate(rec.checkOutDate)}
                  checkInDate={formatDate(rec.checkInDate)}
                  fuelUsagePerDay={rec.fuelUsagePerDay}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TableHead = () => (
  <thead>
    <tr className="text-xs uppercase tracking-wide text-stone-500">
      <th className="text-start p-2">Equipment ID</th>
      <th className="text-start p-2">Type</th>
      <th className="text-start p-2">Site</th>
      <th className="text-start p-2">Check-Out</th>
      <th className="text-start p-2">Check-In</th>
      <th className="text-start p-2">Fuel L/Day</th>
      <th className="w-8"></th>
    </tr>
  </thead>
);

const TableRow = ({
  equipmentId,
  type,
  siteId,
  checkOutDate,
  checkInDate,
  fuelUsagePerDay,
  order,
  path,
}) => (
  <tr className={order % 2 ? "bg-stone-50 text-sm" : "text-sm"}>
    <td className="p-2">
      <button
        title="Copy document path"
        onClick={() => navigator.clipboard?.writeText(path)}
        className="text-violet-600 underline flex items-center gap-1 hover:text-violet-700"
      >
        {equipmentId || "—"} <FiArrowUpRight />
      </button>
    </td>
    <td className="p-2">{type || "—"}</td>
    <td className="p-2">{siteId || "—"}</td>
    <td className="p-2">{checkOutDate || "—"}</td>
    <td className="p-2">{checkInDate || "—"}</td>
    <td className="p-2">{fuelUsagePerDay ?? "—"}</td>
    <td className="w-8">
      <button className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8">
        <FiMoreHorizontal />
      </button>
    </td>
  </tr>
);

export default RecentTransactions;
