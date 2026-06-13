/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer, Budget, BudgetItem } from '../types';
import { 
  FileText, 
  Search, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  X, 
  Printer, 
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

interface BudgetsProps {
  budgets: Budget[];
  customers: Customer[];
  onAddBudget: (b: Budget) => void;
  onUpdateBudget: (b: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onApproveBudget: (b: Budget) => void; // Integrates with Service Orders
}

export default function Budgets({ 
  budgets, 
  customers, 
  onAddBudget, 
  onUpdateBudget, 
  onDeleteBudget,
  onApproveBudget
}: BudgetsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [laborCost, setLaborCost] = useState<number>(0);
  const [marginPercent, setMarginPercent] = useState<number>(20); // Default 20%
  const [discount, setDiscount] = useState<number>(0);
  const [validUntil, setValidUntil] = useState('');
  const [formError, setFormError] = useState('');

  // Item Form Helper State
  const [itemDesc, setItemDesc] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);

  // Set default valid date
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 15); // Default 15 days validity
    setValidUntil(today.toISOString().split('T')[0]);
  }, [isAddingMode]);

  const handleAddItem = () => {
    if (!itemDesc.trim()) {
      alert('Por favor, descreva o material ou serviço do item.');
      return;
    }
    if (itemQty <= 0 || itemPrice < 0) {
      alert('Quantidade e valor devem ser maiores que zero.');
      return;
    }

    const newItem: BudgetItem = {
      id: `bi-${Date.now()}`,
      description: itemDesc,
      quantity: Number(itemQty),
      unitPrice: Number(itemPrice),
      totalPrice: Number((itemQty * itemPrice).toFixed(2)),
    };

    setItems([...items, newItem]);
    setItemDesc('');
    setItemQty(1);
    setItemPrice(0);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(it => it.id !== itemId));
  };

  // Live calculation of totals
  const subtotalMaterials = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const directCostsAndLabor = subtotalMaterials + Number(laborCost);
  const profitMarginAmount = directCostsAndLabor * (Number(marginPercent) / 100);
  const finalCalculatedTotal = Math.max(0, directCostsAndLabor + profitMarginAmount - Number(discount));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setFormError('Por favor, selecione o cliente correspondente.');
      return;
    }
    if (!title.trim()) {
      setFormError('Por favor, informe um título descritivo para a proposta.');
      return;
    }
    if (items.length === 0) {
      setFormError('Você deve adicionar pelo menos um item ao orçamento.');
      return;
    }

    const budgetData: Budget = {
      id: `bud-${Date.now()}`,
      customerId,
      title,
      description,
      items,
      laborCost: Number(laborCost),
      marginPercent: Number(marginPercent),
      discount: Number(discount),
      total: Number(finalCalculatedTotal.toFixed(2)),
      status: 'pendente',
      validUntil: validUntil || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddBudget(budgetData);

    // Reset Form
    setCustomerId('');
    setTitle('');
    setDescription('');
    setItems([]);
    setLaborCost(0);
    setMarginPercent(20);
    setDiscount(0);
    setFormError('');
    setIsAddingMode(false);
  };

  const updateStatus = (budget: Budget, newStatus: Budget['status']) => {
    const updated = { ...budget, status: newStatus };
    onUpdateBudget(updated);
    setSelectedBudget(updated);

    // If approved, trigger Ordem de Serviço generation
    if (newStatus === 'aprovado') {
      onApproveBudget(updated);
    }
  };

  const cancelForm = () => {
    setCustomerId('');
    setTitle('');
    setDescription('');
    setItems([]);
    setLaborCost(0);
    setMarginPercent(20);
    setDiscount(0);
    setFormError('');
    setIsAddingMode(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filter budgets
  const filteredBudgets = budgets.filter(b => {
    const customer = customers.find(c => c.id === b.customerId);
    const searchString = `${b.title} ${customer?.name || ''} ${b.id}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <FileText className="w-5 h-5 text-amber-400" />
            Orçamentos Emitidos ({budgets.length})
          </h2>
          <p className="text-xs text-slate-400">Emita propostas detalhadas de metalurgia, trace margens de lucro e gere ordens de serviço (OS).</p>
        </div>
        {!isAddingMode && (
          <button
            id="bud-add-btn"
            onClick={() => setIsAddingMode(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.2)] transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Novo Orçamento
          </button>
        )}
      </div>

      {/* Grid of contents or Editor */}
      {isAddingMode ? (
        <div className="bg-[#0d0e15] rounded-xl border border-slate-800 shadow-xl p-6 print:hidden text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Gerar Novo Orçamento Comercial</h3>
            <button 
              id="bud-cancel-form"
              onClick={cancelForm} 
              className="text-slate-400 hover:text-white rounded-full p-1.5 hover:bg-slate-800/40 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <p className="text-xs font-bold text-rose-450 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                {formError}
              </p>
            )}

            {/* General details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente Destinatário *</label>
                <select
                  id="bud-form-customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-slate-250 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-medium"
                >
                  <option value="">-- Selecione o Cliente --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#12131a]">{c.name} ({c.document})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Título da Proposta *</label>
                <input
                  id="bud-form-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Confecção de Grades Metalon - Residencial"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Escopo Técnico / Descrição de Soldagem</label>
                <textarea
                  id="bud-form-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Técnicas de união (MIG, TIG, Eletrodo Revestido), tipos de soldas e acabamento superficial desejado..."
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Items Table inputs */}
            <div className="border border-slate-800/80 bg-[#12131a]/50 p-4 rounded-xl space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Matéria-Prima, Consumíveis e Serviços Relacionados</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Atribua custos de eletrodos, gases, chapas de ferro ou perfis adicionados no orçamento.</p>
              </div>

              {/* Items Table List */}
              <div className="space-y-2">
                {items.length > 0 ? (
                  <div className="bg-[#08090d] border border-slate-800 rounded-lg divide-y divide-slate-800/60">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center p-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-200">{index + 1}. {item.description}</p>
                          <p className="text-slate-400 text-[11px]">
                            Quantidade: <span className="font-bold font-mono text-slate-200">{item.quantity}</span> × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-amber-400 font-mono text-xs">{formatCurrency(item.totalPrice)}</span>
                          <button
                            id={`bud-remove-item-${item.id}`}
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-rose-400 hover:text-rose-350 bg-rose-500/10 hover:bg-rose-500/15 p-1.5 rounded-lg border border-rose-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-3 text-center">Nenhum item adicionado à folha de custos.</p>
                )}
              </div>

              {/* Input for new item */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#08090d] p-3 rounded-lg border border-slate-800">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Descrição dos Materiais / Insumos</label>
                  <input
                    id="item-desc-input"
                    type="text"
                    value={itemDesc}
                    onChange={(e) => setItemDesc(e.target.value)}
                    placeholder="Ex: Chapas ASTM A36 1/4\"
                    className="w-full text-xs px-2.5 py-1.5 bg-[#12131a] border border-slate-850 rounded-md focus:outline-hidden focus:border-slate-700 text-white"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Qtd</label>
                  <input
                    id="item-qty-input"
                    type="number"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value === '' ? 1 : Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#12131a] border border-slate-850 rounded-md focus:outline-hidden focus:border-slate-700 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Preço Unitário (R$)</label>
                  <input
                    id="item-price-input"
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#12131a] border border-slate-850 rounded-md focus:outline-hidden focus:border-slate-700 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-1 flex items-end justify-center pb-0.5">
                  <button
                    id="btn-add-item-row"
                    type="button"
                    onClick={handleAddItem}
                    className="bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold px-3 py-2 text-xs rounded-md shadow-xs transition cursor-pointer flex items-center justify-center w-full"
                    title="Adicionar Item"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Calculations and Commercial factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Mão de Obra e Ajustes Comerciais</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Especifique o tempo operacional, margem operacional de lucro e se dará desconto.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Labor */}
                  <div className="space-y-1 bg-[#12131a] p-2.5 rounded-lg border border-slate-800">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Mão de Obra (R$)</label>
                    <input
                      id="bud-form-labor"
                      type="number"
                      step="any"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Number(e.target.value))}
                      className="w-full text-xs px-2 py-1 bg-[#08090d] border border-slate-800 rounded-md focus:outline-hidden mt-1 font-bold text-slate-200 font-mono text-center"
                    />
                  </div>

                  {/* Profit Margin */}
                  <div className="space-y-1 bg-[#12131a] p-2.5 rounded-lg border border-slate-800">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Lucro (%)</label>
                    <input
                      id="bud-form-margin"
                      type="number"
                      step="any"
                      value={marginPercent}
                      onChange={(e) => setMarginPercent(Number(e.target.value))}
                      className="w-full text-xs px-2 py-1 bg-[#08090d] border border-slate-800 rounded-md focus:outline-hidden mt-1 font-bold text-slate-200 font-mono text-center"
                    />
                  </div>

                  {/* Discount */}
                  <div className="space-y-1 bg-[#12131a] p-2.5 rounded-lg border border-slate-800">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Desconto (R$)</label>
                    <input
                      id="bud-form-discount"
                      type="number"
                      step="any"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full text-xs px-2 py-1 bg-[#08090d] border border-slate-800 rounded-md focus:outline-hidden mt-1 font-bold text-slate-200 font-mono text-center"
                    />
                  </div>

                  {/* Valid Until */}
                  <div className="space-y-1 bg-[#12131a] p-2.5 rounded-lg border border-slate-800 sm:col-span-3">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Proposta Válida Até</label>
                    <input
                      id="bud-form-valid"
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="w-full text-xs px-2.5 py-1 bg-[#08090d] border border-slate-800 rounded-md focus:outline-hidden mt-1 font-bold text-slate-200 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Calculations recap block */}
              <div className="bg-[#08090d] text-slate-100 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo de Formação de Preço</h4>
                  
                  <div className="space-y-2 mt-4 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                      <span>Custo Direto (Insumos):</span>
                      <span className="font-mono text-slate-200">{formatCurrency(subtotalMaterials)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                      <span>Mão de Obra de Soldagem:</span>
                      <span className="font-mono text-slate-200">{formatCurrency(laborCost)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5 text-slate-350">
                      <span>Soma Direta de Custos:</span>
                      <span className="font-mono text-slate-200">{formatCurrency(directCostsAndLabor)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1.5 text-amber-400/80">
                      <span>Margem Aplicada (+ {marginPercent}%):</span>
                      <span className="font-mono">+{formatCurrency(profitMarginAmount)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between border-b border-slate-800 pb-1.5 text-rose-450">
                        <span>Desconto deduzido:</span>
                        <span className="font-mono">-{formatCurrency(discount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 mt-4 flex items-baseline justify-between">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Valor Líquido Final:</span>
                  <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                    {formatCurrency(finalCalculatedTotal)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                id="form-cancel-budget"
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 shadow-sm rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                id="form-save-budget"
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-lg shadow-md transition"
              >
                Registrar Orçamento
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Main Budgets View (Split: list on left, printable proposal sheet on right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: List */}
          <div className="lg:col-span-5 space-y-4 print:hidden">
            {/* Search */}
            <div className="bg-[#0d0e15] flex items-center px-4 py-2.5 rounded-xl border border-slate-800 shadow-lg gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                id="bud-search"
                type="text"
                placeholder="Busque por escopo ou cliente cadastrado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 text-xs w-full focus:outline-hidden text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {/* List */}
            <div className="space-y-3 select-none">
              {filteredBudgets.length > 0 ? (
                filteredBudgets.map(budget => {
                  const client = customers.find(c => c.id === budget.customerId);
                  const isSelected = selectedBudget?.id === budget.id;

                  return (
                    <div
                      key={budget.id}
                      id={`list-budget-item-${budget.id}`}
                      onClick={() => setSelectedBudget(budget)}
                      className={`bg-[#0d0e15] rounded-xl border p-4 cursor-pointer transition flex flex-col justify-between gap-3 hover:border-amber-500/40 ${
                        isSelected 
                          ? 'border-transparent ring-2 ring-amber-500 shadow-lg bg-[#11131e]' 
                          : 'border-slate-800/80 shadow-md'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-slate-500 select-all">REF: {budget.id}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                            budget.status === 'aprovado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            budget.status === 'rejeitado' ? 'bg-rose-500/10 text-rose-450 border-rose-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {budget.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-200 text-sm line-clamp-1 leading-snug">{budget.title}</h4>
                        <p className="text-xs text-slate-400">
                          Cliente: <span className="font-bold text-slate-300">{client?.name || 'Não cadastrado'}</span>
                        </p>
                      </div>

                      <div className="flex justify-between items-baseline border-t border-slate-800/60 pt-2.5 mt-0.5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Vencimento: {budget.validUntil}</span>
                        <span className="font-extrabold text-amber-400 font-mono text-sm">{formatCurrency(budget.total)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#0d0e15] text-slate-500 rounded-xl border border-dashed border-slate-800 text-center py-12 text-xs font-semibold uppercase tracking-wider">
                  Nenhum orçamento encontrado.
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Printable Invoice proposal Letterhead */}
          <div className="lg:col-span-7 bg-[#0d0e15] rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col justify-between">
            {selectedBudget ? (
              <>
                {/* Print action toolbar */}
                <div className="p-4 bg-[#12131a] border-b border-slate-800/80 flex items-center justify-between print:hidden gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ações Comerciais:</span>
                    {selectedBudget.status === 'pendente' && (
                      <>
                        <button
                          id="btn-approve-quote"
                          onClick={() => updateStatus(selectedBudget, 'aprovado')}
                          className="bg-emerald-600 hover:bg-emerald-500 tracking-wider text-slate-950 font-black px-3 py-1.5 text-[10px] uppercase rounded-md transition cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-102"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                          Aprovar (Gera OS)
                        </button>
                        <button
                          id="btn-reject-quote"
                          onClick={() => updateStatus(selectedBudget, 'rejeitado')}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-md transition cursor-pointer"
                        >
                          Recusar
                        </button>
                      </>
                    )}
                    {selectedBudget.status === 'aprovado' && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/20 rounded flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5" /> Aprovado (OS Autogerada)
                      </span>
                    )}
                    {selectedBudget.status === 'rejeitado' && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-455 bg-rose-500/10 px-2.5 py-1 border border-rose-500/25 rounded">
                        Proposta Recusada
                      </span>
                    )}
                  </div>

                  <button
                    id="btn-print-quote"
                    onClick={() => window.print()}
                    className="p-2 bg-[#08090d] hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer font-bold text-[10px] uppercase tracking-wide"
                    title="Imprimir Proposta"
                  >
                    <Printer className="w-4 h-4 text-amber-500" />
                    Imprimir Proposta
                  </button>
                </div>

                {/* Printable Frame Area */}
                <div className="p-8 space-y-6 bg-white text-slate-900 border-t border-slate-205 printable-paper max-h-[600px] overflow-y-auto print:max-h-none print:overflow-visible shadow-inner">
                  {/* Workshop Logo Letterhead */}
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-700 font-extrabold uppercase tracking-widest text-base">
                        <div className="w-6 h-6 bg-slate-900 flex items-center justify-center text-white rounded font-black text-xs font-sans">P</div>
                        <span>PEDROSO METALURGIA</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold uppercase font-mono tracking-xs">Soldagem Industrial e Estrutural Avançada</p>
                      <p className="text-[10px] text-slate-400 font-medium">Fone/WhatsApp: (11) 98765-4321 | giovani.pedroso99@gmail.com</p>
                    </div>

                    <div className="text-right space-y-1">
                      <h4 className="text-lg font-black text-slate-950 tracking-tight uppercase">PROPOSTA COMERCIAL</h4>
                      <p className="text-[11px] font-bold font-mono text-slate-500">REF: {selectedBudget.id}</p>
                      <p className="text-[10px] text-slate-400">Emitido em: {selectedBudget.createdAt}</p>
                    </div>
                  </div>

                  {/* Customer Block / Addressed to */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-800 leading-normal">
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Destinatário / Contratante</h5>
                      <p className="font-bold text-slate-950 text-sm">
                        {customers.find(c => c.id === selectedBudget.customerId)?.name || 'Cliente Não Cadastrado'}
                      </p>
                      <p className="text-slate-600 font-medium font-mono">Dcto: {customers.find(c => c.id === selectedBudget.customerId)?.document || 'N/A'}</p>
                    </div>
                    <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-205/60 pt-2.5 md:pt-0 md:pl-4">
                      <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Contato e Entrega</h5>
                      <p className="text-slate-600 font-medium">Fone: {customers.find(c => c.id === selectedBudget.customerId)?.phone || 'N/A'}</p>
                      <p className="text-slate-600 truncate font-medium">Endereço: {customers.find(c => c.id === selectedBudget.customerId)?.address || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Scope description */}
                  <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
                    <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Título Geral do Projeto & Escopo</h5>
                    <p className="font-bold text-slate-950 text-sm leading-tight">{selectedBudget.title}</p>
                    <p className="text-slate-600 font-medium">{selectedBudget.description || 'Nenhuma descrição técnica adicionada.'}</p>
                  </div>

                  {/* Itemized list */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Demanda e Rateamento de Custos</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 text-slate-500 border-b border-slate-300 font-bold uppercase text-[9px] tracking-wide">
                            <th className="py-2.5 px-3">Item</th>
                            <th className="py-2.5 px-3">Especificações Técnicas de Insumos / Execução</th>
                            <th className="py-2.5 px-3 text-center">Quantidade</th>
                            <th className="py-2.5 px-3 text-right">Preço Unitário</th>
                            <th className="py-2.5 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                          {selectedBudget.items.map((it, idx) => (
                            <tr key={it.id}>
                              <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-3 font-semibold text-slate-950">{it.description}</td>
                              <td className="py-3 px-3 text-center font-bold text-slate-700 font-mono">{it.quantity}</td>
                              <td className="py-3 px-3 text-right text-slate-600 font-mono">{formatCurrency(it.unitPrice)}</td>
                              <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">{formatCurrency(it.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Price builder details */}
                  <div className="border-t border-slate-200 pt-5 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-5 text-xs text-slate-800">
                    <div className="space-y-1.5 text-slate-500 max-w-sm">
                      <p className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1 leading-none">
                        <AlertCircle className="w-4 h-4 text-amber-600" /> Notas Comerciais & Garantia
                      </p>
                      <p className="text-[9px] leading-relaxed">
                        Orçamento válido por 15 dias corridos devido à volatilidade nas ligas metálicas estruturais (aço carbono, ferro nodular e consumíveis). Garantia estendida de soldagem de 90 dias contra descontinuidades, inclusões ou fissuras por fadiga na ZTA (Zona Térmica Afetada) em termos operacionais declarados.
                      </p>
                    </div>

                    <div className="w-full md:w-64 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-205 shrink-0 flex flex-col justify-center">
                      <div className="flex justify-between text-slate-600 border-b border-dashed border-slate-200 pb-1 text-[11px] font-medium">
                        <span>Rateio de Insumos:</span>
                        <span className="font-mono">{formatCurrency(selectedBudget.items.reduce((s, it) => s + it.totalPrice, 0))}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 border-b border-dashed border-slate-200 pb-1 text-[11px] font-medium">
                        <span>Horas de Soldagem/Bancada:</span>
                        <span className="font-mono">{formatCurrency(selectedBudget.laborCost)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 border-b border-dashed border-slate-200 pb-1 text-[11px] font-medium">
                        <span>Margem Executiva:</span>
                        <span className="font-mono">+{selectedBudget.marginPercent}%</span>
                      </div>
                      {selectedBudget.discount > 0 && (
                        <div className="flex justify-between text-rose-600 border-b border-dashed border-slate-200 pb-1 text-[11px] font-medium">
                          <span>Desconto aplicado:</span>
                          <span className="font-mono">-{formatCurrency(selectedBudget.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-baseline pt-2 text-slate-900 border-t border-slate-300">
                        <span className="font-black text-xs uppercase text-slate-950">Faturamento Real:</span>
                        <span className="font-mono font-black text-amber-700 text-base">{formatCurrency(selectedBudget.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 pt-10 text-center text-[10px]">
                    <div className="space-y-4">
                      <div className="border-t border-slate-300 pt-2 text-slate-500 uppercase tracking-wider font-semibold">
                        Assinatura do Soldador Responsável
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5">PEDROSO SOLDAS E METALURGIA</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="border-t border-slate-300 pt-2 text-slate-500 uppercase tracking-wider font-semibold">
                        Cliente De Acordo / Aprovação
                        <p className="text-[8px] font-mono text-slate-400 mt-0.5">Ciente e Aceito dos Custos Declarados</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-24 text-slate-500 text-xs flex flex-col justify-center items-center gap-3 bg-[#0d0e15] h-full">
                <FileText className="w-10 h-10 text-slate-700 animate-pulse" />
                <p className="max-w-md px-6 leading-relaxed">Selecione uma cotação da lista lateral para extrair a visualização oficial da proposta técnica, gerenciar o status de aceitação do faturamento ou emitir a versão de impressão.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
