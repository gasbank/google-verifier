import * as functions from 'firebase-functions';
import * as google from 'googleapis';
import * as fs from "fs";
import {auth, JWT} from "google-auth-library";

interface ReceiptPayload {
    packageName: string;
    productId: string;
    purchaseToken: string;
    orderId: string;
    purchaseTime: number;
}

export const verifyGooglePlay = functions.https.onRequest(async (request, response) => {

    let keys = "";
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_STRING) {
        keys = process.env.GOOGLE_APPLICATION_CREDENTIALS_STRING
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        keys = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, { encoding: 'utf-8' })
    } else {
        response.statusCode = 503;
        response.send("Application credentials not found");
        return;
    }

    const keysJson = JSON.parse(keys);

    const receiptBase64 = request.headers['receipt-to-be-verified'];

    if (typeof receiptBase64 !== "string") {
        response.statusCode = 400;
        response.send("Invalid receipt-to-be-verified header.");
        return;
    }

    const receipt = Buffer.from(receiptBase64, 'base64').toString('utf8');
    let receiptJson: {Store: string, Payload: string};
    try {
        receiptJson = JSON.parse(receipt);
    } catch (e) {
        response.statusCode = 400;
        response.send("Invalid JSON.");
        return;
    }

    if (receiptJson.Store !== "GooglePlay") {
        response.statusCode = 400;
        response.send("Invalid store type.");
        return;
    }

    let receiptPayloadJson: {json: string};
    try {
        receiptPayloadJson = JSON.parse(receiptJson.Payload);
    } catch (e) {
        response.statusCode = 400;
        response.send("Invalid JSON payload.");
        return;
    }

    let receiptPayloadJsonJson: ReceiptPayload;
    try {
        receiptPayloadJsonJson = JSON.parse(receiptPayloadJson.json);
    } catch (e) {
        response.statusCode = 400;
        response.send("Invalid JSON payload json field.");
        return;
    }

    const packageName = receiptPayloadJsonJson.packageName;
    const productId = receiptPayloadJsonJson.productId;
    const token = receiptPayloadJsonJson.purchaseToken;
    const orderId = receiptPayloadJsonJson.orderId;
    const purchaseTime = receiptPayloadJsonJson.purchaseTime;

    const authClient = auth.fromJSON(keysJson);
    if (!(authClient instanceof JWT)) {
        response.statusCode = 503;
        response.send("Invalid auth client instance type.");
        return;
    }

    authClient.scopes = ['https://www.googleapis.com/auth/androidpublisher'];

    const params = {
        auth: authClient,
        packageName: packageName,
        productId: productId,
        token: token,
    };

    const publisher = new google.androidpublisher_v3.Androidpublisher({auth: authClient});

    try {
        const verificationResult = await publisher.purchases.products.get(params);

        if (verificationResult.data.kind === "androidpublisher#productPurchase"
            && verificationResult.data.orderId === orderId
            && verificationResult.data.acknowledgementState === 1
            && verificationResult.data.purchaseState === 0
            && verificationResult.data.purchaseTimeMillis === purchaseTime.toString()) {
            // Valid receipt
            response.statusCode = 200;
            response.send(JSON.stringify(verificationResult.data));
        } else {
            response.statusCode = 400;
            response.send("Not verified.");
        }
    } catch (e) {
        response.statusCode = 400;
        response.send("Not verified with exception.");
    }
});
