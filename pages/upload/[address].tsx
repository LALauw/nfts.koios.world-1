import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import UploadPanel from "../../components/upload/UploadPanel";

const upload = ({ isWhitelisted, user, achievementTypes }: any) => {
  const account = useAccount();
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    setUserAddress(account?.address!);
  }, [account]);

  if (!isWhitelisted || userAddress !== user) {
    return (
      <div
        className={
          "flex h-screen w-full items-center justify-center bg-default-text text-center font-heading text-8xl text-brand-rose-hot-pink"
        }
      >
        Not Allowed
      </div>
    );
  }
  return (
    <div
      className={
        "flex h-screen w-full items-center justify-center bg-default-text text-center font-heading text-8xl text-brand-rose-hot-pink"
      }
    >
      <UploadPanel achievementTypes={achievementTypes} />
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { address } = context.query;

  const res = await fetch(
    `${process.env.LOCAL_URL}/api/findAddress?address=${address}`
  );
  const data = await res.json();

  const resType = await fetch(
    `${process.env.LOCAL_URL}/api/getAchievementTypes`
  );
  const typeData = await resType.json();

  return {
    props: {
      isWhitelisted: data.found,
      user: address,
      achievementTypes: typeData,
    },
  };
}

export default upload;
