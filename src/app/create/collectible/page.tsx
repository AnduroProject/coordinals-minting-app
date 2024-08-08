"use client";

import React, { useState } from "react";
import Header from "@/components/layout/header";
import Banner from "@/components/section/banner";
import ButtonLg from "@/components/ui/buttonLg";
import UploadFile from "@/components/section/uploadFile";
import Input from "@/components/ui/input";
import ButtonOutline from "@/components/ui/buttonOutline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { mintToken } from "@/utils/mint";
import UploadCardFit from "@/components/atom/cards/uploadCardFit";
import Layout from "@/components/layout/layout";
import {
  ASSETTYPE,
  FEERATE,
  RECEIVER_ADDRESS,
  MOCK_MENOMIC,
} from "@/lib/constants";
import { tokenData } from "@/types";
import useFormState from "@/lib/store/useFormStore";
import { toast } from "sonner";

const stepperData = ["Upload", "Confirm"];

const SingleCollectible = () => {
  const router = useRouter();
  const {
    ticker,
    setTicker,
    headline,
    setHeadline,
    imageBase64,
    setImageBase64,
    imageMime,
    setImageMime,

    setTxUrl,
    txUrl,
    reset,
  } = useFormState();

  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;
        const mime = base64
          .split(",")[0]
          .split(":")[1]
          .split(";")[0]
          .split("/")[1];
        setImageBase64(base64);
        setImageMime(mime);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    if (!imageBase64) {
      setError("Image not provided.");
      setIsLoading(false);
      return;
    }

    if (!headline) {
      setError("headline not provided.");
      setIsLoading(false);
      return;
    }

    const opReturnValues = [
      {
        image_data: imageBase64,
        mime: imageMime,
      },
    ];

    const data: tokenData = {
      address: RECEIVER_ADDRESS,
      opReturnValues,
      assetType: ASSETTYPE.NFTONCHAIN,
      headline,
      ticker,
      supply: 1,
    };

    if (data.ticker.length > 7) {
      setError("Invalid ticker. Need to be no longer than 7 character long");
      setIsLoading(false);
      return;
    }
    try {
      // Call the mintToken function with the required data
      const transactionResult = await mintToken(data, MOCK_MENOMIC, FEERATE);
      console.log("🚀 ~ handleSubmit ~ mintResponse:", transactionResult);
      if (transactionResult && transactionResult.error == false) {
        setError(transactionResult.message || "An error occurred"); // Set the error state
        toast.error(transactionResult.message || "An error occurred");
        setIsLoading(false);
      } else if (transactionResult) {
        setError("");
        setResponse(transactionResult);
        setIsLoading(false);
        setTxUrl(
          `https://testnet.coordiscan.io/tx/${transactionResult.result}`,
        );
        setStep(1);
      }

      setStep(1);
    } catch (error) {
      setError(error.message || "An error occurred"); // Set the error state
      toast.error(error.message || "An error occurred");
      return setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setImageBase64("");
  };

  const triggerRefresh = () => {
    setStep(0);
    reset();
    router.push("/create");
  };

  return (
    <Layout>
      <div className="flex flex-col w-full h-full bg-background items-center pb-[148px]">
        <Header />
        <div className="w-full flex flex-col items-center gap-16 z-50">
          <Banner
            title={
              step == 0
                ? "Create single Collectible"
                : "Your Collectible is successfully created!"
            }
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <form onSubmit={handleSubmit}>
              <div className="w-[592px] items-start flex flex-col gap-16">
                <div className="w-full gap-8 flex flex-col">
                  <p className="text-profileTitle text-neutral50 font-bold">
                    Upload your Collectible
                  </p>
                  {imageBase64 ? (
                    <UploadCardFit
                      image={imageBase64}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <UploadFile
                      text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                      handleImageUpload={handleImageUpload}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-8 w-full">
                  <p className="text-profileTitle text-neutral50 font-bold">
                    Details (Optional)
                  </p>
                  <div className="flex flex-col gap-6 w-full">
                    <Input
                      title="Name"
                      text="Collectable name"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                    <Input
                      title="Ticker"
                      text="Collectable ticker"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                    />
                    {/* <TextArea title="Description" text="Collectible description" /> */}
                  </div>
                </div>
                <div className="w-full flex flex-row gap-8">
                  <ButtonOutline
                    title="Back"
                    onClick={() => router.push("/")}
                  />
                  <ButtonLg
                    type="submit"
                    isSelected={true}
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? "...loading" : "Continue"}
                  </ButtonLg>
                </div>
              </div>
              <div className="text-red-500">{error}</div>
            </form>
          )}
          {step == 1 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                <img
                  src={imageBase64}
                  alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-cover rounded-3xl"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-3xl text-neutral50 font-bold">
                      ${ticker}
                    </p>
                    <p className="text-xl text-neutral100 font-medium">
                      Total supply: {1}
                    </p>
                  </div>
                  <p className="text-neutral100 text-lg2">
                    <a href={txUrl} target="_blank" className="text-blue-600">
                      {txUrl}
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline
                  title="Go home"
                  onClick={() => router.push("/")}
                />
                <ButtonLg
                  type="submit"
                  isSelected={true}
                  isLoading={isLoading}
                  onClick={() => triggerRefresh()}
                >
                  Create again
                </ButtonLg>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SingleCollectible;
