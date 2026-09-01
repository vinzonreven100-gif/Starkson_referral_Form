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
});

function handleFileSelect() {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
    dropZoneContent.classList.add('hidden');
    filePreview.classList.remove('hidden');
  }
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
  requiredInputs.forEach(input => {
    if (input.value.trim() !== '') filled++;
  });
  const percent = (filled / requiredInputs.length) * 100;
  progressBar.style.width = `${percent}%`;
}

requiredInputs.forEach(input => {
  input.addEventListener('input', updateProgress);
  input.addEventListener('change', updateProgress);
});

// Form Submission Handler
document.getElementById('referralForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('loadingSpinner');
  const statusDiv = document.getElementById('statusMessage');

  // Input Validation for required fields
  let isValid = true;
  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      input.closest('.form-group').classList.add('invalid');
      isValid = false;
    } else {
      input.closest('.form-group').classList.remove('invalid');
    }
  });

  if (!isValid) return;

  // Set Loading State
  submitBtn.disabled = true;
  btnText.classList.add('hidden');
  spinner.classList.remove('hidden');
  statusDiv.className = 'status-box hidden';

  const file = fileInput.files[0];
  
  const submitData = async (fileData = null, fileNameStr = '', mimeTypeStr = '') => {
    const payload = {
      referrerName: form.referrerName.value,
      referrerEmail: form.referrerEmail.value,
      referrerDepartment: form.referrerDepartment.value,
      candidateName: form.candidateName.value,
      candidateEmail: form.candidateEmail.value,
      candidatePhone: form.candidatePhone.value || 'N/A',
      candidatePortfolio: form.candidatePortfolio.value || 'N/A',
      targetRole: form.targetRole.value,
      relationship: form.relationship.value,
      notes: form.notes.value || 'None provided',
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
      btnText.classList.remove('hidden');
      spinner.classList.add('hidden');
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