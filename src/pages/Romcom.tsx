import "../styles/globals.css";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { RomcomBody } from "../components/RomcomBody";

export function Romcom() {
  return (
      <div>
        <Header title="Romcom 3x3" />
        <div className="black-333">
          <RomcomBody />
          <Footer />
        </div>
      </div>
  );
}
