const addNewBtn = document.getElementById('addNewSupplyBtn');
    const formContainer = document.getElementById('supplyForm');

    addNewBtn.addEventListener('click', () => {
      formContainer.classList.remove('hidden');
    });

    const cancelBtn = formContainer.querySelector('.form-actions .cancel-button');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        formContainer.classList.add('hidden');
      });
    }