/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer, ServiceOrder } from '../types';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  User, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  AlertCircle,
  Edit2
} from 'lucide-react';

interface ServiceOrdersProps {
  services: ServiceOrder[];
  customers: Customer[];
  onAddService: (so: ServiceOrder) => void;
  onUpdateService: (so: ServiceOrder) => void;
  onDeleteService: (id: string) => void;
}

export default function ServiceOrders({ 
  services, 
  customers, 
  onAddService, 
  onUpdateService, 
  onDeleteService 
}: ServiceOrdersProps) {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOrder | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceOrder | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ServiceOrder['priority']>('media');
  const [totalValue, setTotalValue] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<ServiceOrder['paymentStatus']>('pendente');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault();
    if (!customerId) {
      setFormError('Por favor, selecione quem encomendou o serviço.');
      return;
    }
    if (!title.trim()) {
      setFormError('Por favor, forneça um título descritivo do trabalho.');
      return;
    }

    const data: ServiceOrder = {
      id: editingService ? editingService.id : `so-${Date.now()}`,
      budgetId: editingService?.budgetId,
      customerId,
      title,
      description,
      status: editingService ? editingService.status : 'fila',
      priority,
      startDate: editingService ? editingService.startDate : new Date().toISOString().split('T')[0],
      endDate: editingService?.endDate,
      totalValue: Number(totalValue),
      paymentStatus,
      notes: notes || '',
    };

    if (editingService) {
      onUpdateService(data);
      setEditingService(null);
    } else {
      onAddService(data);
    }

    // Reset Form
    setCustomerId('');
    setTitle('');
    setDescription('');
    setPriority('media');
    setTotalValue(0);
    setPaymentStatus('pendente');
    setNotes('');
    setFormError('');
    setIsAddingMode(false);
  };

  const startEdit = (so: ServiceOrder) => {
    setEditingService(so);
    setCustomerId(so.customerId);
    setTitle(so.title);
    setDescription(so.description);
    setPriority(so.priority);
    setTotalValue(so.totalValue);
    setPaymentStatus(so.paymentStatus);
    setNotes(so.notes || '');
    setIsAddingMode(true);
  };

  const cancelForm = () => {
    setCustomerId('');
    setTitle('');
    setDescription('');
    setPriority('media');
    setTotalValue(0);
    setPaymentStatus('pendente');
    setNotes('');
    setFormError('');
    setEditingService(null);
    setIsAddingMode(false);
  };

  // Move service states
  const moveStatus = (so: ServiceOrder, direction: 'forward' | 'backward') => {
    const states: ServiceOrder['status'][] = ['fila', 'em_progresso', 'concluido', 'entregue'];
    const currentIndex = states.indexOf(so.status);
    let nextIndex = currentIndex;

    if (direction === 'forward' && currentIndex < states.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'backward' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      const updated: ServiceOrder = {
        ...so,
        status: states[nextIndex],
        endDate: states[nextIndex] === 'entregue' || states[nextIndex] === 'concluido' 
          ? new Date().toISOString().split('T')[0] 
          : undefined
      };
      onUpdateService(updated);
      if (selectedService?.id === so.id) {
        setSelectedService(updated);
      }
    }
  };

  const togglePayment = (so: ServiceOrder) => {
    const updated: ServiceOrder = {
      ...so,
      paymentStatus: so.paymentStatus === 'pago' ? 'pendente' : 'pago'
    };
    onUpdateService(updated);
    if (selectedService?.id === so.id) {
      setSelectedService(updated);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Columns definition optimized for dark theme layout rhythm
  const columns: { id: ServiceOrder['status']; title: string; colorClass: string; bgClass: string; borderClass: string }[] = [
    { id: 'fila', title: 'Fila / Preparação', colorClass: 'text-slate-400', bgClass: 'bg-[#0d0e15]', borderClass: 'border-slate-800/80' },
    { id: 'em_progresso', title: 'Em Cabine / Solda', colorClass: 'text-amber-400', bgClass: 'bg-[#0d0e15]', borderClass: 'border-amber-500/10' },
    { id: 'concluido', title: 'Solda Concluída', colorClass: 'text-emerald-400', bgClass: 'bg-[#0d0e15]', borderClass: 'border-emerald-500/10' },
    { id: 'entregue', title: 'Serviço Entregue', colorClass: 'text-slate-300', bgClass: 'bg-[#0d0e15]', borderClass: 'border-slate-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Upper Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Wrench className="w-5 h-5 text-amber-400" />
            Quadro Kanban de Serviços ({services.length})
          </h2>
          <p className="text-xs text-slate-400">Gerencie o fluxo de soldagem do pátio, monitore as cabines de escarnamento e libere de forma ágil.</p>
        </div>
        {!isAddingMode && (
          <button
            id="so-add-btn"
            onClick={() => setIsAddingMode(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.2)] transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Nova OS Manual
          </button>
        )}
      </div>

      {/* Editor / Addition block */}
      {isAddingMode && (
        <div className="bg-[#0d0e15] rounded-xl border border-slate-800 shadow-xl p-6 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              {editingService ? 'Editar Registro da Ordem de Serviço' : 'Emitir Nova Ordem de Serviço Manual'}
            </h3>
            <button 
              id="so-cancel-form"
              onClick={cancelForm} 
              className="text-slate-400 hover:text-white rounded-full p-1.5 hover:bg-slate-800/40 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-xs font-bold text-rose-450 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente Requerente *</label>
                <select
                  id="so-form-customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-medium"
                >
                  <option value="">-- Selecione o Cliente --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#12131a]">{c.name} ({c.document})</option>
                  ))}
                </select>
              </div>

              {/* Título */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Título do Serviço / OS *</label>
                <input
                  id="so-form-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Soldagem de escada marinheiro - 3m"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição Técnica do Serviço</label>
                <textarea
                  id="so-form-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Instruções de soldagem (ex: passe duplo MIG, raiz revestida, lixamento, selador...)"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Valor do Serviço */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Cobrado (R$)</label>
                <input
                  id="so-form-value"
                  type="number"
                  step="any"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="Ex: 850"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-mono"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgência de Entrega / Prioridade</label>
                <select
                  id="so-form-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ServiceOrder['priority'])}
                  className="w-full text-xs px-3 py-2.5 bg-[#080a10] border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-medium"
                >
                  <option value="baixa">Baixa prioridade</option>
                  <option value="media">Média / Normal</option>
                  <option value="alta">Alta / Urgente</option>
                </select>
              </div>

              {/* Status de Pagamento */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Situação de Pagamento</label>
                <select
                  id="so-form-payment"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as ServiceOrder['paymentStatus'])}
                  className="w-full text-xs px-3 py-2.5 bg-[#080a10] border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-medium"
                >
                  <option value="pendente">Pendente (A receber)</option>
                  <option value="pago">Quitado (Recebido)</option>
                </select>
              </div>

              {/* Observações da Oficina */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observações adicionais / Notas internas</label>
                <input
                  id="so-form-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Soldador associado, mistura de argônio de 20%, etc."
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                id="so-form-cancel"
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="so-form-submit"
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2.5 text-xs uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer"
              >
                {editingService ? 'Salvar Modificações' : 'Iniciar Ordem de Fabricação'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start pb-6">
        {columns.map(col => {
          const columnServices = services.filter(s => s.status === col.id);

          return (
            <div 
              key={col.id} 
              className={`rounded-xl border p-4 ${col.borderClass} ${col.bgClass} flex flex-col gap-4 self-stretch min-h-[500px] shadow-lg`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                <span className={`text-[10px] font-black uppercase tracking-widest ${col.colorClass}`}>
                  {col.title} ({columnServices.length})
                </span>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </div>

              {/* Service Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[630px] pr-1">
                {columnServices.length > 0 ? (
                  columnServices.map(service => {
                    const client = customers.find(c => c.id === service.customerId);

                    return (
                      <div 
                        key={service.id}
                        id={`kanban-card-${service.id}`}
                        className="bg-[#12131a] rounded-xl border border-slate-800/80 p-4 hover:border-amber-500/40 transition space-y-3 text-slate-200"
                      >
                        {/* Header details */}
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded border ${
                            service.priority === 'alta' ? 'bg-rose-500/15 text-rose-400 border-rose-500/20' :
                            service.priority === 'media' ? 'bg-amber-500/10 text-amber-400 border-amber-500/22' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {service.priority}
                          </span>

                          <div className="flex gap-1 shrink-0">
                            <button
                              id={`so-edit-btn-${service.id}`}
                              onClick={() => startEdit(service)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-sm transition cursor-pointer"
                              title="Editar OS"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`so-delete-btn-${service.id}`}
                              onClick={() => {
                                if (confirm(`Remover definitivamente esta Ordem de Serviço: ${service.title}?`)) {
                                  onDeleteService(service.id);
                                  if (selectedService?.id === service.id) {
                                    setSelectedService(null);
                                  }
                                }
                              }}
                              className="p-1 hover:bg-rose-500/10 text-slate-400 hover:text-rose-450 rounded-sm transition cursor-pointer"
                              title="Excluir OS"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title and Client */}
                        <div className="space-y-1.5">
                          <h4 
                            id={`card-title-${service.id}`}
                            onClick={() => setSelectedService(service)}
                            className="font-bold text-slate-100 text-xs hover:text-amber-400 transition cursor-pointer line-clamp-2 leading-snug"
                            title="Clique para ver detalhes técnicos"
                          >
                            {service.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" />
                            <span className="font-semibold truncate">{client?.name || 'Cliente desconhecido'}</span>
                          </p>
                        </div>

                        {/* Cost & Payment status */}
                        <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-slate-800/60 pb-1">
                          <span className="font-extrabold font-mono text-slate-250 text-xs">{formatCurrency(service.totalValue)}</span>
                          
                          <button
                            id={`so-payment-toggle-${service.id}`}
                            onClick={() => togglePayment(service)}
                            className={`flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider py-0.5 px-2 rounded border cursor-pointer hover:border-amber-500/40 shrink-0 transition ${
                              service.paymentStatus === 'pago' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                            }`}
                            title="Clique para alternar situação do pagamento"
                          >
                            <CreditCard className="w-3 h-3 text-current" />
                            {service.paymentStatus === 'pago' ? 'Pago' : 'A pagar'}
                          </button>
                        </div>

                        {/* Fast Mover Transition Controls */}
                        <div className="flex items-center justify-between pt-1 bg-[#090a0f] -m-4 p-2 rounded-b-xl border-t border-slate-800/60 select-none">
                          <button
                            id={`move-prev-${service.id}`}
                            disabled={service.status === 'fila'}
                            onClick={() => moveStatus(service, 'backward')}
                            className="text-slate-500 hover:text-slate-300 disabled:opacity-20 disabled:pointer-events-none p-1 shrink-0 transition cursor-pointer"
                            title="Voltar Etapa"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider font-mono">Fase</span>

                          <button
                            id={`move-next-${service.id}`}
                            disabled={service.status === 'entregue'}
                            onClick={() => moveStatus(service, 'forward')}
                            className="bg-[#12131a] border border-slate-800 flex items-center justify-center p-1 px-2 rounded hover:border-amber-400 hover:bg-[#1c1d29] hover:text-white text-slate-300 transition cursor-pointer"
                            title="Próxima Etapa"
                          >
                            <span className="text-[8px] font-bold mr-1">Próx</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-500 italic text-[11px] border border-dashed border-slate-800 rounded-lg bg-[#08090d]/30">
                    Sem ordens nesta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side modal/drawer overlay for detailed technical inspection */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-[#040508]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0e15] rounded-2xl border border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-zoom-in text-slate-100">
            <div className="p-5 bg-[#12131a] text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400 animate-spin-once" />
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400">Ref: {selectedService.id}</span>
              </div>
              <button 
                id="close-so-modal"
                onClick={() => setSelectedService(null)} 
                className="text-slate-400 hover:text-white rounded-full bg-slate-800/40 p-1.5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded border ${
                  selectedService.priority === 'alta' ? 'bg-rose-500/15 text-rose-455 border-rose-500/22' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  Prioridade {selectedService.priority}
                </span>
                <h3 className="text-sm font-bold text-slate-100 pt-1">{selectedService.title}</h3>
                <p className="text-xs text-slate-400">
                  Cliente: <strong className="text-slate-200">{customers.find(c => c.id === selectedService.customerId)?.name || 'Desconhecido'}</strong>
                </p>
              </div>

              <div className="space-y-1 bg-[#08090d] p-3 rounded-lg border border-slate-850 text-xs">
                <p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest leading-none pb-1.5">Descrição do Escopo Técnico</p>
                <p className="text-slate-300 leading-relaxed font-sans">{selectedService.description || 'Nenhum detalhe técnico cadastrado.'}</p>
              </div>

              {selectedService.notes && (
                <div className="space-y-1 bg-amber-500/5 p-3 rounded-lg border border-amber-500/15 text-xs">
                  <p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest flex items-center gap-1 leading-none pb-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Notas de Soldagem do Pátio
                  </p>
                  <p className="text-slate-300 italic font-medium leading-normal">{selectedService.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="bg-[#08090d] p-2.5 rounded-lg border border-slate-800">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Iniciado em</p>
                  <p className="font-bold text-slate-200 font-mono">{selectedService.startDate}</p>
                </div>
                <div className="bg-[#08090d] p-2.5 rounded-lg border border-slate-800 font-mono">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-0.5">Valor Cobrado</p>
                  <p className="font-black text-amber-400 text-sm">{formatCurrency(selectedService.totalValue)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Pagamento:</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedService.paymentStatus === 'pago' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedService.paymentStatus === 'pago' ? 'Quitado' : 'A pagar'}
                  </span>
                </div>

                <button
                  id="modal-toggle-payment"
                  onClick={() => togglePayment(selectedService)}
                  className="bg-[#12131a] hover:bg-[#1a1c29] border border-slate-800 text-slate-200 font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg transition"
                >
                  Alternar Saldo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
