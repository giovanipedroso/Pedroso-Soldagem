/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { Customer, Material, Budget, ServiceOrder } from './types';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_MATERIALS, 
  INITIAL_BUDGETS, 
  INITIAL_SERVICES 
} from './mockData';

// Subcomponents
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Materials from './components/Materials';
import Budgets from './components/Budgets';
import ServiceOrders from './components/ServiceOrders';

// Icons
import { 
  TrendingUp, 
  Users, 
  Package, 
  FileText, 
  Wrench, 
  Menu, 
  X,
  Plus,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Persistent States
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('soldagem_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('soldagem_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('soldagem_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [services, setServices] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('soldagem_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('soldagem_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('soldagem_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('soldagem_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('soldagem_services', JSON.stringify(services));
  }, [services]);

  // Notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // State Management Actions
  // 1. Customers
  const handleAddCustomer = (c: Customer) => {
    setCustomers([c, ...customers]);
    triggerToast(`Cliente "${c.name}" foi cadastrado com sucesso!`);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(customers.map(c => c.id === updated.id ? updated : c));
    triggerToast(`Informações de "${updated.name}" salvas.`);
  };

  const handleDeleteCustomer = (id: string) => {
    const customer = customers.find(c => c.id === id);
    setCustomers(customers.filter(c => c.id !== id));
    triggerToast(`Cliente "${customer?.name || 'Cliente'}" foi removido.`);
  };

  // 2. Materials
  const handleAddMaterial = (m: Material) => {
    setMaterials([m, ...materials]);
    triggerToast(`Insumo "${m.name}" adicionado ao estoque.`);
  };

  const handleUpdateMaterial = (updated: Material) => {
    setMaterials(materials.map(m => m.id === updated.id ? updated : m));
  };

  const handleDeleteMaterial = (id: string) => {
    const item = materials.find(m => m.id === id);
    setMaterials(materials.filter(m => m.id !== id));
    triggerToast(`Insumo "${item?.name || 'Item'}" removido com sucesso.`);
  };

  // 3. Budgets
  const handleAddBudget = (b: Budget) => {
    setBudgets([b, ...budgets]);
    triggerToast(`Orçamento comercial "${b.title}" foi criado.`);
  };

  const handleUpdateBudget = (updated: Budget) => {
    setBudgets(budgets.map(b => b.id === updated.id ? updated : b));
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
    triggerToast("Orçamento comercial removido.");
  };

  // When a budget gets approved, generate a matching Service Order (OS) automatically
  const handleApproveBudget = (approvedBudget: Budget) => {
    // Check if Service Order already exists for this budget
    const exists = services.some(s => s.budgetId === approvedBudget.id);
    if (exists) {
      triggerToast('Orçamento marcado como Aprovado.');
      return;
    }

    const newSO: ServiceOrder = {
      id: `so-${Date.now()}`,
      budgetId: approvedBudget.id,
      customerId: approvedBudget.customerId,
      title: approvedBudget.title,
      description: approvedBudget.description,
      status: 'fila',
      priority: 'media',
      startDate: new Date().toISOString().split('T')[0],
      totalValue: approvedBudget.total,
      paymentStatus: 'pendente',
      notes: `Ordem de serviço gerada eletronicamente através da aprovação do orçamento de número: ${approvedBudget.id}.`,
    };

    setServices([newSO, ...services]);
    triggerToast(`Orçamento aprovado! Um novo serviço foi encaminhado para a Fila de Execução.`);
  };

  // 4. Service Orders (OS)
  const handleAddService = (so: ServiceOrder) => {
    setServices([so, ...services]);
    triggerToast(`Ordem de Serviço "${so.title}" aberta na fila.`);
  };

  const handleUpdateService = (updated: ServiceOrder) => {
    setServices(services.map(s => s.id === updated.id ? updated : s));
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
    triggerToast("Ordem de Serviço arquivada/excluída.");
  };

  // Navigation Items list
  const navItems = [
    { id: 'dashboard', label: 'Painel Central', icon: TrendingUp },
    { id: 'services', label: 'Status de Serviços (OS)', icon: Wrench },
    { id: 'budgets', label: 'Orçamentos', icon: FileText },
    { id: 'materials', label: 'Lista de Materiais', icon: Package },
    { id: 'customers', label: 'Clientes', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#08090d] flex flex-col md:flex-row font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Alert Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-55 max-w-sm bg-[#12131a] border border-slate-800/80 border-l-4 border-l-amber-500 text-slate-100 p-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-slide-up flex items-start gap-3 print:hidden">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider text-amber-400 block mb-0.5">Notificação</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Panel */}
      <aside className="w-64 bg-[#0d0e15] border-r border-slate-800/60 text-slate-100 hidden md:flex flex-col shrink-0 sticky top-0 h-screen print:hidden select-none">
        {/* Letterhead */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest text-amber-400 uppercase">PEDROSO</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Soldagem & Gestão</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-[0_4px_15px_rgba(245,158,11,0.2)] scale-[1.02]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-500 group-hover:text-amber-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/60 bg-[#07080c] text-center space-y-1 text-[10px]">
          <p className="text-slate-500 font-medium">Gestor de Soldagem v1.4.0</p>
          <p className="text-slate-600 font-mono tracking-xs">giovani.pedroso99@gmail.com</p>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="bg-[#0d0e15] text-white p-4 flex items-center justify-between md:hidden print:hidden border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded">
            <Wrench className="w-4 h-4" />
          </div>
          <h2 className="font-extrabold text-xs uppercase tracking-widest text-amber-400">PEDROSO SOLDAS</h2>
        </div>

        <button 
          id="toggle-mobile-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 hover:bg-slate-800/60 rounded-lg cursor-pointer transition text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-[#08090d]/95 backdrop-blur-md z-40 md:hidden flex flex-col p-4 space-y-2 animate-fade-in print:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full p-4 rounded-xl text-left text-xs uppercase tracking-widest font-bold border transition duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-transparent shadow-[0_4px_12px_rgba(245,158,11,0.2)]' 
                    : 'bg-[#12131a] text-slate-300 border-slate-800/60 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full transition-all">
        {/* Render actual component matching selected tab */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            customers={customers} 
            materials={materials} 
            budgets={budgets} 
            services={services} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'services' && (
          <ServiceOrders 
            services={services} 
            customers={customers} 
            onAddService={handleAddService} 
            onUpdateService={handleUpdateService} 
            onDeleteService={handleDeleteService} 
          />
        )}

        {activeTab === 'budgets' && (
          <Budgets 
            budgets={budgets} 
            customers={customers} 
            onAddBudget={handleAddBudget} 
            onUpdateBudget={handleUpdateBudget} 
            onDeleteBudget={handleDeleteBudget}
            onApproveBudget={handleApproveBudget} 
          />
        )}

        {activeTab === 'materials' && (
          <Materials 
            materials={materials} 
            onAddMaterial={handleAddMaterial} 
            onUpdateMaterial={handleUpdateMaterial} 
            onDeleteMaterial={handleDeleteMaterial} 
          />
        )}

        {activeTab === 'customers' && (
          <Customers 
            customers={customers} 
            budgets={budgets} 
            services={services} 
            onAddCustomer={handleAddCustomer} 
            onUpdateCustomer={handleUpdateCustomer} 
            onDeleteCustomer={handleDeleteCustomer} 
          />
        )}
      </main>
    </div>
  );
}
