import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { AnimePage } from "./components/AnimePage";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";
import { Romcom } from "./pages/Romcom";
import { Drama } from "./pages/Drama";
import { Music } from "./pages/Music";
import { CollectionPage } from "./pages/Collection";
import { ScrollToTop } from "./components/utils/ScrollToTop";

const Admin = lazy(() => import("./pages/Admin").then((module) => ({ default: module.Admin })));

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

        <Route path="/admin" element={<Suspense fallback={<p role="status" className="page-surface min-h-screen p-8 text-zinc-300">Opening editor…</p>}><Admin /></Suspense>} />

        <Route path="/about" element={<About />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
