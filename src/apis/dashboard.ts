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
    totalDebt: number;       // USD
    totalCredit: number;     // USD
    monthlyCollected: number; // USD
    pendingTransactions: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;          // Bs original
    amountUSD?: number;
    bcvRate?: number;
    representativeName: string;
    date: string;
    status: string;
    paymentStatus?: string;
  }>;
  topDebtors: Array<{
    id: string;
    fullName: string;
    identityCard: string;
    debtAmount: number;      // USD
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
    console.log('🔄 Iniciando carga de dashboard...');

    const promises = [
      api.get('/private/academic/teacher/list', { params: { page: 1, limit: 100 } }),
      api.get('/private/user/students/list', { params: { limit: 1000 } }),
      api.get('/private/balance/representatives', { params: { page: 1, limit: 1000 } }),
      api.get('/private/balance/statistics/financial'),
      api.get('/private/balance/representatives/top-debtors', { params: { limit: 5 } }),
      api.get('/private/balance/transactions/recent', { params: { limit: 10 } }),
      api.get('/private/user/statistics')
    ];

    const results = await Promise.allSettled(promises);

    const teachersRes = results[0];
    const studentsRes = results[1];
    const repsRes = results[2];
    const financialRes = results[3];
    const topDebtorsRes = results[4];
    const recentTransactionsRes = results[5];
    const userStatsRes = results[6];

    const teachers = teachersRes.status === 'fulfilled' && teachersRes.value.data?.result
      ? teachersRes.value.data.content
      : [];

    const students = studentsRes.status === 'fulfilled' && studentsRes.value.data?.result
      ? studentsRes.value.data.content
      : [];

    const reps = repsRes.status === 'fulfilled' && repsRes.value.data?.result
      ? (repsRes.value.data.content?.representatives || repsRes.value.data.content || [])
      : [];

    const financial = financialRes.status === 'fulfilled' && financialRes.value.data?.result
      ? financialRes.value.data.content
      : {};

    const topDebtors = topDebtorsRes.status === 'fulfilled' && topDebtorsRes.value.data?.result
      ? (topDebtorsRes.value.data.content?.debtors || [])
      : [];

    const recentTransactions = recentTransactionsRes.status === 'fulfilled' && recentTransactionsRes.value.data?.result
      ? recentTransactionsRes.value.data.content
      : [];

    const userStats = userStatsRes.status === 'fulfilled' && userStatsRes.value.data?.result
      ? userStatsRes.value.data.content
      : {};

    // Calcular estadísticas de docentes
    const activeTeachers = teachers.filter((t: any) => t.status === true || t.status === 'active').length;

    // Calcular estudiantes por estado
    const studentsByStatus = {
      regular: students.filter((s: any) => s.status === 'regular').length,
      pendiente: students.filter((s: any) => s.status === 'pendiente').length,
      repitiente: students.filter((s: any) => s.status === 'repitiente').length,
      condicionado: students.filter((s: any) => s.status === 'condicionado').length,
      inactivo: students.filter((s: any) => s.status === 'inactivo' || s.status === false).length,
    };

    // Calcular representantes
    const repsWithDebt = reps.filter((r: any) => {
      const balance = r.balanceUSD ?? r.balance ?? 0;
      return balance < 0;
    }).length;
    const repsWithCredit = reps.filter((r: any) => {
      const balance = r.balanceUSD ?? r.balance ?? 0;
      return balance > 0;
    }).length;
    const repsZero = reps.filter((r: any) => {
      const balance = r.balanceUSD ?? r.balance ?? 0;
      return balance === 0;
    }).length;
    const paymentPercentage = reps.length > 0
      ? Math.round(((reps.length - repsWithDebt) / reps.length) * 100)
      : 0;

    // ✅ Datos financieros desde backend (ya en USD)¿
    const totalDebtUSD = financial.general?.totalDebtUSD ?? financial.totalDebtUSD ?? 0;
    const totalCreditUSD = financial.general?.totalCreditUSD ?? financial.totalCreditUSD ?? 0;
    const totalDepositsUSD = financial.monthlyTransactions?.totalDepositsUSD
      ?? financial.totalDepositsUSD
      ?? 0;
    const monthlyCollectedUSD = totalDepositsUSD;
    const pendingTransactions = financial.monthlyTransactions?.transactionCount ?? 0;

    // Procesar transacciones recientes
    const formattedTransactions = recentTransactions.map((t: any) => ({
      id: t.id || '',
      type: t.type || 'deposit',
      amount: t.amount || 0,          // Bs original
      amountUSD: t.amountUSD ?? 0,
      bcvRate: t.bcvRate ?? 0,
      representativeName: t.representative?.fullName || t.representativeName || 'N/A',
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
      status: t.status || 'completed',
      paymentStatus: t.paymentStatus || undefined,
    }));

    // Procesar top deudores (debtAmount está en USD)
    const formattedTopDebtors = topDebtors.map((d: any) => ({
      id: d.id || '',
      fullName: d.fullName || 'N/A',
      identityCard: d.identityCard || 'N/A',
      debtAmount: d.debtAmount || Math.abs(d.balanceUSD || d.balance || 0),
      studentCount: d.studentCount || 0,
    }));

    // Usar estadísticas de usuarios
    const userStatsData = {
      totalUsers: userStats.summary?.totalUsers || userStats.users?.total || 0,
      totalStudents: userStats.summary?.totalStudents || userStats.students?.total || 0,
      totalTeachers: userStats.summary?.totalTeachers || userStats.teachers?.total || 0,
      totalRepresentatives: userStats.summary?.totalRepresentatives || userStats.representatives?.total || 0
    };

    const result: DashboardStats = {
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
        totalDebt: totalDebtUSD,        // USD
        totalCredit: totalCreditUSD,    // USD
        monthlyCollected: monthlyCollectedUSD, // USD
        pendingTransactions
      },
      recentTransactions: formattedTransactions,
      topDebtors: formattedTopDebtors,
      topTeachers: teachers.slice(0, 5).map((t: any) => ({
        id: t.id,
        fullName: t.fullName,
        specialization: t.specialization || 'Sin especialización',
        subjectCount: t.subjects?.length || 0
      })),
      summary: {
        totalUsers: userStatsData.totalUsers,
        totalSchedules: 0,
        totalSubjects: 0,
        totalAssignments: 0
      }
    };

    console.log('🎉 Dashboard cargado exitosamente:', result);
    return result;

  } catch (error: any) {
    console.error('❌ Error cargando dashboard stats:', error);
    console.error('Detalles del error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });

    // Retornar datos por defecto en caso de error
    const defaultData: DashboardStats = {
      teachers: { total: 0, active: 0, inactive: 0 },
      students: {
        total: 0,
        active: 0,
        byStatus: { regular: 0, pendiente: 0, repitiente: 0, condicionado: 0, inactivo: 0 }
      },
      representatives: { total: 0, withDebt: 0, withCredit: 0, zeroBalance: 0, paymentPercentage: 0 },
      financial: { totalDebt: 0, totalCredit: 0, monthlyCollected: 0, pendingTransactions: 0 },
      recentTransactions: [],
      topDebtors: [],
      topTeachers: [],
      summary: { totalUsers: 0, totalSchedules: 0, totalSubjects: 0, totalAssignments: 0 }
    };

    console.log('🔄 Retornando datos por defecto:', defaultData);
    return defaultData;
  }
}

