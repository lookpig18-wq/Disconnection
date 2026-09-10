import React, { useState } from 'react';
import { useDataStore } from './hooks/useDataStore';
import { Header, AppTabType } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { DailyWorkloadTab } from './components/DailyWorkloadTab';
import { PlanManagementTab } from './components/PlanManagementTab';
import { MasterBackendTab } from './components/MasterBackendTab';
import { ContractorAndDeviceTab } from './components/ContractorAndDeviceTab';
import { PortionAndRouteTab } from './components/PortionAndRouteTab';
import { PlanFormModal } from './components/PlanFormModal';
import { OfficeManagerModal } from './components/OfficeManagerModal';
import { WorkOrderPrintModal } from './components/WorkOrderPrintModal';
import { DataBackupModal } from './components/DataBackupModal';
import { DisconnectionPlan, Portion, PlanStatus } from './types';

export default function App() {
  const {
    offices,
    contractors,
    devices,
    portions,
    plans,
    addOffice,
    updateOffice,
    deleteOffice,
    addContractor,
    updateContractor,
    deleteContractor,
    addDevice,
    updateDevice,
    deleteDevice,
    addPortion,
    updatePortion,
    deletePortion,
    addPlan,
    updatePlan,
    deletePlan,
    resetToDefault,
    importAllData,
  } = useDataStore();

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<AppTabType>('daily');
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<DisconnectionPlan | null>(null);

  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printingPlan, setPrintingPlan] = useState<DisconnectionPlan | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  // Handlers for plans
  const handleOpenNewPlan = () => {
    setEditingPlan(null);
    setIsPlanModalOpen(true);
  };

  const handleEditPlan = (plan: DisconnectionPlan) => {
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (planData: Omit<DisconnectionPlan, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => {
    if (id) {
      updatePlan(id, planData);
    } else {
      addPlan(planData);
    }
  };

  const handlePrintPlan = (plan: DisconnectionPlan) => {
    setPrintingPlan(plan);
    setIsPrintModalOpen(true);
  };

  const handleUpdatePlanStatus = (id: string, status: PlanStatus) => {
    updatePlan(id, { status });
  };

  const handleUpdatePlanMetrics = (
    id: string, 
    metrics: { disconnectedCount?: number; paidBeforeCutCount?: number; postponedCount?: number }
  ) => {
    updatePlan(id, metrics);
  };

  // Quick plan create with prefilled master information
  const handleOpenNewPlanWithPrefill = (prefill: {
    officeId: string;
    contractorId: string;
    deviceId: string;
    portionId: string;
    portionNumber: string;
    route: string;
    readingDay: number;
  }) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(prefill.readingDay).padStart(2, '0');
    const rDate = `${year}-${month}-${day}`;

    const dDate = new Date(today);
    dDate.setDate(prefill.readingDay + 7);
    const dMonth = String(dDate.getMonth() + 1).padStart(2, '0');
    const dDay = String(dDate.getDate()).padStart(2, '0');

    const ctr = contractors.find((c) => c.id === prefill.contractorId) || contractors[0];
    const dev = devices.find((d) => d.id === prefill.deviceId) || devices[0];

    const newDraftPlan: DisconnectionPlan = {
      id: `draft-${Date.now()}`,
      planCode: `DIS-${year.toString().slice(-2)}${month}-${String(Math.floor(Math.random() * 900) + 100)}`,
      officeId: prefill.officeId,
      portionId: prefill.portionId,
      portionNumber: prefill.portionNumber,
      readingDate: rDate,
      route: prefill.route,
      contractorId: ctr?.id || '',
      contractorCode: ctr?.code || '',
      contractorName: ctr?.name || '',
      deviceId: dev?.id || '',
      deviceCode: dev?.code || '',
      deviceContractorName: dev?.currentContractorName || ctr?.name || '',
      disconnectionDate: `${dDate.getFullYear()}-${dMonth}-${dDay}`,
      targetMetersCount: 15,
      disconnectedCount: 0,
      paidBeforeCutCount: 0,
      postponedCount: 0,
      status: 'PLANNED',
      priority: 'NORMAL',
      notes: `สร้างจากข้อมูลหลักหลังบ้าน พอตชั่น ${prefill.portionNumber} สาย ${prefill.route}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingPlan(newDraftPlan);
    setIsPlanModalOpen(true);
  };

  // Quick plan create from a portion card
  const handleSelectPortionForPlan = (portion: Portion) => {
    handleOpenNewPlanWithPrefill({
      officeId: portion.officeId,
      contractorId: portion.defaultContractorId || '',
      deviceId: portion.defaultDeviceId || '',
      portionId: portion.id,
      portionNumber: portion.portionNumber,
      route: portion.routes[0] || 'สาย 01',
      readingDay: portion.readingDay,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-purple-200">
      
      {/* Top Header */}
      <Header
        offices={offices}
        selectedOfficeId={selectedOfficeId}
        onSelectOffice={setSelectedOfficeId}
        onOpenNewPlan={handleOpenNewPlan}
        onOpenOfficeManager={() => setIsOfficeModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Dashboard Overview Cards */}
        <DashboardOverview
          plans={plans}
          offices={offices}
          contractors={contractors}
          devices={devices}
          portions={portions}
          selectedOfficeId={selectedOfficeId}
        />

        {/* Tab 1: Daily Workload & Remaining Tracker */}
        {activeTab === 'daily' && (
          <DailyWorkloadTab
            plans={plans}
            offices={offices}
            contractors={contractors}
            devices={devices}
            portions={portions}
            selectedOfficeId={selectedOfficeId}
            onOpenNewPlan={handleOpenNewPlan}
            onEditPlan={handleEditPlan}
            onUpdatePlanStatus={handleUpdatePlanStatus}
            onPrintPlan={handlePrintPlan}
            onUpdatePlanMetrics={handleUpdatePlanMetrics}
          />
        )}

        {/* Tab 2: All Plans Management */}
        {activeTab === 'plans' && (
          <PlanManagementTab
            plans={plans}
            offices={offices}
            contractors={contractors}
            devices={devices}
            portions={portions}
            selectedOfficeId={selectedOfficeId}
            searchQuery={searchQuery}
            onOpenNewPlan={handleOpenNewPlan}
            onEditPlan={handleEditPlan}
            onDeletePlan={deletePlan}
            onUpdatePlanStatus={handleUpdatePlanStatus}
            onPrintPlan={handlePrintPlan}
          />
        )}

        {/* Tab 3: Master Backend Matrix (ข้อมูลหลักหลังบ้าน) */}
        {activeTab === 'master' && (
          <MasterBackendTab
            offices={offices}
            contractors={contractors}
            devices={devices}
            portions={portions}
            selectedOfficeId={selectedOfficeId}
            onOpenNewPlanWithPrefill={handleOpenNewPlanWithPrefill}
            onOpenOfficeManager={() => setIsOfficeModalOpen(true)}
          />
        )}

        {/* Tab 4: 1. Contractor (ผู้รับจ้าง) & 2. Device (เครื่อง) */}
        {activeTab === 'contractors-devices' && (
          <ContractorAndDeviceTab
            contractors={contractors}
            devices={devices}
            offices={offices}
            selectedOfficeId={selectedOfficeId}
            onAddContractor={addContractor}
            onUpdateContractor={updateContractor}
            onDeleteContractor={deleteContractor}
            onAddDevice={addDevice}
            onUpdateDevice={updateDevice}
            onDeleteDevice={deleteDevice}
          />
        )}

        {/* Tab 5: 3. Portion & Reading Day & 4. Route (สายของแต่ละพอตชั่น) */}
        {activeTab === 'portions-routes' && (
          <PortionAndRouteTab
            portions={portions}
            offices={offices}
            contractors={contractors}
            devices={devices}
            selectedOfficeId={selectedOfficeId}
            onAddPortion={addPortion}
            onUpdatePortion={updatePortion}
            onDeletePortion={deletePortion}
            onSelectPortionForPlan={handleSelectPortionForPlan}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ระบบวางแผนงานงดจ่ายไฟ (Power Disconnection Work Planner) • รองรับไฟฟ้าต้นสังกัดและไฟฟ้าในสังกัด
          </div>
          <div className="text-slate-400">
            ครอบคลุม 4 หัวข้อ: 1. ผู้รับจ้าง | 2. เครื่อง | 3. วันที่จดหน่วยพอตชั่น | 4. สายของพอตชั่น
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PlanFormModal
        isOpen={isPlanModalOpen}
        onClose={() => { setIsPlanModalOpen(false); setEditingPlan(null); }}
        onSave={handleSavePlan}
        editingPlan={editingPlan}
        offices={offices}
        contractors={contractors}
        devices={devices}
        portions={portions}
        defaultOfficeId={selectedOfficeId}
      />

      <OfficeManagerModal
        isOpen={isOfficeModalOpen}
        onClose={() => setIsOfficeModalOpen(false)}
        offices={offices}
        onAddOffice={addOffice}
        onUpdateOffice={updateOffice}
        onDeleteOffice={deleteOffice}
      />

      <WorkOrderPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => { setIsPrintModalOpen(false); setPrintingPlan(null); }}
        plan={printingPlan}
        offices={offices}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        offices={offices}
        contractors={contractors}
        devices={devices}
        portions={portions}
        plans={plans}
        onResetToDefault={resetToDefault}
        onImportData={importAllData}
      />

    </div>
  );
}
