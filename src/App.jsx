import { useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { initialCardData } from "./data/cardData.js";
import { getCardDisplay } from "./utils/cardDisplay.js";
import HomePage from "./pages/HomePage.jsx";
import CreateCardPage from "./pages/CreateCardPage.jsx";
import ShowCardPage from "./pages/ShowCardPage.jsx";
import AcceptResultPage from "./pages/AcceptResultPage.jsx";
import RejectResultPage from "./pages/RejectResultPage.jsx";

export default function App() {
  const [cardData, setCardData] = useState(initialCardData);
  const display = useMemo(() => getCardDisplay(cardData), [cardData]);

  function updateCardData(nextValue) {
    setCardData((current) => ({
      ...current,
      ...(typeof nextValue === "function" ? nextValue(current) : nextValue)
    }));
  }

  const appProps = {
    cardData,
    display,
    setCardData: updateCardData,
    resetCardData: () => setCardData(initialCardData)
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage {...appProps} />} />
        <Route path="/create" element={<CreateCardPage {...appProps} />} />
        <Route path="/show" element={<ShowCardPage {...appProps} />} />
        <Route path="/result/accept" element={<AcceptResultPage {...appProps} />} />
        <Route path="/result/reject" element={<RejectResultPage {...appProps} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
