const API_URL =
    "https://script.google.com/macros/s/AKfycbyz261bYdqBYI_zUPd6e_53VPewr8NonY5yhYicVd7lIyW260tpUqVV0aPX5lQtrd-kUA/exec";


let allHistory = [];

let filteredHistory = [];


/* =========================================================
   DOM
========================================================= */

const historyList =
    document.getElementById("historyList");

const searchInput =
    document.getElementById("searchInput");

const itemFilter =
    document.getElementById("itemFilter");

const refreshButton =
    document.getElementById("refreshButton");

const statusText =
    document.getElementById("statusText");

const lastUpdated =
    document.getElementById("lastUpdated");

const recordCount =
    document.getElementById("recordCount");


/* =========================================================
   초기 실행
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadHistory();

    }
);


/* =========================================================
   데이터 가져오기
========================================================= */

async function loadHistory() {

    try {

        setStatus("데이터를 불러오는 중...");


        const response =
            await fetch(
                API_URL +
                "?history=true"
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }


        const data =
            await response.json();


        if (
            !data.success
        ) {

            throw new Error(
                data.error ||
                "API 오류"
            );

        }


        allHistory =
            Array.isArray(data.history)
                ? data.history
                : [];


        /*
         * 최신 기록이 위로 오도록 정렬
         */
        allHistory.sort(
            (a, b) => {

                return (
                    new Date(b.timestamp) -
                    new Date(a.timestamp)
                );

            }
        );


        createItemFilter();


        applyFilters();


        const now =
            new Date();


        lastUpdated.textContent =
            "업데이트 " +
            formatTime(now);


        setStatus(
            "정상"
        );


    } catch (error) {

        console.error(error);


        historyList.innerHTML = `
            <div class="error">
                데이터를 불러오지 못했습니다.<br>
                잠시 후 다시 시도해주세요.
            </div>
        `;


        setStatus(
            "데이터 불러오기 실패"
        );

    }

}


/* =========================================================
   아이템 필터 생성
========================================================= */

function createItemFilter() {

    const items =
        new Map();


    allHistory.forEach(
        item => {

            if (
                !item.item
            ) {
                return;
            }


            const normalized =
                item.normalized ||
                normalizeName(item.item);


            if (
                !items.has(normalized)
            ) {

                items.set(
                    normalized,
                    item.item
                );

            }

        }
    );


    itemFilter.innerHTML = `
        <option value="">
            전체 아이템
        </option>
    `;


    [...items.entries()]
        .sort(
            (a, b) =>
                a[1].localeCompare(
                    b[1],
                    "ko"
                )
        )
        .forEach(
            ([normalized, name]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    normalized;


                option.textContent =
                    name;


                itemFilter.appendChild(
                    option
                );

            }
        );

}


/* =========================================================
   필터
========================================================= */

function applyFilters() {

    const search =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const selectedItem =
        itemFilter.value;


    filteredHistory =
        allHistory.filter(
            item => {

                const name =
                    String(
                        item.item || ""
                    ).toLowerCase();


                const normalized =
                    String(
                        item.normalized || ""
                    ).toLowerCase();


                /*
                 * 아이템 선택
                 */
                if (
                    selectedItem &&
                    normalized !==
                        selectedItem.toLowerCase()
                ) {

                    return false;

                }


                /*
                 * 검색
                 */
                if (
                    search &&
                    !name.includes(search) &&
                    !normalized.includes(search)
                ) {

                    return false;

                }


                return true;

            }
        );


    renderHistory();

}


/* =========================================================
   기록 표시
========================================================= */

function renderHistory() {

    recordCount.textContent =
        filteredHistory.length +
        "건";


    if (
        filteredHistory.length === 0
    ) {

        historyList.innerHTML = `
            <div class="empty">
                시세변동 기록이 없습니다.
            </div>
        `;

        return;

    }


    historyList.innerHTML =
        filteredHistory
            .map(
                createHistoryHTML
            )
            .join("");

}


/* =========================================================
   기록 HTML
========================================================= */

function createHistoryHTML(item) {

    const direction =
        String(
            item.direction || ""
        );


    let directionClass =
        "new";


    let arrow =
        "•";


    if (
        direction === "상승"
    ) {

        directionClass =
            "up";

        arrow =
            "▲";

    }
    else if (
        direction === "하락"
    ) {

        directionClass =
            "down";

        arrow =
            "▼";

    }


    const change =
        Number(
            item.change || 0
        );


    const changeRate =
        Number(
            item.changeRate || 0
        );


    let changeClass =
        "neutral";


    if (
        change > 0
    ) {

        changeClass =
            "up";

    }
    else if (
        change < 0
    ) {

        changeClass =
            "down";

    }


    const changeText =
        change > 0
            ? "+" + formatNumber(change)
            : formatNumber(change);


    const rateText =
        changeRate > 0
            ? "+" + changeRate.toFixed(2) + "%"
            : changeRate.toFixed(2) + "%";


    const price =
        formatNumber(
            Number(item.price)
        );


    const time =
        formatDateTime(
            item.timestamp
        );


    return `

        <div class="history-item">

            <div
                class="direction ${directionClass}"
            >
                ${arrow}
            </div>


            <div>

                <div class="item-name">
                    ${escapeHTML(item.item)}
                </div>

                <div class="normalized">
                    ${escapeHTML(item.normalized || "")}
                </div>

            </div>


            <div class="price">
                ${price}
                <span class="price-label">
                    골드
                </span>
            </div>


            <div
                class="change ${changeClass}"
            >
                ${changeText}
            </div>


            <div
                class="change-rate ${changeClass}"
            >
                ${rateText}
            </div>


            <div class="time">
                ${time}
            </div>

        </div>

    `;

}


/* =========================================================
   숫자
========================================================= */

function formatNumber(number) {

    if (
        !Number.isFinite(number)
    ) {

        return "0";

    }


    return number.toLocaleString(
        "ko-KR"
    );

}


/* =========================================================
   날짜
========================================================= */

function formatDateTime(timestamp) {

    const date =
        new Date(timestamp);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const hour =
        String(
            date.getHours()
        ).padStart(2, "0");


    const minute =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    return (
        month +
        "/" +
        day +
        " " +
        hour +
        ":" +
        minute
    );

}


/* =========================================================
   시간
========================================================= */

function formatTime(date) {

    const hour =
        String(
            date.getHours()
        ).padStart(2, "0");


    const minute =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    const second =
        String(
            date.getSeconds()
        ).padStart(2, "0");


    return (
        hour +
        ":" +
        minute +
        ":" +
        second
    );

}


/* =========================================================
   이름 정규화
========================================================= */

function normalizeName(text) {

    return String(text || "")
        .replace(
            /[^\p{L}\p{N}]/gu,
            ""
        )
        .toLowerCase();

}


/* =========================================================
   HTML escape
========================================================= */

function escapeHTML(text) {

    return String(text || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   상태
========================================================= */

function setStatus(text) {

    statusText.textContent =
        text;

}


/* =========================================================
   이벤트
========================================================= */

searchInput.addEventListener(
    "input",
    applyFilters
);


itemFilter.addEventListener(
    "change",
    applyFilters
);


refreshButton.addEventListener(
    "click",
    loadHistory
);


/* =========================================================
   자동 새로고침
========================================================= */

setInterval(
    loadHistory,
    60 * 1000
);
