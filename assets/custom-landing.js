//products grid display
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementsByClassName("row")[0];
  const response = await fetch("/products.json");
  const data = await response.json();
  let i = 0;

  //variables to get variant chosen to send to cart
  let selectedColor = null;
  let selectedSize = null;

  //grid creation
  const content = data.products
    .slice(0, 6)
    .map(
      (product) =>
        `<div class="col">
          <div class="img-wrapper">
           <img src="${product.images[0].src}" alt="${product.title}" />
           <div class="clickable" id="clickable${i}">+</div>
          </div>
        </div>`
    )
    .join("");
  container.innerHTML = content;

  //grid layover creation
  const tcard = document.querySelector(".top");
  document.querySelectorAll(".clickable").forEach((el, index) => {
    el.addEventListener("click", () => {
      console.log(data.products.slice(0, 6));

      const product = data.products[index];
      tcard.innerHTML = `
        <div class="close">
      <i class="fa-solid fa-xmark"></i>
    </div>
    <div class="top-card">
      <img src="${product.images[0].src}" alt="${product.title}" />
      <div class="top-right">
        <span id="prod-title">${product.title}</span>
        <span id="prod-price">${product.variants[0].price} €</span>
        ${product.body_html}
      </div>
    </div>
     <div class="middle-card">
      <div class="colors">Color</div>
      <div class="color-btns">
        <button class="cbtn" 
          style="border-left: 7px solid ${product.options[1].values[0]} !important;"
        >
          ${product.options[1].values[0]}
        </button>
        <button class="cbtn" 
          style="border-left: 7px solid ${product.options[1].values[1]} !important;"
        >
          ${product.options[1].values[1]}
        </button>
      </div>
          <div class="sizes">Size</div>
      <div class="custom-dropdown">
      <div class="selected">
        <span class="placeholder">Choose your size</span>
        <i class="fa-solid fa-chevron-down"></i>
      </div>
      <ul class="dropdown-options">
        <li>${product.options[0].values[0]}</li>
        <li>${product.options[0].values[1]}</li>
        <li>${product.options[0].values[2]}</li>
        <li>${product.options[0].values[3]}</li>
      </ul>
    </div>
     <div class="bottom">
      <div class="bottom-card">
        <button
          class="add-to-cart-btn"
        >
          <span>ADD TO CART</span><i class="fa-solid fa-arrow-right-long"></i>
        </button>
      </div>
    </div>
      `;

      document.querySelector(".fa-xmark").addEventListener("click", close);
      document.querySelector(".product-details").style.display = "block";
      document.querySelector(".grey-bg").style.display = "block";
      document.body.style.overflow = "hidden";

      //get the picked color
      document.querySelectorAll(".cbtn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          selectedColor = e.target.innerText.trim();
        });
      });

      //add to cart button functionality
      const addToCartBtn = document.querySelector(".add-to-cart-btn");
      addToCartBtn.addEventListener("click", () => {
        addToCart(product, selectedColor, selectedSize);
      });
    });
  });

  if (tcard) {
    //get the picked color
    document.querySelectorAll(".cbtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        selectedColor = e.target.innerText.trim();
      });
    });
    tcard.addEventListener("click", (event) => {
      sizesControl();

      const clickedBtn = event.target.closest(".cbtn");
      if (!clickedBtn) return; // clicked outside a color button

      // Remove 'active' from all buttons
      const allBtns = tcard.querySelectorAll(".cbtn");
      allBtns.forEach((btn) => btn.classList.remove("active"));

      // Add 'active' to the clicked one
      clickedBtn.classList.add("active");
    });
  }

  function sizesControl() {
    const dropdown = document.querySelector(".custom-dropdown");
    const selected = dropdown.querySelector(".selected");
    const placeholder = dropdown.querySelector(".placeholder");
    const options = dropdown.querySelectorAll(".dropdown-options li");

    selected.addEventListener("click", () => {
      dropdown.classList.toggle("open");
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        placeholder.textContent = option.textContent;
        dropdown.classList.remove("open");
      });
    });

    // Close dropdown if clicked outside
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
      }
    });

    //get the picked size
    dropdown.querySelectorAll(".dropdown-options li").forEach((option) => {
      option.addEventListener("click", (e) => {
        selectedSize = e.target.innerText.trim();
        placeholder.innerText = selectedSize;
      });
    });
  }

  //get the variant ID based on the selected color and size
  function getVariantId(product, color, size) {
    return product.variants.find(
      (v) => v.option1 === selectedSize && v.option2 === selectedColor
    )?.id;
  }

  function addToCart(product, color, size) {
    console.log("color is " + selectedColor + " and size is " + selectedSize);

    if (!selectedColor || !selectedSize) {
      alert("Please select a size and color.");
      return;
    }

    const variantId = getVariantId(product, color, size);

    if (!variantId) {
      alert("This combination is not available.");
      return;
    }

    // Send to Shopify cart
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 1, id: variantId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Added to cart!");
        // Optionally update UI cart count here
      })
      .catch((err) => {
        console.error(err);
        alert("There was an error adding to cart.");
      });
  }
  function close() {
    document.querySelector(".product-details").style.display = "none";
    document.querySelector(".grey-bg").style.display = "none";
    document.body.style.overflow = "auto";
  }
});
