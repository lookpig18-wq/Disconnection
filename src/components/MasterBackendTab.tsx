import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Building2, 
  Users, 
  Smartphone, 
  Layers, 
  Calendar, 
  Compass, 
  Search, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { Office, Contractor, Device, Portion, DisconnectionPlan } from '../types';

interface MasterBackendTabProps {
  offices: Office[];
  contractors: Contractor[];
  devices: Device[];
  portions: Portion[];
  selectedOfficeId: string;
  onOpenNewPlanWithPrefill: (prefill: {
    officeId: string;
    contractorId: string;
    deviceId: string;
    portionId: string;
    portionNumber: string;
    route: string;
    readingDay: number;
  }) => void;
  onOpenOfficeManager: () => void;
}

export const MasterBackendTab: React.FC<MasterBackendTabProps> = ({
  offices,
  contractors,
  devices,
  portions,
  selectedOfficeId,
  onOpenNewPlanWithPrefill,
  onOpenOfficeManager,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PRIMARY' | 'SUB_OFFICE'>('ALL');

  // Build the master unified matrix rows
  // A master matrix row combines: Office + Portion + Reading Day + Route + Assigned Contractor + Assigned Device
  const masterRows = useMemo(() => {
    const rows: Array<{
      id: string;
      office: Office;
      portion: Portion;
      route: string;
      contractor?: Contractor;
      device?: Device;
    }> = [];

    portions.forEach((portion) => {
      const office = offices.find((o) => o.id === portion.officeId);
      if (!office) return;

      // Contractor assigned to this portion or office
      const contractor = contractors.find((c) => c.id === portion.defaultContractorId) || 
                         contractors.find((c) => c.officeId === portion.officeId);

      // Device assigned to this portion or contractor
      const device = devices.find((d) => d.id === portion.defaultDeviceId) || 
                     (contractor ? devices.find((d) => d.currentContractorId === contractor.id) : undefined) ||
                     devices.find((d) => d.officeId === portion.officeId);

      portion.routes.forEach((route, rIndex) => {
        rows.push({
          id: `${portion.id}-${rIndex}`,
          office,
          portion,
          route,
          contractor,
          device,
        });
      });
    });

    return rows;
  }, [offices, contractors, devices, portions]);

  // Filter master rows
  const filteredRows = useMemo(() => {
    return masterRows.filter((row) => {
      // Office selection filter
      if (selectedOfficeId !== 'ALL' && row.office.id !== selectedOfficeId) {
        return false;
      }
      // Office type filter
      if (filterType !== 'ALL' && row.office.type !== filterType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchOffice = (row.office.name + ' ' + row.office.code).toLowerCase().includes(q);
        const matchPortion = (row.portion.portionNumber + ' ' + row.portion.name).toLowerCase().includes(q);
        const matchRoute = row.route.toLowerCase().includes(q);
        const matchCtr = row.contractor ? (row.contractor.name + ' ' + row.contractor.code).toLowerCase().includes(q) : false;
        const matchDev = row.device ? (row.device.name + ' ' + row.device.code).toLowerCase().includes(q) : false;
        if (!matchOffice && !matchPortion && !matchRoute && !matchCtr && !matchDev) {
          return false;
        }
      }
      return true;
    });
  }, [masterRows, selectedOfficeId, filterType, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-800 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            <Database className="w-6 h-6 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded font-bold text-xs">
                Master Database Matrix
              </span>
              <span className="text-xs text-slate-500 font-medium">
                โครงสร้างข้อมูลหลักหลังบ้าน
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5 tracking-tight">
              ตารางข้อมูลหลักความสัมพันธ์: การไฟฟ้า ↔ ผู้รับจ้าง ↔ เครื่อง ↔ วันที่จดหน่วย ↔ พอตชั่น ↔ สาย
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ฐานข้อมูลกลางสำหรับตรวจสอบว่าแต่ละการไฟฟ้ามีผู้รับจ้างรหัส/ชื่ออะไร ใช้เครื่องรหัสใด จดหน่วยวันที่เท่าไหร่ และมีสายใดในแต่ละพอตชั่น
            </p>
          </div>
        </div>

        {/* Quick Office Manager trigger */}
        <button
          onClick={onOpenOfficeManager}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition shrink-0"
        >
          <Building2 className="w-4 h-4 text-purple-700" />
          <span>จัดการสังกัดการไฟฟ้า</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base">{offices.length} <span className="text-xs font-normal text-slate-500">แห่ง</span></div>
            <div className="text-[11px] text-slate-500">การไฟฟ้าต้นสังกัด/ในสังกัด</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base">{contractors.length} <span className="text-xs font-normal text-slate-500">ราย</span></div>
            <div className="text-[11px] text-slate-500">ผู้รับจ้างประจำการ</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base">{devices.length} <span className="text-xs font-normal text-slate-500">เครื่อง</span></div>
            <div className="text-[11px] text-slate-500">เครื่องบันทึก/Smart POS</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base">{masterRows.length} <span className="text-xs font-normal text-slate-500">สาย</span></div>
            <div className="text-[11px] text-slate-500">โครงสร้างสายทั้งหมด</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">กรองประเภทการไฟฟ้า:</span>
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterType('PRIMARY')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                filterType === 'PRIMARY' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              ⚡ ไฟฟ้าต้นสังกัด
            </button>
            <button
              onClick={() => setFilterType('SUB_OFFICE')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                filterType === 'SUB_OFFICE' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              🔌 ไฟฟ้าในสังกัด
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อการไฟฟ้า, รหัสผู้รับจ้าง, พอตชั่น, สาย..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-purple-600 text-xs"
          />
        </div>
      </div>

      {/* Main Master Mapping Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <th className="py-3 px-3.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-purple-700" />
                    การไฟฟ้า (สำนักงานสังกัด)
                  </span>
                </th>
                <th className="py-3 px-3.5">
                  <span className="flex items-center gap-1 text-amber-900">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    1. ชื่อ & รหัสผู้รับจ้าง
                  </span>
                </th>
                <th className="py-3 px-3.5">
                  <span className="flex items-center gap-1 text-blue-900">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    2. เครื่อง (ผู้รับจ้างเครื่องนั้นๆ)
                  </span>
                </th>
                <th className="py-3 px-3.5">
                  <span className="flex items-center gap-1 text-emerald-900">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    3. พอตชั่น & วันที่จดหน่วย
                  </span>
                </th>
                <th className="py-3 px-3.5">
                  <span className="flex items-center gap-1 text-indigo-900">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    4. สายของพอตชั่น
                  </span>
                </th>
                <th className="py-3 px-3.5 text-right">
                  การปฏิบัติงาน
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    ไม่พบข้อมูลความสัมพันธ์ที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  return (
                    <tr key={row.id} className="hover:bg-purple-50/40 transition group">
                      
                      {/* Office */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-bold text-slate-900">
                          {row.office.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {row.office.code}
                        </div>
                        <div className="mt-1">
                          {row.office.type === 'PRIMARY' ? (
                            <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded inline-block">
                              ⚡ ต้นสังกัด
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded inline-block">
                              🔌 ในสังกัด
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 1. ผู้รับจ้าง (รหัส & ชื่อ) */}
                      <td className="py-3 px-3.5 align-top">
                        {row.contractor ? (
                          <div>
                            <div className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono font-bold text-[11px]">
                              {row.contractor.code}
                            </div>
                            <div className="font-semibold text-slate-900 mt-1">
                              {row.contractor.name}
                            </div>
                            {row.contractor.phone && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                โทร: {row.contractor.phone}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">-- ยังไม่ได้ระบุผู้รับจ้าง --</div>
                        )}
                      </td>

                      {/* 2. เครื่อง (รหัสเครื่อง & ผู้รับจ้างเครื่องนั้นๆ) */}
                      <td className="py-3 px-3.5 align-top">
                        {row.device ? (
                          <div>
                            <div className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-mono font-bold text-[11px]">
                              {row.device.code}
                            </div>
                            <div className="text-slate-800 text-[11px] mt-1 font-medium">
                              {row.device.name}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              ผู้ถือ: <strong>{row.device.currentContractorName || (row.contractor ? row.contractor.name : '-')}</strong>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">-- ยังไม่มีเครื่องประจำ --</div>
                        )}
                      </td>

                      {/* 3. พอตชั่น & วันที่จดหน่วย */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-900 rounded font-bold border border-emerald-200">
                          พอตชั่น {row.portion.portionNumber}
                        </div>
                        <div className="text-slate-700 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          <span>จดหน่วย: <strong>ทุกวันที่ {row.portion.readingDay}</strong></span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {row.portion.name}
                        </div>
                      </td>

                      {/* 4. สายของพอตชั่น */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200 max-w-xs">
                          {row.route}
                        </div>
                      </td>

                      {/* Quick Action: วางแผนงดจ่ายไฟ */}
                      <td className="py-3 px-3.5 align-top text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            onOpenNewPlanWithPrefill({
                              officeId: row.office.id,
                              contractorId: row.contractor?.id || '',
                              deviceId: row.device?.id || '',
                              portionId: row.portion.id,
                              portionNumber: row.portion.portionNumber,
                              route: row.route,
                              readingDay: row.portion.readingDay,
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold transition shadow-2xs"
                          title="สร้างแผนงานงดตัดไฟด้วยข้อมูลชุดนี้"
                        >
                          <span>วางแผนงานงดตัด</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            แสดงทั้งหมด <strong>{filteredRows.length}</strong> แถวข้อมูลความสัมพันธ์โครงสร้างหลังบ้าน
          </div>
          <div className="text-[11px] text-slate-400">
            ระบบเชื่อมโยงข้อมูลอัตโนมัติพร้อมสำหรับการวางแผนงานประจำวัน
          </div>
        </div>
      </div>

    </div>
  );
};
