import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { useHashScroll } from "../hooks/useHashScroll";

export default function Layout() {
  useHashScroll();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <Outlet />
      <Footer />
      <BottomNav />
    </div>
  );
}
