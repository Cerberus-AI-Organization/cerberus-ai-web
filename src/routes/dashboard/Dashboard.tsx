import {Link} from "react-router-dom";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Link to={"/dashboard/admin"}>Admin</Link>
    </div>
  )
}

export default Dashboard;