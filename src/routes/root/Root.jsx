import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import styles from "./Root.module.css";
import Footer from "../../components/footer/Footer";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../../config/networkConfig";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";

const Root = () => {
  const currentAccount = useCurrentAccount();

  const tunflowPackageId = useNetworkVariable("tunflowPackageId");

  const { data: subscriberData } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${tunflowPackageId}::governance::SubscriptionPurchased`,
      },
    },
    {
      select: (data) =>
        data.data
          .flatMap((x) => x.parsedJson)
          .filter((y) => y.user === currentAccount.address),
    }
  );

  return (
    <div className={styles.root}>
      <ScrollToTop />
      <Header />
      <Toaster position="top-right" />
      <Outlet context={subscriberData} />
      <Footer />
    </div>
  );
};

export default Root;
