const express = require("express");
const router = express.Router();
const pool = require("../config/db");


// ============================================================
// GET ALL ACTIVE RESORT CUSTOMERS
// ============================================================

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                resort_customer_id,
                customer_name,
                address
            FROM resort_customer
            WHERE is_active = TRUE
            ORDER BY customer_name
        `);

        res.json(result.rows);

    } catch (error) {

        console.error(
            "Error fetching resort customers:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch resort customers"
        });
    }
});


// ============================================================
// GET PRODUCTS, COMBOS AND PRICES
// FOR A PARTICULAR RESORT CUSTOMER
// ============================================================

router.get("/:customerId/products", async (req, res) => {

    const { customerId } = req.params;

    try {

        const result = await pool.query(`
            SELECT
                p.product_id,
                p.product_name,

                pv.product_variant_id,
                pv.pack_size_grams,

                c.combo_id,
                c.combo_name,

                rcp.price

            FROM resort_customer_price rcp

            LEFT JOIN product_variant pv
                ON rcp.product_variant_id =
                   pv.product_variant_id

            LEFT JOIN product p
                ON pv.product_id =
                   p.product_id

            LEFT JOIN combo c
                ON rcp.combo_id =
                   c.combo_id

            WHERE rcp.resort_customer_id = $1

            ORDER BY
                COALESCE(
                    p.product_name,
                    c.combo_name
                ),
                pv.pack_size_grams
        `, [customerId]);

        res.json(result.rows);

    } catch (error) {

        console.error(
            "Error fetching resort customer products:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch products for resort customer"
        });
    }
});


// ============================================================
// CREATE RESORT CUSTOMER ORDER
// ============================================================

router.post("/:customerId/orders", async (req, res) => {

    const { customerId } = req.params;

    const {
        orderDate,
        totalAmount,
        items
    } = req.body;


    // ========================================================
    // VALIDATION
    // ========================================================

    if (
        !customerId ||
        totalAmount === undefined ||
        !items ||
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return res.status(400).json({
            message:
                "Customer ID, total amount and items are required"
        });
    }


    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // ====================================================
        // 1. CREATE ORDER
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
                $1,
                NULL,
                $2,
                $3
            )
            RETURNING
                order_id,
                resort_customer_id,
                order_date,
                total_amount
            `,
            [
                customerId,
                orderDate || new Date(),
                totalAmount
            ]
        );

        const order = orderResult.rows[0];


        // ====================================================
        // 2. CREATE ORDER ITEMS
        // ====================================================

        for (const item of items) {

            await client.query(
    `
    INSERT INTO order_item (
        order_id,
        product_variant_id,
        combo_id,
        quantity,
        price
    )
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
        order.order_id,

        item.productVariantId
            ? item.productVariantId
            : null,

        item.comboId
            ? item.comboId
            : null,

        Number(item.quantity),

        Number(item.price)
    ]
);
        }


        // ====================================================
        // 3. COMMIT
        // ====================================================

        await client.query("COMMIT");


        res.status(201).json({

            message:
                "Resort order created successfully",

            order

        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Error creating resort order:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create resort order"
        });

    } finally {

        client.release();

    }
});


// ============================================================
// GET MONTHLY PRODUCT / COMBO QUANTITY
// FOR A PARTICULAR RESORT CUSTOMER
// ============================================================

router.get("/:customerId/monthly-orders", async (req, res) => {

    const { customerId } = req.params;

    const {
        month,
        year
    } = req.query;


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!month || !year) {

        return res.status(400).json({
            message:
                "Month and year are required"
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
            message:
                "Invalid month or year"
        });
    }


    try {

        const result = await pool.query(
            `
            SELECT

                COALESCE(
                    p.product_name,
                    c.combo_name
                ) AS item_name,

                pv.pack_size_grams,

                SUM(oi.quantity) AS total_quantity,

                SUM(oi.price) AS total_amount

            FROM orders o

            INNER JOIN order_item oi
                ON o.order_id =
                   oi.order_id

            LEFT JOIN product_variant pv
                ON oi.product_variant_id =
                   pv.product_variant_id

            LEFT JOIN product p
                ON pv.product_id =
                   p.product_id

            LEFT JOIN combo c
                ON oi.combo_id =
                   c.combo_id

            WHERE
                o.resort_customer_id = $1

                AND EXTRACT(
                    MONTH FROM o.order_date
                ) = $2

                AND EXTRACT(
                    YEAR FROM o.order_date
                ) = $3

            GROUP BY
                p.product_name,
                c.combo_name,
                pv.pack_size_grams

            ORDER BY
                item_name,
                pv.pack_size_grams
            `,
            [
                customerId,
                selectedMonth,
                selectedYear
            ]
        );


        res.json(result.rows);

    } catch (error) {

        console.error(
            "Error fetching monthly resort orders:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch monthly resort orders"
        });
    }
});


// ============================================================
// GET MONTHLY ORDER DETAILS
// FOR EXCEL / DETAILED DISPLAY
// ============================================================
//
// Endpoint:
//
// /api/resort-customers/:customerId/monthly-order-details
//
// Response is grouped by order:
//
// [
//     {
//         order_id: 1,
//         order_date: "...",
//         total_amount: 600,
//         items: [
//             {
//                 item_name: "Instant Coffee",
//                 pack_size_grams: 200,
//                 quantity: 1,
//                 quantity_display: "200g",
//                 unit_price: 100,
//                 total_price: 200
//             }
//         ]
//     }
// ]
// ============================================================

router.get(
    "/:customerId/monthly-order-details",
    async (req, res) => {

        const { customerId } = req.params;

        const {
            month,
            year
        } = req.query;


        // ====================================================
        // VALIDATION
        // ====================================================

        if (!month || !year) {

            return res.status(400).json({
                message:
                    "Month and year are required"
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
                message:
                    "Invalid month or year"
            });
        }


        try {

            // =================================================
            // GET ORDER DETAILS
            // =================================================

            const result = await pool.query(
                `
                SELECT

                    o.order_id,

                    o.order_date,

                    o.total_amount,

                    oi.order_item_id,

                    COALESCE(
                        p.product_name,
                        c.combo_name
                    ) AS item_name,

                    pv.pack_size_grams,

                    oi.quantity,

                    CASE
                        WHEN oi.quantity > 0
                        THEN
                            oi.price / oi.quantity
                        ELSE
                            0
                    END AS unit_price,

                    oi.price AS total_price

                FROM orders o

                INNER JOIN order_item oi
                    ON o.order_id =
                       oi.order_id

                LEFT JOIN product_variant pv
                    ON oi.product_variant_id =
                       pv.product_variant_id

                LEFT JOIN product p
                    ON pv.product_id =
                       p.product_id

                LEFT JOIN combo c
                    ON oi.combo_id =
                       c.combo_id

                WHERE
                    o.resort_customer_id = $1

                    AND EXTRACT(
                        MONTH FROM o.order_date
                    ) = $2

                    AND EXTRACT(
                        YEAR FROM o.order_date
                    ) = $3

                ORDER BY
                    o.order_date,
                    o.order_id,
                    oi.order_item_id
                `,
                [
                    customerId,
                    selectedMonth,
                    selectedYear
                ]
            );


            // =================================================
            // GROUP ITEMS BY ORDER
            // =================================================

            const ordersMap = new Map();


            for (const row of result.rows) {

                const orderId = row.order_id;


                // =================================================
                // CREATE ORDER
                // =================================================

                if (!ordersMap.has(orderId)) {

                    ordersMap.set(orderId, {

                        order_id:
                            row.order_id,

                        order_date:
                            row.order_date,

                        total_amount:
                            Number(row.total_amount),

                        items: []

                    });

                }


                // =================================================
                // FORMAT QUANTITY
                // =================================================

                let quantityDisplay;


                if (row.pack_size_grams) {

                    const totalGrams =
                        Number(row.quantity) *
                        Number(row.pack_size_grams);

                    quantityDisplay =
                        `${totalGrams}g`;

                } else {

                    quantityDisplay =
                        Number(row.quantity);

                }


                // =================================================
                // ADD ITEM
                // =================================================

                ordersMap.get(orderId).items.push({

                    order_item_id:
                        row.order_item_id,

                    item_name:
                        row.item_name,

                    pack_size_grams:
                        row.pack_size_grams
                            ? Number(row.pack_size_grams)
                            : null,

                    quantity:
                        Number(row.quantity),

                    quantity_display:
                        quantityDisplay,

                    unit_price:
                        Number(row.unit_price),

                    total_price:
                        Number(row.total_price)

                });

            }


            // =================================================
            // CONVERT MAP TO ARRAY
            // =================================================

            const formattedOrders =
                Array.from(ordersMap.values());


            // =================================================
            // SEND RESPONSE
            // =================================================

            res.json(formattedOrders);


        } catch (error) {

            console.error(
                "Error fetching detailed monthly resort orders:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to fetch detailed monthly resort orders"
            });
        }
    }
);


module.exports = router;