const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMtnoAr3Y8Y8JNsWcUw_Lyv1-lEU_9-QlVExhpqBhHUjseiUz97wyxD6fCnvsRSmrT/exec';

// View Navigation Logic
const landingView = document.getElementById('landingView');
const formView = document.getElementById('formView');
const startBtn = document.getElementById('startReferralBtn');
const backBtn = document.getElementById('backBtn');

startBtn.addEventListener('click', () => {
  landingView.classList.remove('active');
  landingView.classList.add('hidden');
  
  setTimeout(() => {
    formView.classList.remove('hidden');
    formView.classList.add('active');
  }, 150);
});

backBtn.addEventListener('click', () => {
  formView.classList.remove('active');
  formView.classList.add('hidden');
  
  setTimeout(() => {
    landingView.classList.remove('hidden');
    landingView.classList.add('active');
  }, 150);
});

// File Upload Drag-and-Drop Handling
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('resume');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFileBtn');
const dropZoneContent = document.getElementById('dropZoneContent');
const resumeGroup = document.getElementById('resumeGroup');

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
});
['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
});

fileInput.addEventListener('change', handleFileSelect);
removeFileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.value = '';
  filePreview.classList.add('hidden');
  dropZoneContent.classList.remove('hidden');
  resumeGroup.classList.add('invalid');
  updateProgress();
});

function handleFileSelect() {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
    dropZoneContent.classList.add('hidden');
    filePreview.classList.remove('hidden');
    resumeGroup.classList.remove('invalid');
  } else {
    resumeGroup.classList.add('invalid');
  }
  updateProgress();
}

// Character Counter
const notesArea = document.getElementById('notes');
const charCount = document.getElementById('charCount');
notesArea.addEventListener('input', () => {
  charCount.textContent = notesArea.value.length;
});

// Progress Bar Logic
const requiredInputs = document.querySelectorAll('#referralForm [required]');
const progressBar = document.getElementById('progressBar');

function updateProgress() {
  let filled = 0;
  let total = requiredInputs.length;
  
  requiredInputs.forEach(input => {
    if (input.type === 'file') {
      if (input.files.length > 0) filled++;
    } else {
      if (input.value.trim() !== '') filled++;
    }
  });
  
  const percent = (filled / total) * 100;
  progressBar.style.width = `${percent}%`;
}

requiredInputs.forEach(input => {
  input.addEventListener('input', updateProgress);
  input.addEventListener('change', updateProgress);
});

// Strict Form Submission Handler
document.getElementById('referralForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const spinner = document.getElementById('loadingSpinner');
  const statusDiv = document.getElementById('statusMessage');

  let isValid = true;

  // 1. Strict validation check for every required element
  requiredInputs.forEach(input => {
    const group = input.closest('.form-group');
    if (input.type === 'file') {
      if (!input.files || input.files.length === 0) {
        group.classList.add('invalid');
        isValid = false;
      } else {
        group.classList.remove('invalid');
      }
    } else {
      if (!input.value.trim()) {
        group.classList.add('invalid');
        isValid = false;
      } else {
        group.classList.remove('invalid');
      }
    }
  });

  // 2. Strict Referrer Email validation (Ensures proper domain structure and extension)
  const referrerEmailInput = document.getElementById('referrerEmail');
  const referrerEmailVal = referrerEmailInput.value.trim().toLowerCase();
  // Standard robust email regex requiring proper formatting (e.g. name@domain.com)
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  const referrerGroup = referrerEmailInput.closest('.form-group');

  if (!emailRegex.test(referrerEmailVal) || referrerEmailVal.endsWith('.co')) {
    referrerGroup.classList.add('invalid');
    const errSpan = referrerGroup.querySelector('.error-msg');
    if (errSpan) errSpan.textContent = "Please enter a complete, valid work email address (e.g. name@starkson.com).";
    isValid = false;
  } else {
    referrerGroup.classList.remove('invalid');
  }

  // 3. Strict Philippine Phone Number validation (Exact 11 digits starting with 09)
  const phoneInput = document.getElementById('candidatePhone');
  const phoneVal = phoneInput.value.trim();
  const phoneRegex = /^09\d{9}$/;
  const phoneGroup = phoneInput.closest('.form-group');
  
  if (!phoneRegex.test(phoneVal)) {
    phoneGroup.classList.add('invalid');
    const errSpan = phoneGroup.querySelector('.error-msg');
    if (errSpan) errSpan.textContent = "Strict rule: Must be an exact 11-digit PH mobile number starting with 09.";
    isValid = false;
  } else {
    phoneGroup.classList.remove('invalid');
  }

  // 4. Strict Candidate Gmail validation check
  const candidateEmailInput = document.getElementById('candidateEmail');
  const emailVal = candidateEmailInput.value.trim().toLowerCase();
  const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
  const emailGroup = candidateEmailInput.closest('.form-group');
  
  if (!gmailRegex.test(emailVal)) {
    emailGroup.classList.add('invalid');
    const errSpan = emailGroup.querySelector('.error-msg');
    if (errSpan) errSpan.textContent = "Strict rule: Candidate email must end with @gmail.com.";
    isValid = false;
  } else {
    emailGroup.classList.remove('invalid');
  }

  // Hard block if any required field is empty or format is invalid
  if (!isValid) {
    statusDiv.textContent = "Submission blocked: Please fill in all required fields and correct any errors highlighted in red.";
    statusDiv.className = 'status-box error';
    
    // Scroll smoothly to the first error found on the form
    const firstError = form.querySelector('.form-group.invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Set Loading State (Show spinner only during active processing)
  submitBtn.disabled = true;
  spinner.classList.remove('hidden');
  statusDiv.className = 'status-box hidden';

  const file = fileInput.files[0];
  
  const submitData = async (fileData = null, fileNameStr = '', mimeTypeStr = '') => {
    const payload = {
      referrerName: form.referrerName.value.trim(),
      referrerEmail: form.referrerEmail.value.trim(),
      referrerDepartment: form.referrerDepartment.value,
      candidateName: form.candidateName.value.trim(),
      candidateEmail: form.candidateEmail.value.trim(),
      candidatePhone: form.candidatePhone.value.trim(),
      candidatePortfolio: form.candidatePortfolio.value.trim() || 'N/A',
      targetRole: form.targetRole.value.trim(),
      relationship: form.relationship.value,
      notes: form.notes.value.trim() || 'None provided',
      hasFile: !!fileData,
      fileName: fileNameStr,
      mimeType: mimeTypeStr,
      fileData: fileData
    };

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain' }
      });

      statusDiv.textContent = "Referral successfully submitted. A copy has been dispatched to your email.";
      statusDiv.className = 'status-box success';
      form.reset();
      filePreview.classList.add('hidden');
      dropZoneContent.classList.remove('hidden');
      charCount.textContent = '0';
      progressBar.style.width = '0%';
    } catch (err) {
      statusDiv.textContent = 'Network error. Unable to complete submission at this time.';
      statusDiv.className = 'status-box error';
    } finally {
      submitBtn.disabled = false;
      spinner.classList.add('hidden'); // Hide spinner again once done processing
    }
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      submitData(base64Data, file.name, file.type);
    };
    reader.readAsDataURL(file);
  } else {
    submitData();
  }
});