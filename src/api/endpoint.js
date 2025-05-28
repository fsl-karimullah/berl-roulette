// const url = "/local";
// const url = "https://ecommerce.berlstore.com/api";
const url = "http://192.168.68.148:1234/api";

// const ecommerceUrl = "/ecomerce";
// const ecommerceUrl = "https://ecommerce.berlmember.com/ecomerce";
export const endpoint = {
  getPollingData: `${url}/pollings`,
  getPollingById: (slug) => `${url}/pollings/${slug}`,
  getPollingRoulette: (slug) => `${url}/pollings/${slug}/roulettes`,
  savePostVote: (slug) => `${url}/pollings/${slug}/save-participant`,
  saveClaimPrize: (slug) => `${url}/pollings/${slug}/roulettes/claim-reward`,
}; 