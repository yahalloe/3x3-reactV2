import "../styles/globals.css";
import { Body } from "../components/Body";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Others } from "../components/Others";
import { useContent } from "../content/ContentProvider";

export function Home() {
  const { settings } = useContent();
  return (
    <div>
      <Header title={settings.homeTitle} />
      <div className="black-333">
        <Body />
        <Others />
        <Footer />
      </div>
    </div>
  );
}
