const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log(
    "Database host:",
    process.env.DATABASE_URL
        ? new URL(process.env.DATABASE_URL).hostname
        : "DATABASE_URL NOT FOUND"
);

const pool = require("./config/db");
const resortCustomerRoutes = require("./routes/resortCustomerRoutes");
const storeCustomerRoutes = require("./routes/storeCustomers");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/resort-customers", resortCustomerRoutes);

app.use("/api/store-customers", storeCustomerRoutes);

app.get("/", (req, res) => {
    res.send("Coffee Billing Backend is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});