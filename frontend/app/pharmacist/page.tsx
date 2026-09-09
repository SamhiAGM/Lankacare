'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Pill, AlertTriangle, Calendar, Layers, ShieldAlert,
  ArrowRight, CheckCircle2, Clock, Building2, Search, Plus,
  FileBarChart2, Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { auditLogService } from '@/services/apiClient';

export default function PharmacistPortalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const assignedHospitalId = user?.hospitalId || 'hosp-kinniya';
  const assignedHospitalName = user?.organization || 'Base Hospital Kinniya';

  // Scoped strictly to assigned hospital pharmacy
  const [inventory, setInventory] = useState(
    ([] as any[]).filter((inv) => inv.hospitalId === assignedHospitalId)
  );

  const [search, setSearch] = useState('');
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [reqDrug, setReqDrug] = useState('Paracetamol 500mg Tablets');
  const [reqQty, setReqQty] = useState(10000);
  const [reqReason, setReqReason] = useState('Anticipated monsoon viral fever surge in Kinniya division');

  const filtered = inventory.filter(
    (item) =>
      item.genericName.toLowerCase().includes(search.toLowerCase()) ||
      (item.batchNumber ? item.batchNumber.toLowerCase().includes(search.toLowerCase()) : false)
  );

  const lowStockCount = inventory.filter(
    (i) => i.stockStatus === 'LOW_STOCK' || i.stockStatus === 'CRITICAL'
  ).length;

  const expiringSoonCount = inventory.filter((i) => {
    if (!i.expiryDate) return false;
    const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
  }).length;

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    auditLogService.log(
      'STOCK_REQUISITION_CREATED',
      'MEDICINE',
      `REQ-${Date.now()}`,
      `Pharmacist requested ${reqQty} units of ${reqDrug} from MSD Colombo. Reason: ${reqReason}`,
      assignedHospitalId,
      assignedHospitalName
    );
    setShowRequisitionModal(false);
    toast.success(
      'Requisition Submitted to Medical Supplies Division (MSD)',
      `Requisition logged for ${reqDrug}`
    );
  };

  return (
    <RoleGuard allowedRoles={[UserRole.PHARMACIST, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                <Pill className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Hospital Pharmacy Depot Workspace
              </h1>
              <Badge variant="teal">Authorized Depot</Badge>
            </div>
            <p className="text-xs text-slate-400">
              {user?.name || 'M. Farhan'} • {assignedHospitalName} Pharmacy Depot • Scope: {assignedHospitalId}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowRequisitionModal(true)}
              className="gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 font-semibold"
            >
              <Plus className="w-4 h-4" /> MSD Stock Requisition
            </Button>
            <Link href="/medicines">
              <Button variant="outline" size="sm" className="text-xs bg-slate-800 text-slate-200 border-slate-700">
                NMRA Master Catalog
              </Button>
            </Link>
          </div>
        </div>

        {/* Scope Restriction Warning */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              <strong>Section 59 Organization Scope:</strong> You are authorized to manage stock batches for <strong>{assignedHospitalName}</strong> only. Cross-facility inventory modifications (e.g. modifying NHSL Colombo inventory) are rejected at Express API level.
            </span>
          </div>
          <Badge variant="outline">STRICT_SCOPED</Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Tracked Line Items</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{inventory.length}</p>
            <span className="text-[11px] text-teal-600 font-medium">Kinniya In-Stock Depot</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Low / Critical Stock</span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{lowStockCount}</p>
            <span className="text-[11px] text-rose-600 font-medium">Auto-Alert Triggered</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Expiring in &lt; 90 Days</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{expiringSoonCount}</p>
            <span className="text-[11px] text-amber-600 font-medium">Batch Rotation Required</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Daily Dispensary Queue</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">142</p>
            <span className="text-[11px] text-slate-500">Prescriptions Processed</span>
          </div>
        </div>

        {/* Medicine Inventory Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                Depot Inventory Batches ({assignedHospitalName})
              </h2>
              <p className="text-xs text-slate-500">
                Verified batches, physical unit counts, and shelf expiry dates.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drug or batch..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Generic Name</th>
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Min Threshold</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {item.genericName}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {item.batchNumber || 'MSD-BATCH-GEN'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {(item.quantity ?? item.stockQuantity ?? 0).toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {(item.minimumThreshold ?? 1000).toLocaleString()} {item.unit}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                      {item.expiryDate || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          item.stockStatus === 'AVAILABLE'
                            ? 'teal'
                            : item.stockStatus === 'LOW_STOCK'
                            ? 'amber'
                            : 'danger'
                        }
                      >
                        {item.stockStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-400">
                      {item.source || 'Medical Supplies Division (MSD)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Requisition Modal */}
        {showRequisitionModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Create MSD Central Drug Requisition
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRequisitionModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequisition} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Medicine Item:
                  </label>
                  <input
                    type="text"
                    value={reqDrug}
                    onChange={(e) => setReqDrug(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requisition Quantity:
                  </label>
                  <input
                    type="number"
                    value={reqQty}
                    onChange={(e) => setReqQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Justification:
                  </label>
                  <textarea
                    rows={3}
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowRequisitionModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 bg-orange-600 hover:bg-orange-700">
                    Dispatch to MSD
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}


