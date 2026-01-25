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
  summary: {
    totalUsers: number;
    totalSchedules: number;
    totalSubjects: number;
    totalAssignments: number;
  };
}

export async function getDashboardStatsAPI(): Promise<DashboardStats> {
  try {
    console.log('🔄 [DASHBOARD] Cargando estadísticas del dashboard...');
    
    // Obtener múltiples datos en paralelo con manejo de errores individual
    const promises = [
      // Docentes
      api.get('/private/academic/teacher/list', { params: { limit: 1000, page: 1 } })
        .catch(error => ({ data: { result: false, content: [], error: error.message } })),
      
      // Estudiantes
      api.get('/private/user/students/list', { params: { limit: 1000 } })
        .catch(error => ({ data: { result: false, content: [], error: error.message } })),
      
      // Representantes
      api.get('/private/balance/representatives', { params: { limit: 1000, page: 1 } })
        .catch(error => ({ data: { result: false, content: { representatives: [] }, error: error.message } })),
      
      // Estadísticas financieras
      api.get('/private/balance/statistics/financial')
        .catch(error => ({ data: { result: false, content: {}, error: error.message } })),
      
      // Top deudores
      api.get('/private/balance/representatives/top-debtors', { params: { limit: 5 } })
        .catch(error => ({ data: { result: false, content: { debtors: [] }, error: error.message } })),
      
      // Transacciones recientes
      api.get('/private/balance/transactions/recent', { params: { limit: 10 } })
        .catch(error => ({ data: { result: false, content: [], error: error.message } })),
      
      // Estadísticas generales
      api.get('/private/user/statistics')
        .catch(error => ({ data: { result: false, content: {}, error: error.message } })),
    ];

    const [
      teachersRes,
      studentsRes,
      repsRes,
      financialRes,
      topDebtorsRes,
      recentTransactionsRes,
      summaryRes
    ] = await Promise.all(promises);

    console.log('✅ [DASHBOARD] Todas las respuestas recibidas');

    // Procesar datos de docentes
    let teachers = [];
    let teachersTotal = 0;
    let activeTeachers = 0;
    
    if (teachersRes.data.result && Array.isArray(teachersRes.data.content)) {
      teachers = teachersRes.data.content;
      teachersTotal = teachers.length;
      activeTeachers = teachers.filter((t: any) => t.status === true).length;
    } else {
      console.warn('⚠️ [DASHBOARD] No se pudieron obtener datos de docentes:', teachersRes.data.error);
    }

    // Procesar datos de estudiantes
    let students = [];
    let studentsTotal = 0;
    let activeStudents = 0;
    const studentsByStatus = {
      regular: 0,
      pendiente: 0,
      repitiente: 0,
      condicionado: 0,
      inactivo: 0
    };

    if (studentsRes.data.result && Array.isArray(studentsRes.data.content)) {
      students = studentsRes.data.content;
      studentsTotal = students.length;
      
      students.forEach((student: any) => {
        const status = student.status?.toLowerCase() || 'pendiente';
        if (status in studentsByStatus) {
          studentsByStatus[status as keyof typeof studentsByStatus]++;
        }
      });
      
      activeStudents = studentsByStatus.regular;
    } else {
      console.warn('⚠️ [DASHBOARD] No se pudieron obtener datos de estudiantes:', studentsRes.data.error);
    }

    // Procesar datos de representantes
    let representatives = [];
    let repsTotal = 0;
    let repsWithDebt = 0;
    let repsWithCredit = 0;
    let repsZero = 0;
    let paymentPercentage = 0;

    if (repsRes.data.result && repsRes.data.content?.representatives) {
      representatives = repsRes.data.content.representatives;
      repsTotal = representatives.length;
      
      representatives.forEach((rep: any) => {
        const balance = rep.balance || 0;
        if (balance < 0) repsWithDebt++;
        else if (balance > 0) repsWithCredit++;
        else repsZero++;
      });
      
      paymentPercentage = repsTotal > 0 
        ? Math.round(((repsTotal - repsWithDebt) / repsTotal) * 100)
        : 0;
    } else {
      console.warn('⚠️ [DASHBOARD] No se pudieron obtener datos de representantes:', repsRes.data.error);
    }

    // Procesar datos financieros
    const financialData = financialRes.data.result ? financialRes.data.content : {};
    const totalDebt = Math.abs(financialData.general?.totalDebt || 0);
    const totalCredit = financialData.general?.totalCredit || 0;
    const monthlyCollected = financialData.monthlyTransactions?.[0]?.totalDeposits || 0;
    const pendingTransactions = financialData.monthlyTransactions?.[0]?.transactionCount || 0;

    // Procesar top deudores
    const topDebtors = topDebtorsRes.data.result ? topDebtorsRes.data.content?.debtors || [] : [];
    const formattedDebtors = topDebtors.map((debtor: any) => ({
      id: debtor.id,
      fullName: debtor.fullName || 'Desconocido',
      identityCard: debtor.identityCard || 'N/A',
      debtAmount: Math.abs(debtor.balance || 0),
      studentCount: debtor.activeStudents || 0
    }));

    // Procesar transacciones recientes
    const recentTransactions = recentTransactionsRes.data.result ? recentTransactionsRes.data.content || [] : [];
    const formattedTransactions = recentTransactions.map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      representativeName: t.representative?.fullName || 'N/A',
      date: new Date(t.createdAt).toLocaleDateString('es-VE'),
      status: t.status
    }));

    // Procesar resumen general
    const summaryData = summaryRes.data.result ? summaryRes.data.content : {};
    const totalUsers = summaryData.users?.total || 0;

    console.log('📊 [DASHBOARD] Estadísticas procesadas:', {
      teachersTotal,
      studentsTotal,
      repsTotal,
      paymentPercentage,
      totalDebt
    });

    return {
      teachers: {
        total: teachersTotal,
        active: activeTeachers,
        inactive: teachersTotal - activeTeachers
      },
      students: {
        total: studentsTotal,
        active: activeStudents,
        byStatus: studentsByStatus
      },
      representatives: {
        total: repsTotal,
        withDebt: repsWithDebt,
        withCredit: repsWithCredit,
        zeroBalance: repsZero,
        paymentPercentage
      },
      financial: {
        totalDebt,
        totalCredit,
        monthlyCollected,
        pendingTransactions
      },
      recentTransactions: formattedTransactions,
      topDebtors: formattedDebtors,
      summary: {
        totalUsers,
        totalSchedules: 0, // Agregar si tienes endpoint
        totalSubjects: 0,  // Agregar si tienes endpoint
        totalAssignments: 0 // Agregar si tienes endpoint
      }
    };

  } catch (error: any) {
    console.error('❌ [DASHBOARD] Error crítico al cargar estadísticas:', error);
    
    // Retornar estructura por defecto en caso de error
    return {
      teachers: {
        total: 0,
        active: 0,
        inactive: 0
      },
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
      summary: {
        totalUsers: 0,
        totalSchedules: 0,
        totalSubjects: 0,
        totalAssignments: 0
      }
    };
  }
}

// Función para obtener datos de una sección específica (opcional)
export async function getDashboardSectionData(section: string) {
  try {
    switch (section) {
      case 'financial':
        const res = await api.get('/private/balance/statistics/financial');
        return res.data.content || {};
      case 'teachers':
        const teachersRes = await api.get('/private/academic/teacher/list', { params: { limit: 100 } });
        return teachersRes.data.content || [];
      case 'students':
        const studentsRes = await api.get('/private/user/students/list', { params: { limit: 100 } });
        return studentsRes.data.content || [];
      case 'transactions':
        const transactionsRes = await api.get('/private/balance/transactions/recent', { params: { limit: 20 } });
        return transactionsRes.data.content || [];
      default:
        throw new Error('Sección no válida');
    }
  } catch (error: any) {
    console.error(`❌ [DASHBOARD] Error cargando sección ${section}:`, error);
    throw error;
  }
}