export async function getDashboardSectionData(section: string) {
  try {
    console.log(`📥 Obteniendo datos para sección: ${section}`);

    switch (section) {
      case 'financial': {
        const financialRes = await api.get('/private/balance/statistics/financial');
        return {
          result: true,
          content: financialRes.data?.content || {},
          error: []
        };
      }
      case 'teachers': {
        const teachersRes = await api.get('/private/academic/teacher/list', { params: { limit: 100 } });
        return {
          result: true,
          content: teachersRes.data?.content || [],
          error: []
        };
      }
      case 'students': {
        const studentsRes = await api.get('/private/user/students/list', { params: { limit: 100 } });
        return {
          result: true,
          content: studentsRes.data?.content || [],
          error: []
        };
      }
      case 'transactions': {
        const transactionsRes = await api.get('/private/balance/transactions/recent', { params: { limit: 20 } });
        return {
          result: true,
          content: transactionsRes.data?.content || [],
          error: []
        };
      }
      case 'debtors': {
        const debtorsRes = await api.get('/private/balance/representatives/top-debtors', { params: { limit: 10 } });
        return {
          result: true,
          content: debtorsRes.data?.content?.debtors || [],
          error: []
        };
      }
      default:
        throw new Error('Sección no válida');
    }
  } catch (error: any) {
    console.error(`❌ Error cargando datos de ${section}:`, error);
    console.error('Detalles:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return {
      result: false,
      content: [],
      error: [error.message || 'Error al cargar datos']
    };
  }
}