import React, { useState } from 'react';
import { Plus, Building2, Check, Mail, Briefcase, Calendar, ShieldCheck, X } from 'lucide-react';
import { Client } from '../types';

interface ClientsViewProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  activeClientId: string;
  setActiveClientId: (id: string) => void;
  triggerToast: (msg: string) => void;
  logAudit: (action: string, affected?: string, prev?: string, next?: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  setClients,
  activeClientId,
  setActiveClientId,
  triggerToast,
  logAudit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<Client['businessType']>('LLC');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [accountingBasis, setAccountingBasis] = useState<'Cash' | 'Accrual'>('Accrual');
  const [fiscalYear, setFiscalYear] = useState('Calendar Year (Jan - Dec)');

  function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: `cli_${Date.now()}`,
      name: name.trim(),
      businessType,
      contactName: contactName.trim() || 'Primary Contact',
      email: email.trim() || 'accounting@example.com',
      industry: industry.trim() || 'Professional Services',
      accountingBasis,
      fiscalYear,
      status: 'Active',
    };

    setClients(prev => [...prev, newClient]);
    setActiveClientId(newClient.id);
    logAudit('CREATE_CLIENT_ENTITY', newClient.id, undefined, `Created entity: ${newClient.name} (${newClient.businessType})`);
    triggerToast(`Client ${newClient.name} created and activated.`);
    
    setName('');
    setContactName('');
    setEmail('');
    setIndustry('');
    setShowAddModal(false);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Client & Entity Management</span>
          </h2>
          <p className="text-sm text-white/60">Configure multi-entity accounting profiles, tax classification, and reconciliation rules.</p>
        </div>
        <button 
          id="btn-open-add-client-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4.5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client Entity</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => {
          const isActive = client.id === activeClientId;
          return (
            <div 
              key={client.id}
              id={`client-card-${client.id}`}
              className={`backdrop-blur-xl rounded-3xl p-6 transition flex flex-col justify-between space-y-5 shadow-xl ${
                isActive 
                  ? 'bg-white/[0.07] border-2 border-indigo-400/70 shadow-2xl shadow-indigo-500/10' 
                  : 'bg-white/[0.04] border border-white/12 hover:border-white/25 hover:bg-white/[0.06]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/30">
                    {client.businessType} • {client.industry}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    client.status === 'Active' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-white/50 border border-white/10'
                  }`}>
                    {client.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-tight">{client.name}</h3>

                <div className="space-y-2.5 text-xs text-white/70 py-3.5 mt-2 border-t border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-white/40" />
                      <span>Contact:</span>
                    </span>
                    <span className="font-medium text-white truncate max-w-[180px]">{client.contactName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-white/40" />
                      <span>Email:</span>
                    </span>
                    <span className="font-medium text-white/80 truncate max-w-[180px]">{client.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
                      <span>Accounting Basis:</span>
                    </span>
                    <span className="font-semibold text-indigo-300">{client.accountingBasis} (US GAAP)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      <span>Fiscal Period:</span>
                    </span>
                    <span className="font-medium text-white/80">{client.fiscalYear}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  id={`btn-select-client-${client.id}`}
                  onClick={() => {
                    setActiveClientId(client.id);
                    triggerToast(`Switched active entity to ${client.name}`);
                  }}
                  className={`w-full py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 backdrop-blur-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 border border-white/20'
                      : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white border border-white/15'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Current Active Entity</span>
                    </>
                  ) : (
                    <span>Switch to this Entity</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 border border-white/20 rounded-3xl w-full max-w-lg p-6.5 space-y-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3.5">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Add New Client Business Entity</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Legal Entity Name</label>
                <input 
                  id="input-new-client-name"
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Cascade Meridian Technologies LLC" 
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-white/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Business Structure</label>
                  <select
                    id="select-new-client-type"
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md"
                  >
                    <option value="LLC" className="bg-slate-900 text-white">LLC</option>
                    <option value="C-Corp" className="bg-slate-900 text-white">C-Corporation</option>
                    <option value="S-Corp" className="bg-slate-900 text-white">S-Corporation</option>
                    <option value="Partnership" className="bg-slate-900 text-white">Partnership</option>
                    <option value="Sole Proprietorship" className="bg-slate-900 text-white">Sole Proprietorship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Accounting Basis</label>
                  <select
                    id="select-new-client-basis"
                    value={accountingBasis}
                    onChange={e => setAccountingBasis(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md"
                  >
                    <option value="Accrual" className="bg-slate-900 text-white">Accrual (US GAAP)</option>
                    <option value="Cash" className="bg-slate-900 text-white">Cash Basis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Primary Contact</label>
                  <input 
                    id="input-new-client-contact"
                    type="text" 
                    value={contactName} 
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. David Vance" 
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-white/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Contact Email</label>
                  <input 
                    id="input-new-client-email"
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="david@cascadetech.example" 
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Industry Sector</label>
                <input 
                  id="input-new-client-industry"
                  type="text" 
                  value={industry} 
                  onChange={e => setIndustry(e.target.value)}
                  placeholder="e.g. Enterprise SaaS & Cloud Computing" 
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400 backdrop-blur-md placeholder-white/40"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-white/10 text-white/80 rounded-xl text-sm font-semibold hover:bg-white/15 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  id="btn-submit-new-client"
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/25 border border-white/20 cursor-pointer"
                >
                  Save & Activate Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
