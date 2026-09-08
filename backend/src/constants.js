// constants.js
export const DB_NAME = "kabadiwala_connect";

export const USER_ROLES = {
    COLLECTOR: "collector",
    RECYCLER: "recycler",
    ADMIN: "admin"
};

export const LOT_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    PICKED: "picked",
    DELIVERED: "delivered",
    COMPLETED: "completed",
    CANCELLED: "cancelled"
};

export const PAYMENT_STATUS = {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed"
};

export const MATERIAL_TYPES = {
    PLASTIC: "plastic",
    PAPER: "paper",
    METAL: "metal",
    GLASS: "glass",
    ELECTRONICS: "electronics",
    ORGANIC: "organic",
    OTHER: "other"
};