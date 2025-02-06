/**
 * Google Apps Script URL එක.
 * @constant {string}
 */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3iLqXm7baGM5Kz3YpTbFHTAfMCknU-rGE71uHQDvzo-7RVb9b-aMyNsC4n6rP18Y/exec'; // **මෙතැනට ඔයාගේ Google Script URL එක දාන්න**

// Utility Functions (උපකාරක ශ්‍රිත)

/**
 * Date of Birth එකෙන් වයස ගණනය කරනවා.
 * @param {string} dob - Date of Birth (YYYY-MM-DD).
 * @returns {number} - වයස.
 */
function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

/**
 * Issue Date එකෙන් අවුරුදු 10කට පස්සේ Expiry Date එක හදනවා.
 * @param {string} issueDate - Issue Date (YYYY-MM-DD).
 * @returns {string} - Expiry Date (YYYY-MM-DD).
 */
function calculateExpiry(issueDate) {
    const date = new Date(issueDate);
    date.setFullYear(date.getFullYear() + 10);
    return date.toISOString().split('T')[0];
}

/**
 * Error message එකක් පෙන්නනවා, input field එක highlight කරනවා.
 * @param {HTMLElement} inputElement - අදාල input element එක.
 * @param {string} errorMessage - පෙන්නන්න ඕන error message එක.
 */
function showError(inputElement, errorMessage) {
    const errorElement = document.getElementById(inputElement.id + 'Error');
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.remove('hidden');
    }
    inputElement.classList.add('validation-error-style');
}

/**
 * Error message එක හංගනවා, input field එකේ highlight එක අයින් කරනවා.
 * @param {HTMLElement} inputElement - අදාල input element එක.
 */
function hideError(inputElement) {
    const errorElement = document.getElementById(inputElement.id + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
    inputElement.classList.remove('validation-error-style');
}

// Event Listeners (සිදුවීම් වලට සවන් දීම)

document.getElementById('dateOfBirth').addEventListener('change', function() {
    document.getElementById('age').value = calculateAge(this.value);
});

document.getElementById('issueDate').addEventListener('change', function() {
    document.getElementById('expiryDate').value = calculateExpiry(this.value);
});

const passportNumberInput = document.getElementById('passportNumber');
const mobileNumberInput = document.getElementById('mobileNumber');

/**
 * Passport number එක validate කරනවා.
 * @param {string} passportNumber - Passport number එක.
 * @returns {boolean} - නිවැරදිනම් true, නැත්නම් false.
 */
function validatePassportNumber(passportNumber) {
    const passportRegex = /^[A-Z]{1}[0-9]{7,9}$/;
    return passportRegex.test(passportNumber);
}

/**
 * Mobile number එක validate කරනවා (සරල validation එකක්).
 * @param {string} mobileNumber - Mobile number එක.
 * @returns {boolean} - නිවැරදිනම් true, නැත්නම් false.
 */
function validateMobileNumber(mobileNumber) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobileNumber);
}

/**
 * Passport number input එකේ වෙනස්වීම් handle කරනවා.
 */
async function handlePassportInput() {
    const newPassportNumber = passportNumberInput.value;
    const isDuplicate = await checkDuplicateOnPassportChange();
    const isValid = validatePassportNumber(newPassportNumber);

    if (!isValid) {
        showError(passportNumberInput, "Invalid Passport Number Format!");
    } else if (isDuplicate) {
        showError(passportNumberInput, "Passport Number is Already exists!");
    } else {
        hideError(passportNumberInput);
    }
}

/**
 * Mobile number input එකේ වෙනස්වීම් handle කරනවා.
 */
function handleMobileInput() {
    const newMobileNumber = mobileNumberInput.value;
    const isValid = validateMobileNumber(newMobileNumber);

    if (!isValid) {
        showError(mobileNumberInput, "Invalid Mobile Number.  Enter 10 digits.");
    } else {
        hideError(mobileNumberInput);
    }
}

passportNumberInput.addEventListener('input', handlePassportInput);
mobileNumberInput.addEventListener('input', handleMobileInput);


// Form Submission (ෆෝම් එක යවන එක)

