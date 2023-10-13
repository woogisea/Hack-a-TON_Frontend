import { styled } from "styled-components";
import NftPreviewImage from "../../components/lerverage/NFTPreview/NftPreviewImage";
import NFTPreviewInfo from "../../components/lerverage/NFTPreview/NFTPreviewInfo";
import FooterButton from "../../components/common/FooterButton";
import { UserDeposit } from "../../hooks/contract/tact_NexTon";
import * as Contract from "../../hooks/contract/useNextonContract";
import BasicModal from "../../components/common/Modal/BasicModal";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { stakingAtom, stakingInputAtom } from "../../lib/atom/staking";
import { postStakingInfo } from "../../api/postStakingInfo";
import { useNavigate } from "react-router-dom";
import { MainButton } from "@vkruglikov/react-telegram-web-app";
import ProgressBar from "../../components/lerverage/common/ProgressBar";
import IcAlertBlue from "../../assets/icons/ic_alert_blue.svg";

const tele = (window as any).Telegram.WebApp;

const NFTPreview = () => {
  const stakingInfo = useRecoilValue(stakingAtom);
  const stakeInfoReset = useResetRecoilState(stakingAtom);

  const [, setInput] = useRecoilState(stakingInputAtom);
  const { sendMessage } = Contract.useNextonContract();
  const [modal, setModal] = useState(false);

  const navigate = useNavigate();

  const toggleModal = () => {
    setModal((prev) => !prev);
  };

  //minting 된 nft 서버 호출
  const handleMinting = async () => {
    const data = (): UserDeposit => {
      return {
        $$type: "UserDeposit",
        queryId: BigInt(Date.now()),
        lockPeriod: BigInt(stakingInfo.lockup),
        leverage: BigInt(stakingInfo.leverage),
      };
    };
    await postStakingInfo({
      id: stakingInfo.id,
      leverage: stakingInfo.leverage,
      address: stakingInfo.address,
      amount: stakingInfo.principal,
      lockPeriod: stakingInfo.lockup.toString(),
      nominator: stakingInfo.nominator,
    });
    await sendMessage(data(), stakingInfo.principal);

    toggleModal();
    setInput("");
    stakeInfoReset();
  };

  useEffect(() => {
    if (tele) {
      tele.ready();
      tele.BackButton.show();
      tele.onEvent("backButtonClicked", () => {
        navigate("/stake/leverage");
      });
    }
    window.scrollTo(0, 0);

    return () => {
      tele.offEvent("backButtonClicked");
    };
  }, []);

  return (
    <NFTPreviewWrapper>
      {modal && <BasicModal type="stake" toggleModal={toggleModal} />}
      <ProgressBar />
      <StepBox>Final</StepBox>
      <NFTPreviewHeader>Staking NFT Preview</NFTPreviewHeader>
      <NftPreviewImage lockup={stakingInfo.lockup} />
      <NFTPreviewInfo stakingInfo={stakingInfo} />
      <NFTPreviewConfirmBox>
        <img src={IcAlertBlue} alt="alertBlue" />
        <div>
          <NFTPreviewConfirmText>
            You cannot cancel the transaction after pressing
          </NFTPreviewConfirmText>
          <NFTPreviewConfirmText>
            Confirm. Please check the NFT information.
          </NFTPreviewConfirmText>
        </div>
        <MainButton text="Confirm" onClick={handleMinting} />
        {/* <FooterButton title="Confirm" onClick={handleMinting} /> */}
      </NFTPreviewConfirmBox>
    </NFTPreviewWrapper>
  );
};

export default NFTPreview;

const NFTPreviewWrapper = styled.div`
  position: relative;

  width: 100%;
  padding: 0 2rem;
`;

const NFTPreviewHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  width: 100%;
  margin-top: 2rem;
  margin-bottom: 2rem;

  color: #45464f;
  ${({ theme }) => theme.fonts.Nexton_Title_Large};
`;

const NFTPreviewConfirmBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 1.4rem;

  width: 100%;
  margin-bottom: 1.6rem;
`;
const NFTPreviewConfirmText = styled.p`
  color: #007aff;
  ${({ theme }) => theme.fonts.Nexton_Label_Small};
`;

const StepBox = styled.div`
  width: fit-content;
  padding: 0.7rem 1.2rem;

  border: 0.1rem solid #d0d0e2;
  border-radius: 2rem;

  color: #333;
  font-family: Montserrat;
  font-size: 1.1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.4rem; /* 127.273% */
  letter-spacing: 0.0066rem;
`;
