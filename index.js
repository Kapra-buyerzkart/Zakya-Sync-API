const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// Initialize Firestore
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Webhook Endpoint to Receive Walk-in Sales from Zakya
app.post("/zakya/webhook", async (req, res) => {
    try {
        const invoiceData = req.body;
        console.log("Received webhook:", invoiceData);

        if (!invoiceData.invoiceId || !invoiceData.items) {
            return res.status(400).json({ message: "Invalid data received" });
        }

        await db.collection("walkInSales").doc(invoiceData.invoiceId).set(invoiceData);

        res.status(200).json({ message: "Webhook received successfully" });
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
