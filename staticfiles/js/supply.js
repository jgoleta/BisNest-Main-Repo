// ===== Supply Form Modal Toggle =====

// Elements
const addNewBtn = document.getElementById("addNewSupplyBtn");
const supplyFormContainer = document.querySelector(".supply-form-container");
const overlay = document.getElementById("supplyModalOverlay");
const cancelBtn = supplyFormContainer?.querySelector(".cancel-button");

// Open Modal
addNewBtn?.addEventListener("click", () => {
  supplyFormContainer.classList.add("active");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden"; // prevent background scroll
});

// Close Modal (Cancel Button Only)
cancelBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  closeSupplyForm();
});

// Close Modal Function
function closeSupplyForm() {
  supplyFormContainer.classList.remove("active");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
}
