const API_URL =
  "https://late-water-2fc2.blackhoodty2023.workers.dev";

let marketData = [];
let currentItem = null;


async function loadData() {
  try {
    document.getElementById("status").textContent =
      "데이터 불러오는 중...";

    const response = await fetch(
      API_URL + "?market=true"
    );

    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status
      );
    }

    const data = await response.json();

    marketData =
      Array.isArray(data)
        ? data
        : data.data || [];

    render();

    document.getElementById("status").textContent =
      "아이템 " +
      marketData.length +
      "개";

  } catch (error) {
    console.error(error);

    document.getElementById("status").textContent =
      "데이터를 불러오지 못했습니다.";

    document.getElementById("grid").innerHTML =
      '<div class="loading">' +
      "데이터를 불러오지 못했습니다." +
      "</div>";
  }
}


async function loadHistory(itemName) {
  const history =
    document.getElementById("history");

  const count =
    document.getElementById("historyCount");

  history.innerHTML =
    '<div class="no-history">' +
    "가격 기록을 불러오는 중..." +
    "</div>";

  count.textContent = "";

  try {
    const url =
      API_URL +
      "?history=true&item=" +
      encodeURIComponent(itemName);

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "HTTP " + response.status
      );
    }

    const data =
      await response.json();

    const records =
      Array.isArray(data)
        ? data
        : data.data || [];

    count.textContent =
      records.length + "개 기록";

    renderHistory(records);

  } catch (error) {
    console.error(error);

    history.innerHTML =
      '<div class="no-history">' +
      "가격 기록을 불러오지 못했습니다." +
      "</div>";
  }
}
