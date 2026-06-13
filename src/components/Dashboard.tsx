/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Customer, Material, Budget, ServiceOrder } from '../types';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  FileText, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Package,
  ArrowUpRight
} from 'lucide-react';

interface DashboardProps {
  customers: Customer[];
  materials: Material[];
  budgets: Budget[];
  services: ServiceOrder[];
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ customers, materials, budgets, services, setActiveTab }: DashboardProps) {
  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // KPIs
  const totalRevenue = services
    .filter(s => s.paymentStatus === 'pago')
    .reduce((sum, s) => sum + s.totalValue, 0);

  const pendingRevenue = services
    .filter(s => s.paymentStatus === 'pendente')
    .reduce((sum, s) => sum + s.totalValue, 0);

  const activeServicesCount = services.filter(s => s.status !== 'entregue').length;

  const lowStockMaterials = materials.filter(m => m.quantity <= m.minQuantity);
  
  const pendingBudgetsCount = budgets.filter(b => b.status === 'pendente').length;
  const pendingBudgetsTotal = budgets
    .filter(b => b.status === 'pendente')
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="space-y-6">
      {/* Welcome / Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d0e15] via-[#141622] to-amber-950/20 p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-white">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12">
          <Wrench className="w-96 h-96 text-amber-500" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full uppercase font-bold tracking-widest font-mono">
              Painel Operacional
            </span>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl text-slate-100">
              Painel Central de Soldagem
            </h1>
            <p className="text-slate-400 max-w-2xl text-xs md:text-sm leading-relaxed">
              Monitore ordens de serviço (OS) de alta fusão, acompanhe propostas ativas de clientes e mantenha ordens de reposição de insumos cruciais sob controle total de faturamento.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button 
              id="dash-new-os"
              onClick={() => setActiveTab('services')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              Monitorar OS
            </button>
            <button 
              id="dash-new-budget"
              onClick={() => setActiveTab('budgets')}
              className="bg-[#1b1d28] hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              Novo Orçamento
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento Pago */}
        <div className="bg-[#0d0e15] p-5 rounded-xl border border-slate-800/85 shadow-lg hover:border-slate-700/80 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Faturamento Recebido</p>
            <p className="text-2xl font-bold text-white font-mono tracking-tight">{formatCurrency(totalRevenue)}</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              Serviços quitados
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Serviços Ativos */}
        <div className="bg-[#0d0e15] p-5 rounded-xl border border-slate-800/85 shadow-lg hover:border-slate-700/80 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Serviços Ativos</p>
            <p className="text-2xl font-bold text-white font-mono tracking-tight">{activeServicesCount}</p>
            <p className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3 text-amber-500" />
              Em fila ou progresso
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Orçamentos Pendentes */}
        <div className="bg-[#0d0e15] p-5 rounded-xl border border-slate-800/85 shadow-lg hover:border-slate-700/80 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Orçamentos Propostos</p>
            <p className="text-2xl font-bold text-white font-mono tracking-tight">{pendingBudgetsCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[160px]">
              Totalizando {formatCurrency(pendingBudgetsTotal)}
            </p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Alerta de Estoque */}
        <div className="bg-[#0d0e15] p-5 rounded-xl border border-slate-800/85 shadow-lg hover:border-slate-700/80 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Estoque Crítico</p>
            <p className="text-2xl font-bold text-white font-mono tracking-tight">{lowStockMaterials.length}</p>
            <p className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
              {lowStockMaterials.length > 0 ? (
                <>
                  <AlertTriangle className="w-3 h-3 animate-bounce" /> Necessitam compra
                </>
              ) : (
                'Estoque regulado'
              )}
            </p>
          </div>
          <div className={`p-3 rounded-xl border transition-all ${lowStockMaterials.length > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' : 'bg-slate-800/40 text-slate-400 border-slate-700/60'}`}>
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Services status highlights */}
        <div className="lg:col-span-2 bg-[#0d0e15] rounded-xl border border-slate-800/85 shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Serviços Críticos e Urgentes</h2>
              <p className="text-slate-400 text-xs mt-0.5">Ordens que requerem andamento imediato na bancada</p>
            </div>
            <button 
              id="dash-all-services"
              onClick={() => setActiveTab('services')}
              className="text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {services
              .filter(s => s.status !== 'entregue')
              .slice(0, 3)
              .map((service) => {
                const customer = customers.find(c => c.id === service.customerId);
                return (
                  <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#12131a] hover:bg-[#161824] border border-slate-800 rounded-xl transition duration-200 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-md ${
                          service.priority === 'alta' ? 'bg-rose-950/40 text-rose-400 border-rose-900/30' :
                          service.priority === 'media' ? 'bg-amber-950/40 text-amber-400 border-amber-900/30' : 'bg-slate-800/40 text-slate-400 border-slate-700/60'
                        }`}>
                          Prioridade {service.priority}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-md ${
                          service.status === 'fila' ? 'bg-slate-800/40 text-slate-300 border-slate-750' :
                          service.status === 'em_progresso' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {service.status === 'fila' ? 'Fila / Pendente' :
                           service.status === 'em_progresso' ? 'Em Execução' : 'Concluído'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-200 text-sm leading-snug">{service.title}</h4>
                      <p className="text-xs text-slate-400">
                        Cliente: <span className="font-semibold text-slate-300">{customer?.name || 'Cliente desconhecido'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor Estimado</p>
                        <p className="font-bold text-white font-mono text-sm">{formatCurrency(service.totalValue)}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Financeiro</p>
                        <p className={`text-xs font-bold font-mono ${service.paymentStatus === 'pago' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {service.paymentStatus === 'pago' ? 'RECEBIDO' : 'A RECEBER'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

            {services.filter(s => s.status !== 'entregue').length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs font-medium">
                Nenhum serviço em andamento no momento. Excelente!
              </div>
            )}
          </div>
        </div>

        {/* Right column: Stock warnings & quick actions */}
        <div className="bg-[#0d0e15] rounded-xl border border-slate-800/85 shadow-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Alertas do Estoque</h3>
                <p className="text-slate-400 text-xs mt-0.5">Insumos perto do ponto de ressuprimento</p>
              </div>
              <button 
                id="dash-materials-tab"
                onClick={() => setActiveTab('materials')}
                className="text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-wider hover:underline cursor-pointer"
              >
                Atualizar
              </button>
            </div>

            <div className="space-y-3">
              {lowStockMaterials.length > 0 ? (
                lowStockMaterials.map(m => (
                  <div key={m.id} className="p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-xl flex items-center justify-between gap-2 transition duration-200">
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-slate-200 line-clamp-1">{m.name}</p>
                      <p className="text-[10px] text-slate-400">Fornecedor: <span className="font-semibold text-slate-300">{m.supplier}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-rose-400 font-mono">{m.quantity} {m.unit}</p>
                      <p className="text-[9px] text-slate-500 font-mono">alerta: {m.minQuantity} {m.unit}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-3">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="max-w-[180px] leading-relaxed mx-auto">Eletrodos, gases, chapas e discos em níveis adequados de segurança.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 bg-[#12131a]/60 -m-6 p-6 rounded-b-xl space-y-2">
            <h4 className="text-[10px] font-black text-amber-400 tracking-widest uppercase">Nota Operacional de Oficina</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Manter o estoque de gases de proteção (Argônio/Mistura) regulado evita paradas intempestivas nos processos MIG/TIG de alta deposição. Lembre-se de dar entrada nas notas de aquisições assim que os cilindros forem trocados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
