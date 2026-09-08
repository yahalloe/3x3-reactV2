import "../styles/globals.css";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { MusicBody } from "../components/MusicBody";

export function Music() {
  return (
    <div>
      <Header title="Music 3×3" />
      <MusicBody />
      <Footer />
    </div>
  );
}
