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

  read: async function (id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.qrCodesTableName}
      WHERE id = ?;
    `;

    const rows = this.__query(query, [id]);

    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

    return this.__addImageUrl(rows[0])
  },

  delete: async function (id) {
    await this.ready;

    const query = `
      DELETE FROM ${this.qrCodesTableName}
      WHERE id = ?;
    `;

    await this.__query(query, [id]);
    return true;
  },

  generateQrcodeDestinationUrl: function (qrcode) {
    return
    `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode.id}/scan`;
  },

  handleCodeScan: async function (qrcode) {
    await this.__increaseScanCount(qrcode);

    const url = new URL(qrcode.shopDomain);
    switch (qrcode.destination) {
      case "product":
        return this.__goToProductView(url, qrcode);
      case "checkout":
        return this.__goToProductCheckout(url, qrcode);
      default:
        throw `Unrecognized destination: "${qrcode.destination}"`
    }
  },

  __hasQrCodesTable: async function () {
    const query = `
      SELECT name from sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;

    const rows = await this.__query(query, [this.qrCodesTableName]);
    return rows.length === 1;
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

  __addImageUrl: function (qrcode) {
    try {
      qrcode.imageUrl = this.__generateQRcodeImageUrl(qrcode);
    } catch (err) {
      console.error(err)
    }
  },

  __generateQRcodeImageUrl: function (qrcode) {
    return
    `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode.id}/image`
  }



}