// const url = "/local";
// const url = "https://ecommerce.berlstore.com/api";
const url = "http://192.168.68.194:8000/api";

// const ecommerceUrl = "/ecomerce";
// const ecommerceUrl = "https://ecommerce.berlmember.com/ecomerce";
export const endpoint = {
  getPollingData: `${url}/pollings`,
  getPollingById: (slug) => `${url}/pollings/${slug}`,
  getPollingRoulette: (slug) => `${url}/pollings/${slug}/roulettes`,
};