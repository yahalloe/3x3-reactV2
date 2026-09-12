import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { AnimePage } from "./components/AnimePage";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";
import { CollectionPage } from "./pages/Collection";
import { ScrollToTop } from "./components/utils/ScrollToTop";
import { SiteNavigation } from "./components/SiteNavigation";
import { ContentNotice } from "./components/ContentNotice";
import { PageSkeleton } from "./components/PageSkeleton";
import { Collections } from "./pages/Collections";

const Admin = lazy(() => import("./pages/Admin").then((module) => ({ default: module.Admin })));

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteNavigation />
      <ContentNotice />
      <div id="main-content" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/anime/:id" element={<AnimePage />} />

        <Route path="/romcom" element={<CollectionPage collectionSlug="romcom" />} />

        <Route path="/drama" element={<CollectionPage collectionSlug="drama" />} />

        <Route path="/music" element={<CollectionPage collectionSlug="music" />} />
        <Route path="/collections" element={<Collections />} />

        <Route path="/collection/:slug" element={<CollectionPage />} />

        <Route path="/admin" element={<Suspense fallback={<PageSkeleton />}><Admin /></Suspense>} />

        <Route path="/about" element={<About />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
