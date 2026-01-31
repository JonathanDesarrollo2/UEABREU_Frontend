// ListRoutes.tsx
import { Routes, Route } from 'react-router-dom'
import LayoutPublic from './publicViews/LayoutPublic'
import HomeView from './publicViews/HomeView/HomeView'
import Login from './publicViews/LoginAuthPublic/LoginAuth'
import AboutUsView from './publicViews/AboutUs/AboutUs'
import { PrivacyPolicy } from './publicViews/Polity/Polity'
import { TermsAndConditions } from './publicViews/TermsAndConditions/TAC'
import { JoinUsView } from './publicViews/JoinUs'
import PrivateRoutes from './auth/privateRoutes'
import RepresLayout from './layouts/RepresLayout'  // ✅ Layout corregido
import AdminLayout from './layouts/AdminLayout'
import RepresDashboard from './layouts/RepresDashboard'  // ✅ Dashboard corregido
import AdminDashboard from './layouts/AdminDashboard'
import AuthRedirector from './publicViews/Components/Redirector'
import LayoutUsers from './layouts/UserLayout'
import InsertUser from './privateViews/insertUser/insertUser'
import UserDashboard from './layouts/UserLayout'
import PaymentValidation from './privateViews/payment/paymentValidation'  // ✅ Nueva vista agregada
import ClassSchedule from './privateViews/Schedule/ClassSchedule'
import ManualBalance from './privateViews/balance/ManualBalance'
import AdminListUsersBackend from './privateViews/userList/UserList'
import ScheduleView from './privateViews/Schedule/ClassSchedule'
import AdminListSubjectsBackend from './privateViews/ListSubject/AdminLIstSubjectBackend'
import AdminListStudentsBackend from './privateViews/AdminListStudentBackend/AdminListStudentBackend'
import AdminListTeachersBackend from './privateViews/TeacherList/AdminTeacherListBackend'

function ListRoutes() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LayoutPublic />}>
        <Route index element={<HomeView />} />
        <Route path="login" element={<Login />} />
        <Route path="join-us" element={<JoinUsView />} />
        <Route path="SobreNosotros" element={<AboutUsView />} />
        <Route path="PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="TermsAndConditions" element={<TermsAndConditions />} />
      </Route>

      {/* Rutas Privadas */}
      <Route element={<PrivateRoutes />}>
        <Route path="/app" element={<AuthRedirector />} />
          
        {/* Rutas específicas por rol */}
        <Route path="/representante" element={<RepresLayout />}>
          <Route index element={<RepresDashboard />} />
          {/* ✅ Nueva ruta para validación de pagos - AHORA EN REPRESENTANTE */}
          <Route path="payment-validation" element={<PaymentValidation />} />
          <Route path="class-schedule" element={<ClassSchedule />} /> {/* Nueva ruta */}
        </Route>
          
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<LayoutUsers />}>
            <Route index element={<UserDashboard />} />
            <Route path="insert" element={<InsertUser />} />
            <Route path="list" element={<AdminListUsersBackend />} />
          </Route>
          <Route path="Schedule" element={<ScheduleView />} />
          <Route path="Balance" element={<ManualBalance />} />
          <Route path="ListSubjects" element={<AdminListSubjectsBackend />} />
          <Route path="listStudents" element={<AdminListStudentsBackend />} />
          <Route path="ListTeacher" element={<AdminListTeachersBackend />} />
        
        </Route>
      </Route>
    </Routes>
  )
}

export default ListRoutes