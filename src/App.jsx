import { useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { initialCardData } from "./data/cardData.js";
import { getCardDisplay } from "./utils/cardDisplay.js";
import AcceptResultPage from "./pages/AcceptResultPage.jsx";
import CreateCardPage from "./pages/CreateCardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import RejectResultPage from "./pages/RejectResultPage.jsx";
import ShowCardPage from "./pages/ShowCardPage.jsx";

export default function App() {
  const [cardData, setCardData] = useState(initialCardData);
  const display = useMemo(() => getCardDisplay(cardData), [cardData]);

  function updateCardData(nextValue) {
    setCardData((current) => ({
      ...current,
      ...(typeof nextValue === "function" ? nextValue(current) : nextValue)
    }));
  }

  const pageProps = {
    cardData,
    display,
    setCardData: updateCardData,
    resetCardData: () => setCardData(initialCardData)
  };

  return (
    <BrowserRouter basename="/gunnam">
      <Routes>
        <Route path="/" element={<HomePage {...pageProps} />} />
        <Route path="/create" element={<CreateCardPage {...pageProps} />} />
        <Route path="/show" element={<ShowCardPage {...pageProps} />} />
        <Route
          path="/result/accept"
          element={<AcceptResultPage {...pageProps} />}
        />
        <Route
          path="/result/reject"
          element={<RejectResultPage {...pageProps} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
