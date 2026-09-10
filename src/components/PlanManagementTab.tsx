import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Printer, 
  Edit3, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Layers, 
  Filter, 
  Search, 
  FileText, 
  ArrowUpDown,
  Building2,
  Users,
  Smartphone,
  Zap,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { 
  DisconnectionPlan, 
  Office, 
  Contractor, 
  Device, 
  Portion, 
  PlanStatus,
  PlanPriority 
} from '../types';

interface PlanManagementTabProps {
  plans: DisconnectionPlan[];
  offices: Office[];
  contractors: Contractor[];
  devices: Device[];
  portions: Portion[];
  selectedOfficeId: string;
  searchQuery: string;
  onOpenNewPlan: () => void;
  onEditPlan: (plan: DisconnectionPlan) => void;
  onDeletePlan: (id: string) => void;
  onUpdatePlanStatus: (id: string, status: PlanStatus) => void;
  onPrintPlan: (plan: DisconnectionPlan) => void;
}

export const PlanManagementTab: React.FC<PlanManagementTabProps> = ({
  plans,
  offices,
  contractors,
  devices,
  portions,
  selectedOfficeId,
  searchQuery,
  onOpenNewPlan,
  onEditPlan,
  onDeletePlan,
  onUpdatePlanStatus,
  onPrintPlan,
}) => {
  // Sub-filters
  const [filterPortion, setFilterPortion] = useState<string>('ALL');
  const [filterContractor, setFilterContractor] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'portion' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<DisconnectionPlan | null>(null);

  // Filtered and sorted plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Office filter
      if (selectedOfficeId !== 'ALL' && plan.officeId !== selectedOfficeId) {
        return false;
      }
      // Portion filter
      if (filterPortion !== 'ALL' && plan.portionNumber !== filterPortion) {
        return false;
      }
      // Contractor filter
      if (filterContractor !== 'ALL' && plan.contractorId !== filterContractor) {
        return false;
      }
      // Status filter
      if (filterStatus !== 'ALL' && plan.status !== filterStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = plan.planCode?.toLowerCase().includes(q);
        const matchContractor = (plan.contractorName + ' ' + plan.contractorCode).toLowerCase().includes(q);
        const matchDevice = (plan.deviceCode + ' ' + plan.deviceContractorName).toLowerCase().includes(q);
        const matchPortion = (plan.portionNumber + ' ' + plan.route).toLowerCase().includes(q);
        const matchNotes = plan.notes?.toLowerCase().includes(q);
        if (!matchCode && !matchContractor && !matchDevice && !matchPortion && !matchNotes) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = a.disconnectionDate || a.readingDate;
        const dateB = b.disconnectionDate || b.readingDate;
        return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      } else if (sortBy === 'portion') {
        return sortOrder === 'asc' 
          ? a.portionNumber.localeCompare(b.portionNumber)
          : b.portionNumber.localeCompare(a.portionNumber);
      } else {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });
  }, [plans, selectedOfficeId, filterPortion, filterContractor, filterStatus, searchQuery, sortBy, sortOrder]);

  const getOfficeName = (officeId: string) => {
    const office = offices.find((o) => o.id === officeId);
    if (!office) return 'ไม่ระบุสังกัด';
    return office.name;
  };

  const getOfficeBadge = (officeId: string) => {
    const office = offices.find((o) => o.id === officeId);
    if (!office) return null;
    return office.type === 'PRIMARY' ? (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
        ⚡ ไฟฟ้าต้นสังกัด
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
        🔌 ไฟฟ้าในสังกัด
      </span>
    );
  };

  const renderStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3" /> เสร็จสมบูรณ์
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="w-3 h-3" /> กำลังปฏิบัติงาน
          </span>
        );
      case 'PLANNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Calendar className="w-3 h-3" /> มีแผนแล้ว
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            ฉบับร่าง
          </span>
        );
      case 'POSTPONED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
            ผ่อนผัน/เลื่อน
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            ยกเลิก
          </span>
        );
    }
  };

  // Get unique portion numbers for dropdown
  const portionNumbers = Array.from(new Set(portions.map((p) => p.portionNumber))).sort();

  return (
    <div className="space-y-4">
      {/* Control & Filter Header */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Title & Stats */}
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-700" />
              รายการแผนงานงดจ่ายไฟ ({filteredPlans.length} รายการ)
            </h2>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Portion Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-slate-500 font-medium">พอตชั่น:</span>
              <select
                value={filterPortion}
                onChange={(e) => setFilterPortion(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">ทั้งหมด</option>
                {portionNumbers.map((num) => (
                  <option key={num} value={num}>
                    พอตชั่น {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Contractor Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-slate-500 font-medium">ผู้รับจ้าง:</span>
              <select
                value={filterContractor}
                onChange={(e) => setFilterContractor(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL">ทั้งหมด</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-slate-500 font-medium">สถานะ:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="ALL">ทุกสถานะ</option>
                <option value="DRAFT">ฉบับร่าง</option>
                <option value="PLANNED">มีแผนแล้ว</option>
                <option value="IN_PROGRESS">กำลังปฏิบัติงาน</option>
                <option value="COMPLETED">เสร็จสมบูรณ์</option>
                <option value="POSTPONED">ผ่อนผัน/เลื่อน</option>
              </select>
            </div>

            {/* Sort order toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-medium transition"
              title="สลับลำดับ เรียงหน้า-หลัง"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'asc' ? 'ลำดับ: เก่า-ใหม่' : 'ลำดับ: ใหม่-เก่า'}</span>
            </button>

            {/* New Plan Button */}
            <button
              onClick={onOpenNewPlan}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-medium shadow-2xs transition ml-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มแผนงาน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลแผนงานงดจ่ายไฟ</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            ลองปรับเปลี่ยนตัวกรองสังกัด พอตชั่น หรือผู้รับจ้าง หรือกดปุ่ม &quot;+ เพิ่มแผนงาน&quot; ด้านบนเพื่อเริ่มต้นสร้างแผนงานงดจ่ายไฟใหม่
          </p>
          <button
            onClick={onOpenNewPlan}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 text-white rounded-lg text-xs font-semibold hover:bg-purple-800 transition"
          >
            <Plus className="w-4 h-4" />
            สร้างแผนงานงดจ่ายไฟรายการแรก
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3.5">รหัสแผน / สังกัด</th>
                  <th className="py-3 px-3.5">
                    <div className="flex items-center gap-1 text-emerald-800 font-bold">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      3. พอตชั่น & วันที่จดหน่วย
                    </div>
                  </th>
                  <th className="py-3 px-3.5">
                    <div className="text-emerald-800 font-bold">
                      4. สายของพอตชั่น
                    </div>
                  </th>
                  <th className="py-3 px-3.5">
                    <div className="flex items-center gap-1 text-amber-800 font-bold">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      1. รหัส & ชื่อผู้รับจ้าง
                    </div>
                  </th>
                  <th className="py-3 px-3.5">
                    <div className="flex items-center gap-1 text-blue-800 font-bold">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      2. เครื่อง & ผู้ถือเครื่อง
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-center">วันงดจ่ายไฟ / ยอดเป้าหมาย</th>
                  <th className="py-3 px-3.5 text-center">สถานะ</th>
                  <th className="py-3 px-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.map((plan) => {
                  return (
                    <tr 
                      key={plan.id}
                      className="hover:bg-purple-50/40 transition-colors group"
                    >
                      {/* Plan Code & Office */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          {plan.planCode}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                          {getOfficeName(plan.officeId)}
                        </div>
                        <div className="mt-1">
                          {getOfficeBadge(plan.officeId)}
                        </div>
                      </td>

                      {/* 3. พอตชั่นและวันที่จดหน่วย */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          พอตชั่น {plan.portionNumber}
                        </div>
                        <div className="text-slate-600 text-[11px] mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>จดหน่วย: <strong>{plan.readingDate}</strong></span>
                        </div>
                      </td>

                      {/* 4. สายของแต่ละพอตชั่น */}
                      <td className="py-3 px-3.5 align-top max-w-[200px]">
                        <div className="font-semibold text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-200">
                          {plan.route}
                        </div>
                        {plan.notes && (
                          <div className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                            หมายเหตุ: {plan.notes}
                          </div>
                        )}
                      </td>

                      {/* 1. ชื่อและรหัสผู้รับจ้าง */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono text-[11px] font-bold">
                          {plan.contractorCode}
                        </div>
                        <div className="font-medium text-slate-800 mt-1">
                          {plan.contractorName}
                        </div>
                      </td>

                      {/* 2. เครื่อง (ชื่อผู้รับจ้างเครื่องนั้นๆ) */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-mono text-[11px] font-bold">
                          {plan.deviceCode}
                        </div>
                        <div className="text-slate-700 text-[11px] mt-1">
                          <span className="text-slate-500">ผู้ถือเครื่อง: </span>
                          <span className="font-medium">{plan.deviceContractorName || plan.contractorName}</span>
                        </div>
                      </td>

                      {/* Target Count & Progress */}
                      <td className="py-3 px-3.5 align-top text-center">
                        <div className="font-bold text-slate-800">
                          {plan.disconnectionDate}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          เป้าหมาย: <strong className="text-purple-700">{plan.targetMetersCount}</strong> ราย
                        </div>
                        {(plan.disconnectedCount > 0 || plan.paidBeforeCutCount > 0) && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            (ตัด {plan.disconnectedCount} / จ่าย {plan.paidBeforeCutCount})
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 align-top text-center">
                        <div>{renderStatusBadge(plan.status)}</div>
                        {/* Quick status change */}
                        <select
                          value={plan.status}
                          onChange={(e) => onUpdatePlanStatus(plan.id, e.target.value as PlanStatus)}
                          className="mt-1.5 text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 outline-none cursor-pointer"
                        >
                          <option value="DRAFT">ร่าง</option>
                          <option value="PLANNED">มีแผน</option>
                          <option value="IN_PROGRESS">ทำอยู่</option>
                          <option value="COMPLETED">เสร็จสิ้น</option>
                          <option value="POSTPONED">ผ่อนผัน</option>
                          <option value="CANCELLED">ยกเลิก</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 align-top text-right space-x-1 whitespace-nowrap">
                        {/* Print Work Order Button */}
                        <button
                          onClick={() => onPrintPlan(plan)}
                          className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                          title="พิมพ์ใบสั่งงานงดจ่ายไฟ / ใบงานภาคสนาม"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditPlan(plan)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                          title="แก้ไขแผนงาน"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบแผนงาน ${plan.planCode}?`)) {
                              onDeletePlan(plan.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                          title="ลบแผนงาน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>
              แสดงทั้งหมด <strong className="text-slate-800">{filteredPlans.length}</strong> แผนงาน (จากทั้งหมด {plans.length} แผนงานในระบบ)
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> เสร็จสมบูรณ์
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> กำลังปฏิบัติงาน
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> มีแผนแล้ว
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
