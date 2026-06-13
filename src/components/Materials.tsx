/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Material, MaterialType } from '../types';
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2,
  X,
  ArrowUp,
  ArrowDown,
  Edit2
} from 'lucide-react';

interface MaterialsProps {
  materials: Material[];
  onAddMaterial: (m: Material) => void;
  onUpdateMaterial: (m: Material) => void;
  onDeleteMaterial: (id: string) => void;
}

export default function Materials({ 
  materials, 
  onAddMaterial, 
  onUpdateMaterial, 
  onDeleteMaterial 
}: MaterialsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<MaterialType | 'all'>('all');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<MaterialType>('eletrodos');
  const [quantity, setQuantity] = useState<number>(0);
  const [unit, setUnit] = useState('kg');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [minQuantity, setMinQuantity] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [formError, setFormError] = useState('');

  // Quick adjustment state
  const adjustStock = (materialId: string, amount: number) => {
    const item = materials.find(m => m.id === materialId);
    if (!item) return;

    const newQty = Math.max(0, Number((item.quantity + amount).toFixed(2)));
    onUpdateMaterial({
      ...item,
      quantity: newQty
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Por favor, indique o nome do insumo.');
      return;
    }
    if (quantity < 0 || unitPrice < 0 || minQuantity < 0) {
      setFormError('Valores numéricos não podem ser negativos.');
      return;
    }

    const data: Material = {
      id: editingMaterial ? editingMaterial.id : `mat-${Date.now()}`,
      name,
      type,
      quantity: Number(quantity),
      unit: unit || 'unidade',
      unitPrice: Number(unitPrice),
      minQuantity: Number(minQuantity),
      supplier: supplier || 'Diverso',
    };

    if (editingMaterial) {
      onUpdateMaterial(data);
      setEditingMaterial(null);
    } else {
      onAddMaterial(data);
    }

    // Reset Form
    setName('');
    setType('eletrodos');
    setQuantity(0);
    setUnit('kg');
    setUnitPrice(0);
    setMinQuantity(0);
    setSupplier('');
    setFormError('');
    setIsAddingMode(false);
  };

  const startEdit = (m: Material) => {
    setEditingMaterial(m);
    setName(m.name);
    setType(m.type);
    setQuantity(m.quantity);
    setUnit(m.unit);
    setUnitPrice(m.unitPrice);
    setMinQuantity(m.minQuantity);
    setSupplier(m.supplier);
    setIsAddingMode(true);
  };

  const cancelForm = () => {
    setName('');
    setType('eletrodos');
    setQuantity(0);
    setUnit('kg');
    setUnitPrice(0);
    setMinQuantity(0);
    setSupplier('');
    setFormError('');
    setEditingMaterial(null);
    setIsAddingMode(false);
  };

  // Filter materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || m.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeNameInPortuguese = (t: MaterialType) => {
    switch (t) {
      case 'eletrodos': return 'Eletrodos';
      case 'arames_mig': return 'Arames MIG/Mag';
      case 'gases': return 'Gás de Proteção';
      case 'chapas_perfis': return 'Chapas & Perfis';
      case 'abrasivos': return 'Discos & Abrasivos';
      case 'outros': return 'Outros Insumos';
    }
  };

  const getStockAlertStyle = (m: Material) => {
    if (m.quantity <= 0) return 'text-rose-450 bg-rose-500/10 border-rose-500/20';
    if (m.quantity <= m.minQuantity) return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
    return 'text-slate-200 bg-[#08090d] border-slate-800';
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Package className="w-5 h-5 text-amber-400" />
            Lista de Materiais e Estoque ({materials.length})
          </h2>
          <p className="text-xs text-slate-400">Controles de consumo e rastreamento de cargas para TIG, MIG e eletrodo revestido.</p>
        </div>
        {!isAddingMode && (
          <button
            id="mat-add-btn"
            onClick={() => setIsAddingMode(true)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.2)] transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Novo Insumo
          </button>
        )}
      </div>

      {/* Adding Form */}
      {isAddingMode && (
        <div className="bg-[#0d0e15] rounded-xl border border-slate-800 p-6 shadow-xl animate-fade-in text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              {editingMaterial ? 'Editar Detalhes do Insumo' : 'Cadastrar Novo Insumo de Oficina'}
            </h3>
            <button 
              id="mat-cancel-form"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nome do Insumo */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome Comercial / Descrição do Material *</label>
                <input
                  id="mat-form-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Eletrodo Revestido Esab E7018 - 3.25mm"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria de Insumo</label>
                <select
                  id="mat-form-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as MaterialType)}
                  className="w-full text-xs px-3 py-2.5 bg-[#0c0d15] border border-slate-800 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-medium"
                >
                  <option value="eletrodos">Eletrodos Revestidos</option>
                  <option value="arames_mig">Arame MIG/MAG (Bobinas)</option>
                  <option value="gases">Gases (Cilindros / m³)</option>
                  <option value="chapas_perfis">Chapas, Perfis e Canos</option>
                  <option value="abrasivos">Discos, Flaps e Abrasivos</option>
                  <option value="outros">Outros materiais</option>
                </select>
              </div>

              {/* Quantidade */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quantidade Atual</label>
                <input
                  id="mat-form-qty"
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-mono"
                />
              </div>

              {/* Unidade */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unidade de Medida</label>
                <input
                  id="mat-form-unit"
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Ex: kg, bobina, cilindro, chapa, un"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Quantidade Mínima para Alerta */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estoque Mínimo (Alerta)</label>
                <input
                  id="mat-form-min"
                  type="number"
                  step="any"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="Ex: 5"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-mono"
                />
              </div>

              {/* Fornecedor */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fornecedor Preferencial</label>
                <input
                  id="mat-form-supplier"
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Ex: Gerdau S.A., Liquigás Distribuidora, Categoria etc."
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              {/* Preço Unitário */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preço de Custo (Unidade)</label>
                <input
                  id="mat-form-price"
                  type="number"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="Ex: 28.50"
                  className="w-full text-xs px-3 py-2.5 bg-[#08090d] border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                id="mat-form-cancel"
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                id="mat-form-submit"
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-2 text-xs uppercase tracking-wider rounded-lg shadow-md transition"
              >
                {editingMaterial ? 'Salvar Alterações' : 'Adicionar no Estoque'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Table */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 bg-[#0d0e15] flex items-center px-4 py-2.5 rounded-xl border border-slate-800/80 shadow-lg gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="mat-search"
            type="text"
            placeholder="Busque insumos de solda por nome comercial, fabricante preferencial ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 text-xs w-full focus:outline-hidden text-slate-100 placeholder:text-slate-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none shrink-0 select-none">
          <button
            id="btn-filter-all"
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer border ${
              selectedType === 'all' 
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md' 
                : 'bg-[#12131a] text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Todos Insumos
          </button>
          {(['eletrodos', 'arames_mig', 'gases', 'chapas_perfis', 'abrasivos', 'outros'] as MaterialType[]).map((t) => (
            <button
              key={t}
              id={`btn-filter-${t}`}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer border ${
                selectedType === t 
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md' 
                  : 'bg-[#12131a] text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {getTypeNameInPortuguese(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table Grid */}
      <div className="bg-[#0d0e15] rounded-xl border border-slate-800/80 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#12131a] border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                <th className="px-6 py-4">Insumo / Especificação Técnica</th>
                <th className="px-6 py-4 col-span-1">Categoria</th>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">Custo Unitário</th>
                <th className="px-6 py-4 text-center">Nível do Estoque</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => {
                  const isLow = material.quantity <= material.minQuantity;
                  const isOutOfStock = material.quantity <= 0;

                  return (
                    <tr key={material.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-200 text-sm leading-tight">{material.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono leading-none">Cód: {material.id}</span>
                            {isOutOfStock ? (
                              <span className="text-[8px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded leading-none">ESGOTADO</span>
                            ) : isLow ? (
                              <span className="text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1 leading-none">
                                <AlertTriangle className="w-2.5 h-2.5" /> CRÍTICO
                              </span>
                            ) : (
                              <span className="text-[8px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded leading-none">REGULADO</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-[#12131a] border border-slate-800/80 px-2.5 py-1 rounded-md">
                          {getTypeNameInPortuguese(material.type)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-slate-400 truncate block max-w-[150px] font-medium">{material.supplier}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-200 font-mono text-sm leading-none">{formatCurrency(material.unitPrice)}</p>
                          <p className="text-[10px] text-slate-500 leading-none">por {material.unit}</p>
                        </div>
                      </td>

                      {/* Stock controller with fast plus/minus */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="flex items-center gap-2">
                            <button
                              id={`stock-dec-${material.id}`}
                              onClick={() => adjustStock(material.id, -1)}
                              className="p-1 hover:bg-[#1f202e] bg-[#12131a] text-slate-300 hover:text-white border border-slate-800 rounded-sm hover:-translate-x-[1px] active:scale-90 transition cursor-pointer"
                              title="Reduzir 1 unidade"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <span className={`font-mono font-extrabold text-center w-16 text-xs py-1 px-2 rounded-sm border ${getStockAlertStyle(material)}`}>
                              {material.quantity}
                            </span>
                            <button
                              id={`stock-inc-${material.id}`}
                              onClick={() => adjustStock(material.id, 1)}
                              className="p-1 hover:bg-[#1f202e] bg-[#12131a] text-slate-300 hover:text-white border border-slate-800 rounded-sm hover:translate-x-[1px] active:scale-90 transition cursor-pointer"
                              title="Aumentar 1 unidade"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Alerta: {material.minQuantity} {material.unit}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            id={`mat-edit-${material.id}`}
                            onClick={() => startEdit(material)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800/30 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`mat-delete-${material.id}`}
                            onClick={() => {
                              if (confirm(`Remover ${material.name} do estoque?`)) {
                                onDeleteMaterial(material.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-450 bg-slate-800/30 hover:bg-rose-500/10 border border-slate-800 rounded-lg transition"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    Nenhum insumo encontrado nas condições filtradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
