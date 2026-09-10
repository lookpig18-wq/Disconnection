import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Layers, 
  Users, 
  Smartphone, 
  Calendar, 
  Building2, 
  AlertCircle,
  FileCheck,
  Check
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

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (planData: Omit<DisconnectionPlan, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  editingPlan: DisconnectionPlan | null;
  offices: Office[];
  contractors: Contractor[];
  devices: Device[];
  portions: Portion[];
  defaultOfficeId: string;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPlan,
  offices,
  contractors,
  devices,
  portions,
  defaultOfficeId,
}) => {
  // Office selection
  const [officeId, setOfficeId] = useState<string>('');
  
  // 3. Portion & Reading date
  const [portionId, setPortionId] = useState<string>('');
  const [portionNumber, setPortionNumber] = useState<string>('');
  const [readingDate, setReadingDate] = useState<string>('');
  
  // 4. Route of that portion
  const [route, setRoute] = useState<string>('');
  const [customRoute, setCustomRoute] = useState<string>('');
  const [isCustomRoute, setIsCustomRoute] = useState<boolean>(false);
  
  // 1. Contractor
  const [contractorId, setContractorId] = useState<string>('');
  const [contractorCode, setContractorCode] = useState<string>('');
  const [contractorName, setContractorName] = useState<string>('');
  
  // 2. Device
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceCode, setDeviceCode] = useState<string>('');
  const [deviceContractorName, setDeviceContractorName] = useState<string>('');
  
  // Additional Disconnection Details
  const [planCode, setPlanCode] = useState<string>('');
  const [disconnectionDate, setDisconnectionDate] = useState<string>('');
  const [targetMetersCount, setTargetMetersCount] = useState<number>(10);
  const [disconnectedCount, setDisconnectedCount] = useState<number>(0);
  const [paidBeforeCutCount, setPaidBeforeCutCount] = useState<number>(0);
  const [postponedCount, setPostponedCount] = useState<number>(0);
  const [status, setStatus] = useState<PlanStatus>('PLANNED');
  const [priority, setPriority] = useState<PlanPriority>('NORMAL');
  const [notes, setNotes] = useState<string>('');

  // Available portions for selected office
  const availablePortions = portions.filter((p) => !officeId || p.officeId === officeId);
  const availableContractors = contractors.filter((c) => !officeId || c.officeId === officeId);
  const availableDevices = devices.filter((d) => !officeId || d.officeId === officeId);

  // Available routes for currently selected portion
  const selectedPortionObj = portions.find((p) => p.id === portionId);
  const availableRoutes = selectedPortionObj ? selectedPortionObj.routes : [];

  // Reset or fill form when opening or editingPlan changes
  useEffect(() => {
    if (editingPlan) {
      setOfficeId(editingPlan.officeId);
      setPlanCode(editingPlan.planCode);
      setPortionId(editingPlan.portionId);
      setPortionNumber(editingPlan.portionNumber);
      setReadingDate(editingPlan.readingDate);
      setRoute(editingPlan.route);
      setContractorId(editingPlan.contractorId);
      setContractorCode(editingPlan.contractorCode);
      setContractorName(editingPlan.contractorName);
      setDeviceId(editingPlan.deviceId);
      setDeviceCode(editingPlan.deviceCode);
      setDeviceContractorName(editingPlan.deviceContractorName);
      setDisconnectionDate(editingPlan.disconnectionDate);
      setTargetMetersCount(editingPlan.targetMetersCount);
      setDisconnectedCount(editingPlan.disconnectedCount || 0);
      setPaidBeforeCutCount(editingPlan.paidBeforeCutCount || 0);
      setPostponedCount(editingPlan.postponedCount || 0);
      setStatus(editingPlan.status);
      setPriority(editingPlan.priority || 'NORMAL');
      setNotes(editingPlan.notes || '');
      setIsCustomRoute(false);
    } else {
      // Create new defaults
      const targetOff = defaultOfficeId && defaultOfficeId !== 'ALL' 
        ? defaultOfficeId 
        : (offices[0]?.id || '');
      setOfficeId(targetOff);

      const generatedCode = `DIS-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
      setPlanCode(generatedCode);

      // Default portion
      const defaultPortion = portions.find(p => p.officeId === targetOff) || portions[0];
      if (defaultPortion) {
        setPortionId(defaultPortion.id);
        setPortionNumber(defaultPortion.portionNumber);
        
        // Compute reading date for current month
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(defaultPortion.readingDay).padStart(2, '0');
        const rDate = `${year}-${month}-${day}`;
        setReadingDate(rDate);

        // Disconnection date (e.g. 7 days after reading)
        const dDate = new Date(today);
        dDate.setDate(defaultPortion.readingDay + 7);
        const dMonth = String(dDate.getMonth() + 1).padStart(2, '0');
        const dDay = String(dDate.getDate()).padStart(2, '0');
        setDisconnectionDate(`${dDate.getFullYear()}-${dMonth}-${dDay}`);

        setRoute(defaultPortion.routes[0] || '');
      }

      // Default contractor & device
      const defaultCtr = contractors.find(c => c.officeId === targetOff) || contractors[0];
      if (defaultCtr) {
        setContractorId(defaultCtr.id);
        setContractorCode(defaultCtr.code);
        setContractorName(defaultCtr.name);
      }

      const defaultDev = devices.find(d => d.officeId === targetOff) || devices[0];
      if (defaultDev) {
        setDeviceId(defaultDev.id);
        setDeviceCode(defaultDev.code);
        setDeviceContractorName(defaultDev.currentContractorName || defaultCtr?.name || '');
      }

      setTargetMetersCount(15);
      setDisconnectedCount(0);
      setPaidBeforeCutCount(0);
      setPostponedCount(0);
      setStatus('PLANNED');
      setPriority('NORMAL');
      setNotes('');
      setIsCustomRoute(false);
    }
  }, [editingPlan, isOpen, defaultOfficeId, offices, portions, contractors, devices]);

  // Handle portion selection change
  const handlePortionChange = (selectedId: string) => {
    setPortionId(selectedId);
    const pObj = portions.find((p) => p.id === selectedId);
    if (pObj) {
      setPortionNumber(pObj.portionNumber);
      
      // Auto-set reading date for current month
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(pObj.readingDay).padStart(2, '0');
      const rDate = `${year}-${month}-${day}`;
      setReadingDate(rDate);

      // Auto-set disconnection date (+7 days)
      const dDate = new Date(year, today.getMonth(), pObj.readingDay + 7);
      const dMonth = String(dDate.getMonth() + 1).padStart(2, '0');
      const dDay = String(dDate.getDate()).padStart(2, '0');
      setDisconnectionDate(`${dDate.getFullYear()}-${dMonth}-${dDay}`);

      // Set first route of portion
      if (pObj.routes.length > 0) {
        setRoute(pObj.routes[0]);
        setIsCustomRoute(false);
      }

      // If portion has default contractor, auto-select
      if (pObj.defaultContractorId) {
        const ctr = contractors.find((c) => c.id === pObj.defaultContractorId);
        if (ctr) {
          setContractorId(ctr.id);
          setContractorCode(ctr.code);
          setContractorName(ctr.name);
        }
      }

      // If portion has default device, auto-select
      if (pObj.defaultDeviceId) {
        const dev = devices.find((d) => d.id === pObj.defaultDeviceId);
        if (dev) {
          setDeviceId(dev.id);
          setDeviceCode(dev.code);
          setDeviceContractorName(dev.currentContractorName || contractorName);
        }
      }
    }
  };

  // Handle contractor selection change
  const handleContractorChange = (selectedId: string) => {
    setContractorId(selectedId);
    const ctr = contractors.find((c) => c.id === selectedId);
    if (ctr) {
      setContractorCode(ctr.code);
      setContractorName(ctr.name);
      
      // If there is a device assigned to this contractor, suggest it
      const dev = devices.find((d) => d.currentContractorId === ctr.id);
      if (dev) {
        setDeviceId(dev.id);
        setDeviceCode(dev.code);
        setDeviceContractorName(ctr.name);
      } else if (!deviceId) {
        setDeviceContractorName(ctr.name);
      }
    }
  };

  // Handle device selection change
  const handleDeviceChange = (selectedId: string) => {
    setDeviceId(selectedId);
    const dev = devices.find((d) => d.id === selectedId);
    if (dev) {
      setDeviceCode(dev.code);
      setDeviceContractorName(dev.currentContractorName || contractorName);
      
      // If device has an assigned contractor and user hasn't picked one
      if (dev.currentContractorId && !contractorId) {
        const ctr = contractors.find((c) => c.id === dev.currentContractorId);
        if (ctr) {
          setContractorId(ctr.id);
          setContractorCode(ctr.code);
          setContractorName(ctr.name);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoute = isCustomRoute ? customRoute.trim() : route;
    if (!finalRoute) {
      alert('กรุณาระบุสายของพอตชั่น');
      return;
    }
    if (!contractorName || !contractorCode) {
      alert('กรุณาระบุชื่อและรหัสผู้รับจ้าง');
      return;
    }
    if (!deviceCode) {
      alert('กรุณาระบุรหัสเครื่อง');
      return;
    }

    const payload: Omit<DisconnectionPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      planCode: planCode || `DIS-${Date.now().toString().slice(-4)}`,
      officeId,
      portionId,
      portionNumber,
      readingDate,
      route: finalRoute,
      contractorId,
      contractorCode,
      contractorName,
      deviceId,
      deviceCode,
      deviceContractorName: deviceContractorName || contractorName,
      disconnectionDate,
      targetMetersCount: Number(targetMetersCount) || 0,
      disconnectedCount: Number(disconnectedCount) || 0,
      paidBeforeCutCount: Number(paidBeforeCutCount) || 0,
      postponedCount: Number(postponedCount) || 0,
      status,
      priority,
      notes,
    };

    onSave(payload, editingPlan ? editingPlan.id : undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {editingPlan ? 'แก้ไขแผนงานงดจ่ายไฟ' : 'สร้างแผนงานงดจ่ายไฟใหม่'}
              </h3>
              <p className="text-xs text-purple-200">
                กรอกข้อมูลผู้รับจ้าง เครื่อง วันที่จดหน่วย และสายของแต่ละพอตชั่น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Section: สังกัดการไฟฟ้า และ รหัสแผนงาน */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                สำนักงานการไฟฟ้า (ต้นสังกัด / ในสังกัด) *
              </label>
              <select
                value={officeId}
                onChange={(e) => setOfficeId(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-purple-600"
              >
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.type === 'PRIMARY' ? '⚡ [ต้นสังกัด] ' : '🔌 [ในสังกัด] '}
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                รหัสแผนงาน / เลขที่ใบสั่งงาน *
              </label>
              <input
                type="text"
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value)}
                required
                placeholder="เช่น DIS-6709-001"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-medium text-slate-800 outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Section: 3. วันที่จดหน่วยแต่ละพอตชั่น และ 4. สายของแต่ละพอตชั่น */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold border-b border-emerald-200 pb-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>3. ข้อมูลพอตชั่น / วันที่จดหน่วย และ 4. สายของแต่ละพอตชั่น</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Portion Dropdown */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  เลือกพอตชั่น *
                </label>
                <select
                  value={portionId}
                  onChange={(e) => handlePortionChange(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-emerald-600"
                >
                  <option value="">-- เลือกพอตชั่น --</option>
                  {availablePortions.map((p) => (
                    <option key={p.id} value={p.id}>
                      พอตชั่น {p.portionNumber} ({p.name} - จดหน่วยวันที่ {p.readingDay})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. วันที่จดหน่วย */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  3. วันที่จดหน่วยของพอตชั่นนี้ *
                </label>
                <input
                  type="date"
                  value={readingDate}
                  onChange={(e) => setReadingDate(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 4. สายของแต่ละพอตชั่น */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">
                  4. สายของพอตชั่นนี้ (Route / Feeder) *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomRoute(!isCustomRoute)}
                  className="text-[11px] text-emerald-700 hover:underline font-medium"
                >
                  {isCustomRoute ? '← เลือกจากรายการสายมาตรฐาน' : '+ พิมพ์สายระบุเอง'}
                </button>
              </div>

              {isCustomRoute ? (
                <input
                  type="text"
                  value={customRoute}
                  onChange={(e) => setCustomRoute(e.target.value)}
                  placeholder="พิมพ์ชื่อสาย เช่น สาย 05-ซอยมังกรทอง"
                  required={isCustomRoute}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-emerald-600"
                />
              ) : (
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  required={!isCustomRoute}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-emerald-600"
                >
                  {availableRoutes.length === 0 ? (
                    <option value="">-- ยังไม่มีสายในพอตชั่นนี้ กรุณาพิมพ์ระบุเอง --</option>
                  ) : (
                    availableRoutes.map((r, idx) => (
                      <option key={idx} value={r}>
                        {r}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Section: 1. ผู้รับจ้าง และ 2. เครื่อง */}
          <div className="border border-amber-200 bg-amber-50/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold border-b border-amber-200 pb-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>1. ชื่อและรหัสผู้รับจ้าง & 2. เครื่อง (ชื่อผู้รับจ้างเครื่องนั้นๆ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. ผู้รับจ้าง Dropdown */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  1. เลือกผู้รับจ้างปฏิบัติงาน *
                </label>
                <select
                  value={contractorId}
                  onChange={(e) => handleContractorChange(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-amber-600"
                >
                  <option value="">-- เลือกผู้รับจ้าง --</option>
                  {availableContractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[11px] text-slate-500">รหัส: <strong>{contractorCode || '-'}</strong></span>
                  <span className="text-[11px] text-slate-500">| ชื่อ: <strong>{contractorName || '-'}</strong></span>
                </div>
              </div>

              {/* 2. เครื่อง Dropdown */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  2. เครื่อง (รหัส & ชื่อผู้รับจ้างเครื่องนั้นๆ) *
                </label>
                <select
                  value={deviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="">-- เลือกเครื่องปฏิบัติงาน --</option>
                  {availableDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.code}] {d.name} {d.currentContractorName ? `(ผู้ถือ: ${d.currentContractorName})` : ''}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-600 mt-1.5">
                  ผู้รับจ้างประจำเครื่อง: <strong className="text-blue-800">{deviceContractorName || contractorName || '-'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section: วันที่งดจ่ายไฟ / ยอดเป้าหมาย / สถานะ */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5">
              กำหนดการปฏิบัติงานงดจ่ายไฟภาคสนาม
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  วันที่ดำเนินการงดจ่ายไฟ *
                </label>
                <input
                  type="date"
                  value={disconnectionDate}
                  onChange={(e) => setDisconnectionDate(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  จำนวนรายเป้าหมาย (ราย) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={targetMetersCount}
                  onChange={(e) => setTargetMetersCount(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  สถานะแผนงาน
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PlanStatus)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium text-slate-800 outline-none focus:border-purple-600"
                >
                  <option value="DRAFT">ฉบับร่าง (Draft)</option>
                  <option value="PLANNED">มีแผนแล้ว (Planned)</option>
                  <option value="IN_PROGRESS">กำลังปฏิบัติงาน (In Progress)</option>
                  <option value="COMPLETED">เสร็จสมบูรณ์ (Completed)</option>
                  <option value="POSTPONED">ผ่อนผัน/เลื่อน (Postponed)</option>
                  <option value="CANCELLED">ยกเลิก (Cancelled)</option>
                </select>
              </div>
            </div>

            {/* Results Counters if In Progress / Completed */}
            {(status === 'IN_PROGRESS' || status === 'COMPLETED' || editingPlan) && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-rose-700 font-semibold mb-1">
                    จำนวนตัดไฟแล้ว (ราย)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={disconnectedCount}
                    onChange={(e) => setDisconnectedCount(Number(e.target.value))}
                    className="w-full bg-white border border-rose-200 rounded-lg p-2 font-medium text-rose-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-emerald-700 font-semibold mb-1">
                    ชำระก่อนตัดไฟ (ราย)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paidBeforeCutCount}
                    onChange={(e) => setPaidBeforeCutCount(Number(e.target.value))}
                    className="w-full bg-white border border-emerald-200 rounded-lg p-2 font-medium text-emerald-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-orange-700 font-semibold mb-1">
                    ผ่อนผัน/เลื่อน (ราย)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={postponedCount}
                    onChange={(e) => setPostponedCount(Number(e.target.value))}
                    className="w-full bg-white border border-orange-200 rounded-lg p-2 font-medium text-orange-800 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                หมายเหตุ / คำแนะนำภาคสนาม
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น ผู้ใช้ไฟรายใหญ่, มีสุนัขดุ, ประสานงาน รปภ. ก่อนเข้าพื้นที่"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>{editingPlan ? 'บันทึกการแก้ไข' : 'บันทึกแผนงาน'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
