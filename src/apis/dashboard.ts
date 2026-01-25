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
    // Obtener múltiples datos en paralelo
    const [
      teachersRes,
      studentsRes,
      repsRes,
      financialRes,
      topDebtorsRes,
      recentTransactionsRes,
      summaryRes
    ] = await Promise.all([
      // Docentes
      api.get('/private/academic/teacher/list', { params: { limit: 1 } }),
      // Estudiantes
      api.get('/private/user/students/list', { params: { limit: 1 } }),
      // Representantes con filtros
      api.get('/private/balance/representatives', { 
        params: { 
          limit: 1,
          hasDebt: 'false',
          hasCredit: 'false'
        } 
      }),
      // Estadísticas financieras
      api.get('/private/balance/statistics/financial'),
      // Top deudores
      api.get('/private/balance/representatives/top-debtors', { params: { limit: 5 } }),
      // Transacciones recientes
      api.get('/private/balance/representative/transactions/recent', { params: { limit: 10 } }),
      // Resumen general
      api.get('/private/user/statistics')
    ]);

    // Procesar los datos
    const teachers = teachersRes.data.content || [];
    const students = studentsRes.data.content || [];
    const reps = repsRes.data.content?.representatives || [];
    const financial = financialRes.data.content || {};
    const topDebtors = topDebtorsRes.data.content?.debtors || [];
    const recentTransactions = recentTransactionsRes.data.content || [];
    const summary = summaryRes.data.content || {};

    // Calcular estadísticas
    const activeTeachers = teachers.filter((t: any) => t.status === true).length;
    
    // Agrupar estudiantes por status
    const studentsByStatus = {
      regular: students.filter((s: any) => s.status === 'regular').length,
      pendiente: students.filter((s: any) => s.status === 'pendiente').length,
      repitiente: students.filter((s: any) => s.status === 'repitiente').length,
      condicionado: students.filter((s: any) => s.status === 'condicionado').length,
      inactivo: students.filter((s: any) => s.status === 'inactivo').length,
    };

    // Calcular porcentaje de pago (representantes sin deuda)
    const repsWithDebt = reps.filter((r: any) => (r.balance || 0) < 0).length;
    const repsWithCredit = reps.filter((r: any) => (r.balance || 0) > 0).length;
    const repsZero = reps.filter((r: any) => (r.balance || 0) === 0).length;
    const paymentPercentage = reps.length > 0 
      ? Math.round(((reps.length - repsWithDebt) / reps.length) * 100)
      : 0;

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
      financial: {
        totalDebt: Math.abs(financial.general?.totalDebt || 0),
        totalCredit: financial.general?.totalCredit || 0,
        monthlyCollected: financial.monthlyTransactions?.[0]?.totalDeposits || 0,
        pendingTransactions: financial.monthlyTransactions?.[0]?.transactionCount || 0
      },
      recentTransactions: recentTransactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        representativeName: t.representative?.fullName || 'N/A',
        date: new Date(t.createdAt).toLocaleDateString(),
        status: t.status
      })),
      topDebtors: topDebtors.map((d: any) => ({
        id: d.id,
        fullName: d.fullName,
        identityCard: d.identityCard,
        debtAmount: Math.abs(d.balance || 0),
        studentCount: d.activeStudents || 0
      })),
      topTeachers: [], // Se puede poblar si tienes endpoint
      summary: {
        totalUsers: summary.users?.total || 0,
        totalSchedules: 0, // Agregar si tienes endpoint
        totalSubjects: 0,  // Agregar si tienes endpoint
        totalAssignments: 0 // Agregar si tienes endpoint
      }
    };
  } catch (error: any) {
    console.error('Error loading dashboard stats:', error);
    throw new Error(error.response?.data?.error?.[0] || 'Error al cargar estadísticas');
  }
}

// Función para obtener datos más específicos por sección
export async function getDashboardSectionData(section: string) {
  switch (section) {
    case 'financial':
      return api.get('/private/balance/statistics/financial');
    case 'teachers':
      return api.get('/private/academic/teacher/list', { params: { limit: 100 } });
    case 'students':
      return api.get('/private/user/students/list', { params: { limit: 100 } });
    case 'transactions':
      return api.get('/private/balance/representative/transactions/recent', { params: { limit: 20 } });
    default:
      throw new Error('Sección no válida');
  }
}