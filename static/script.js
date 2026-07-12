let currentThreadId = localStorage.getItem("travel_thread_id") || null;
let latestAnswerMarkdown = "";

function setPrompt(text) {
    document.getElementById("userInput").value = text;
}

function setLoading(isLoading) {
    const sendBtn = document.getElementById("sendBtn");
    const btnText = document.getElementById("btnText");
    const btnLoader = document.getElementById("btnLoader");

    sendBtn.disabled = isLoading;

    if (isLoading) {
        btnText.classList.add("hidden");
        btnLoader.classList.remove("hidden");
    } else {
        btnText.classList.remove("hidden");
        btnLoader.classList.add("hidden");
    }
}

function showError(message) {
    const errorBox = document.getElementById("errorBox");

    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

function hideError() {
    const errorBox = document.getElementById("errorBox");

    errorBox.classList.add("hidden");
    errorBox.textContent = "";
}

/* ---------------------------------------------------------------
   Minimal markdown renderer (headers, bold/italic/code, lists,
   tables, horizontal rules, paragraphs). Keeps this project free
   of any third-party rendering library.
   --------------------------------------------------------------- */

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function renderInline(text) {
    let escaped = escapeHtml(text);

    escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

    return escaped;
}

function isTableRow(line) {
    return /^\s*\|.*\|\s*$/.test(line);
}

function isTableDivider(line) {
    return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
}

function splitTableCells(line) {
    const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");

    return trimmed.split("|").map(cell => cell.trim());
}

function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");

    let html = "";
    let listType = null;
    let i = 0;

    function closeList() {
        if (listType) {
            html += listType === "ul" ? "</ul>" : "</ol>";
            listType = null;
        }
    }

    while (i < lines.length) {
        const line = lines[i];

        if (/^\s*$/.test(line)) {
            closeList();
            i++;
            continue;
        }

        if (isTableRow(line) && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
            closeList();

            const headerCells = splitTableCells(line);
            const rows = [];
            let j = i + 2;

            while (j < lines.length && isTableRow(lines[j])) {
                rows.push(splitTableCells(lines[j]));
                j++;
            }

            html += "<table><thead><tr>" +
                headerCells.map(cell => `<th>${renderInline(cell)}</th>`).join("") +
                "</tr></thead><tbody>";

            rows.forEach(row => {
                html += "<tr>" + row.map(cell => `<td>${renderInline(cell)}</td>`).join("") + "</tr>";
            });

            html += "</tbody></table>";
            i = j;
            continue;
        }

        if (/^\s*([-*_]){3,}\s*$/.test(line)) {
            closeList();
            html += "<hr>";
            i++;
            continue;
        }

        const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);

        if (headerMatch) {
            closeList();
            const level = headerMatch[1].length;
            html += `<h${level}>${renderInline(headerMatch[2])}</h${level}>`;
            i++;
            continue;
        }

        const unorderedMatch = line.match(/^\s*[-*+]\s+(.*)$/);

        if (unorderedMatch) {
            if (listType !== "ul") {
                closeList();
                html += "<ul>";
                listType = "ul";
            }
            html += `<li>${renderInline(unorderedMatch[1])}</li>`;
            i++;
            continue;
        }

        const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/);

        if (orderedMatch) {
            if (listType !== "ol") {
                closeList();
                html += "<ol>";
                listType = "ol";
            }
            html += `<li>${renderInline(orderedMatch[1])}</li>`;
            i++;
            continue;
        }

        closeList();

        const paragraphLines = [line];
        i++;

        while (
            i < lines.length &&
            !/^\s*$/.test(lines[i]) &&
            !/^#{1,6}\s+/.test(lines[i]) &&
            !/^\s*[-*+]\s+/.test(lines[i]) &&
            !/^\s*\d+\.\s+/.test(lines[i]) &&
            !/^\s*([-*_]){3,}\s*$/.test(lines[i]) &&
            !isTableRow(lines[i])
        ) {
            paragraphLines.push(lines[i]);
            i++;
        }

        html += `<p>${paragraphLines.map(renderInline).join("<br>")}</p>`;
    }

    closeList();

    return html;
}

/* --------------------------------------------------------------- */

function showResult(answer, threadId) {
    latestAnswerMarkdown = answer;

    const resultSection = document.getElementById("resultSection");
    const resultBox = document.getElementById("resultBox");
    const threadInfo = document.getElementById("threadInfo");

    resultBox.innerHTML = renderMarkdown(answer);
    threadInfo.textContent = `Booking ref — ${threadId}`;

    resultSection.classList.remove("hidden");
    positionResultNotches();

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

async function sendMessage() {
    hideError();

    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) {
        showError("Add a destination, dates or budget before sending this request.");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("/api/travel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                thread_id: currentThreadId
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "The desk could not put this itinerary together.");
        }

        currentThreadId = data.thread_id;
        localStorage.setItem("travel_thread_id", currentThreadId);

        showResult(data.answer, data.thread_id);

    } catch (error) {
        showError(error.message);
    } finally {
        setLoading(false);
    }
}

function copyResult() {
    const resultBox = document.getElementById("resultBox");
    const text = resultBox.innerText;

    if (!text) {
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            const copyBtn = document.querySelector(".copy-btn");
            const oldText = copyBtn.textContent;

            copyBtn.textContent = "Copied";

            setTimeout(() => {
                copyBtn.textContent = oldText;
            }, 1400);
        })
        .catch(() => {
            showError("Could not copy the itinerary to your clipboard.");
        });
}

function downloadPDF() {
    if (!latestAnswerMarkdown) {
        showError("There's no itinerary to print yet — generate one first.");
        return;
    }

    window.print();
}

/* ---------------------------------------------------------------
   Positions the ticket's side notches at the perforated seam so
   the paper-ticket cutout lines up regardless of content height.
   --------------------------------------------------------------- */

function positionPlannerNotches() {
    const ticket = document.querySelector(".planner-ticket");
    const perforation = document.querySelector(".planner-ticket .perforation");

    if (!ticket || !perforation) {
        return;
    }

    const offset = perforation.offsetTop + perforation.offsetHeight / 2;
    ticket.style.setProperty("--notch-y", `${offset}px`);
}

function positionResultNotches() {
    const ticket = document.querySelector(".result-ticket");
    const seam = document.querySelector(".result-ticket .ticket-top");

    if (!ticket || !seam || ticket.classList.contains("hidden")) {
        return;
    }

    const offset = seam.offsetTop + seam.offsetHeight;
    ticket.style.setProperty("--notch-y", `${offset}px`);
}

function positionAllNotches() {
    positionPlannerNotches();
    positionResultNotches();
}

document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.key === "Enter") {
        sendMessage();
    }
});

window.addEventListener("load", positionAllNotches);
window.addEventListener("resize", positionAllNotches);
