import "../styles/globals.css";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { DramaBody } from "../components/DramaBody";

export function Drama() {
  return (
      <div>
        <Header title="Drama 3x3" />
        <div className="black-333">
          <DramaBody />
          <Footer />
        </div>
      </div>
  );
}
