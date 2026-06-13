/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer, Budget, ServiceOrder } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Briefcase,
  X,
  Edit2
} from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  budgets: Budget[];
  services: ServiceOrder[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export default function Customers({ 
  customers, 
  budgets, 
  services, 
  onAddCustomer, 
  onUpdateCustomer, 
  onDeleteCustomer 
}: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  // Search filter
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Por favor, informe o nome do cliente.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Por favor, informe um telefone de contato.');
      return;
    }

    const data: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name,
      document: document || 'Não informado',
      phone,
      email: email || 'Não informado',
      address: address || 'Não informado',
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString().split('T')[0],
    };

    if (editingCustomer) {
      onUpdateCustomer(data);
      setEditingCustomer(null);
    } else {
      onAddCustomer(data);
    }

    // Reset Form
    setName('');
    setDocument('');
    setPhone('');
    setEmail('');
    setAddress('');
    setFormError('');
    setIsAddingMode(false);
  };

  const startEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setDocument(c.document);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address === 'Não informado' ? '' : c.address);
    setIsAddingMode(true);
  };

  const cancelForm = () => {
    setName('');
    setDocument('');
    setPhone('');
    setEmail('');
    setAddress('');
    setFormError('');
    setEditingCustomer(null);
    setIsAddingMode(false);
  };

  const getCustomerStats = (customerId: string) => {
    const customerBudgets = budgets.filter(b => b.customerId === customerId);
    const customerServices = services.filter(s => s.customerId === customerId);
    const totalSpent = customerServices
      .filter(s => s.paymentStatus === 'pago')
      .reduce((sum, s) => sum + s.totalValue, 0);

    return {
      budgetsCount: customerBudgets.length,
      approvedBudgetsCount: customerBudgets.filter(b => b.status === 'aprovado').length,
      servicesCount: customerServices.length,
      completedServicesCount: customerServices.filter(s => s.status === 'concluido' || s.status === 'entregue').length,
      totalSpent
    };
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Upper bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Users className="w-5 h-5 text-amber-400" />
            Clientes de Oficina ({customers.length})
          </h2>
          <p className="text-xs text-slate-400">Gerencie contatos e analise o faturamento histórico de cada parceiro.</p>
        </div>
        {!isAddingMode && (
          <button
            id="cust-add-btn"
            onClick={() => setIsAddingMode(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.2)] transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Novo Cliente
          </button>
        )}
      </div>

      {/* Forms Drawer/Collapsible */}
      {isAddingMode && (
        <div className="bg-[#0d0e15] rounded-xl border border-slate-800 p-6 shadow-xl animate-fade-in text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              {editingCustomer ? 'Editar Ficha do Cliente' : 'Cadastrar Novo Cliente'}
            </h3>
            <button 
              id="cust-cancel-form"
              onClick={cancelForm} 
              className="text-slate-400 hover:text-white rounded-full p-1.5 hover:bg-slate-800/40 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <p className="text-xs font-bold text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome Completo / Razão Social *</label>
                <input
                  id="form-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Roberto de Souza ou Metalúrgica Silva"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Documento */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF ou CNPJ</label>
                <input
                  id="form-doc"
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="Ex: 000.000.000-00 ou 00.000.000/0001-00"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone / WhatsApp *</label>
                <input
                  id="form-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail de Contato</label>
                <input
                  id="form-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: cliente@email.com"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Endereço */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço Completo</label>
                <input
                  id="form-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Av. Industrial, 1500, Galpão B, São Paulo - SP"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                id="form-cancel"
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="form-submit"
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2 text-xs uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer"
              >
                {editingCustomer ? 'Salvar Ficha' : 'Efetuar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Input */}
      <div className="flex bg-[#0d0e15] items-center px-4 py-2.5 rounded-xl border border-slate-800/80 shadow-lg gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          id="cust-search"
          type="text"
          placeholder="Busque clientes por nome, CNPJ/CPF, e-mail ou telefone de contato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 text-xs w-full focus:outline-hidden text-slate-100 placeholder-slate-500"
        />
        {searchTerm && (
          <button 
            id="cust-clear-search"
            onClick={() => setSearchTerm('')} 
            className="text-[10px] font-bold text-amber-400 uppercase tracking-wider hover:text-amber-300"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Main clients structure split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left/Middle Column: Cards list of clients */}
        <div className="lg:col-span-2 space-y-3">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(customer => {
              const stats = getCustomerStats(customer.id);
              const isSelected = selectedCustomer?.id === customer.id;

              return (
                <div 
                  key={customer.id} 
                  className={`bg-[#0d0e15] rounded-xl border transition-all duration-200 p-5 flex flex-col justify-between gap-4 cursor-pointer hover:border-amber-400/50 ${
                    isSelected ? 'ring-2 ring-amber-500 border-transparent bg-[#11131e] shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-slate-800/80 shadow-md'
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-100 text-sm">{customer.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">CNPJ/CPF: {customer.document}</p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        id={`cust-edit-${customer.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(customer);
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800/30 hover:bg-slate-800 border border-slate-800 rounded-lg transition cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`cust-delete-${customer.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Tem certeza que deseja remover o cliente ${customer.name}?`)) {
                            onDeleteCustomer(customer.id);
                            if (selectedCustomer?.id === customer.id) {
                              setSelectedCustomer(null);
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/30 hover:bg-rose-500/10 border border-slate-800 rounded-lg transition cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-800/60 pt-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate font-medium">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate font-medium">{customer.address}</span>
                    </div>
                  </div>

                  {/* Summary badges */}
                  <div className="flex items-center justify-between bg-[#12131a] border border-slate-800/40 p-2.5 rounded-lg text-xs mt-1">
                    <div className="flex gap-4">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        Orçamentos: <strong className="text-slate-100 font-mono ml-0.5">{stats.budgetsCount}</strong>
                      </span>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        Serviços (OS): <strong className="text-slate-100 font-mono ml-0.5">{stats.servicesCount}</strong>
                      </span>
                    </div>
                    <span className="text-emerald-400 text-xs font-bold font-mono">
                      INVESTIDO: {formatCurrency(stats.totalSpent)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#0d0e15] text-slate-500 rounded-xl border border-dashed border-slate-800 text-center py-12 text-xs font-medium">
              Nenhum cliente cadastrado correspondendo aos termos da busca.
            </div>
          )}
        </div>

        {/* Right side panel: Client History Timeline */}
        <div className="bg-[#0d0e15] rounded-xl border border-slate-800/80 p-5 shadow-lg h-full sticky top-4 space-y-4 text-slate-100">
          {selectedCustomer ? (
            <>
              <div className="border-b border-slate-800/60 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Histórico Detalhado</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{selectedCustomer.name}</p>
                </div>
                <button
                  id="close-history-panel"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-850 rounded-full p-1 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Statistics Quick Card */}
              <div className="grid grid-cols-2 gap-3 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 text-[11px]">
                <div>
                  <p className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Total Pago (Aprovado)</p>
                  <p className="font-bold text-amber-400 text-xs font-mono mt-0.5">
                    {formatCurrency(getCustomerStats(selectedCustomer.id).totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wider font-bold text-[9px]">Histórico de Serviços</p>
                  <p className="font-bold text-slate-200 text-xs font-mono mt-0.5">
                    {getCustomerStats(selectedCustomer.id).servicesCount} OS criadas
                  </p>
                </div>
              </div>

              {/* Timeline Service Orders */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                  Ordens de Serviço ({services.filter(s => s.customerId === selectedCustomer.id).length})
                </h4>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {services.filter(s => s.customerId === selectedCustomer.id).length > 0 ? (
                    services
                      .filter(s => s.customerId === selectedCustomer.id)
                      .map(s => (
                        <div key={s.id} className="p-2.5 bg-[#12131a] border border-slate-800/60 rounded-lg text-[11px] flex justify-between items-center gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-bold text-slate-200 truncate">{s.title}</p>
                            <p className="text-[9px] text-slate-500 font-mono">Emissão: {s.startDate}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 shrink-0 rounded capitalize border ${
                            s.status === 'concluido' || s.status === 'entregue' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                          }`}>
                            {s.status === 'fila' ? 'Fila' : s.status === 'em_progresso' ? 'Em Progresso' : s.status}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Nenhuma OS em andamento para este cliente.</p>
                  )}
                </div>
              </div>

              {/* Timeline Budgets */}
              <div className="space-y-3 pt-2 border-t border-slate-800/60">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Orçamentos Enviados ({budgets.filter(b => b.customerId === selectedCustomer.id).length})
                </h4>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {budgets.filter(b => b.customerId === selectedCustomer.id).length > 0 ? (
                    budgets
                      .filter(b => b.customerId === selectedCustomer.id)
                      .map(b => (
                        <div key={b.id} className="p-2.5 bg-[#12131a] border border-slate-800/60 rounded-lg text-[11px] flex justify-between items-center gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <p className="font-bold text-slate-200 truncate">{b.title}</p>
                            <p className="text-[10px] font-extrabold text-amber-400 font-mono">{formatCurrency(b.total)}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 shrink-0 rounded capitalize border ${
                            b.status === 'aprovado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            b.status === 'rejeitado' ? 'bg-rose-500/10 text-rose-450 border-rose-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Nenhum orçamento registrado para este cliente.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs flex flex-col justify-center items-center gap-3">
              <Users className="w-8 h-8 text-slate-700 animate-pulse" />
              <p className="max-w-[200px] leading-relaxed">Selecione um parceiro da lista para analisar os serviços contratados, as ordens de pagamento e as propostas comerciais enviadas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
