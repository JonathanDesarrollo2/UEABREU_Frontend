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
    console.log('🔄 Iniciando carga de dashboard...');
    
    // Usar Promise.allSettled para manejar errores individuales
    const promises = [
      // Docentes
      api.get('/private/academic/teacher/list', { params: { page: 1, limit: 100 } }),
      // Estudiantes - USANDO RUTA CORRECTA
      api.get('/private/user/students/list', { params: { limit: 1000 } }),
      // Representantes
      api.get('/private/balance/representatives', { 
        params: { 
          page: 1,
          limit: 1000
        } 
      }),
      // Estadísticas financieras
      api.get('/private/balance/statistics/financial'),
      // Top deudores
      api.get('/private/balance/representatives/top-debtors', { params: { limit: 5 } }),
      // Transacciones recientes
      api.get('/private/balance/transactions/recent', { params: { limit: 10 } }),
      // Estadísticas de usuarios
      api.get('/private/user/statistics')
    ];

    const results = await Promise.allSettled(promises);

    // Procesar cada resultado con manejo de errores
    const teachersRes = results[0];
    const studentsRes = results[1];
    const repsRes = results[2];
    const financialRes = results[3];
    const topDebtorsRes = results[4];
    const recentTransactionsRes = results[5];
    const userStatsRes = results[6];

    console.log('✅ Respuestas recibidas del dashboard:');

    // Procesar los datos con validación robusta
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

    console.log('📊 Datos procesados:');
    console.log('- Total teachers:', teachers.length);
    console.log('- Total students:', students.length);
    console.log('- Total reps:', reps.length);

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

    console.log('👨‍🎓 Estudiantes por estado:', studentsByStatus);

    // Calcular estadísticas de representantes
    const repsWithDebt = reps.filter((r: any) => {
      const balance = r.balance || r.currentBalance || 0;
      return balance < 0;
    }).length;
    
    const repsWithCredit = reps.filter((r: any) => {
      const balance = r.balance || r.currentBalance || 0;
      return balance > 0;
    }).length;
    
    const repsZero = reps.filter((r: any) => {
      const balance = r.balance || r.currentBalance || 0;
      return balance === 0;
    }).length;
    
    const paymentPercentage = reps.length > 0 
      ? Math.round(((reps.length - repsWithDebt) / reps.length) * 100)
      : 0;

    console.log('💰 Representantes:', {
      total: reps.length,
      conDeuda: repsWithDebt,
      conCredito: repsWithCredit,
      sinSaldo: repsZero,
      porcentajePago: paymentPercentage
    });

    // Procesar datos financieros con valores por defecto
    const financialData = {
      totalDebt: Math.abs(financial.general?.totalDebt || financial.totalDebt || 0),
      totalCredit: financial.general?.totalCredit || financial.totalCredit || 0,
      monthlyCollected: financial.monthlyTransactions?.[0]?.totalDeposits || financial.totalDeposits || 0,
      pendingTransactions: financial.monthlyTransactions?.[0]?.transactionCount || 0
    };

    console.log('💵 Datos financieros:', financialData);

    // Procesar transacciones recientes
    const formattedTransactions = recentTransactions.map((t: any) => ({
      id: t.id || '',
      type: t.type || 'deposit',
      amount: t.amount || 0,
      representativeName: t.representative?.fullName || t.representativeName || 'N/A',
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
      status: t.status || 'completed'
    }));

    // Procesar top deudores
    const formattedTopDebtors = topDebtors.map((d: any) => ({
      id: d.id || '',
      fullName: d.fullName || 'N/A',
      identityCard: d.identityCard || 'N/A',
      debtAmount: Math.abs(d.balance || d.debtAmount || d.currentBalance || 0),
      studentCount: d.activeStudents || d.studentCount || 0
    }));

    // Usar estadísticas de usuarios
    const userStatsData = {
      totalUsers: userStats.summary?.totalUsers || userStats.users?.total || 0,
      totalStudents: userStats.summary?.totalStudents || userStats.students?.total || 0,
      totalTeachers: userStats.summary?.totalTeachers || userStats.teachers?.total || 0,
      totalRepresentatives: userStats.summary?.totalRepresentatives || userStats.representatives?.total || 0
    };

    console.log('👥 Estadísticas de usuarios:', userStatsData);

    const result = {
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
      topTeachers: teachers.slice(0, 5).map((t: any) => ({
        id: t.id,
        fullName: t.fullName,
        specialization: t.specialization || 'Sin especialización',
        subjectCount: t.subjects?.length || 0
      })),
      summary: {
        totalUsers: userStatsData.totalUsers,
        totalSchedules: 0, // Necesitarás endpoint específico
        totalSubjects: 0,  // Necesitarás endpoint específico  
        totalAssignments: 0 // Necesitarás endpoint específico
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
    const defaultData = {
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
    
    console.log('🔄 Retornando datos por defecto:', defaultData);
    return defaultData;
  }
}

// Función para obtener datos específicos por sección
export async function getDashboardSectionData(section: string) {
  try {
    console.log(`📥 Obteniendo datos para sección: ${section}`);
    
    switch (section) {
      case 'financial':
        const financialRes = await api.get('/private/balance/statistics/financial');
        console.log('💵 Respuesta financiera:', financialRes.data);
        return {
          result: true,
          content: financialRes.data?.content || {},
          error: []
        };
      case 'teachers':
        const teachersRes = await api.get('/private/academic/teacher/list', { 
          params: { limit: 100 } 
        });
        console.log('👨‍🏫 Respuesta docentes:', teachersRes.data);
        return {
          result: true,
          content: teachersRes.data?.content || [],
          error: []
        };
      case 'students':
        const studentsRes = await api.get('/private/user/students/list', { 
          params: { limit: 100 } 
        });
        console.log('👨‍🎓 Respuesta estudiantes:', studentsRes.data);
        return {
          result: true,
          content: studentsRes.data?.content || [],
          error: []
        };
      case 'transactions':
        const transactionsRes = await api.get('/private/balance/transactions/recent', { 
          params: { limit: 20 } 
        });
        console.log('💳 Respuesta transacciones:', transactionsRes.data);
        return {
          result: true,
          content: transactionsRes.data?.content || [],
          error: []
        };
      case 'debtors':
        const debtorsRes = await api.get('/private/balance/representatives/top-debtors', { 
          params: { limit: 10 } 
        });
        console.log('📉 Respuesta deudores:', debtorsRes.data);
        return {
          result: true,
          content: debtorsRes.data?.content?.debtors || [],
          error: []
        };
      default:
        console.log('⚠️ Sección no válida:', section);
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