document.getElementById('participantForm').addEventListener('submit', async e => {
    e.preventDefault();

    const button = document.querySelector('button[type="submit"]');
    const spinner = document.getElementById('spinner');
    const thankYouMessage = document.getElementById('thankYouMessage');
    const errorMessage = document.getElementById('error-message');
    const form = document.getElementById('participantForm');
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData) {
        data[key] = value;
    }

     //  Form එකේ තියෙන ඔක්කොම අකුරු ලොකු අකුරු කරනවා
    for (const key in data) {
        if (typeof data[key] === 'string') {
            data[key] = data[key].toUpperCase();
        }
    }

    const newPassportNumber = data["passportNumber"];
    const loadingAnimation = document.getElementById('loading-animation');
    loadingAnimation.classList.remove('hidden');
    const formElements = form.querySelectorAll(
        '#formInputs input, #formInputs textarea, #formInputs button, #formInputs label, #formInputs select, #formInputs h2'
    );
    formElements.forEach(element => {
        element.style.display = 'none';
    });
    errorMessage.style.display = 'none';

    const isDuplicate = await fetch(SCRIPT_URL + "?action=checkDuplicate&passportNumber=" + encodeURIComponent(newPassportNumber))
        .then(response => response.json())
        .then(result => result.isDuplicate);

    loadingAnimation.classList.add('hidden');

    if (isDuplicate) {
        const errorMessageDiv = document.getElementById('error-message');
        const errorTextSpan = document.getElementById('error-text');
        errorTextSpan.textContent = "Duplicate Passport Number!";
        errorMessageDiv.style.display = 'block';
        passportNumberInput.classList.add('highlight-error');
        formElements.forEach(element => {
            element.style.display = '';
        });
        thankYouMessage.style.display = 'none';
        button.disabled = false;
        spinner.style.display = 'none';
        return;
    }

    let isFormValid = true;
    form.querySelectorAll('input, select').forEach(input => {
        if (input.required && !input.value) {
            showError(input, "This field is required.");
            isFormValid = false;
        } else {
            hideError(input);
        }
    });

    if (!isFormValid) {
      formElements.forEach(element => {
          element.style.display = '';
      });
        button.disabled = false;
        spinner.style.display = 'none';
        return;
    }

    const thankYouDiv = document.getElementById('thankYouMessage');
    thankYouDiv.style.display = 'block';

    const thankYouElements = thankYouDiv.querySelectorAll('*');
    thankYouElements.forEach(element => {
        element.style.display = 'block';
    });

    button.disabled = true;
    spinner.style.display = 'inline-block';

    try {
        const response = await fetch(
            SCRIPT_URL + '?data=' + encodeURIComponent(JSON.stringify(data)), {
                method: 'GET',
                mode: 'cors'
            }
        );

        const result = await response.json();

        if (result.result === 'success') {
            thankYouMessage.innerHTML = `
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative" role="alert">
                <strong class="font-bold">Thank you!</strong>
                <span class="block sm:inline"> Your application has been submitted.</span>
            </div>
            `;
            thankYouMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            document.getElementById('formInputs').style.display = 'block';

        } else if (result.result === 'error') {
            console.error('Error saving data:', result.error);
            const errorMessageDiv = document.getElementById('error-message');
            const errorTextSpan = document.getElementById('error-text');
            errorTextSpan.textContent = result.error;
            errorMessageDiv.style.display = 'block';
            thankYouMessage.style.display = 'none';
            formElements.forEach(element => {
                element.style.display = '';
            });
        }
    } catch (error) {
        console.error('Error:', error);
        showError(document.body, 'Oops! Something went wrong. Please try again.');
        formElements.forEach(element => {
            element.style.display = '';
        });
    } finally {
        button.disabled = false;
        spinner.style.display = 'none';
    }
});


/**
 * Company names ටික අරන් dropdown එකට දානවා.
 */
async function populateCompanyDropdown() {
    const companyDropdown = document.getElementById('companyName');
    const customerCodeInput = document.getElementById('customerCode');

    const companyData = await fetch(SCRIPT_URL + "?action=getCompanyData")
        .then(response => response.json());

    console.log("Company Data:", companyData);

    companyData.forEach(company => {
        const option = document.createElement('option');
        option.value = company[0];
        option.textContent = company[0];
        companyDropdown.appendChild(option);
    });

    companyDropdown.addEventListener('change', function() {
        const selectedCompanyName = this.value;
        const selectedCompany = companyData.find(company => company[0] === selectedCompanyName);
        console.log("Selected Company:", selectedCompany);
        if (selectedCompany) {
            customerCodeInput.value = selectedCompany[1];
            console.log("Customer Code:", selectedCompany[1]);
        }
    });
}

populateCompanyDropdown();


/**
 * පිටුව ඉහළට scroll කරනවා.
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Additional Participants Radio Button Logic
document.querySelectorAll('input[name="additionalParticipants"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'Yes') {
            //  "ඔව්" කියල select කරොත් මොකක් හරි කරන්න පුළුවන් මෙතන.
        } else {
            // "නැහැ" කියල select කරොත් මොකක් හරි කරන්න පුළුවන් මෙතන.
        }
    });
});


/**
 * Duplicate passport numbers තියෙනවද බලනවා.
 * @async
 * @returns {Promise<boolean>} - ඩూප්ලිකේට් නම් true, නැත්නම් false.
 */
async function checkDuplicateOnPassportChange() {
    const newPassportNumber = passportNumberInput.value;
    const isDuplicate = await fetch(SCRIPT_URL + "?action=checkDuplicate&passportNumber=" + encodeURIComponent(newPassportNumber))
        .then(response => response.json())
        .then(result => result.isDuplicate);

    return isDuplicate;
}