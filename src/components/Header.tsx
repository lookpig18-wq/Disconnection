import React from 'react';
import { 
  Building2, 
  Zap, 
  PlusCircle, 
  Download, 
  Search,
  Users, 
  Smartphone, 
  Layers, 
  CalendarDays,
  CalendarCheck,
  Database,
  Clock
} from 'lucide-react';
import { Office } from '../types';

export type AppTabType = 'daily' | 'plans' | 'master' | 'contractors-devices' | 'portions-routes';

interface HeaderProps {
  offices: Office[];
  selectedOfficeId: string;
  onSelectOffice: (id: string) => void;
  onOpenNewPlan: () => void;
  onOpenOfficeManager: () => void;
  onOpenBackup: () => void;
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  offices,
  selectedOfficeId,
  onSelectOffice,
  onOpenNewPlan,
  onOpenOfficeManager,
  onOpenBackup,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  const primaryOffices = offices.filter((o) => o.type === 'PRIMARY');
  const subOffices = offices.filter((o) => o.type === 'SUB_OFFICE');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-200 shrink-0">
              <Zap className="w-6 h-6 fill-amber-300 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  ระบบวางแผนงานงดจ่ายไฟ
                </h1>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-medium border border-purple-200">
                  Power Disconnection Planner
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                บริหารจัดการไฟฟ้าต้นสังกัด • ไฟฟ้าในสังกัด • ผู้รับจ้าง • เครื่อง • วันที่จดหน่วย • พอตชั่นและสาย
              </p>
            </div>
          </div>

          {/* Quick Actions & Office Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Office Filter Dropdown */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
              <Building2 className="w-4 h-4 text-slate-500 ml-1 mr-1.5" />
              <select
                id="office-selector"
                value={selectedOfficeId}
                onChange={(e) => onSelectOffice(e.target.value)}
                aria-label="เลือกสำนักงานการไฟฟ้า"
                className="bg-transparent text-slate-800 font-medium py-1 pr-2 outline-none cursor-pointer text-xs"
              >
                <option value="ALL">🏢 ทุกสังกัด (แสดงทั้งหมด)</option>
                <optgroup label="⚡ ไฟฟ้าต้นสังกัด (Primary)">
                  {primaryOffices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🔌 ไฟฟ้าในสังกัด (Sub-Offices)">
                  {subOffices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Manage Offices Button */}
            <button
              id="btn-manage-offices"
              onClick={onOpenOfficeManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition"
              title="จัดการข้อมูลไฟฟ้าต้นสังกัดและในสังกัด"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>สังกัดการไฟฟ้า ({offices.length})</span>
            </button>

            {/* Backup / Export Button */}
            <button
              id="btn-backup"
              onClick={onOpenBackup}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition"
              title="สำรองข้อมูล / ส่งออก"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">สำรองข้อมูล</span>
            </button>

            {/* Create New Plan Button */}
            <button
              id="btn-new-plan"
              onClick={onOpenNewPlan}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs shadow-purple-300 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ สร้างแผนงดจ่ายไฟ</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-2 pb-2 gap-2">
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            
            {/* Tab 1: Daily Workload & Remaining Tracker */}
            <button
              id="nav-tab-daily"
              onClick={() => setActiveTab('daily')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'daily'
                  ? 'bg-purple-700 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CalendarCheck className={`w-4 h-4 ${activeTab === 'daily' ? 'text-amber-300' : 'text-purple-600'}`} />
              <span>งานประจำวัน & ติดตามคงเหลือ</span>
            </button>

            {/* Tab 2: All Plans Management */}
            <button
              id="nav-tab-plans"
              onClick={() => setActiveTab('plans')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'plans'
                  ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-purple-600" />
              <span>แผนงานทั้งหมด ({offices.length > 0 ? 'Plans' : ''})</span>
            </button>

            {/* Tab 3: Master Matrix (ข้อมูลหลังบ้าน) */}
            <button
              id="nav-tab-master"
              onClick={() => setActiveTab('master')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'master'
                  ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>ข้อมูลหลักหลังบ้าน (Master Matrix)</span>
            </button>

            {/* Tab 4: Contractors & Devices */}
            <button
              id="nav-tab-contractors-devices"
              onClick={() => setActiveTab('contractors-devices')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'contractors-devices'
                  ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>1. ผู้รับจ้าง & 2. เครื่อง</span>
            </button>

            {/* Tab 5: Portions & Routes */}
            <button
              id="nav-tab-portions-routes"
              onClick={() => setActiveTab('portions-routes')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'portions-routes'
                  ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>3. พอตชั่น (วันจด) & 4. สาย</span>
            </button>
          </nav>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="quick-search-input"
              type="text"
              placeholder="ค้นหาด่วน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-purple-600 focus:border-purple-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
