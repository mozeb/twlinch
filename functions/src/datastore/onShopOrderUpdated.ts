import { logger } from "firebase-functions";
import {
  type Change,
  type DocumentSnapshot,
  type FirestoreEvent,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import archiver from "archiver";
import { ShopOrder } from "../interfaces";
import { get } from "lodash";
import { orderState } from "../https/woocommerce";

export const fsshoporderonupdated = onDocumentUpdated(
  {
    document: "/shopOrders/{orderId}",
    memory: "4GiB",
    timeoutSeconds: 280,
    maxInstances: 100,
  },
  onShopOrderUpdated,
);

async function onShopOrderUpdated(
  event: FirestoreEvent<
    Change<DocumentSnapshot> | undefined,
    { orderId: string }
  >,
) {
  const orderId = event.params.orderId;
  logger.info(`ℹ️ onShopOrderUpdated for orderId=${orderId}`);

  // Check if deleted
  if (!event.data?.after.exists) {
    logger.info("🗑️ Skipping because the value was deleted.");
    return;
  }

  const orderBefore = event.data.before.data() as ShopOrder;
  const orderAfter = event.data.after.data() as ShopOrder;

  // Check if music upload flag changed to true.
  if (
    orderBefore.order_process?.musicProcess !== "uploadFinished" &&
    orderAfter.order_process?.musicProcess === "uploadFinished"
  ) {
    logger.info("ℹ️ Starting to create music zip folder");
    const zipFileUrl = await createZipFromFolder(
      `orders/${orderId}/music/`,
      `Order_${orderAfter.wc_order_num}_${orderAfter.address_billing.first_name}_${orderAfter.address_billing.last_name}_Music.zip`,
    );

    await getFirestore().collection("shopOrders").doc(orderId).update({
      musicZip: zipFileUrl,
    });
  }

  const beforeLabel: orderState | undefined = get(
    orderBefore,
    "order_process.labelProcess",
  );
  const afterLabel: orderState | undefined = get(
    orderAfter,
    "order_process.labelProcess",
  );

  const beforeSleeve: orderState | undefined = get(
    orderBefore,
    "order_process.sleeveProcess",
  );
  const afterSleeve: orderState | undefined = get(
    orderAfter,
    "order_process.sleeveProcess",
  );

  const beforeSlipmat: orderState | undefined = get(
    orderBefore,
    "order_process.slipmatProcess",
  );
  const afterSlipmat: orderState | undefined = get(
    orderAfter,
    "order_process.slipmatProcess",
  );

  const beforePD: orderState | undefined = get(
    orderBefore,
    "order_process.pictureDiscProcess",
  );
  const afterPD: orderState | undefined = get(
    orderAfter,
    "order_process.pictureDiscProcess",
  );

  // Label status changed to "uploadFinished" and other two conditions are not "waitingForUpload".
  // So they are either "notOrdered" or "uploadFinished" or undefined. This is as intended.
  const onLabelChange =
    beforeLabel !== "uploadFinished" &&
    afterLabel === "uploadFinished" &&
    afterSleeve !== "waitingForUpload" &&
    afterSlipmat !== "waitingForUpload" &&
    afterPD !== "waitingForUpload";

  // Sleeve status changed to "uploadFinished" and other two conditions are not "waitingForUpload".
  const onSleeveChange =
    beforeSleeve !== "uploadFinished" &&
    afterSleeve === "uploadFinished" &&
    afterLabel !== "waitingForUpload" &&
    afterSlipmat !== "waitingForUpload" &&
    afterPD !== "waitingForUpload";

  // Slipmat status changed to "uploadFinished" and other two conditions are not "waitingForUpload".
  const onSlipmatChange =
    beforeSlipmat !== "uploadFinished" &&
    afterSlipmat === "uploadFinished" &&
    afterLabel !== "waitingForUpload" &&
    afterSleeve !== "waitingForUpload" &&
    afterPD !== "waitingForUpload";

  // Slipmat status changed to "uploadFinished" and other two conditions are not "waitingForUpload".
  const onPictureDiscChange =
    beforePD !== "uploadFinished" &&
    afterPD === "uploadFinished" &&
    afterLabel !== "waitingForUpload" &&
    afterSleeve !== "waitingForUpload" &&
    afterSlipmat !== "waitingForUpload";

  // If any of the three conditions happened, run the code.
  if (
    onLabelChange ||
    onSleeveChange ||
    onSlipmatChange ||
    onPictureDiscChange
  ) {
    logger.info("ℹ️ Starting to create zip from folder");
    const zipFileUrl = await createZipFromFolder(
      `orders/${orderId}/artwork/`,
      `Order_${orderAfter.wc_order_num}_${orderAfter.address_billing.first_name}_${orderAfter.address_billing.last_name}_Artwork.zip`,
    );

    await getFirestore().collection("shopOrders").doc(orderId).update({
      artworkZip: zipFileUrl,
    });
  }
}

/**
 * Recursively scan folder for files and zip them.
 * @param folderPath Path in storage to the folder containing files/folders.
 * @param zipFileName Zip file name.
 */
async function createZipFromFolder(folderPath: string, zipFileName: string) {
  const mainBucket = getStorage().bucket();
  const bucket = getStorage().bucket("twlinch-records-order-zips");
  const zipFile = bucket.file(folderPath + zipFileName);

  // Get all files from bucket.
  const [fileRefs] = await mainBucket.getFiles({
    prefix: folderPath,
    delimiter: ".zip",
  });

  // Create writable stream to zipFile and pipe in archiver output.
  const outputStreamBuffer = zipFile.createWriteStream({
    gzip: true,
    metadata: { cacheControl: "no-cache" },
  });
  const archive = archiver("zip", {
    gzip: true,
    zlib: { level: 9 },
  });
  archive.on("error", (err: any) => {
    logger.error(err);
    throw err;
  });
  archive.pipe(outputStreamBuffer);

  for (const fileRef of fileRefs) {
    logger.info(`ℹ️ Start to download file: ${fileRef.name}`);
    const file = await fileRef.download();
    const name = fileRef.name.replace(folderPath, "");
    archive.append(file[0], {
      name: name,
    });
  }

  const zipUrl: string =
    "https://storage.googleapis.com/twlinch-records-order-zips/" +
    folderPath +
    zipFileName;

  archive.on("finish", async () => {
    logger.log("✅ Finished uploading zip.");
  });

  await archive.finalize();

  // zipUrl = (
  //   await zipFile.getSignedUrl({
  //     expires: new Date(2050, 12, 31),
  //     action: "read",
  //   })
  // )[0];

  // Get the download URL

  return zipUrl;
}
