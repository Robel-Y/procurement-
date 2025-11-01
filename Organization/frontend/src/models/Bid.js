// This represents how bids should be structured
export const bidStructure = {
  _id: "",
  purchaseRequest: "", // Reference to purchase request
  supplier: {
    _id: "",
    companyName: "",
    email: "",
    rating: 0,
    deliveryScore: 0,
  },
  bidAmount: 0,
  proposal: "",
  deliveryTime: "", // in days
  status: "pending", // pending, reviewed, rejected, accepted
  createdAt: "",
};
