import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Users from './Users';
import CreateUser from './CreateUser';
import CreateUnit from './CreateUnit';
import Dashboard from './Dashboard';
import CreateContract from './CreateContract'
import CreateContractRenewal from './CreateContractRenewal';
import Tenants from './Tenants';
import UpdateUser from './UpdateUser';
import BillingPayment from './BillingPayment';
import Units from './Units';
import CreateUnitType from './CreateUnitType';
import UpdateUnit from './UpdateUnit';
import Maintenance from './Maintenance';
import CreateMaintenance from './CreateMaintenance';
import Login from './Login';
import Signup from './Signup';
import PrivateRoute from './PrivateRoute';
import AccountManagement from './AccountManagement';
import History from './History';
import LegitDBoard from './LegitDBoard';
import Contracts from './Contracts';
import UpdateMaintenance from './UpdateMaintenance';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />}>
              <Route index element={<LegitDBoard />} />
              <Route path="dashboard" element={<LegitDBoard />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="expiredcontracts" element={<History />} />
              <Route path="unit/:id" element={<CreateUnit />} />
              <Route path="create" element={<CreateUser />} />
              <Route path='contract/:id' element={<CreateContract />}></Route>
              <Route path='contractrenewal/:id' element={<CreateContractRenewal />}></Route>
              <Route path="update/:id" element={<UpdateUser />} />
              <Route path="billing" element={<BillingPayment />} />
              <Route path="units" element={<Units />} />
              <Route path="unittype" element={<CreateUnitType />} />
              <Route path="editUnit/:id" element={<UpdateUnit />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="newmaintenance" element={<CreateMaintenance />} />
              <Route path="account/:userId" element={<AccountManagement />} />
              <Route path="editMaintenance/:id" element={<UpdateMaintenance />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;