"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import Image from "next/image";
import Options from "@/components/section/options";
import { Gallery, Stop, BuyCrypto } from "iconsax-react";
import ButtonLg from "@/components/ui/buttonLg";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

const Create = () => {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleOptionClick = (id: number) => {
    setSelectedOption((prevSelectedOption) => {
      if (prevSelectedOption === id) {
        return null;
      } else {
        return id;
      }
    });
  };

  const handleNav = () => {
    if (selectedOption !== null) {
      const selectedData = data.find((item) => item.id === selectedOption);
      if (selectedData) {
        router.push(selectedData.pageUrl);
      }
    }
  };

  const data = [
    {
      id: 2,
      icon: Stop,
      title: "Single Collectible",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      pageUrl: "/create/collectible",
    },
    {
      id: 3,
      icon: BuyCrypto,
      title: "Token",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      pageUrl: "/create/token",
    },
  ];

  return (
    <Layout>
      <div className="flex h-full w-full flex-col justify-start items-center pb-20">
        <div className="flex flex-col items-center w-full gap-12 mt-[42.5px] z-50">
          <div className="relative w-full h-40 flex justify-center max-w-[1216px]">
            <Image
              src={"/background.png"}
              alt="background"
              width={0}
              height={160}
              sizes="100%"
              className="object-cover w-full h-full rounded-3xl"
            />
            <div className="absolute top-0 flex flex-col items-center justify-center w-full h-full gap-6 bg-bannerBlack rounded-3xl backdrop-blur-3xl bg-opacity-[70%]">
              <p className="text-4xl font-bold text-neutral50">
                What are you going to create?
              </p>
              <p className="text-xl text-neutral-100">
                Choose one of them to continue.
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-[592px] mt-12 items-center flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            {data.map((item) => (
              <Options
                key={item.id}
                id={item.id}
                title={item.title}
                text={item.text}
                icon={item.icon}
                isSelected={selectedOption === item.id}
                onClick={() => handleOptionClick(item.id)}
              />
            ))}
          </div>
          <ButtonLg type="button" isSelected={selectedOption !== null} onClick={handleNav}>
            Continue
          </ButtonLg>
        </div>
      </div>

      <div className="fixed top-0 left-0 w-full h-full bg-overlayRgb flex justify-center items-center z-50 hidden">
       <div className="bg-white rounded-lg max-w-2xl w-full relative">
        <div className="grid grid-cols-12">
         <div className="col-span-4">
          <div className="p-5 bg-neutral100 rounded-l-lg">
           <Link href={"/"}>
              <Image src={"/Logo.svg"} alt="coordinals" width={160} height={40} />
            </Link>
           <h4 className="my-3">Connect your network</h4>
           <p className="text-sm mb-3">Connecting your network is like "logging in to Web3. Select your network from the options to get started.</p>
           <Link className="text-sm text-neutral700" href={"/"}>I don't have a network</Link>
          </div> 
         </div>
         <div className="col-span-8">
          <div className="border-b border-gray-400 flex flex-row justify-between items-center px-2">
           <h5 className>Available Networks (2)</h5>
           <button className="bg-transparent border-none text-2xl">&times;</button>
          </div>
          <div className="grid grid-cols-12 gap-2 mt-4 px-2">
           <div className="col-span-6">
            <div className="border border-gray-400 p-2 rounded-lg flex flex-row items-center">
             <div className="border border-gray-400 p-1.5 rounded-lg">
              <Image
                src={"/cbtc.svg"}
                alt="background"
                width={20}
                height={20}
                sizes="100%"
                className="object-cover w-5 h-5"
              />
             </div>
             <p className="pl-2 text-base">cBTC Network</p>
            </div>
           </div>
           <div className="col-span-6">
            <div className="border border-gray-400 p-2 rounded-lg flex flex-row items-center">
             <div className="border border-gray-400 p-1.5 rounded-lg">
              <Image
                src={"/alys.svg"}
                alt="background"
                width={20}
                height={20}
                sizes="100%"
                className="object-cover w-5 h-5 rounded-full"
              />
             </div>
             <p className="pl-2 text-base">aBTC Network</p>
            </div>
           </div>
          </div>
         </div> 
        </div>
      </div>
     </div>

    </Layout>
  );
};

export default Create;
