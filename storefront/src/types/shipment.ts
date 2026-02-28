export interface ShiprocketActivity {
    date: string
    status: string
    activity: string
    location: string
    "sr-status": string
    "sr-status-label": string
}

export interface ShipmentTrack {
    id: number
    awb_code: string
    courier_company_id: number
    shipment_id: number
    order_id: number
    pickup_date: string | null
    delivered_date: string | null
    weight: string
    packages: number
    current_status: string
    delivered_to: string
    destination: string
    consignee_name: string
    origin: string
    courier_agent_details: string | null
    courier_name: string
    edd: string | null
    pod: string
    pod_status: string
}

export interface TrackingData {
    tracking_data: {
        track_status: number
        shipment_status: number
        shipment_track: ShipmentTrack[] // This is the [ [Object] ] in your log
        shipment_track_activities: ShiprocketActivity[]
        track_url: string
        etd: string
        qc_response: string | { qc_image: string; qc_failed_reason: string }
        is_return: boolean
        order_tag: string
    }
}

// This matches your console.log({ tracking_data: { ... } })
export type TrackingAPIResult = {
    tracking: TrackingData
}