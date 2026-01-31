import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FeedItem } from "./get-product-feed-items"

type StepInput = {
    items: FeedItem[]
}

export const buildProductFeedXmlStep = createStep(
    "build-product-feed-xml",
    async (input: StepInput) => {
        const escape = (str: string) =>
            str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&apos;")

        const itemsXml = input.items.map((item) => {
            const gtin = item.ean || item.upc
            return (
                `<item>` +
                `<g:id>${escape(item.id)}</g:id>` +
                `<title>${escape(item.title)}</title>` +
                `<description>${escape(item.description)}</description>` +
                `<link>${escape(item.link)}</link>` +

                (item.image_link ? `<g:image_link>${escape(item.image_link)}</g:image_link>` : "") +
                (item.additional_image_link
                    ? `<g:additional_image_link>${escape(item.additional_image_link)}</g:additional_image_link>`
                    : "") +

                `<g:availability>${escape(item.availability)}</g:availability>` +
                `<g:price>${escape(item.price)}</g:price>` +
                (item.sale_price ? `<g:sale_price>${escape(item.sale_price)}</g:sale_price>` : "") +
                `<g:country>IN</g:country>` +

                `<g:shipping>` +
                `<g:country>IN</g:country>` +
                `<g:service>Standard</g:service>` +
                `<g:price>0 INR</g:price>` +
                `</g:shipping>` +

                `<g:condition>${escape(item.condition || "new")}</g:condition>` +
                `<g:brand>${escape(item.brand || "Hot Wheels")}</g:brand>` +

                `<g:google_product_category>1253</g:google_product_category>` +

                `<g:product_type>Collectibles > Die-cast Vehicles > Hot Wheels</g:product_type>` +
                `<g:age_group>adult</g:age_group>` +
                `<g:gender>unisex</g:gender>` +
                `<g:material>diecast metal</g:material>` +
                `<g:adult>no</g:adult>` +
                (gtin ? `<g:gtin>${escape(gtin)}</g:gtin>` : "") +
                `<g:identifier_exists>${gtin ? "yes" : "no"}</g:identifier_exists>` +
                `<g:mpn>${escape(item.id)}</g:mpn>` +
                (item.item_group_id
                    ? `<g:item_group_id>${escape(item.item_group_id)}</g:item_group_id>`
                    : "") +

                `</item>`
            )
        }).join("")

        const xml =
            `<?xml version="1.0" encoding="UTF-8"?>` +
            `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
            `<channel>` +
            `<title>Product Feed</title>` +
            `<description>Product Feed for Google Merchant</description>` +
            itemsXml +
            `</channel>` +
            `</rss>`

        return new StepResponse(xml)
    }
)