import { useState, useEffect } from 'react';
import { Office, Contractor, Device, Portion, DisconnectionPlan } from '../types';
import {
  INITIAL_OFFICES,
  INITIAL_CONTRACTORS,
  INITIAL_DEVICES,
  INITIAL_PORTIONS,
  INITIAL_PLANS,
} from '../data/initialData';

const STORAGE_KEYS = {
  OFFICES: 'pea_planner_offices_v1',
  CONTRACTORS: 'pea_planner_contractors_v1',
  DEVICES: 'pea_planner_devices_v1',
  PORTIONS: 'pea_planner_portions_v1',
  PLANS: 'pea_planner_plans_v1',
};

export function useDataStore() {
  const [offices, setOffices] = useState<Office[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFICES);
      return saved ? JSON.parse(saved) : INITIAL_OFFICES;
    } catch {
      return INITIAL_OFFICES;
    }
  });

  const [contractors, setContractors] = useState<Contractor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTRACTORS);
      return saved ? JSON.parse(saved) : INITIAL_CONTRACTORS;
    } catch {
      return INITIAL_CONTRACTORS;
    }
  });

  const [devices, setDevices] = useState<Device[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
      return saved ? JSON.parse(saved) : INITIAL_DEVICES;
    } catch {
      return INITIAL_DEVICES;
    }
  });

  const [portions, setPortions] = useState<Portion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PORTIONS);
      return saved ? JSON.parse(saved) : INITIAL_PORTIONS;
    } catch {
      return INITIAL_PORTIONS;
    }
  });

  const [plans, setPlans] = useState<DisconnectionPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
      return saved ? JSON.parse(saved) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFICES, JSON.stringify(offices));
    } catch (e) {
      console.error('Failed to save offices', e);
    }
  }, [offices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify(contractors));
    } catch (e) {
      console.error('Failed to save contractors', e);
    }
  }, [contractors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
    } catch (e) {
      console.error('Failed to save devices', e);
    }
  }, [devices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PORTIONS, JSON.stringify(portions));
    } catch (e) {
      console.error('Failed to save portions', e);
    }
  }, [portions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    } catch (e) {
      console.error('Failed to save plans', e);
    }
  }, [plans]);

  // Office Actions (ไฟฟ้าต้นสังกัด และ ไฟฟ้าในสังกัด)
  const addOffice = (office: Omit<Office, 'id'>) => {
    const newOffice: Office = {
      ...office,
      id: `off-${Date.now()}`,
    };
    setOffices((prev) => [...prev, newOffice]);
    return newOffice;
  };

  const updateOffice = (id: string, updated: Partial<Office>) => {
    setOffices((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updated } : o))
    );
  };

  const deleteOffice = (id: string) => {
    setOffices((prev) => prev.filter((o) => o.id !== id));
  };

  // Contractor Actions (1. ชื่อและรหัสผู้รับจ้าง)
  const addContractor = (contractor: Omit<Contractor, 'id'>) => {
    const newContractor: Contractor = {
      ...contractor,
      id: `ctr-${Date.now()}`,
    };
    setContractors((prev) => [...prev, newContractor]);
    return newContractor;
  };

  const updateContractor = (id: string, updated: Partial<Contractor>) => {
    setContractors((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updated } : c));
      // If name or code updated, update associated devices & plans
      const target = next.find((c) => c.id === id);
      if (target) {
        setDevices((dPrev) =>
          dPrev.map((d) =>
            d.currentContractorId === id
              ? { ...d, currentContractorName: target.name }
              : d
          )
        );
      }
      return next;
    });
  };

  const deleteContractor = (id: string) => {
    setContractors((prev) => prev.filter((c) => c.id !== id));
    // Clear from devices
    setDevices((prev) =>
      prev.map((d) =>
        d.currentContractorId === id
          ? { ...d, currentContractorId: undefined, currentContractorName: undefined }
          : d
      )
    );
  };

  // Device Actions (2. เครื่อง และชื่อผู้รับจ้างเครื่องนั้นๆ)
  const addDevice = (device: Omit<Device, 'id'>) => {
    const contractor = contractors.find((c) => c.id === device.currentContractorId);
    const newDevice: Device = {
      ...device,
      id: `dev-${Date.now()}`,
      currentContractorName: contractor ? contractor.name : (device.currentContractorName || ''),
    };
    setDevices((prev) => [...prev, newDevice]);
    return newDevice;
  };

  const updateDevice = (id: string, updated: Partial<Device>) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        let cName = d.currentContractorName;
        if (updated.currentContractorId !== undefined) {
          const contractor = contractors.find((c) => c.id === updated.currentContractorId);
          cName = contractor ? contractor.name : '';
        }
        return {
          ...d,
          ...updated,
          currentContractorName: cName,
        };
      })
    );
  };

  const deleteDevice = (id: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  // Portion Actions (3. วันที่จดหน่วยแต่ละพอตชั่น และ 4. สายของแต่ละพอตชั่น)
  const addPortion = (portion: Omit<Portion, 'id'>) => {
    const newPortion: Portion = {
      ...portion,
      id: `por-${Date.now()}`,
    };
    setPortions((prev) => [...prev, newPortion]);
    return newPortion;
  };

  const updatePortion = (id: string, updated: Partial<Portion>) => {
    setPortions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deletePortion = (id: string) => {
    setPortions((prev) => prev.filter((p) => p.id !== id));
  };

  // Plan Actions (วางแผนงานงดจ่ายไฟ)
  const addPlan = (plan: Omit<DisconnectionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPlan: DisconnectionPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  };

  const updatePlan = (id: string, updated: Partial<DisconnectionPlan>) => {
    const now = new Date().toISOString();
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: now } : p))
    );
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const resetToDefault = () => {
    setOffices(INITIAL_OFFICES);
    setContractors(INITIAL_CONTRACTORS);
    setDevices(INITIAL_DEVICES);
    setPortions(INITIAL_PORTIONS);
    setPlans(INITIAL_PLANS);
    localStorage.clear();
  };

  const importAllData = (data: {
    offices?: Office[];
    contractors?: Contractor[];
    devices?: Device[];
    portions?: Portion[];
    plans?: DisconnectionPlan[];
  }) => {
    if (data.offices) setOffices(data.offices);
    if (data.contractors) setContractors(data.contractors);
    if (data.devices) setDevices(data.devices);
    if (data.portions) setPortions(data.portions);
    if (data.plans) setPlans(data.plans);
  };

  return {
    offices,
    contractors,
    devices,
    portions,
    plans,
    // Office
    addOffice,
    updateOffice,
    deleteOffice,
    // Contractor
    addContractor,
    updateContractor,
    deleteContractor,
    // Device
    addDevice,
    updateDevice,
    deleteDevice,
    // Portion
    addPortion,
    updatePortion,
    deletePortion,
    // Plan
    addPlan,
    updatePlan,
    deletePlan,
    // Utilities
    resetToDefault,
    importAllData,
  };
}
