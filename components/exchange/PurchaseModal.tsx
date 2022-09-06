import IERC721MetadataModel from "@/models/IERC721MetadataModel";
import { useModalStore, useNFTState, useUserStore } from "@/state/store";
import { useEffect, useState } from "react";
import { IoCloseCircleSharp } from "react-icons/io5";
import crypto from "crypto";
import { useSignMessage } from "wagmi";
import { generateProof } from "@/api/exchange/generateProof";
import { IResponseMessage } from "@/models/IResponseMessage";
import Spinner from "../util/Spinner";
import MintERC1155 from "./MintERC1155";
import SignatureCard from "./SignatureCard";
import { motion } from "framer-motion";
import { useUserCoupons } from "@/api/hooks/useUserCoupons";
import { mutate } from "swr";

const PurchaseModel = (item: IERC721MetadataModel) => {
  const closeModal = useModalStore((state) => state.closeModal);
  const [userSalt, setUserSalt] = useState("");
  const [proofResponse, setProofResponse] = useState<IResponseMessage>();
  const [proofSignature, setProofSignature] = useState<string>("");
  const [proofHash, setProofHash] = useState<string>("");
  const [noCouponError, setNoCouponError] = useState<string>("");
  const [acceptance, setAcceptance] = useState<boolean>(false);
  const user = useUserStore((state) => state.user);
  const { data: couponData } = useUserCoupons(user);

  const { data, isError, isLoading, isSuccess, signMessage, error } =
    useSignMessage({
      message: userSalt,
    });

  useEffect(() => {
    if (!data) {
      setUserSalt(crypto.randomBytes(16).toString("base64"));
    }
  }, [data]);

  useEffect(() => {
    if (proofResponse) {
      setProofSignature(proofResponse.data.signature);
      setProofHash(proofResponse.data.saltHash);
    }
  }, [proofResponse]);

  const retrieveProof = async () => {
    if (data && userSalt) {
      const proofData: IResponseMessage = await generateProof(
        data,
        userSalt,
        item.tokenId
      );
      if (proofData.error) {
        setNoCouponError(proofData.message);
      } else {
        mutate("UserCoupons: " + user);

        setProofResponse(proofData);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-default-text/30 p-10 backdrop-blur lg:p-20 lg:pb-10"
    >
      <div className="flex h-full w-full flex-col rounded lg:w-4/5">
        <div className="flex h-32 w-full justify-between rounded-t bg-zinc-700 p-5 lg:p-10">
          <div className=" flex flex-col font-heading uppercase text-white">
            <h1 className="text-2xl lg:text-4xl">Purchasing</h1>
            <h2 className="text-lg text-zinc-400 lg:text-2xl">
              {item.attributes[0].trait_type}: {item.attributes[0].value}
            </h2>
          </div>
          <div
            onClick={() => closeModal()}
            className="scale-75 cursor-pointer fill-white transition duration-300 ease-in-out hover:fill-brand-rose-hot-pink lg:scale-100 "
          >
            <IoCloseCircleSharp fill="text-gray-400" size={50} />
          </div>
        </div>
        <div className="flex h-5/6 w-full items-center justify-center  rounded-b bg-zinc-800 ">
          <div className="hidden h-full w-1/2 items-center justify-center border-r-2 border-dashed border-zinc-400 border-opacity-40 p-5 lg:flex">
            <img
              className="w-full rounded object-contain"
              src={item.image}
              alt={item.name}
            />
          </div>

          <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-800 lg:w-1/2">
            {!couponData && (
              <h1 className="w-full p-5 text-center font-heading text-xl text-action-error">
                No Coupons found 😭
              </h1>
            )}
            {couponData && (
              <>
                {proofSignature && (
                  <div className="flex h-1/4 w-full flex-col items-center justify-center gap-5">
                    <h1 className="font-heading text-lg text-action-valid">
                      Successfully Generated Proof! 🎉
                    </h1>
                  </div>
                )}

                {couponData.amount === 0 && !proofSignature && (
                  <h1 className="w-full p-5 text-center font-heading text-xl text-action-error">
                    Out of Coupons 😅
                  </h1>
                )}

                {couponData.amount > 0 && !proofSignature && (
                  <div className="flex h-1/4 w-full flex-col items-center justify-center gap-5 p-10">
                    {!noCouponError && (
                      <h1 className="text-center font-heading text-2xl uppercase text-white">
                        Sign For Verification
                      </h1>
                    )}

                    {!data && (
                      <button
                        onClick={() => signMessage()}
                        className="flex h-10 w-1/2 items-center justify-center rounded bg-brand-rose-hot-pink font-heading uppercase transition duration-300 hover:bg-brand-rose-pale-rose"
                      >
                        {isLoading ? (
                          <>
                            <Spinner /> Awaiting Signature...
                          </>
                        ) : (
                          "Sign"
                        )}
                      </button>
                    )}

                    {data && acceptance && !noCouponError && !proofResponse && (
                      <button
                        onClick={() => retrieveProof()}
                        className="h-10 w-1/2 rounded bg-brand-rose-hot-pink font-heading uppercase transition duration-300 hover:bg-brand-rose-pale-rose"
                      >
                        Generate Proof
                      </button>
                    )}
                  </div>
                )}

                {data && !acceptance && (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-10">
                    <div className="flex flex-col items-center justify-center gap-2 rounded bg-orange-600/20 p-3 text-center">
                      <h1 className="font-heading text-xl uppercase text-action-warning ">
                        Warning
                      </h1>
                      <p className=" text-center text-xs font-bold uppercase text-action-warning">
                        GENERATING A PROOF WILL DEDUCT A COUPON! <br />
                        After generation you may save the data if anything goes
                        wrong 😬
                      </p>
                      <button
                        onClick={() => setAcceptance(!acceptance)}
                        className="h-10 w-full rounded bg-orange-400 font-heading uppercase transition duration-300 hover:bg-brand-rose-pale-rose lg:w-1/2"
                      >
                        I Understand
                      </button>
                      <p className=" text-center text-[10px] italic text-action-warning">
                        Proof is the signature, hash and tokenID that gets sent
                        to the smart contract in order to verify your ability to
                        mint
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex h-3/4 w-full flex-col items-center justify-center gap-2 p-5">
                  {noCouponError && (
                    <p className="text-center font-heading text-xl uppercase italic text-action-error">
                      {noCouponError}
                    </p>
                  )}
                  <SignatureCard
                    proofHash={proofHash}
                    proofSignature={proofSignature}
                    tokenId={item.tokenId}
                  />
                </div>
                <div className="flex h-1/4 w-full flex-col items-center justify-center gap-2">
                  <MintERC1155
                    proofHash={proofHash}
                    proofSignature={proofSignature}
                    tokenId={item.tokenId}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default PurchaseModel;
