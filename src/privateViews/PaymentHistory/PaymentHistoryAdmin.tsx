import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaHistory } from 'react-icons/fa';
import { toast } from 'react-toastify';
import type { Representative } from '../balance/ManualBalance';
import { getAllTransactions } from '../../apis/balance';
import api from '../../library/axios';
import { formatCurrency, mapPaymentMethodToDisplay } from '../balance/utils/balanceUtils';

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  description: string;
  paymentMethod: string;
  reference: string;
  status: string;
  createdAt: string;
  student?: {
    id: string;
    fullName: string;
    currentGrade?: string;
  } | null;
  representative?: {
    id: string;
    fullName: string;
    identityCard: string;
  };
}

const PaymentHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    studentId: '',
    representativeId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({ totalRecords: 0, currentPage: 1, totalPages: 1 });
  const [representativesList, setRepresentativesList] = useState<Representative[]>([]);
  const [studentsList, setStudentsList] = useState<{ id: string; fullName: string }[]>([]);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [repSearchTerm, setRepSearchTerm] = useState('');

  // Cargar representantes iniciales y cuando se busca
  const loadRepresentatives = useCallback(async (term: string = '') => {
    try {
      const { data } = await api.get('/private/balance/representatives', {
        params: { search: term, limit: 100 }
      });
      if (data.result) {
        setRepresentativesList(data.content.representatives || data.content || []);
      }
    } catch (error) {
      // silencio si falla la carga de representantes
    }
  }, []);

  // Cargar representantes al montar
  useEffect(() => {
    loadRepresentatives('');
  }, [loadRepresentatives]);

  // Buscar representantes por texto
  const handleRepSearch = (term: string) => {
    setRepSearchTerm(term);
    loadRepresentatives(term);
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllTransactions({
        ...filters,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        representativeId: filters.representativeId || undefined,
        studentId: filters.studentId || undefined,
        search: filters.search || undefined,
      });
      if (response.result) {
        setTransactions(response.content.transactions);
        setPagination(response.content.pagination);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar transacciones');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [filters.page, filters.representativeId, filters.studentId]);

  // Al seleccionar un representante, cargar sus estudiantes
  const handleRepresentativeSelect = async (repId: string) => {
    setFilters(prev => ({ ...prev, representativeId: repId, studentId: '' }));
    if (repId) {
      const { data } = await api.get(`/private/balance/representative/${repId}/balance`);
      if (data.result) {
        setSelectedRep(data.content.representative);
        setStudentsList(data.content.representative.students || []);
      }
    } else {
      setSelectedRep(null);
      setStudentsList([]);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      studentId: '',
      representativeId: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20,
    });
    setSelectedRep(null);
    setStudentsList([]);
    setRepSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center space-x-3">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-3 rounded-xl shadow-md">
            <FaHistory className="text-2xl text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Historial de Pagos</h1>
            <p className="text-gray-600">Consulte todas las transacciones realizadas en el sistema</p>
          </div>
        </div>

        {/* Panel de filtros */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Referencia, descripción..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Representante</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar representante..."
                  value={repSearchTerm}
                  onChange={(e) => handleRepSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-1"
                />
                <select
                  value={filters.representativeId}
                  onChange={(e) => handleRepresentativeSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todos</option>
                  {representativesList.map(rep => (
                    <option key={rep.id} value={rep.id}>{rep.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estudiante</label>
              <select
                value={filters.studentId}
                onChange={(e) => handleFilterChange('studentId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={!selectedRep}
              >
                <option value="">Todos</option>
                {studentsList.map(st => (
                  <option key={st.id} value={st.id}>{st.fullName}</option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button onClick={clearFilters} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Limpiar filtros
            </button>
            <button onClick={() => fetchTransactions()} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Aplicar filtros
            </button>
          </div>
        </div>

        {/* Tabla de transacciones */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No se encontraron transacciones con los filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Representante</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Método</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Referencia</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {t.representative?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {t.student?.fullName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          t.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type === 'deposit' ? 'DEPÓSITO' : t.type.toUpperCase()}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold ${
                        t.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.type === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                        {mapPaymentMethodToDisplay(t.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {t.reference || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {t.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          t.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t">
              <span className="text-sm text-gray-600">
                Mostrando {((filters.page - 1) * filters.limit) + 1}-
                {Math.min(filters.page * filters.limit, pagination.totalRecords)} de {pagination.totalRecords}
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={filters.page === pagination.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="px-3 py-1 border rounded-md disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;