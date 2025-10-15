import { Routes, Route } from 'react-router-dom'
import LayoutPublic from './publicViews/LayoutPublic'
import HomeView from './publicViews/HomeView/HomeView'
import Login from './publicViews/LoginAuthPublic/LoginAuth'
import AboutUsView from './publicViews/AboutUs/AboutUs'
import { PrivacyPolicy } from './publicViews/Polity/Polity'
import { TermsAndConditions } from './publicViews/TermsAndConditions/TAC'
import { JoinUsView } from './publicViews/JoinUs'

function ListRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LayoutPublic />}>
        <Route index element={<HomeView />} />
        <Route path="login" element={<Login />} />
        <Route path="join-us" element={<JoinUsView />} />
        <Route path="SobreNosotros" element={<AboutUsView />} />
        <Route path="PrivacyPolicy" element={<PrivacyPolicy />} />
        <Route path="TermsAndConditions" element={<TermsAndConditions />} />
      </Route>
    </Routes>
  )
}

export default ListRoutes