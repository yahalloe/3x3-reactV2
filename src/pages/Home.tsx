import "../styles/globals.css";
import { Body } from "../components/Body";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Others } from "../components/Others";

export function Home() {
  return (
    <div>
      <Header title="YAHALLO'S 3X3" />
      <div className="black-333">
        <Body />
        <Others />
        <Footer />
      </div>
    </div>
  );
}
