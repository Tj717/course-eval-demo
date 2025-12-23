import Home from "./components/common/Home"
import TrendPage from "./components/Trend/TrendPage";
import UploadData from "./components/common/UploadData";

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/trend",
    component: TrendPage,
  },
  {
    path: "/upload",
    component: UploadData,
  }
];  

export default routes;
