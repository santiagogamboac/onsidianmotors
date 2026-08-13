import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import SmsWidget from "./SmsWidget";
import { useScrollBehavior } from "../hooks/useScrollBehavior";

export default function Layout() {
  useScrollBehavior();

  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <Outlet />
      <Footer />
      <SmsWidget />
      <BottomNav />
    </div>
  );
}
