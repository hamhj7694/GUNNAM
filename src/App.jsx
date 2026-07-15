import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { initialCardData } from "./data/cardData.js";
import { getCardDisplay } from "./utils/cardDisplay.js";
import {
  clearCardData,
  loadCardData,
  saveCardData
} from "./utils/cardStorage.js";
import {
  createReplyHistoryId,
  loadReplyHistory,
  saveReplyHistory
} from "./utils/replyHistoryStorage.js";
import AcceptResultPage from "./pages/AcceptResultPage.jsx";
import CreateCardPage from "./pages/CreateCardPage.jsx";
import DeliveryModePage from "./pages/DeliveryModePage.jsx";
import HomePage from "./pages/HomePage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import RejectResultPage from "./pages/RejectResultPage.jsx";
import ShowCardPage from "./pages/ShowCardPage.jsx";

export default function App() {
  const [cardData, setCardData] = useState(loadCardData);
  const [replyHistory, setReplyHistory] = useState(loadReplyHistory);
  const display = useMemo(() => getCardDisplay(cardData), [cardData]);

  useEffect(() => {
    saveCardData(cardData);
  }, [cardData]);

  useEffect(() => {
    saveReplyHistory(replyHistory);
  }, [replyHistory]);

  function updateCardData(nextValue) {
    setCardData((current) => ({
      ...current,
      ...(typeof nextValue === "function" ? nextValue(current) : nextValue)
    }));
  }

  function resetCardData() {
    clearCardData();
    setCardData({ ...initialCardData });
  }

  function recordReply({ historyId, responseType, replyText, resultText }) {
    const id = historyId || createReplyHistoryId();
    const now = new Date().toISOString();
    const nextItem = {
      id,
      replyText,
      responseType,
      receivedAt: now,
      updatedAt: now,
      context: {
        questionText: cardData.mainText,
        resultText
      }
    };

    setReplyHistory((current) => {
      const existingItem = current.find((item) => item.id === id);

      if (!existingItem) {
        return [nextItem, ...current];
      }

      return current.map((item) =>
        item.id === id
          ? { ...nextItem, receivedAt: item.receivedAt || now }
          : item
      );
    });

    return id;
  }

  function deleteReplyHistory(id) {
    setReplyHistory((current) => current.filter((item) => item.id !== id));
  }

  const pageProps = {
    cardData,
    display,
    replyHistory,
    setCardData: updateCardData,
    resetCardData,
    recordReply,
    deleteReplyHistory
  };

  return (
    <BrowserRouter basename="/gunnam">
      <Routes>
        <Route path="/" element={<HomePage {...pageProps} />} />
        <Route path="/create/mode" element={<DeliveryModePage />} />
        <Route path="/create" element={<CreateCardPage {...pageProps} />} />
        <Route path="/history" element={<HistoryPage {...pageProps} />} />
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
