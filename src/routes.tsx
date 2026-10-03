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
import RepresLayout from './layouts/RepresLayout'
import AdminLayout from './layouts/AdminLayout'
import RepresDashboard from './layouts/RepresDashboard'
import AdminDashboard from './layouts/AdminDashboard'
import FuncionalLayout from './layouts/funcionalLayout'
import FuncionalDashboard from './layouts/funcionalDashboard'
import SecretarioLayout from './layouts/SecretarioLayout'
import SecretarioDashboard from './layouts/SecretarioDashboard'
import AuthRedirector from './publicViews/Components/Redirector'
import LayoutUsers from './layouts/UserLayout'
import InsertUser from './privateViews/insertUser/insertUser'
import UserDashboard from './layouts/UserLayout'
import ManualBalance from './privateViews/balance/ManualBalance'
import AdminListUsersBackend from './privateViews/userList/UserList'
import ScheduleView from './privateViews/Schedule/ClassSchedule'
import AdminListSubjectsBackend from './privateViews/ListSubject/AdminLIstSubjectBackend'
import AdminListStudentsBackend from './privateViews/AdminListStudentBackend/AdminListStudentBackend'
import AdminListTeachersBackend from './privateViews/TeacherList/AdminTeacherListBackend'
import TeacherListPage from './privateViews/TeacherList/AdminTeacherListBackend'
import EditTeacherPage from './privateViews/TeacherEdit/EditTeacherView'
import ChildrenScheduleView from './privateViews/ChildrenSchedule/ChildrenSchedule'
import PaymentValidationPage from './privateViews/PaymentValidation/PaymentValidationPage'
import SolicitudInscripcion from './publicViews/inscription/SolicitudInscripcion'
import InscriptionSettings from './privateViews/inscription/inscriptionSettings'
import PaymentHistory from './privateViews/PaymentHistory/PaymentHistoryAdmin'
import AdminRegistrationsList from './privateViews/AdminRegistrationList/AdminRegistrationList'
import SchoolFeeSettings from './privateViews/SchoolFeeSettings/SchoolFeeSettings'
import SimuladorCobros from './privateViews/Simulador/CobrosSimulador'
import EditUser from './privateViews/editUser/EditUsers'
import EditApplication from './privateViews/editApplication/EditApplication'
import StudentsRanking from './privateViews/studentRanking/StudentRanking'
import InfoAccount from './privateViews/InfoAccount/InfoAccount'
import RepresentativeRegistration from './privateViews/RepresentativeRegistration/RepresentativeRegistration'
import TasaLista from './privateViews/tasaLista/TasaListaVista'

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
        <Route path="Solicitud" element={<SolicitudInscripcion />} />
      </Route>

      {/* Rutas Privadas */}
      <Route element={<PrivateRoutes />}>
        <Route path="/app" element={<AuthRedirector />} />

        {/* Rutas Representante */}
        <Route path="/representante" element={<RepresLayout />}>
          <Route index element={<RepresDashboard />} />
          <Route path="validar-pago/:representativeId" element={<PaymentValidationPage />} />
          <Route path="ChildrenSchedule" element={<ChildrenScheduleView />} />
          <Route path="InfoAccount" element={<InfoAccount />} />
          <Route path="Inscripciones" element={<RepresentativeRegistration />} />
        </Route>

        {/* Rutas Funcional */}
        <Route path="/funcional" element={<FuncionalLayout />}>
          <Route index element={<FuncionalDashboard />} />
          <Route path="users">
            <Route path="insert" element={<InsertUser forceNivel={1} />} />
            <Route path="list" element={<AdminListUsersBackend />} />
          </Route>
        </Route>

        {/* ⭐ NUEVO: Rutas Secretario */}
        <Route path="/secretario" element={<SecretarioLayout />}>
          <Route index element={<SecretarioDashboard />} />
          <Route path="pagos" element={<PaymentHistory />} />
        </Route>

        {/* Rutas Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<LayoutUsers />}>
            <Route index element={<UserDashboard />} />
            <Route path="insert" element={<InsertUser />} />
            <Route path="list" element={<AdminListUsersBackend />} />
            <Route path="edit" element={<EditUser />} />
          </Route>
          <Route path="Schedule" element={<ScheduleView />} />
          <Route path="Balance" element={<ManualBalance />} />
          <Route path="ListSubjects" element={<AdminListSubjectsBackend />} />
          <Route path="listStudents" element={<AdminListStudentsBackend />} />
          <Route path="ListTeacher" element={<AdminListTeachersBackend />} />
          <Route path="Settings" element={<InscriptionSettings />} />
          <Route path="transactions" element={<PaymentHistory />} />
          <Route path="ranking" element={<StudentsRanking />} />
          <Route path="registrations" element={<AdminRegistrationsList />} />
          <Route path="school-fees" element={<SchoolFeeSettings />} />
          <Route path="tasa-lista" element={<TasaLista />} />
          <Route path="simulador-cobros" element={<SimuladorCobros />} />
          <Route path="registrations/:id/edit" element={<EditApplication />} />

          <Route path="teachers">
            <Route path="list" element={<TeacherListPage />} />
            <Route path="edit" element={<EditTeacherPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default ListRoutes