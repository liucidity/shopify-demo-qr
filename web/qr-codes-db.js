import sqlite3 from 'sqlite3';
import path from 'path';
import shopify from './shopify.js';


const DEFAULT_DB_FILE = path.join(process.cwd(), "qr_codes_db.sqlite");

const DEFAULT_PURCHASE_QUANTITY = 1;

export const QRCodesDB = {
  qrCodesTableName: "qr_codes",
  db: null,
  ready: null,

  create: async function ({
    shopDomain,
    title,
    productId,
    variantId,
    handle,
    discountId,
    discountCode,
    destination,
  }) {
    await this.ready;

    const query = `
    INSERT INTO ${this.qrCodesTableName}
    (shopDomain, title, productId, variantId, handle, discountId, discountCode, destination, scans)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    RETURNING id;
    `

    const rawResults = await this.__query(query, [
      shopDomain,
      title,
      productId,
      variantId,
      handle,
      discountId,
      discountCode,
      destination,
    ]);

    return rawResults[0].id
  },

  update: async function (
    id, {
      title,
      productId,
      variantId,
      handle,
      discountId,
      discountCode,
      destination,
    }
  ) {
    await this.ready;

    const query = `
    UPDATE ${this.qrCodesTableName}
    SET
      title = ?,
      productId = ?,
      variantId = ?,
      handle = ?,
      discountId = ?,
      discountCode = ?,
      destination = ?
    WHERE
      id = ?;
    `;

    await this.__query(query, [
      title,
      productId,
      variantId,
      handle,
      discountId,
      discountCode,
      destination,
      id,
    ]);
    return true;
  },

  list: async function (shopDomain) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.qrCodesTableName}
      WHERE shopDomain = ?;
    `;

    const results = await this.__query(query, [shopDomain]);

    return results.map((qrcode) => this.__addImageUrl(qrcode));
  },

  __query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },


}