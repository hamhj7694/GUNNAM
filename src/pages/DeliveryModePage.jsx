import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import DeliveryModeCard from "../components/DeliveryModeCard.jsx";
import { featureFlags } from "../config/featureFlags.js";

export default function DeliveryModePage() {
  const navigate = useNavigate();
  const linkDeliveryEnabled =
    featureFlags.linkDelivery.enabled && featureFlags.linkDelivery.path;
  const publicDeliveryEnabled =
    featureFlags.publicDelivery.enabled && featureFlags.publicDelivery.path;

  return (
    <CardFrame className="delivery-mode-page">
      <button
        className="screen-back-button"
        type="button"
        onClick={() => navigate("/")}
        aria-label="홈으로 돌아가기"
      >
        ←
      </button>

      <header className="delivery-mode-header">
        <p className="eyebrow">새 카드 만들기</p>
        <h1>어떻게 건넬까요?</h1>
        <p>상대에게 카드를 건넬 방식을 선택해 주세요.</p>
      </header>

      <div className="delivery-mode-list">
        <DeliveryModeCard
          title="직접 건넴"
          description="지금 사용하는 기기에서 상대방에게 직접 카드를 보여줘요."
          actionLabel="직접 건넴으로 만들기"
          onSelect={() => navigate("/create")}
        />
        <DeliveryModeCard
          title="링크로 건넴"
          description="공유 링크를 받은 사람만 카드를 보고 답변할 수 있어요."
          actionLabel={linkDeliveryEnabled ? "링크로 건넴 선택" : "준비 중"}
          badge={linkDeliveryEnabled ? null : "준비 중"}
          disabled={!linkDeliveryEnabled}
          onSelect={
            linkDeliveryEnabled
              ? () => navigate(featureFlags.linkDelivery.path)
              : undefined
          }
        />
        <DeliveryModeCard
          title="모두에게 건넴"
          description="건넴을 사용하는 누구나 카드를 찾아보고 답변할 수 있어요."
          actionLabel={publicDeliveryEnabled ? "모두에게 건넴 선택" : "준비 중"}
          badge={publicDeliveryEnabled ? null : "준비 중"}
          disabled={!publicDeliveryEnabled}
          onSelect={
            publicDeliveryEnabled
              ? () => navigate(featureFlags.publicDelivery.path)
              : undefined
          }
        />
      </div>
    </CardFrame>
  );
}
