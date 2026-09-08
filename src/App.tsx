import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { AnimePage } from "./components/AnimePage";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";
import { Romcom } from "./pages/Romcom";
import { Drama } from "./pages/Drama";
import { Music } from "./pages/Music";
import { CollectionPage } from "./pages/Collection";
import { Admin } from "./pages/Admin";
import { ScrollToTop } from "./components/utils/ScrollToTop";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/anime/:id" element={<AnimePage />} />

        <Route path="/romcom" element={<Romcom />} />

        <Route path="/drama" element={<Drama />} />

        <Route path="/music" element={<Music />} />

        <Route path="/collection/:slug" element={<CollectionPage />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/about" element={<About />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
