// const url = "/local";
// const url = "https://ecommerce.berlstore.com/api";
const url = "https://dev.panelis.net/api";

// const ecommerceUrl = "/ecomerce";
// const ecommerceUrl = "https://ecommerce.berlmember.com/ecomerce";
export const endpoint = {
  getPollingData: `${url}/pollings`,
  getPollingById: (slug) => `${url}/pollings/${slug}`,
  getPollingRoulette: (id) => `${url}/pollings/${id}/roulettes`,
  savePostVote: (id) => `${url}/pollings/${id}/save-participant`,
  saveClaimPrize: (id) => `${url}/pollings/${id}/roulettes/claim-reward`,
    //endpoint non polling 
  getPrizeData: `${url}/roulettes/event`,
  insertDataRoulette: `${url}/roulettes/event`, 
}; 




 