// src/apis/dashboard.ts
import api from "../library/axios";

export interface DashboardStats {
  teachers: {
    total: number;
    active: number;
    inactive: number;
  };
  students: {
    total: number;
    active: number;
    byStatus: {
      regular: number;
      pendiente: number;
      repitiente: number;
      condicionado: number;
      inactivo: number;
    };
  };
  representatives: {
    total: number;
    withDebt: number;
    withCredit: number;
    zeroBalance: number;
    paymentPercentage: number;
  };
  financial: {
    totalDebt: number;
    totalCredit: number;
    monthlyCollected: number;
    pendingTransactions: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    representativeName: string;
    date: string;
    status: string;
  }>;
  topDebtors: Array<{
    id: string;
    fullName: string;
    identityCard: string;
    debtAmount: number;
    studentCount: number;
  }>;
  topTeachers: Array<{
    id: string;
    fullName: string;
    specialization: string;
    subjectCount: number;
  }>;
  summary: {
    totalUsers: number;
    totalSchedules: number;
    totalSubjects: number;
    totalAssignments: number;
  };
}

export async function getDashboardStatsAPI(): Promise<DashboardStats> {
  try {
    // Obtener múltiples datos en paralelo - CORREGIDO RUTAS
    const [
      teachersRes,
      studentsRes,
      repsRes,
      financialRes,
      topDebtorsRes,
      recentTransactionsRes
    ] = await Promise.all([
      // Docentes - CORREGIDO: usando endpoint correcto
      api.get('/private/academic/teacher/list', { params: { limit: 100 } }),
      // Estudiantes - CORREGIDO: usando endpoint correcto
      api.get('/private/user/students/list', { params: { limit: 100 } }),
      // Representantes - CORREGIDO: solo contamos total, sin filtros innecesarios
      api.get('/private/balance/representatives', { 
        params: { 
          limit: 100,
          page: 1
        } 
      }),
      // Estadísticas financieras - RUTA CORRECTA (ya la tienes)
      api.get('/private/balance/statistics/financial'),
      // Top deudores - RUTA CORRECTA
      api.get('/private/balance/representatives/top-debtors', { params: { limit: 5 } }),
      // Transacciones recientes - CORREGIDO: sin "representative" en la ruta
      api.get('/private/balance/transactions/recent', { params: { limit: 10 } })
    ]);

    console.log('✅ Dashboard API responses:', {
      teachers: teachersRes.data,
      students: studentsRes.data,
      reps: repsRes.data,
      financial: financialRes.data,
      topDebtors: topDebtorsRes.data,
      transactions: recentTransactionsRes.data
    });

    // Procesar los datos con validación
    const teachers = teachersRes.data?.content || [];
    const students = studentsRes.data?.content || [];
    const reps = repsRes.data?.content?.representatives || [];
    const financial = financialRes.data?.content || {};
    const topDebtors = topDebtorsRes.data?.content?.debtors || [];
    const recentTransactions = recentTransactionsRes.data?.content || [];

    // Calcular estadísticas de docentes
    const activeTeachers = teachers.filter((t: any) => t.status === true).length;
    
    // Calcular estudiantes por estado
    const studentsByStatus = {
      regular: students.filter((s: any) => s.status === 'regular').length,
      pendiente: students.filter((s: any) => s.status === 'pendiente').length,
      repitiente: students.filter((s: any) => s.status === 'repitiente').length,
      condicionado: students.filter((s: any) => s.status === 'condicionado').length,
      inactivo: students.filter((s: any) => s.status === 'inactivo').length,
    };

    // Calcular estadísticas de representantes
    const repsWithDebt = reps.filter((r: any) => {
      const balance = r.balance || 0;
      return balance < 0;
    }).length;
    
    const repsWithCredit = reps.filter((r: any) => {
      const balance = r.balance || 0;
      return balance > 0;
    }).length;
    
    const repsZero = reps.filter((r: any) => {
      const balance = r.balance || 0;
      return balance === 0;
    }).length;
    
    const paymentPercentage = reps.length > 0 
      ? Math.round(((reps.length - repsWithDebt) / reps.length) * 100)
      : 0;

    // Procesar datos financieros con valores por defecto
    const financialData = {
      totalDebt: Math.abs(financial.general?.totalDebt || 0),
      totalCredit: financial.general?.totalCredit || 0,
      monthlyCollected: financial.monthlyTransactions?.[0]?.totalDeposits || 0,
      pendingTransactions: financial.monthlyTransactions?.[0]?.transactionCount || 0
    };

    // Procesar transacciones recientes
    const formattedTransactions = recentTransactions.map((t: any) => ({
      id: t.id || '',
      type: t.type || 'deposit',
      amount: t.amount || 0,
      representativeName: t.representative?.fullName || 'N/A',
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
      status: t.status || 'completed'
    }));

    // Procesar top deudores
    const formattedTopDebtors = topDebtors.map((d: any) => ({
      id: d.id || '',
      fullName: d.fullName || 'N/A',
      identityCard: d.identityCard || 'N/A',
      debtAmount: Math.abs(d.balance || d.debtAmount || 0),
      studentCount: d.activeStudents || 0
    }));

    return {
      teachers: {
        total: teachers.length,
        active: activeTeachers,
        inactive: teachers.length - activeTeachers
      },
      students: {
        total: students.length,
        active: studentsByStatus.regular,
        byStatus: studentsByStatus
      },
      representatives: {
        total: reps.length,
        withDebt: repsWithDebt,
        withCredit: repsWithCredit,
        zeroBalance: repsZero,
        paymentPercentage
      },
      financial: financialData,
      recentTransactions: formattedTransactions,
      topDebtors: formattedTopDebtors,
      topTeachers: [], // Puedes llenar esto si tienes endpoint específico
      summary: {
        totalUsers: teachers.length + reps.length, // Temporal: suma de docentes + representantes
        totalSchedules: 0, // Necesitarás endpoint específico
        totalSubjects: 0,  // Necesitarás endpoint específico  
        totalAssignments: 0 // Necesitarás endpoint específico
      }
    };
  } catch (error: any) {
    console.error('❌ Error loading dashboard stats:', error);
    console.error('Error response:', error.response?.data);
    
    // Retornar datos por defecto en caso de error
    return {
      teachers: { total: 0, active: 0, inactive: 0 },
      students: { 
        total: 0, 
        active: 0, 
        byStatus: { 
          regular: 0, 
          pendiente: 0, 
          repitiente: 0, 
          condicionado: 0, 
          inactivo: 0 
        }
      },
      representatives: { 
        total: 0, 
        withDebt: 0, 
        withCredit: 0, 
        zeroBalance: 0, 
        paymentPercentage: 0 
      },
      financial: { 
        totalDebt: 0, 
        totalCredit: 0, 
        monthlyCollected: 0, 
        pendingTransactions: 0 
      },
      recentTransactions: [],
      topDebtors: [],
      topTeachers: [],
      summary: {
        totalUsers: 0,
        totalSchedules: 0,
        totalSubjects: 0,
        totalAssignments: 0
      }
    };
  }
}

// Función para obtener datos específicos por sección
export async function getDashboardSectionData(section: string) {
  try {
    switch (section) {
      case 'financial':
        const financialRes = await api.get('/private/balance/statistics/financial');
        return {
          result: true,
          content: financialRes.data?.content || {},
          error: []
        };
      case 'teachers':
        const teachersRes = await api.get('/private/academic/teacher/list', { params: { limit: 100 } });
        return {
          result: true,
          content: teachersRes.data?.content || [],
          error: []
        };
      case 'students':
        const studentsRes = await api.get('/private/user/students/list', { params: { limit: 100 } });
        return {
          result: true,
          content: studentsRes.data?.content || [],
          error: []
        };
      case 'transactions':
        const transactionsRes = await api.get('/private/balance/transactions/recent', { params: { limit: 20 } });
        return {
          result: true,
          content: transactionsRes.data?.content || [],
          error: []
        };
      default:
        throw new Error('Sección no válida');
    }
  } catch (error: any) {
    console.error(`Error loading ${section} data:`, error);
    return {
      result: false,
      content: [],
      error: [error.message || 'Error al cargar datos']
    };
  }
}