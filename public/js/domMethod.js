import { useIndexedDb } from "./indexedDb";
// import { formatDate, getParams } from "./utils";
// Clear the article container and insert placeholder articles
function renderPlaceHolders() {
  const transactionContainer = document.querySelector(".transactions");

  const placeholders = createPlaceholders();

  while (transactionContainer.firstChild) {
    transactionContainer.removeChild(transactionContainer.firstChild);
  }

  transactionContainer.appendChild(placeholders);
}

// Create and return 4 placeholder articles
function createPlaceholders() {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 4; i++) {
    const placeholder = createPlaceholder();
    fragment.appendChild(placeholder);
  }

  return fragment;
}

// Returns markup for a placeholder article
function createPlaceholder() {
  return createElement(
    "div",
    { class: "transaction-skeleton" },
    createElement(
      "div",
      { class: "transaction-skeleton__header" },
      createElement("div", { class: "transaction-skeleton__transaction" }),
      createElement("div", { class: "transaction-skeleton__amount" })
    ),
    createElement(
      "div",
      { class: "transaction-skeleton__content" },
      createElement("div", { class: "transaction-skeleton__text" }),
      createElement("div", { class: "transaction-skeleton__text" }),
      createElement("div", { class: "transaction-skeleton__text" }),
      createElement("div", { class: "transaction-skeleton__text" }),
    )
  );
}

// Empties article container and appends articles
export function renderTransactions(transactionData, loadPage) {
  renderPlaceHolders();
  const transactionContainer = document.querySelector(".transactions");
  const transactionTable = document.querySelector("tbody");

  const newTransaction = createTransaction(transactionData, loadPage);

  while (transactionContainer.firstChild) {
    transactionContainer.removeChild(transactionContainer.firstChild);
  }

  const { query } = getParams();

  transactionTable.textContent = query;
  transactionContainer.appendChild(articles);
}

// Return HTML for each article provided
function createTransaction(transactionData, loadPage) {
  const fragment = document.createDocumentFragment();

  transactionData.forEach(data => {
    const newTransaction = createTransaction(data, loadPage);
    fragment.appendChild(newTransaction);
  });

  return fragment;
}

// Returns markup for a single article
function createTransaction(
  { transaction, amount,},
  loadPage
) {
//left off here//
  return createElement(
    "article",
    null,
    createElement(
      "div",
      { class: "article-header" },
      createElement("div", { class: "article-header__title" }, createElement("h3", null, title)),
      createElement(
        "div",
        { class: "article-header__published" },
        createElement("p", null, author),
        createElement("p", null, formatDate(publishedAt))
      )
    ),
    createElement(
      "div",
      { class: "article-container" },
      createElement(
        "p",
        null,
        urlToImage && createElement("img", { src: urlToImage, alt: title }),
        description
      ),
     
      !favorite
        ? createElement(
          "button",
          {
            class: "button button--primary",
            onclick: () => {
              useIndexedDb("articles", "ArticleStore", "put", {
                source,
                author,
                title,
                description,
                url,
                urlToImage,
                publishedAt,
                _id
              });
              loadPage();
            }
          },
          "Save to Favorites"
        )
        : createElement(
          "button",
          {
            class: "button button--danger",
            onclick: () => {
              useIndexedDb("articles", "ArticleStore", "delete", { _id });
              loadPage();
            }
          },
          "Remove from Favorites"
        )
    )
  );
}

// Helper function for creating elements
export function createElement(type, attributes, ...children) {
  const element = document.createElement(type);

  if (attributes !== null && typeof attributes === "object") {
    for (const key in attributes) {
      if (key.startsWith("on")) {
        const event = key.substring(2).toLowerCase();
        const handler = attributes[key];

        element.addEventListener(event, handler);
      } else {
        element.setAttribute(key, attributes[key]);
      }
    }
  }

  children.forEach(child => {
    if (typeof child === "boolean" || child === null || child === undefined) {
      return;
    }

    let node;

    if (child instanceof HTMLElement) {
      node = child;
    } else {
      node = document.createTextNode(child);
    }

    element.appendChild(node);
  });

  return element;
}