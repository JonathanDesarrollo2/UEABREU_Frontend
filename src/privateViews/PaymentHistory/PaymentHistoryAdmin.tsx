import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaHistory, FaFilter, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllTransactions } from '../../apis/balance';
import { getPaginatedStudentsAPI } from '../../apis/student';
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
  student?: { id: string; fullName: string; currentGrade?: string } | null;
  representative?: { id: string; fullName: string; identityCard: string };
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

  const [repSearchTerm, setRepSearchTerm] = useState('');
  const [repResults, setRepResults] = useState<any[]>([]);
  const [showRepDropdown, setShowRepDropdown] = useState(false);

  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const repInputRef = useRef<HTMLInputElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);

  const searchReps = useCallback(async (term: string) => {
    if (term.length < 2) {
      setRepResults([]);
      return;
    }
    try {
      const { data } = await api.get('/private/balance/representatives', {
        params: { search: term, limit: 10 }
      });
      if (data.result) {
        setRepResults(data.content.representatives || data.content || []);
        setShowRepDropdown(true);
      }
    } catch (error) {}
  }, []);

  const searchStudents = useCallback(async (term: string) => {
    if (term.length < 2) {
      setStudentResults([]);
      return;
    }
    try {
      const response = await getPaginatedStudentsAPI(1, 10, term);
      if (response.result) {
        setStudentResults(response.content || []);
        setShowStudentDropdown(true);
      }
    } catch (error) {}
  }, []);

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
  }, [filters.page]);

  const handleApplyFilters = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchTransactions();
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
    setRepSearchTerm('');
    setStudentSearchTerm('');
    setRepResults([]);
    setStudentResults([]);
    setShowRepDropdown(false);
    setShowStudentDropdown(false);
    fetchTransactions();
  };

  const selectRepresentative = (rep: any) => {
    setFilters(prev => ({ ...prev, representativeId: rep.id, page: 1 }));
    setRepSearchTerm(rep.fullName);
    setShowRepDropdown(false);
  };

  const selectStudent = (student: any) => {
    setFilters(prev => ({ ...prev, studentId: student.id, page: 1 }));
    setStudentSearchTerm(student.fullName);
    setShowStudentDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-8xl mx-auto"> {/* Ancho ampliado */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <FaHistory className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Historial de Transacciones</h1>
              <p className="text-gray-600">Consulte todos los movimientos financieros del sistema</p>
            </div>
          </div>
          <div className="hidden md:block bg-white rounded-xl px-5 py-2 shadow-sm">
            <span className="text-sm text-gray-500">Total registros: </span>
            <span className="font-bold text-blue-700">{pagination.totalRecords}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <FaFilter className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-700">Filtros de búsqueda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Referencia, descripción..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Representante</label>
              <input
                ref={repInputRef}
                type="text"
                value={repSearchTerm}
                onChange={(e) => {
                  setRepSearchTerm(e.target.value);
                  if (!e.target.value) {
                    setFilters(prev => ({ ...prev, representativeId: '' }));
                  }
                  searchReps(e.target.value);
                }}
                placeholder="Buscar representante..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400"
              />
              {showRepDropdown && repResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                  {repResults.map(rep => (
                    <div
                      key={rep.id}
                      onClick={() => selectRepresentative(rep)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                    >
                      {rep.fullName} <span className="text-sm text-gray-400">({rep.identityCard})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Estudiante</label>
              <input
                ref={studentInputRef}
                type="text"
                value={studentSearchTerm}
                onChange={(e) => {
                  setStudentSearchTerm(e.target.value);
                  if (!e.target.value) {
                    setFilters(prev => ({ ...prev, studentId: '' }));
                  }
                  searchStudents(e.target.value);
                }}
                placeholder="Buscar estudiante..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400"
              />
              {showStudentDropdown && studentResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                  {studentResults.map((student: any) => (
                    <div
                      key={student.id}
                      onClick={() => selectStudent(student)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
                    >
                      {student.fullName} <span className="text-sm text-gray-400">({student.currentGrade || 'Sin grado'})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Desde</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Hasta</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              <FaSearch className="inline mr-2" /> Buscar
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100"
            >
              <FaTimes className="inline mr-2" /> Limpiar filtros
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20">
              <FaHistory className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron transacciones</p>
              <p className="text-gray-400">Pruebe ajustando los filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Representante</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Estudiante</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Método</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Referencia</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('es-VE') : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {t.representative?.fullName || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {t.student?.fullName || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {mapPaymentMethodToDisplay(t.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {t.reference || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                        {t.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.status === 'completed' ? 'Completado' : t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
              <span className="text-sm text-gray-600">
                Página {pagination.currentPage} de {pagination.totalPages} (Total: {pagination.totalRecords})
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                >
                  <FaChevronLeft className="text-gray-600" />
                </button>
                <button
                  disabled={filters.page === pagination.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                >
                  <FaChevronRight className="text-gray-600" />
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