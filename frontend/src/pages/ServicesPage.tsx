import React, { useState, useEffect } from 'react';
import {
  Plus,
  Scissors,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  Filter,
  Command,
} from 'lucide-react';
import { api } from '../services/api';
import type { Service } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Haircut',
    duration_minutes: 45,
    price: 40,
    description: '',
    is_active: true,
  });

  // Delete Modal State
  const [deleteConfirmService, setDeleteConfirmService] = useState<Service | null>(null);

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Haircut',
      duration_minutes: 45,
      price: 40,
      description: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category || 'Haircut',
      duration_minutes: service.duration_minutes,
      price: service.price,
      description: service.description,
      is_active: service.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingService) {
      await api.updateService(editingService.id, formData);
      showToast(`Service "${formData.name}" updated successfully!`);
    } else {
      await api.createService(formData);
      showToast(`Service "${formData.name}" added to catalog!`);
    }

    setIsModalOpen(false);
    await loadServices();
  };

  const handleToggleActive = async (service: Service) => {
    const updated = await api.updateService(service.id, { is_active: !service.is_active });
    showToast(
      `Service "${service.name}" is now ${updated.is_active ? 'Active' : 'Hidden from customers'}.`
    );
    await loadServices();
  };

  const handleDelete = async () => {
    if (!deleteConfirmService) return;
    await api.deleteService(deleteConfirmService.id);
    showToast(`Service "${deleteConfirmService.name}" deleted.`);
    setDeleteConfirmService(null);
    await loadServices();
  };

  const categories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));

  const filteredServices = services.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = s.name.toLowerCase().includes(term);
      const matchDesc = s.description.toLowerCase().includes(term);
      return matchName || matchDesc;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl shadow-xs animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Services & Pricing Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure service offerings, durations, and pricing displayed to mobile app customers.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#144e3e] hover:bg-[#0f3c30] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search services by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e] placeholder:text-slate-400 shadow-xs"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-400">
            <Command className="w-2.5 h-2.5" />
            <span>F</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e] w-full sm:w-auto shadow-xs"
          >
            <option value="all">All Categories ({services.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Cards Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <div className="w-8 h-8 border-3 border-[#144e3e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading catalog...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <Scissors className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No services found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Create your first service offering to allow clients to book with you.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#144e3e] text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-3xl border transition-all p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 ${
                service.is_active ? 'border-slate-200/80' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold tracking-wider text-[#144e3e] uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {service.category || 'General'}
                  </span>
                  <Badge status={service.is_active ? 'active' : 'inactive'} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4">{service.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {service.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{service.duration_minutes} minutes</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">
                    ${service.price.toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors ${
                    service.is_active
                      ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      : 'text-[#144e3e] hover:bg-emerald-50'
                  }`}
                >
                  {service.is_active ? 'Hide from App' : 'Publish to App'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(service)}
                    className="p-2 text-slate-400 hover:text-[#144e3e] hover:bg-emerald-50 rounded-xl transition-colors"
                    title="Edit Service"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmService(service)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add or Edit Service */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingService ? 'Edit Service' : 'Add New Service Offering'}
          subtitle="Configure pricing and booking slot duration"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Executive Haircut & Style"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Haircut, Beard..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Price ($ USD) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration (mins) *
                </label>
                <select
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })
                  }
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e] bg-white"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={75}>75 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what is included in this service..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#144e3e]/20 focus:border-[#144e3e]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_active_toggle"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-[#144e3e] focus:ring-[#144e3e]"
              />
              <label htmlFor="is_active_toggle" className="text-xs font-semibold text-slate-700">
                Visible & bookable immediately by customers in mobile app
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-[#144e3e] hover:bg-[#0f3c30] text-white rounded-2xl shadow-xs transition-colors"
              >
                {editingService ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmService && (
        <Modal
          isOpen={!!deleteConfirmService}
          onClose={() => setDeleteConfirmService(null)}
          title="Delete Service Offering"
          subtitle={deleteConfirmService.name}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this service? Past booking records will
              remain preserved in history.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmService(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-xs"
              >
                Delete Service
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
