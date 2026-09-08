import "../styles/globals.css";
import { Header } from "../components/Header";
import { AboutmeBody } from "../components/AboutmeBody";
import { AboutmeFooter } from "../components/AboutmeFooter";
import { useContent } from "../content/ContentProvider";

export function About() {
  const { settings } = useContent();
  return (
    <div>
      <Header title={settings.aboutTitle}/>
      <div className="black-333">
        <AboutmeBody />
        <AboutmeFooter />
      </div>
    </div>
  );
}
