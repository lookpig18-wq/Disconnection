import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Check, 
  X, 
  Building2, 
  Users, 
  Smartphone, 
  ListPlus,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Portion, Office, Contractor, Device } from '../types';

interface PortionAndRouteTabProps {
  portions: Portion[];
  offices: Office[];
  contractors: Contractor[];
  devices: Device[];
  selectedOfficeId: string;
  onAddPortion: (portion: Omit<Portion, 'id'>) => void;
  onUpdatePortion: (id: string, updated: Partial<Portion>) => void;
  onDeletePortion: (id: string) => void;
  onSelectPortionForPlan?: (portion: Portion) => void;
}

export const PortionAndRouteTab: React.FC<PortionAndRouteTabProps> = ({
  portions,
  offices,
  contractors,
  devices,
  selectedOfficeId,
  onAddPortion,
  onUpdatePortion,
  onDeletePortion,
  onSelectPortionForPlan,
}) => {
  const [isAddingPortion, setIsAddingPortion] = useState(false);
  const [editingPortionId, setEditingPortionId] = useState<string | null>(null);

  // Form State
  const [portionNumber, setPortionNumber] = useState('');
  const [portionName, setPortionName] = useState('');
  const [officeId, setOfficeId] = useState('');
  const [readingDay, setReadingDay] = useState<number>(5);
  const [routesInput, setRoutesInput] = useState<string>('');
  const [defaultContractorId, setDefaultContractorId] = useState<string>('');
  const [defaultDeviceId, setDefaultDeviceId] = useState<string>('');
  const [estimatedMeters, setEstimatedMeters] = useState<number>(350);

  // Filtered by Office
  const filteredPortions = selectedOfficeId === 'ALL'
    ? portions
    : portions.filter((p) => p.officeId === selectedOfficeId);

  const startAddPortion = () => {
    setIsAddingPortion(true);
    setEditingPortionId(null);
    const nextNum = String(portions.length + 1).padStart(2, '0');
    setPortionNumber(nextNum);
    setPortionName(`โซนพื้นที่ปฏิบัติงานพอตชั่น ${nextNum}`);
    setOfficeId(selectedOfficeId !== 'ALL' ? selectedOfficeId : (offices[0]?.id || ''));
    setReadingDay(Math.min(28, (portions.length * 3) + 2));
    setRoutesInput(`สาย 01-ถนนสายหลัก\nสาย 02-ย่านการค้า\nสาย 03-ชุมชนพัฒนา`);
    setDefaultContractorId('');
    setDefaultDeviceId('');
    setEstimatedMeters(400);
  };

  const startEditPortion = (p: Portion) => {
    setEditingPortionId(p.id);
    setIsAddingPortion(false);
    setPortionNumber(p.portionNumber);
    setPortionName(p.name);
    setOfficeId(p.officeId);
    setReadingDay(p.readingDay);
    setRoutesInput(p.routes.join('\n'));
    setDefaultContractorId(p.defaultContractorId || '');
    setDefaultDeviceId(p.defaultDeviceId || '');
    setEstimatedMeters(p.estimatedMeters || 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portionNumber.trim() || !portionName.trim()) {
      alert('กรุณากรอกหมายเลขพอตชั่นและชื่อโซน');
      return;
    }

    const cleanedRoutes = routesInput
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (cleanedRoutes.length === 0) {
      alert('กรุณาระบุสายของพอตชั่นอย่างน้อย 1 สาย (พิมพ์บรรทัดละ 1 สาย)');
      return;
    }

    if (isAddingPortion) {
      onAddPortion({
        portionNumber: portionNumber.trim(),
        name: portionName.trim(),
        officeId,
        readingDay: Number(readingDay),
        routes: cleanedRoutes,
        defaultContractorId: defaultContractorId || undefined,
        defaultDeviceId: defaultDeviceId || undefined,
        estimatedMeters: Number(estimatedMeters) || 0,
      });
      setIsAddingPortion(false);
    } else if (editingPortionId) {
      onUpdatePortion(editingPortionId, {
        portionNumber: portionNumber.trim(),
        name: portionName.trim(),
        officeId,
        readingDay: Number(readingDay),
        routes: cleanedRoutes,
        defaultContractorId: defaultContractorId || undefined,
        defaultDeviceId: defaultDeviceId || undefined,
        estimatedMeters: Number(estimatedMeters) || 0,
      });
      setEditingPortionId(null);
    }
  };

  const getOfficeName = (id: string) => {
    const o = offices.find((off) => off.id === id);
    return o ? o.name : '-';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>3. วันที่จดหน่วยแต่ละพอตชั่น & 4. สายของแต่ละพอตชั่น</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดตารางรอบวันจดหน่วยประจำเดือน (Reading Cycle) และโครงสร้างสายจดหน่วย/สายงดจ่ายไฟในแต่ละพอตชั่น
          </p>
        </div>

        {!isAddingPortion && !editingPortionId && (
          <button
            onClick={startAddPortion}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มพอตชั่นใหม่</span>
          </button>
        )}
      </div>

      {/* Form for Add/Edit Portion */}
      {(isAddingPortion || editingPortionId) && (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-emerald-300 rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>{isAddingPortion ? 'เพิ่มข้อมูลพอตชั่นและกำหนดสายใหม่' : 'แก้ไขข้อมูลพอตชั่นและสาย'}</span>
            </div>
            <button
              type="button"
              onClick={() => { setIsAddingPortion(false); setEditingPortionId(null); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                หมายเลขพอตชั่น *
              </label>
              <input
                type="text"
                value={portionNumber}
                onChange={(e) => setPortionNumber(e.target.value)}
                required
                placeholder="เช่น 01, 02, 1A"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-900 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                3. วันที่จดหน่วยประจำเดือน (1-31) *
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={readingDay}
                onChange={(e) => setReadingDay(Number(e.target.value))}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-emerald-800 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                สังกัดการไฟฟ้า *
              </label>
              <select
                value={officeId}
                onChange={(e) => setOfficeId(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:border-emerald-600"
              >
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ชื่อโซน / รายละเอียดพื้นที่ของพอตชั่นนี้ *
            </label>
            <input
              type="text"
              value={portionName}
              onChange={(e) => setPortionName(e.target.value)}
              required
              placeholder="เช่น เขตเทศบาลนคร โซนเศรษฐกิจชั้นใน"
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          {/* 4. สายของแต่ละพอตชั่น Textarea */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5">
            <label className="block text-emerald-900 font-bold mb-1 flex items-center justify-between">
              <span>4. รายการสายของพอตชั่นนี้ (พิมพ์ 1 บรรทัด = 1 สาย) *</span>
              <span className="text-[11px] font-normal text-emerald-700">สามารถกด Enter เพื่อขึ้นสายใหม่ได้</span>
            </label>
            <textarea
              rows={4}
              value={routesInput}
              onChange={(e) => setRoutesInput(e.target.value)}
              required
              placeholder="สาย 01-ถนนราษฎร์ดำเนิน&#10;สาย 02-ตลาดสดเทศบาล&#10;สาย 03-ซอยร่วมใจ"
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800 outline-none focus:border-emerald-600 leading-relaxed"
            />
          </div>

          {/* Optional Default Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-slate-600 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                ผู้รับจ้างแนะนำประจำพอตชั่นนี้ (ถ้ามี)
              </label>
              <select
                value={defaultContractorId}
                onChange={(e) => setDefaultContractorId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
              >
                <option value="">-- ไม่ระบุ --</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                เครื่องแนะนำประจำพอตชั่นนี้ (ถ้ามี)
              </label>
              <select
                value={defaultDeviceId}
                onChange={(e) => setDefaultDeviceId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 outline-none"
              >
                <option value="">-- ไม่ระบุ --</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    [{d.code}] {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => { setIsAddingPortion(false); setEditingPortionId(null); }}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกพอตชั่นและสาย</span>
            </button>
          </div>
        </form>
      )}

      {/* Portions & Routes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPortions.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            ไม่พบข้อมูลพอตชั่นในสังกัดนี้
          </div>
        ) : (
          filteredPortions.map((portion) => {
            const defaultCtr = contractors.find((c) => c.id === portion.defaultContractorId);
            const defaultDev = devices.find((d) => d.id === portion.defaultDeviceId);

            return (
              <div
                key={portion.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex flex-col justify-between overflow-hidden"
              >
                {/* Portion Top Card Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {portion.portionNumber}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs leading-tight">
                          พอตชั่น {portion.portionNumber}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {portion.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditPortion(portion)}
                        className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-slate-800 transition"
                        title="แก้ไขพอตชั่นและสาย"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`ยืนยันการลบพอตชั่น ${portion.portionNumber}?`)) {
                            onDeletePortion(portion.id);
                          }
                        }}
                        className="p-1 rounded-md text-slate-500 hover:bg-white hover:text-rose-600 transition"
                        title="ลบพอตชั่น"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 3. วันที่จดหน่วย Highlight Badge */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-md font-semibold border border-emerald-200">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>3. จดหน่วย: ทุกวันที่ <strong>{portion.readingDay}</strong></span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {getOfficeName(portion.officeId)}
                    </div>
                  </div>
                </div>

                {/* 4. สายของแต่ละพอตชั่น (Routes List) */}
                <div className="p-4 flex-1 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      4. สายในพอตชั่นนี้ ({portion.routes.length} สาย):
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {portion.routes.map((routeItem, rIdx) => (
                      <div
                        key={rIdx}
                        className="px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold shrink-0">
                          {rIdx + 1}
                        </span>
                        <span className="line-clamp-1">{routeItem}</span>
                      </div>
                    ))}
                  </div>

                  {/* Default Contractor / Device if any */}
                  {(defaultCtr || defaultDev) && (
                    <div className="pt-2 border-t border-slate-100 mt-2 space-y-1 text-[11px] text-slate-500">
                      {defaultCtr && (
                        <div className="flex items-center gap-1 text-amber-800">
                          <Users className="w-3 h-3 text-amber-600" />
                          <span>ผู้รับจ้างประจำ: <strong>[{defaultCtr.code}] {defaultCtr.name}</strong></span>
                        </div>
                      )}
                      {defaultDev && (
                        <div className="flex items-center gap-1 text-blue-800">
                          <Smartphone className="w-3 h-3 text-blue-600" />
                          <span>เครื่องประจำ: <strong>[{defaultDev.code}] {defaultDev.name}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Action */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-right">
                  <button
                    onClick={() => onSelectPortionForPlan?.(portion)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 transition"
                  >
                    <span>วางแผนงดจ่ายไฟพอตชั่นนี้</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
