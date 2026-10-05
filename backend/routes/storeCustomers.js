const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ============================================================
// GET ALL STORE CUSTOMERS
// ============================================================

router.get("/", async (req, res) => {
try {

    const result = await pool.query(`
        SELECT
            store_customer_id,
            customer_name,
            address
        FROM store_customer
        ORDER BY customer_name
    `);

    res.json(result.rows);

} catch (error) {

    console.error(
        "Error fetching store customers:",
        error
    );

    res.status(500).json({
        message: "Failed to fetch store customers"
    });
}

});

// ============================================================
// GET PRODUCTS FOR STORE CUSTOMER BILLING
// ============================================================

router.get("/products", async (req, res) => {
try {

    const result = await pool.query(`
        SELECT
            product_id,
            product_name
        FROM product
        ORDER BY product_name
    `);

    res.json(result.rows);

} catch (error) {

    console.error(
        "Error fetching products for store customers:",
        error
    );

    res.status(500).json({
        message: "Failed to fetch products"
    });
}

});

// ============================================================
// GET MONTHLY SALES FOR ALL STORE CUSTOMERS
// ============================================================

router.get("/monthly-sales", async (req, res) => {

const { month, year } = req.query;


// ========================================================
// VALIDATE MONTH AND YEAR
// ========================================================

if (!month || !year) {

    return res.status(400).json({
        message: "Month and year are required"
    });
}


const selectedMonth = Number(month);
const selectedYear = Number(year);


if (
    !Number.isInteger(selectedMonth) ||
    selectedMonth < 1 ||
    selectedMonth > 12 ||
    !Number.isInteger(selectedYear)
) {

    return res.status(400).json({
        message: "Invalid month or year"
    });
}


try {

    const result = await pool.query(
        `
        SELECT
            p.product_id,
            p.product_name,
            oi.unit,
            SUM(oi.quantity) AS total_quantity,
            SUM(oi.price) AS total_amount

        FROM orders o

        INNER JOIN order_item oi
            ON o.order_id = oi.order_id

        INNER JOIN product p
            ON oi.product_id = p.product_id

        WHERE o.store_customer_id IS NOT NULL

          AND EXTRACT(MONTH FROM o.order_date) = $1

          AND EXTRACT(YEAR FROM o.order_date) = $2

        GROUP BY
            p.product_id,
            p.product_name,
            oi.unit

        ORDER BY
            p.product_name,
            oi.unit
        `,
        [
            selectedMonth,
            selectedYear
        ]
    );


    res.json(result.rows);

} catch (error) {

    console.error(
        "Error fetching monthly store customer sales:",
        error
    );

    res.status(500).json({
        message:
            "Failed to fetch monthly store customer sales"
    });
}


});

// ============================================================
// CREATE STORE CUSTOMER ORDER
// ============================================================

router.post("/orders", async (req, res) => {

const {
    customerName,
    address,
    orderDate,
    totalAmount,
    items
} = req.body;


// ========================================================
// VALIDATE CUSTOMER + ORDER
// ========================================================

if (
    !customerName ||
    !address ||
    totalAmount === undefined ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
) {

    return res.status(400).json({
        message:
            "Customer name, address, total amount and items are required"
    });
}


// ========================================================
// VALIDATE ORDER ITEMS
// ========================================================

for (const item of items) {

    if (
        !item.productId ||
        item.quantity === undefined ||
        item.quantity === null ||
        Number(item.quantity) <= 0 ||
        !item.unit ||
        item.price === undefined ||
        item.price === null ||
        Number(item.price) < 0
    ) {

        return res.status(400).json({
            message:
                "Each item must have a valid product, quantity, unit and price"
        });
    }


    // Only these units are allowed for store customers.
    if (!["kg", "gms", "pcs"].includes(item.unit)) {

        return res.status(400).json({
            message:
                "Invalid unit. Allowed units are kg, gms and pcs"
        });
    }
}


const client = await pool.connect();


try {

    await client.query("BEGIN");


    // ====================================================
    // 1. GET EXISTING CUSTOMER OR CREATE NEW CUSTOMER
    // ====================================================

    const customerResult = await client.query(
        `
        INSERT INTO store_customer (
            customer_name,
            address
        )
        VALUES ($1, $2)

        ON CONFLICT (
            customer_name,
            address
        )

        DO UPDATE SET
            customer_name = EXCLUDED.customer_name

        RETURNING
            store_customer_id,
            customer_name,
            address
        `,
        [
            customerName.trim(),
            address.trim()
        ]
    );


    const customer = customerResult.rows[0];


    // ====================================================
    // 2. CREATE ORDER
    // ====================================================

    const orderResult = await client.query(
        `
        INSERT INTO orders (
            resort_customer_id,
            store_customer_id,
            order_date,
            total_amount
        )
        VALUES (
            NULL,
            $1,
            $2,
            $3
        )

        RETURNING
            order_id,
            store_customer_id,
            order_date,
            total_amount
        `,
        [
            customer.store_customer_id,
            orderDate || new Date(),
            Number(totalAmount)
        ]
    );


    const order = orderResult.rows[0];


    // ====================================================
    // 3. INSERT ORDER ITEMS
    // ====================================================

    for (const item of items) {

        await client.query(
            `
            INSERT INTO order_item (
                order_id,
                product_variant_id,
                combo_id,
                product_id,
                quantity,
                unit,
                price
            )
            VALUES (
                $1,
                NULL,
                NULL,
                $2,
                $3,
                $4,
                $5
            )
            `,
            [
                order.order_id,
                Number(item.productId),
                Number(item.quantity),
                item.unit,

                // Store line total price
                Number(item.price) *
                Number(item.quantity)
            ]
        );
    }


    // ====================================================
    // 4. COMMIT
    // ====================================================

    await client.query("COMMIT");


    res.status(201).json({
        message:
            "Store customer order created successfully",

        customer,

        order
    });


} catch (error) {

    await client.query("ROLLBACK");


    console.error(
        "Error creating store customer order:",
        error
    );


    res.status(500).json({
        message:
            "Failed to create store customer order"
    });


} finally {

    client.release();
}

});

module.exports = router;
