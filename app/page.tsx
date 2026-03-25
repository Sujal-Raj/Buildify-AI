import Image from "next/image";
import Navbar from "./components/layout/Navbar";
import HomePage from "./components/layout/HeroSection";
import About from "./components/layout/About";
import Footer from "./components/layout/Footer";

export default function Home() {
  return (
    <>
    <Navbar/>
    <HomePage/>
    <About/>
    <Footer/>
    </>
  );
}
