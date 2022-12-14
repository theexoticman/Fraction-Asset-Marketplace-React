import {
  Alert,
  Badge,
  Button,
  Card,
  Image,
  Input,
  Modal,
  Spin,
  Tooltip,
} from "antd";
import React, { useState, useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { FileSearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Meta from "antd/lib/card/Meta";
import { getExplorer } from "helpers/networks";

import LogoImg from "../assets/logo_without_name.png";
import { useFractionAsset } from "hooks/useFractionAsset";

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    gap: "10px",
  },
};

export default function FractionAsset(props) {
  const fallbackImg = LogoImg;
  const { chainId, signer, accounts, fractionAssetContract, assets } =
    useFractionAsset();
  const [assetToBuy, setAssetToBuy] = useState(null);
  const [visibility, setVisibility] = useState(false);
  const [errorTransaction, setErrorTransaction] = useState(false);
  const [transactionReceipt, setTransactionReceipt] = useState();

  const [loading, setLoading] = useState(false);
  const [fractionsToBuy, setFractionsToBuy] = useState("");
  const DECIMALS = 10 ** 18;
  const buyShares = async (asset, amount) => {
    setLoading(true);
    console.log("contract");
    console.log(asset.contract);

    try {
      const res = await (
        await asset.contract.connect(signer).buyFractions(amount, {
          value: BigNumber.from(
            String(Math.ceil(amount * asset?.price) * DECIMALS)
          ),
          gasLimit: "100000",
        })
      ).wait();
    } catch (e) {
      setTransactionReceipt(e);
      console.log(e);
      setErrorTransaction(true);
    }

    console.log("Transaction Receipt");
    console.log(transactionReceipt);
    setLoading(false);
    setVisibility(false);
  };

  const handleBuyClick = (asset) => {
    setAssetToBuy(asset);

    setVisibility(true);
  };
  const handleInput = (event) => {
    setFractionsToBuy(event.target.value);
  };

  return (
    <div style={styles.NFTs}>
      {assets?.map((asset, index) => (
        <div key={index}>
          <Card
            hoverable
            actions={[
              <Tooltip title="View On Blockexplorer">
                <FileSearchOutlined
                  onClick={() =>
                    window.open(
                      `${getExplorer(chainId)}address/${asset.addr}`,
                      "_blank"
                    )
                  }
                />
              </Tooltip>,
              <Tooltip title="Buy Asset Fractions">
                <ShoppingCartOutlined onClick={() => handleBuyClick(asset)} />
              </Tooltip>,
            ]}
            style={{ width: 240, border: "2px solid #e7eaf3" }}
            cover={
              <Image
                preview={false}
                src={asset?.image || "error"}
                fallback={fallbackImg}
                alt=""
                style={{ height: "240px", objectFit: "scale-down" }}
              />
            }
          >
            {asset && (
              <Badge.Ribbon text="Buy Now" color="green"></Badge.Ribbon>
            )}
            <Meta
              title={asset?.name}
              description={`Available shares: ${asset?.availableShares} / ${
                asset?.shares
              }. Share price: ${asset?.price.toFixed(2)} Matic`}
            />
          </Card>

          <Modal
            title={`Buy ${assetToBuy?.name} #${assetToBuy?.shares}`}
            visible={visibility}
            onCancel={() => {
              setVisibility(false);
              setLoading(false);
            }}
            onOk={() => buyShares(assetToBuy, fractionsToBuy)}
            okText="Buy"
          >
            <Spin spinning={loading}>
              <div
                style={{
                  width: "250px",
                  margin: "auto",
                }}
              >
                <Badge.Ribbon
                  color="green"
                  text={`${assetToBuy?.price.toFixed(2)} Matic`}
                >
                  <img
                    src={assetToBuy?.image}
                    style={{
                      width: "250px",
                      borderRadius: "10px",
                      marginBottom: "15px",
                    }}
                  />
                  <Input
                    onChange={handleInput}
                    placeholder={`# of shares max: ' ${assetToBuy?.availableShares}`}
                  ></Input>
                </Badge.Ribbon>
              </div>
            </Spin>
          </Modal>

          <Modal
            title={`Error with Transaction`}
            visible={errorTransaction}
            footer={[
              <Button key="ok" onClick={() => setErrorTransaction(false)}>
                ok
              </Button>,
            ]}
          ></Modal>
        </div>
      ))}
    </div>
  );
}
