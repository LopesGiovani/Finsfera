import Retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return Retry(fetchStatusPage, {
      retries: 100,
    });
    async function fetchStatusPage() {
      const response = await fetch("http:/localhost:3000/api/v1/status");
      const responseBody = await response.json();
    }
  }
}

export default {
  waitForAllServices,
};
