/**
 * Firebase Configuration & Initialization
 */
const firebaseConfig = {
  apiKey: "AIzaSyBXQmnX4Q5Qm_KgvoDUeapSDplSv126H-Q",
  authDomain: "pkstudentcare-6cc57.firebaseapp.com",
  databaseURL: "https://pkstudentcare-6cc57-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pkstudentcare-6cc57",
  storageBucket: "pkstudentcare-6cc57.firebasestorage.app",
  messagingSenderId: "993494045553",
  appId: "1:993494045553:web:a0b38a0b30b9fb5ba41cd0",
  measurementId: "G-4C5KQ9N0LL"
};

// Initialize Firebase Compat
let database = null;
try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log("Firebase Database connected successfully.");
  } else {
    console.warn("Firebase SDK is not loaded. Operating in Local-only mode.");
  }
} catch (e) {
  console.error("Firebase Initialization failed:", e);
}

/**
 * Application State
 */
const appState = {
  userRole: null, // 'teacher', 'admin', or null (not logged in)
  currentView: 'dashboard', // 'dashboard', 'form', 'report'
  currentStep: 1,
  totalSteps: 7,
  reports: [], // List of saved reports
  currentReportId: null, // ID of the report being viewed or edited
  editingReportId: null, // ID of the report currently being edited (null for new)
  currentReport: {
    reportId: '',
    schoolName: 'โรงเรียนพระโขนงพิทยาลัย',
    schoolLogoUrl: 'pklogo.png',
    semester: 'ภาคเรียนที่ 1',
    academicYear: 'ปีการศึกษา 2569',
    classLevel: 'ชั้นมัธยมศึกษาปีที่ 5/5',
    totalStudents: 35,
    visitPeriodStart: '26 พฤษภาคม 2569',
    visitPeriodEnd: '30 มิถุนายน 2569',
    advisorTeachers: ['นายกฤษฎ์ปัวร ปรีดาสร้อยสุด', 'นางสาวภริษา ข่าทิว'],
    stat_visitedCount: 35,
    stat_onlineCount: 5,
    stat_inPersonCount: 30,
    family_complete: { count: 25, percent: 70 },
    family_separated: { count: 5, percent: 15 },
    family_withRelatives: { count: 4, percent: 10 },
    family_other: { count: 1, percent: 5 },
    incomeRanges: [
      { label: 'ต่ำกว่า 10,000 บาท', count: 6, percent: 17.14 },
      { label: '10,000 – 30,000 บาท', count: 16, percent: 45.71 },
      { label: '30,000 – 50,000 บาท', count: 9, percent: 25.71 },
      { label: 'มากกว่า 50,000 บาท', count: 4, percent: 11.44 }
    ],
    topIssues: [
      { rank: 1, label: 'ปัญหาด้านการเรียน', count: 12 },
      { rank: 2, label: 'ปัญหาด้านการเงิน/ค่าใช้จ่าย', count: 8 },
      { rank: 3, label: 'ปัญหาด้านสุขภาพจิต/ความเครียด', count: 6 },
      { rank: 4, label: 'ปัญหาด้านครอบครัว', count: 4 },
      { rank: 5, label: 'ปัญหาการติดเกม/โซเชียล', count: 3 }
    ],
    actionPlans: [
      'ติดตามผลการเรียนและพฤติกรรมของนักเรียนกลุ่มเสี่ยงอย่างใกล้ชิด',
      'ส่งต่อครูแนะแนวและนักจิตวิทยาเพื่อดูแลประเด็นสุขภาพจิต',
      'ประสานทุนการศึกษาของโรงเรียนและสมาคมผู้ปกครองเพื่อช่วยเหลือนักเรียนขาดแคลน',
      'จัดหาอุปกรณ์การเรียนเพิ่มเติมผ่านโครงการกองทุนสนับสนุนการศึกษา',
      'วางแผนเยี่ยมบ้านซ้ำหรือประสานการพูดคุยกับผู้ปกครองรายบุคคลอย่างต่อเนื่อง'
    ],
    photos: ['', '', '', '', '', '', '', ''], // Base64 or URLs (8 slots)
    summaryText: 'จากการดำเนินงานออกเยี่ยมบ้านนักเรียนชั้นมัธยมศึกษาปีที่ 5/5 จำนวน 35 คน ตามระบบดูแลช่วยเหลือนักเรียนของโรงเรียนพระโขนงพิทยาลัย พบว่านักเรียนส่วนใหญ่ได้รับการดูแลเอาใจใส่จากผู้ปกครองเป็นอย่างดี อย่างไรก็ตามยังมีนักเรียนบางส่วนที่ประสบปัญหาด้านเศรษฐกิจและการเรียน ซึ่งโรงเรียนได้ร่วมมือกับผู้ปกครองจัดเตรียมมาตรการช่วยเหลือ เช่น การสนับสนุนทุนการศึกษา การให้คำปรึกษาทางจิตวิทยา และการวางแผนติดตามผลการพัฒนาเป็นรายบุคคล เพื่อให้นักเรียนสามารถเรียนรู้ได้อย่างมีประสิทธิภาพและเต็มตามศักยภาพ',
    isPosted: false
  }
};

/**
 * App Module
 */
const app = {
  /**
   * Initialize Application
   */
  init() {
    this.loadReportsFromStorage();
    this.setupEventListeners();
    this.initDynamicListListeners();
    this.autoFillDemoForm();

    // Check if role is stored in sessionStorage
    const storedRole = sessionStorage.getItem('userRole');
    if (storedRole === 'teacher' || storedRole === 'admin') {
      appState.userRole = storedRole;
      this.applyRoleUI();
      
      // Hide landing and pin screens
      document.getElementById('view-landing').style.display = 'none';
      document.getElementById('view-pin-lock').style.display = 'none';
      document.querySelector('.app-header').style.display = 'block';
      document.querySelector('.app-container').style.display = 'block';
      
      this.switchView('dashboard');
      this.checkUrlParams();
    } else {
      // Not logged in yet, show landing screen
      appState.userRole = null;
      document.getElementById('view-landing').style.display = 'flex';
      document.getElementById('view-pin-lock').style.display = 'none';
      document.querySelector('.app-header').style.display = 'none';
      document.querySelector('.app-container').style.display = 'none';
    }
  },

  /**
   * Select User Role (Teacher or trigger PIN for Admin)
   */
  selectRole(role) {
    if (role === 'teacher') {
      appState.userRole = 'teacher';
      sessionStorage.setItem('userRole', 'teacher');
      this.applyRoleUI();
      
      // Transition UI
      document.getElementById('view-landing').style.display = 'none';
      document.getElementById('view-pin-lock').style.display = 'none';
      document.querySelector('.app-header').style.display = 'block';
      document.querySelector('.app-container').style.display = 'block';
      
      this.switchView('dashboard');
    }
  },

  /**
   * Show PIN Lock screen
   */
  showPINScreen() {
    document.getElementById('view-pin-lock').style.display = 'flex';
    const pinField = document.getElementById('admin-pin-field');
    if (pinField) {
      pinField.value = '';
      pinField.focus();
    }
    document.getElementById('pin-error-message').textContent = '';
  },

  /**
   * Hide PIN Lock screen
   */
  hidePINScreen() {
    document.getElementById('view-pin-lock').style.display = 'none';
  },

  /**
   * Verify PIN for Admin login
   */
  verifyPIN() {
    const pinField = document.getElementById('admin-pin-field');
    const pin = pinField ? pinField.value.trim() : '';
    const errorMsg = document.getElementById('pin-error-message');

    if (pin === '0000') {
      appState.userRole = 'admin';
      sessionStorage.setItem('userRole', 'admin');
      this.applyRoleUI();

      // Clear fields & transition UI
      if (pinField) pinField.value = '';
      if (errorMsg) errorMsg.textContent = '';
      
      document.getElementById('view-landing').style.display = 'none';
      document.getElementById('view-pin-lock').style.display = 'none';
      document.querySelector('.app-header').style.display = 'block';
      document.querySelector('.app-container').style.display = 'block';
      
      this.switchView('dashboard');
    } else {
      if (errorMsg) {
        errorMsg.textContent = '❌ รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      }
      if (pinField) {
        pinField.value = '';
        pinField.focus();
      }
    }
  },

  /**
   * Logout from system
   */
  logout() {
    appState.userRole = null;
    sessionStorage.removeItem('userRole');
    
    // Hide main view components
    document.querySelector('.app-header').style.display = 'none';
    document.querySelector('.app-container').style.display = 'none';
    
    // Show landing, hide PIN
    document.getElementById('view-landing').style.display = 'flex';
    document.getElementById('view-pin-lock').style.display = 'none';
    
    // Switch internal view state to default dashboard for next login
    appState.currentView = 'dashboard';
  },

  /**
   * Apply UI visibility modifications based on userRole
   */
  applyRoleUI() {
    const roleBadge = document.getElementById('header-role-badge');
    const tabForm = document.getElementById('tab-form');
    const btnCreateDash = document.getElementById('btn-create-report-dash');
    const btnCreateEmpty = document.getElementById('btn-create-report-empty');
    const btnTabOverview = document.getElementById('btn-tab-overview');
    const btnExportCSV = document.getElementById('btn-export-csv');

    if (appState.userRole === 'teacher') {
      // 1. Role Badge
      if (roleBadge) {
        roleBadge.textContent = 'ครูที่ปรึกษา';
        roleBadge.className = 'role-badge teacher';
      }
      
      // 2. Hide school-wide stats & CSV export
      if (btnTabOverview) btnTabOverview.style.display = 'none';
      if (btnExportCSV) btnExportCSV.style.display = 'none';
      
      // 3. Show create report options
      if (tabForm) tabForm.style.display = 'inline-flex';
      if (btnCreateDash) btnCreateDash.style.display = 'inline-flex';
      if (btnCreateEmpty) btnCreateEmpty.style.display = 'inline-flex';

      // 4. Force subtab to 'list'
      this.switchDashboardTab('list');
      
    } else if (appState.userRole === 'admin') {
      // 1. Role Badge
      if (roleBadge) {
        roleBadge.textContent = 'ผู้ดูแลระบบ (Admin)';
        roleBadge.className = 'role-badge admin';
      }
      
      // 2. Show school-wide stats & CSV export
      if (btnTabOverview) btnTabOverview.style.display = 'inline-flex';
      if (btnExportCSV) btnExportCSV.style.display = 'inline-flex';
      
      // 3. Hide create report options
      if (tabForm) tabForm.style.display = 'none';
      if (btnCreateDash) btnCreateDash.style.display = 'none';
      if (btnCreateEmpty) btnCreateEmpty.style.display = 'none';
    }
  },

  /**
   * Load saved reports from local storage
   */
  loadReportsFromStorage() {
    const rawReports = localStorage.getItem('visit_reports');
    if (rawReports) {
      try {
        appState.reports = JSON.parse(rawReports);
      } catch (e) {
        console.error("Error parsing reports from localStorage:", e);
        appState.reports = [];
      }
    }
    
    // Seed default sample report if no reports are found
    const hasSample = appState.reports.some(r => r.reportId === 'RPT-SAMPLE55' || r.isSample);
    if (!hasSample) {
      const seedReport = { 
        ...appState.currentReport, 
        reportId: 'RPT-SAMPLE55', 
        isSample: true,
        classLevel: 'ชั้นมัธยมศึกษาปีที่ 5/5 (ตัวอย่าง)',
        isPosted: true
      };
      appState.reports.unshift(seedReport);
      localStorage.setItem('visit_reports', JSON.stringify(appState.reports));
    } else {
      // Ensure the existing sample report has the isSample flag and label
      appState.reports.forEach(r => {
        if (r.reportId === 'RPT-SAMPLE55' || r.isSample) {
          r.isSample = true;
          if (!r.classLevel.includes('(ตัวอย่าง)')) {
            r.classLevel += ' (ตัวอย่าง)';
          }
        }
      });
      localStorage.setItem('visit_reports', JSON.stringify(appState.reports));
    }
    
    // Trigger real-time sync with Firebase
    this.syncReportsWithFirebase();
  },

  /**
   * Save reports array to localStorage and sync to Firebase Database
   */
  saveReportsToStorage() {
    localStorage.setItem('visit_reports', JSON.stringify(appState.reports));
    
    // Sync to Firebase Database if available
    if (database) {
      try {
        appState.reports.forEach(report => {
          // Only sync posted reports, ignore drafts and seed samples
          if (report.isPosted && !report.isSample && report.reportId !== 'RPT-SAMPLE55') {
            database.ref('reports/' + report.reportId).set(report);
          }
        });
      } catch (e) {
        console.error("Error syncing reports to Firebase Database:", e);
      }
    }
  },

  /**
   * Synchronize reports array with Firebase Database in real-time
   */
  syncReportsWithFirebase() {
    if (!database) return;
    try {
      const reportsRef = database.ref('reports');
      reportsRef.on('value', snapshot => {
        const remoteData = snapshot.val();
        if (remoteData) {
          // Convert dictionary object to array
          const remoteReports = Object.values(remoteData);
          
          // Separate local drafts, sample reports, etc.
          const localDrafts = appState.reports.filter(r => !r.isPosted || r.isSample || r.reportId === 'RPT-SAMPLE55');
          
          // Merge remote reports into local array
          const merged = [...localDrafts];
          remoteReports.forEach(remoteRep => {
            const existingIdx = merged.findIndex(r => r.reportId === remoteRep.reportId);
            if (existingIdx !== -1) {
              // Update local with remote copy
              merged[existingIdx] = remoteRep;
            } else {
              // Add new remote report
              merged.push(remoteRep);
            }
          });
          
          appState.reports = merged;
          localStorage.setItem('visit_reports', JSON.stringify(appState.reports));
          
          // Re-render views if user is looking at dashboard
          if (appState.currentView === 'dashboard') {
            this.renderDashboard();
            this.renderDashboardOverview();
          }
        }
      }, error => {
        console.error("Firebase Database listener error:", error);
      });
    } catch (e) {
      console.error("Error initializing Firebase sync listener:", e);
    }
  },

  /**
   * Check URL params to load shared reports
   */
  checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('reportId');
    if (reportId) {
      this.viewReport(reportId);
    }
  },

  /**
   * Setup UI Event Listeners
   */
  setupEventListeners() {
    // Inputs that trigger auto-calculations
    const calcInputs = [
      'input-total-students',
      'input-visited-count',
      'input-online-count',
      'input-family-complete',
      'input-family-separated',
      'input-family-with-relatives',
      'input-family-other',
      'input-income-tier1',
      'input-income-tier2',
      'input-income-tier3',
      'input-income-tier4'
    ];

    calcInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.calculateFormStats());
      }
    });
  },

  /**
   * Switch Active View
   * @param {string} viewName - 'dashboard', 'form', 'report'
   */
  switchView(viewName) {
    appState.currentView = viewName;

    // Toggle views in DOM
    document.getElementById('view-dashboard').style.display = viewName === 'dashboard' ? 'block' : 'none';
    document.getElementById('view-form').style.display = viewName === 'form' ? 'block' : 'none';
    document.getElementById('view-report').style.display = viewName === 'report' ? 'block' : 'none';

    // Update Header tab highlights
    document.getElementById('tab-dashboard').classList.toggle('active', viewName === 'dashboard');
    document.getElementById('tab-form').classList.toggle('active', viewName === 'form');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'dashboard') {
      const overviewBtn = document.getElementById('btn-tab-overview');
      if (overviewBtn && overviewBtn.classList.contains('active')) {
        this.renderDashboardOverview();
      } else {
        this.renderDashboard();
      }
    }
  },

  /**
   * Form Wizard: Go to Specific Step
   */
  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > appState.totalSteps) return;

    // Validate active step before proceeding to higher steps
    if (stepNumber > appState.currentStep) {
      for (let s = appState.currentStep; s < stepNumber; s++) {
        if (!this.validateStep(s)) {
          this.showToast(`กรุณากรอกข้อมูลในขั้นตอนที่ ${s} ให้ครบถ้วนและถูกต้อง`, 'error');
          this.goToStep(s);
          return;
        }
      }
    }

    appState.currentStep = stepNumber;

    // Update Step classes in Wizard progress bar
    document.querySelectorAll('.step-item').forEach(el => {
      const step = parseInt(el.getAttribute('data-step'));
      el.classList.toggle('active', step === stepNumber);
      el.classList.toggle('completed', step < stepNumber);
    });

    // Toggle form steps visibility
    document.querySelectorAll('.form-step').forEach(el => {
      const step = parseInt(el.getAttribute('data-step'));
      el.classList.toggle('active', step === stepNumber);
    });

    // Update nav control buttons
    document.getElementById('btn-prev').style.visibility = stepNumber === 1 ? 'hidden' : 'visible';
    
    if (stepNumber === appState.totalSteps) {
      document.getElementById('btn-next').style.display = 'none';
      
      const saveBtn = document.getElementById('btn-save');
      const postBtn = document.getElementById('btn-post-form');
      
      if (saveBtn && postBtn) {
        saveBtn.style.display = 'inline-flex';
        postBtn.style.display = 'inline-flex';
        
        // Get isPosted status
        let isPosted = false;
        if (appState.editingReportId) {
          const report = appState.reports.find(r => r.reportId === appState.editingReportId);
          if (report) isPosted = report.isPosted || false;
        } else {
          isPosted = appState.currentReport.isPosted || false;
        }
        
        if (isPosted) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '💾 บันทึก & สร้างรายงาน';
          postBtn.disabled = true;
          postBtn.innerHTML = '✅ โพสต์สำเร็จแล้ว';
          postBtn.className = 'btn btn-secondary';
        } else {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '🔒 ต้องโพสต์ก่อนบันทึก';
          postBtn.disabled = false;
          postBtn.innerHTML = '📢 โพสต์ลงแดชบอร์ดกลาง';
          postBtn.className = 'btn btn-warning';
        }
      }
    } else {
      document.getElementById('btn-next').style.display = 'inline-flex';
      const saveBtn = document.getElementById('btn-save');
      if (saveBtn) saveBtn.style.display = 'none';
      const postBtn = document.getElementById('btn-post-form');
      if (postBtn) postBtn.style.display = 'none';
    }
  },

  nextStep() {
    this.goToStep(appState.currentStep + 1);
  },

  prevStep() {
    this.goToStep(appState.currentStep - 1);
  },

  /**
   * Validate fields on a specific wizard step
   */
  validateStep(step) {
    let isValid = true;
    
    if (step === 1) {
      const school = document.getElementById('input-school-name').value.trim();
      const semester = document.getElementById('input-semester').value;
      const year = document.getElementById('input-academic-year').value;
      const classLevel = document.getElementById('input-class-level').value.trim();
      const totalStud = parseInt(document.getElementById('input-total-students').value) || 0;
      const advisor1 = document.getElementById('input-advisor-1').value.trim();

      if (!school || !semester || !year || !classLevel || totalStud <= 0 || !advisor1) {
        isValid = false;
      }
    } else if (step === 2) {
      const totalStud = parseInt(document.getElementById('input-total-students').value) || 0;
      const visited = parseInt(document.getElementById('input-visited-count').value) || 0;
      const online = parseInt(document.getElementById('input-online-count').value) || 0;

      if (visited > totalStud) {
        document.getElementById('visit-validation-message').textContent = '⚠️ จำนวนนักเรียนที่เยี่ยมแล้ว ห้ามเกินจำนวนนักเรียนทั้งหมด';
        isValid = false;
      } else if (online > visited) {
        document.getElementById('visit-validation-message').textContent = '⚠️ จำนวนเยี่ยมออนไลน์ ห้ามมากกว่าจำนวนนักเรียนที่เยี่ยมแล้ว';
        isValid = false;
      } else {
        document.getElementById('visit-validation-message').textContent = '';
      }
    } else if (step === 3) {
      const visited = parseInt(document.getElementById('input-visited-count').value) || 0;
      const complete = parseInt(document.getElementById('input-family-complete').value) || 0;
      const separated = parseInt(document.getElementById('input-family-separated').value) || 0;
      const withRelatives = parseInt(document.getElementById('input-family-with-relatives').value) || 0;
      const other = parseInt(document.getElementById('input-family-other').value) || 0;

      const sum = complete + separated + withRelatives + other;
      if (sum !== visited) {
        document.getElementById('family-validation-message').textContent = `⚠️ ผลรวมของสถานะครอบครัว (${sum} คน) ต้องเท่ากับจำนวนนักเรียนที่เยี่ยมบ้านแล้ว (${visited} คน)`;
        isValid = false;
      } else {
        document.getElementById('family-validation-message').textContent = '';
      }
    } else if (step === 4) {
      const visited = parseInt(document.getElementById('input-visited-count').value) || 0;
      const tier1 = parseInt(document.getElementById('input-income-tier1').value) || 0;
      const tier2 = parseInt(document.getElementById('input-income-tier2').value) || 0;
      const tier3 = parseInt(document.getElementById('input-income-tier3').value) || 0;
      const tier4 = parseInt(document.getElementById('input-income-tier4').value) || 0;

      const sum = tier1 + tier2 + tier3 + tier4;
      if (sum !== visited) {
        document.getElementById('income-validation-message').textContent = `⚠️ ผลรวมรายได้ครัวเรือน (${sum} คน) ต้องเท่ากับจำนวนนักเรียนที่เยี่ยมบ้านแล้ว (${visited} คน)`;
        isValid = false;
      } else {
        document.getElementById('income-validation-message').textContent = '';
      }
    } else if (step === 5) {
      const checkedBoxes = document.querySelectorAll('.issue-checkbox:checked');
      if (checkedBoxes.length === 0) {
        document.getElementById('issue-validation-message').textContent = '⚠️ กรุณาเลือกปัญหา/อุปสรรคอย่างน้อย 1 หัวข้อ (สูงสุด 5 หัวข้อ)';
        isValid = false;
      } else if (checkedBoxes.length > 5) {
        document.getElementById('issue-validation-message').textContent = '⚠️ สามารถเลือกปัญหาได้สูงสุด 5 หัวข้อเท่านั้น';
        isValid = false;
      } else {
        let countsValid = true;
        checkedBoxes.forEach(cb => {
          const itemRow = cb.closest('.issue-checkbox-item');
          const countField = itemRow.querySelector('.issue-count-field');
          const val = parseInt(countField.value) || 0;
          if (val <= 0) {
            countsValid = false;
          }
        });
        if (!countsValid) {
          document.getElementById('issue-validation-message').textContent = '⚠️ กรุณาระบุจำนวนนักเรียนในแต่ละหัวข้อปัญหาที่เลือกให้ถูกต้อง (ต้องมีอย่างน้อย 1 คน)';
          isValid = false;
        } else {
          document.getElementById('issue-validation-message').textContent = '';
        }
      }
    } else if (step === 7) {
      const summary = document.getElementById('input-summary-text').value.trim();
      if (!summary) {
        isValid = false;
      }
    }

    return isValid;
  },

  /**
   * Checkbox Issue list toggling count inputs
   */
  toggleIssueInput(checkbox) {
    const itemRow = checkbox.closest('.issue-checkbox-item');
    const countField = itemRow.querySelector('.issue-count-field');
    
    if (checkbox.checked) {
      const checkedBoxes = document.querySelectorAll('.issue-checkbox:checked');
      if (checkedBoxes.length > 5) {
        checkbox.checked = false;
        this.showToast('สามารถเลือกปัญหาได้สูงสุด 5 อันดับแรกเท่านั้น', 'error');
        return;
      }
      countField.disabled = false;
      countField.required = true;
      countField.value = '1';
    } else {
      countField.disabled = true;
      countField.required = false;
      countField.value = '';
    }
  },

  /**
   * Auto Fill Form with Demo Data for fast preview
   */
  autoFillDemoForm() {
    const data = appState.currentReport;
    
    // Step 1
    document.getElementById('input-school-name').value = data.schoolName;
    document.getElementById('input-semester').value = data.semester;
    document.getElementById('input-academic-year').value = data.academicYear;
    document.getElementById('input-class-level').value = data.classLevel;
    document.getElementById('input-total-students').value = data.totalStudents;
    document.getElementById('input-visit-period-start').value = data.visitPeriodStart;
    document.getElementById('input-visit-period-end').value = data.visitPeriodEnd;
    document.getElementById('input-advisor-1').value = data.advisorTeachers[0] || '';
    document.getElementById('input-advisor-2').value = data.advisorTeachers[1] || '';

    // Step 2
    document.getElementById('input-visited-count').value = data.stat_visitedCount;
    document.getElementById('input-online-count').value = data.stat_onlineCount;

    // Step 3
    document.getElementById('input-family-complete').value = data.family_complete.count;
    document.getElementById('input-family-separated').value = data.family_separated.count;
    document.getElementById('input-family-with-relatives').value = data.family_withRelatives.count;
    document.getElementById('input-family-other').value = data.family_other.count;

    // Step 4
    document.getElementById('input-income-tier1').value = data.incomeRanges[0].count;
    document.getElementById('input-income-tier2').value = data.incomeRanges[1].count;
    document.getElementById('input-income-tier3').value = data.incomeRanges[2].count;
    document.getElementById('input-income-tier4').value = data.incomeRanges[3].count;

    // Step 5 (Checkboxes)
    document.querySelectorAll('.issue-checkbox').forEach(cb => {
      cb.checked = false;
      const countField = cb.closest('.issue-checkbox-item').querySelector('.issue-count-field');
      countField.disabled = true;
      countField.value = '';
    });
    if (data.topIssues) {
      data.topIssues.forEach(issue => {
        const checkbox = Array.from(document.querySelectorAll('.issue-checkbox')).find(cb => cb.value === issue.label);
        if (checkbox) {
          checkbox.checked = true;
          const countField = checkbox.closest('.issue-checkbox-item').querySelector('.issue-count-field');
          countField.disabled = false;
          countField.value = issue.count;
        }
      });
    }

    // Step 6
    this.renderDynamicListForm('actionplans-list-inputs', data.actionPlans);

    // Step 7
    document.getElementById('input-summary-text').value = data.summaryText;

    // Photos
    this.photoPreviewArray = [...data.photos];
    this.updatePhotoPreviews();

    // Trigger Calculations
    this.calculateFormStats();
  },

  /**
   * Pre-populate form with specific report data for editing
   */
  editReport(reportId, event) {
    if (event) event.stopPropagation();

    const report = appState.reports.find(r => r.reportId === reportId);
    if (!report) return;

    if (report.isSample || report.reportId === 'RPT-SAMPLE55') {
      if (appState.userRole !== 'admin') {
        this.showToast('⚠️ รายงานนี้เป็นรายงานตัวอย่าง เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่แก้ไขได้', 'error');
        return;
      }
    }

    appState.editingReportId = reportId;

    // Map properties to form
    document.getElementById('input-school-name').value = report.schoolName;
    document.getElementById('input-semester').value = report.semester;
    document.getElementById('input-academic-year').value = report.academicYear;
    document.getElementById('input-class-level').value = report.classLevel;
    document.getElementById('input-total-students').value = report.totalStudents;
    document.getElementById('input-visit-period-start').value = report.visitPeriodStart;
    document.getElementById('input-visit-period-end').value = report.visitPeriodEnd;
    document.getElementById('input-advisor-1').value = report.advisorTeachers[0] || '';
    document.getElementById('input-advisor-2').value = report.advisorTeachers[1] || '';

    document.getElementById('input-visited-count').value = report.stat_visitedCount;
    document.getElementById('input-online-count').value = report.stat_onlineCount;

    document.getElementById('input-family-complete').value = report.family_complete.count;
    document.getElementById('input-family-separated').value = report.family_separated.count;
    document.getElementById('input-family-with-relatives').value = report.family_withRelatives.count;
    document.getElementById('input-family-other').value = report.family_other.count;

    document.getElementById('input-income-tier1').value = report.incomeRanges[0].count;
    document.getElementById('input-income-tier2').value = report.incomeRanges[1].count;
    document.getElementById('input-income-tier3').value = report.incomeRanges[2].count;
    document.getElementById('input-income-tier4').value = report.incomeRanges[3].count;

    // Step 5 (Checkboxes)
    document.querySelectorAll('.issue-checkbox').forEach(cb => {
      cb.checked = false;
      const countField = cb.closest('.issue-checkbox-item').querySelector('.issue-count-field');
      countField.disabled = true;
      countField.value = '';
    });
    if (report.topIssues) {
      report.topIssues.forEach(issue => {
        const checkbox = Array.from(document.querySelectorAll('.issue-checkbox')).find(cb => cb.value === issue.label);
        if (checkbox) {
          checkbox.checked = true;
          const countField = checkbox.closest('.issue-checkbox-item').querySelector('.issue-count-field');
          countField.disabled = false;
          countField.value = issue.count;
        }
      });
    }

    this.renderDynamicListForm('actionplans-list-inputs', report.actionPlans);

    document.getElementById('input-summary-text').value = report.summaryText;

    // Support size migration if report is from older version with only 6 slots
    this.photoPreviewArray = Array(8).fill('');
    if (report.photos) {
      report.photos.forEach((photo, idx) => {
        if (idx < 8) this.photoPreviewArray[idx] = photo;
      });
    }
    this.updatePhotoPreviews();

    // Trigger calculations
    this.calculateFormStats();

    // Open Form Wizard View
    this.goToStep(1);
    this.switchView('form');
  },

  /**
   * Action: Create New Report from scratch
   */
  createNewReport() {
    appState.editingReportId = null;
    appState.currentReport.isPosted = false; // Reset post state
    this.resetForm();
    this.goToStep(1);
    this.switchView('form');
  },

  /**
   * Reset all form inputs to empty/defaults
   */
  resetForm() {
    document.getElementById('report-form').reset();
    
    // Explicitly reset all form inputs to prevent browser caching/dynamic state issues
    document.getElementById('input-school-name').value = 'โรงเรียนพระโขนงพิทยาลัย';
    document.getElementById('input-semester').value = 'ภาคเรียนที่ 1';
    document.getElementById('input-academic-year').value = 'ปีการศึกษา 2569';
    document.getElementById('input-class-level').value = '';
    document.getElementById('input-total-students').value = '';
    document.getElementById('input-visit-period-start').value = '26 พฤษภาคม 2569';
    document.getElementById('input-visit-period-end').value = '30 มิถุนายน 2569';
    document.getElementById('input-advisor-1').value = '';
    document.getElementById('input-advisor-2').value = '';

    document.getElementById('input-visited-count').value = '';
    document.getElementById('input-online-count').value = '';

    document.getElementById('input-family-complete').value = '';
    document.getElementById('input-family-separated').value = '';
    document.getElementById('input-family-with-relatives').value = '';
    document.getElementById('input-family-other').value = '';

    document.getElementById('input-income-tier1').value = '';
    document.getElementById('input-income-tier2').value = '';
    document.getElementById('input-income-tier3').value = '';
    document.getElementById('input-income-tier4').value = '';
    
    // Clear Step 5 checkboxes
    document.querySelectorAll('.issue-checkbox').forEach(cb => {
      cb.checked = false;
      const countField = cb.closest('.issue-checkbox-item').querySelector('.issue-count-field');
      countField.disabled = true;
      countField.value = '';
    });

    // Clear dynamic inputs
    document.getElementById('actionplans-list-inputs').innerHTML = '';
    this.addDynamicItem('actionplans-list-inputs');

    this.photoPreviewArray = ['', '', '', '', '', '', '', ''];
    this.updatePhotoPreviews();

    document.getElementById('input-summary-text').value = '';

    // Clear validation messages
    const visitMsg = document.getElementById('visit-validation-message');
    if (visitMsg) visitMsg.textContent = '';
    const famMsg = document.getElementById('family-validation-message');
    if (famMsg) famMsg.textContent = '';
    const incMsg = document.getElementById('income-validation-message');
    if (incMsg) incMsg.textContent = '';
    const issMsg = document.getElementById('issue-validation-message');
    if (issMsg) issMsg.textContent = '';

    this.calculateFormStats();
  },

  /**
   * Calculate form statistics on input changes
   */
  calculateFormStats() {
    const totalStudents = parseInt(document.getElementById('input-total-students').value) || 0;
    const visitedCount = parseInt(document.getElementById('input-visited-count').value) || 0;
    const onlineCount = parseInt(document.getElementById('input-online-count').value) || 0;

    // 1. Visit Stats percentages
    let visitedPercent = 0;
    let onlinePercent = 0;
    let inPersonCount = 0;
    let inPersonPercent = 0;

    if (totalStudents > 0) {
      visitedPercent = (visitedCount / totalStudents) * 100;
      onlinePercent = (onlineCount / totalStudents) * 100;
      
      inPersonCount = Math.max(0, visitedCount - onlineCount);
      inPersonPercent = (inPersonCount / totalStudents) * 100;
    }

    // Set auto-calc in DOM
    document.getElementById('calc-visited-percent').textContent = visitedPercent.toFixed(2) + '%';
    document.getElementById('calc-online-percent').textContent = onlinePercent.toFixed(2) + '%';
    document.getElementById('display-inperson-count').textContent = inPersonCount;
    document.getElementById('calc-inperson-percent').textContent = inPersonPercent.toFixed(2) + '%';

    // Placeholders updates
    document.querySelectorAll('.target-students-placeholder').forEach(el => {
      el.textContent = visitedCount; // Validate against visited count
    });

    // 2. Family Status percentages
    const complete = parseInt(document.getElementById('input-family-complete').value) || 0;
    const separated = parseInt(document.getElementById('input-family-separated').value) || 0;
    const withRelatives = parseInt(document.getElementById('input-family-with-relatives').value) || 0;
    const other = parseInt(document.getElementById('input-family-other').value) || 0;

    const familySum = complete + separated + withRelatives + other;
    const familyDiff = visitedCount - familySum;

    const completePct = visitedCount > 0 ? (complete / visitedCount * 100) : 0;
    const separatedPct = visitedCount > 0 ? (separated / visitedCount * 100) : 0;
    const relativesPct = visitedCount > 0 ? (withRelatives / visitedCount * 100) : 0;
    const otherPct = visitedCount > 0 ? (other / visitedCount * 100) : 0;

    document.getElementById('calc-family-complete-percent').textContent = completePct.toFixed(0) + '%';
    document.getElementById('calc-family-separated-percent').textContent = separatedPct.toFixed(0) + '%';
    document.getElementById('calc-family-relatives-percent').textContent = relativesPct.toFixed(0) + '%';
    document.getElementById('calc-family-other-percent').textContent = otherPct.toFixed(0) + '%';

    const familyStatusEl = document.getElementById('family-sum-status');
    if (familyStatusEl) {
      if (familyDiff === 0) {
        familyStatusEl.className = 'status-value valid';
        familyStatusEl.innerHTML = `${familySum} / ${visitedCount} คน ✅ (ครบถ้วน)`;
        document.getElementById('family-validation-message').textContent = '';
      } else {
        familyStatusEl.className = 'status-value invalid';
        const text = familyDiff > 0 ? `ขาดอีก ${familyDiff} คน` : `เกินมา ${Math.abs(familyDiff)} คน`;
        familyStatusEl.innerHTML = `${familySum} / ${visitedCount} คน ❌ (${text})`;
      }
    }

    // 3. Income Tiers percentages
    const tier1 = parseInt(document.getElementById('input-income-tier1').value) || 0;
    const tier2 = parseInt(document.getElementById('input-income-tier2').value) || 0;
    const tier3 = parseInt(document.getElementById('input-income-tier3').value) || 0;
    const tier4 = parseInt(document.getElementById('input-income-tier4').value) || 0;

    const incomeSum = tier1 + tier2 + tier3 + tier4;
    const incomeDiff = visitedCount - incomeSum;

    const t1Pct = visitedCount > 0 ? (tier1 / visitedCount * 100) : 0;
    const t2Pct = visitedCount > 0 ? (tier2 / visitedCount * 100) : 0;
    const t3Pct = visitedCount > 0 ? (tier3 / visitedCount * 100) : 0;
    const t4Pct = visitedCount > 0 ? (tier4 / visitedCount * 100) : 0;

    document.getElementById('calc-income-tier1-percent').textContent = t1Pct.toFixed(2) + '%';
    document.getElementById('calc-income-tier2-percent').textContent = t2Pct.toFixed(2) + '%';
    document.getElementById('calc-income-tier3-percent').textContent = t3Pct.toFixed(2) + '%';
    document.getElementById('calc-income-tier4-percent').textContent = t4Pct.toFixed(2) + '%';

    const incomeStatusEl = document.getElementById('income-sum-status');
    if (incomeStatusEl) {
      if (incomeDiff === 0) {
        incomeStatusEl.className = 'status-value valid';
        incomeStatusEl.innerHTML = `${incomeSum} / ${visitedCount} คน ✅ (ครบถ้วน)`;
        document.getElementById('income-validation-message').textContent = '';
      } else {
        incomeStatusEl.className = 'status-value invalid';
        const text = incomeDiff > 0 ? `ขาดอีก ${incomeDiff} คน` : `เกินมา ${Math.abs(incomeDiff)} คน`;
        incomeStatusEl.innerHTML = `${incomeSum} / ${visitedCount} คน ❌ (${text})`;
      }
    }
  },

  /**
   * Dynamic Input list logic
   */
  initDynamicListListeners() {
    this.photoPreviewArray = ['', '', '', '', '', '', '', ''];
  },

  /**
   * Add text row to Dynamic Inputs
   */
  addDynamicItem(containerId, value = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'dynamic-item-row';
    row.innerHTML = `
      <input type="text" class="form-input dynamic-list-input" value="${value}" placeholder="ระบุข้อความ...">
      <button type="button" class="btn btn-danger btn-sm" onclick="app.removeDynamicItem(this)">🗑️</button>
    `;
    container.appendChild(row);
  },

  removeDynamicItem(button) {
    const row = button.parentNode;
    const container = row.parentNode;
    row.remove();
    // Keep at least one row
    if (container.children.length === 0) {
      this.addDynamicItem(container.id);
    }
  },

  /**
   * Build dynamic list inputs from string array
   */
  renderDynamicListForm(containerId, itemsArray) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    if (!itemsArray || itemsArray.length === 0) {
      this.addDynamicItem(containerId);
    } else {
      itemsArray.forEach(item => {
        this.addDynamicItem(containerId, item);
      });
    }
  },

  /**
   * Extract array values from dynamic inputs in form
   */
  getDynamicListValues(containerId) {
    const inputs = document.querySelectorAll(`#${containerId} .dynamic-list-input`);
    const values = [];
    inputs.forEach(input => {
      const val = input.value.trim();
      if (val) values.push(val);
    });
    return values;
  },

  /**
   * Photo Upload preview
   */
  triggerPhotoUpload(input, index) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreviewArray[index] = e.target.result;
        this.updatePhotoPreviews();
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  removePhoto(index) {
    this.photoPreviewArray[index] = '';
    // Clear the input file element
    const slot = document.querySelector(`.photo-slot[data-index="${index}"]`);
    if (slot) {
      const fileInput = slot.querySelector('.photo-file-input');
      if (fileInput) fileInput.value = '';
    }
    this.updatePhotoPreviews();
  },

  updatePhotoPreviews() {
    this.photoPreviewArray.forEach((base64, index) => {
      const slot = document.querySelector(`.photo-slot[data-index="${index}"]`);
      if (!slot) return;

      const placeholder = slot.querySelector('.photo-preview-placeholder');
      const img = slot.querySelector('.photo-preview-img');
      const delBtn = slot.querySelector('.delete-photo-btn');

      if (base64) {
        img.src = base64;
        img.style.display = 'block';
        placeholder.style.display = 'none';
        delBtn.style.display = 'flex';
      } else {
        img.src = '';
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        delBtn.style.display = 'none';
      }
    });
  },

  /**
   * Action: Collect and Save Form Data
   */
  saveReport(isPostedValue = null) {
    // Perform final validations across all steps
    for (let step = 1; step <= appState.totalSteps; step++) {
      if (!this.validateStep(step)) {
        this.showToast(`กรุณากรอกข้อมูลในขั้นตอนที่ ${step} ให้ครบถ้วนและถูกต้อง`, 'error');
        this.goToStep(step);
        return false;
      }
    }

    // Collect all inputs to build Report Object
    const totalStudents = parseInt(document.getElementById('input-total-students').value) || 0;
    const visitedCount = parseInt(document.getElementById('input-visited-count').value) || 0;
    const onlineCount = parseInt(document.getElementById('input-online-count').value) || 0;
    const inPersonCount = Math.max(0, visitedCount - onlineCount);

    const complete = parseInt(document.getElementById('input-family-complete').value) || 0;
    const separated = parseInt(document.getElementById('input-family-separated').value) || 0;
    const withRelatives = parseInt(document.getElementById('input-family-with-relatives').value) || 0;
    const other = parseInt(document.getElementById('input-family-other').value) || 0;

    const tier1 = parseInt(document.getElementById('input-income-tier1').value) || 0;
    const tier2 = parseInt(document.getElementById('input-income-tier2').value) || 0;
    const tier3 = parseInt(document.getElementById('input-income-tier3').value) || 0;
    const tier4 = parseInt(document.getElementById('input-income-tier4').value) || 0;

    // Top 5 issues from checkboxes
    const topIssues = [];
    const checkedBoxes = document.querySelectorAll('.issue-checkbox:checked');
    const selectedIssues = [];
    checkedBoxes.forEach(cb => {
      const itemRow = cb.closest('.issue-checkbox-item');
      const countField = itemRow.querySelector('.issue-count-field');
      const count = parseInt(countField.value) || 0;
      selectedIssues.push({ label: cb.value, count });
    });

    // Sort by count descending
    selectedIssues.sort((a, b) => b.count - a.count);

    // Take top 5 and assign rank
    selectedIssues.slice(0, 5).forEach((issue, index) => {
      topIssues.push({
        rank: index + 1,
        label: issue.label,
        count: issue.count
      });
    });

    // Advisors
    const advisorTeachers = [document.getElementById('input-advisor-1').value.trim()];
    const advisor2 = document.getElementById('input-advisor-2').value.trim();
    if (advisor2) advisorTeachers.push(advisor2);

    const reportId = appState.editingReportId || 'RPT-' + Date.now().toString(36).toUpperCase();

    // Determine post status
    let finalPosted = false;
    if (isPostedValue !== null) {
      finalPosted = isPostedValue;
    } else {
      if (appState.editingReportId) {
        const oldReport = appState.reports.find(r => r.reportId === reportId);
        if (oldReport) finalPosted = oldReport.isPosted || false;
      } else {
        finalPosted = appState.currentReport.isPosted || false;
      }
    }

    const reportData = {
      reportId,
      createdAt: new Date().toISOString(),
      schoolName: document.getElementById('input-school-name').value.trim(),
      schoolLogoUrl: 'pklogo.png', // Always use the attached logo
      semester: document.getElementById('input-semester').value,
      academicYear: document.getElementById('input-academic-year').value,
      classLevel: document.getElementById('input-class-level').value.trim(),
      totalStudents,
      visitPeriodStart: document.getElementById('input-visit-period-start').value.trim(),
      visitPeriodEnd: document.getElementById('input-visit-period-end').value.trim(),
      advisorTeachers,
      stat_visitedCount: visitedCount,
      stat_onlineCount: onlineCount,
      stat_inPersonCount: inPersonCount,
      
      family_complete: { count: complete, percent: visitedCount > 0 ? Math.round(complete / visitedCount * 100) : 0 },
      family_separated: { count: separated, percent: visitedCount > 0 ? Math.round(separated / visitedCount * 100) : 0 },
      family_withRelatives: { count: withRelatives, percent: visitedCount > 0 ? Math.round(withRelatives / visitedCount * 100) : 0 },
      family_other: { count: other, percent: visitedCount > 0 ? Math.round(other / visitedCount * 100) : 0 },

      incomeRanges: [
        { label: 'ต่ำกว่า 10,000 บาท', count: tier1, percent: visitedCount > 0 ? (tier1 / visitedCount * 100) : 0 },
        { label: '10,000 – 30,000 บาท', count: tier2, percent: visitedCount > 0 ? (tier2 / visitedCount * 100) : 0 },
        { label: '30,000 – 50,000 บาท', count: tier3, percent: visitedCount > 0 ? (tier3 / visitedCount * 100) : 0 },
        { label: 'มากกว่า 50,000 บาท', count: tier4, percent: visitedCount > 0 ? (tier4 / visitedCount * 100) : 0 }
      ],
      
      topIssues,
      actionPlans: this.getDynamicListValues('actionplans-list-inputs'),
      photos: [...this.photoPreviewArray],
      
      summaryText: document.getElementById('input-summary-text').value.trim(),
      isPosted: finalPosted
    };

    // Save to State
    if (appState.editingReportId) {
      const idx = appState.reports.findIndex(r => r.reportId === reportId);
      if (idx !== -1) appState.reports[idx] = reportData;
    } else {
      appState.reports.unshift(reportData);
    }

    // Save to LocalStorage
    this.saveReportsToStorage();
    this.showToast(appState.editingReportId ? 'แก้ไขข้อมูลเรียบร้อย!' : 'บันทึกรายงานสำเร็จ!', 'success');

    // Reset Editing ID & state
    appState.editingReportId = null;
    appState.currentReport.isPosted = false;

    // View the Report
    this.viewReport(reportId);
    return true;
  },

  /**
   * Action: Open Report View with Rendered content
   */
  viewReport(reportId) {
    const report = appState.reports.find(r => r.reportId === reportId);
    if (!report) {
      this.showToast('ไม่พบข้อมูลรายงานที่ต้องการ', 'error');
      this.switchView('dashboard');
      return;
    }

    if (report.isHidden && appState.userRole !== 'admin') {
      this.showToast('⚠️ รายงานนี้ถูกผู้ดูแลระบบ (Admin) ซ่อนไว้ชั่วคราว', 'error');
      this.switchView('dashboard');
      return;
    }

    appState.currentReportId = reportId;
    this.renderReportContent(report);
    this.switchView('report');
  },

  /**
   * Action: Trigger form editing based on current report ID
   */
  editCurrentReport() {
    if (appState.currentReportId) {
      this.editReport(appState.currentReportId);
    }
  },

  /**
   * Action: Delete specific report
   */
  deleteReport(reportId, event) {
    if (event) event.stopPropagation();

    const report = appState.reports.find(r => r.reportId === reportId);
    if (report && (report.isSample || report.reportId === 'RPT-SAMPLE55')) {
      if (appState.userRole !== 'admin') {
        this.showToast('⚠️ เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบรายงานตัวอย่างได้', 'error');
        return;
      }
    }

    if (confirm('คุณยืนยันที่จะลบรายงานนี้ใช่หรือไม่? การลบข้อมูลนี้จะไม่สามารถกู้คืนได้')) {
      appState.reports = appState.reports.filter(r => r.reportId !== reportId);
      this.saveReportsToStorage();
      
      // Delete from Firebase Database if available
      if (database) {
        try {
          database.ref('reports/' + reportId).remove();
        } catch (e) {
          console.error("Error removing report from Firebase Database:", e);
        }
      }

      this.showToast('ลบรายงานเรียบร้อยแล้ว', 'success');
      this.renderDashboard();
    }
  },

  /**
   * Action: Toggle hide/show status for a report (Admin only)
   */
  toggleHideReport(reportId, event) {
    if (event) event.stopPropagation();

    if (appState.userRole !== 'admin') {
      this.showToast('⚠️ เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถซ่อน/แสดงรายงานได้', 'error');
      return;
    }

    const report = appState.reports.find(r => r.reportId === reportId);
    if (!report) {
      this.showToast('ไม่พบข้อมูลรายงานที่ต้องการซ่อน/แสดง', 'error');
      return;
    }

    report.isHidden = !report.isHidden;
    this.saveReportsToStorage();
    
    if (report.isHidden) {
      this.showToast(`ซ่อนรายงานของ ${report.classLevel} สำเร็จ (ระบบจะไม่แสดงผลในแดชบอร์ดครูทั่วไปและสถิติรวม)`, 'success');
    } else {
      this.showToast(`แสดงรายงานของ ${report.classLevel} บนบอร์ดสถิติตามปกติ`, 'success');
    }

    this.renderDashboard();
    this.renderDashboardOverview();
  },

  /**
   * Action: Filter Dashboard Reports List
   */
  filterReports() {
    this.renderDashboard();
  },

  /**
   * Action: Post report from form Step 7 before saving
   */
  postFormToDashboard() {
    // Validate step 7 before posting
    if (!this.validateStep(7)) {
      this.showToast('กรุณากรอกสรุปภาพรวมในขั้นตอนที่ 7 ให้ถูกต้องก่อนทำการโพสต์', 'error');
      return;
    }

    if (appState.editingReportId) {
      const idx = appState.reports.findIndex(r => r.reportId === appState.editingReportId);
      if (idx !== -1) {
        appState.reports[idx].isPosted = true;
      }
    } else {
      appState.currentReport.isPosted = true;
    }
    
    // Refresh button states in step 7
    this.goToStep(7);
    
    // Show simulated upload progress toast
    this.showToast('กำลังเชื่อมต่อคลาวด์กลางและส่งข้อมูลดิบสู่ฐานข้อมูลแอดมิน...', 'info');
    setTimeout(() => {
      this.showToast('📢 โพสต์รายงานลงแดชบอร์ดกลางสำเร็จ! ตอนนี้คุณสามารถกดบันทึกได้แล้ว', 'success');
    }, 1200);
  },

  /**
   * Action: Post current report from report view toolbar
   */
  postCurrentToDashboard() {
    const reportId = appState.currentReportId;
    if (!reportId) return;

    const reportIdx = appState.reports.findIndex(r => r.reportId === reportId);
    if (reportIdx !== -1) {
      appState.reports[reportIdx].isPosted = true;
      this.saveReportsToStorage();
      this.renderReportContent(appState.reports[reportIdx]);
      
      this.showToast('กำลังเชื่อมต่อคลาวด์กลางและส่งข้อมูลดิบสู่ฐานข้อมูลแอดมิน...', 'info');
      setTimeout(() => {
        this.showToast('📢 โพสต์รายงานลงแดชบอร์ดกลางสำเร็จ! ตอนนี้สามารถสั่งพิมพ์หรือบันทึกรายงานได้แล้ว', 'success');
      }, 1200);
    }
  },

  /**
   * Dashboard Rendering
   */
  renderDashboard() {
    const grid = document.getElementById('reports-grid');
    if (!grid) return;

    // Apply Filter Criteria
    const semFilter = document.getElementById('filter-semester').value;
    const yearFilter = document.getElementById('filter-year').value;
    const searchVal = document.getElementById('search-input').value.trim().toLowerCase();

    const filtered = appState.reports.filter(r => {
      // Hide from non-admin users
      if (r.isHidden && appState.userRole !== 'admin') return false;

      if (semFilter && r.semester !== semFilter) return false;
      if (yearFilter && r.academicYear !== yearFilter) return false;
      
      if (searchVal) {
        const matchClass = r.classLevel.toLowerCase().includes(searchVal);
        const matchAdvisors = r.advisorTeachers.some(t => t.toLowerCase().includes(searchVal));
        const matchSchool = r.schoolName.toLowerCase().includes(searchVal);
        if (!matchClass && !matchAdvisors && !matchSchool) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>ไม่พบรายงานที่ตรงกับการค้นหา</h3>
          <p>ลองปรับฟิลเตอร์หรือคำค้นหาของคุณอีกครั้ง</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    filtered.forEach(report => {
      const card = document.createElement('div');
      
      // Add status highlighting class
      const isPostedClass = report.isPosted ? 'posted-card' : '';
      card.className = `report-card ${isPostedClass}`;
      card.onclick = () => this.viewReport(report.reportId);

      const tPercent = report.totalStudents > 0 ? (report.stat_visitedCount / report.totalStudents * 100).toFixed(0) : 0;
      
      // Status badge template
      let statusBadgeHtml = '';
      if (report.isHidden) {
        statusBadgeHtml = `<span class="status-badge hidden" style="background-color: var(--danger-red); color: white;">🔒 ซ่อนอยู่ (แอดมินเท่านั้นที่เห็น)</span>`;
      } else if (report.isPosted) {
        statusBadgeHtml = `<span class="status-badge posted">📢 โพสต์แล้ว (แอดมินดึงข้อมูลได้)</span>`;
      } else {
        statusBadgeHtml = `<span class="status-badge local">💻 แบบร่างส่วนบุคคล</span>`;
      }

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title">${report.classLevel}</h3>
          <div class="card-badges-wrapper">
            <span class="card-semester-badge">${report.semester}</span>
          </div>
        </div>
        <div class="card-meta-line">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89l-.06-.582V9.397zM6 10.546l1.394.598a3 3 0 002.396 0l7.98-3.42V12.75a2.25 2.25 0 01-2.25 2.25H9.866a9.01 9.01 0 00-1.05.174 1 1 0 01-.89-.89l-.06-.582V10.546z"/></svg>
          ${report.schoolName}
        </div>
        <div class="card-meta-line">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
          ${report.advisorTeachers.join(', ')}
        </div>
        <div class="card-meta-line">
          📅 ${report.academicYear}
        </div>
        
        <div class="card-stats-mini">
          <div class="mini-stat">
            <span class="mini-stat-label">นักเรียนทั้งหมด</span>
            <span class="mini-stat-value">${report.totalStudents} คน</span>
          </div>
          <div class="mini-stat">
            <span class="mini-stat-label">เยี่ยมแล้ว</span>
            <span class="mini-stat-value">${report.stat_visitedCount} คน (${tPercent}%)</span>
          </div>
        </div>

        <div class="card-status-row">
          ${statusBadgeHtml}
        </div>

        <div class="card-actions" style="flex-direction: column; gap: 8px;">
          ${appState.userRole === 'admin' ? `
            <button class="btn btn-warning btn-sm" style="width: 100%; font-size: 11px;" onclick="app.toggleHideReport('${report.reportId}', event)">
              ${report.isHidden ? '👁️ แสดงรายงาน (แสดงสถิติและบอร์ดครู)' : '👁️‍🗨️ ซ่อนรายงาน (ซ่อนจากสถิติและบอร์ดครู)'}
            </button>
          ` : ''}
          <div style="display: flex; gap: 10px; width: 100%;">
            <button class="btn btn-secondary btn-sm" onclick="app.editReport('${report.reportId}', event)">✏️ แก้ไข</button>
            <button class="btn btn-danger btn-sm" onclick="app.deleteReport('${report.reportId}', event)">🗑️ ลบ</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  },

  /**
   * A4 Infographic Report Rendering
   * Build report elements in full detail
   */
  renderReportContent(data) {
    const container = document.getElementById('a4-report-content');
    if (!container) return;

    // Reset A4 Content
    container.innerHTML = '';

    // Calculate dynamic values for conic gradient
    const completePercent = data.family_complete.percent;
    const separatedPercent = data.family_separated.percent;
    const relativesPercent = data.family_withRelatives.percent;
    const otherPercent = data.family_other.percent;

    const slice1 = completePercent;
    const slice2 = slice1 + separatedPercent;
    const slice3 = slice2 + relativesPercent;
    
    // Conic gradient style for family status donut chart
    const donutGradient = `conic-gradient(
      #2B5EA7 0% ${slice1}%, 
      #5B9BD5 ${slice1}% ${slice2}%, 
      #A5C8E1 ${slice2}% ${slice3}%, 
      #E8B54D ${slice3}% 100%
    )`;

    // Max count for scaling the horizontal income bars
    const maxIncomeCount = Math.max(...data.incomeRanges.map(r => r.count), 1);

    // Render stats
    const visitedPercent = data.totalStudents > 0 ? (data.stat_visitedCount / data.totalStudents * 100).toFixed(1) : 0;
    const onlinePercent = data.totalStudents > 0 ? (data.stat_onlineCount / data.totalStudents * 100).toFixed(1) : 0;
    const inPersonPercent = data.totalStudents > 0 ? (data.stat_inPersonCount / data.totalStudents * 100).toFixed(1) : 0;

    // Render top issues list
    let issuesHtml = '';
    if (data.topIssues && data.topIssues.length > 0) {
      data.topIssues.forEach(issue => {
        issuesHtml += `
          <div class="issue-item">
            <div class="issue-badge rank-${issue.rank}">${issue.rank}</div>
            <div class="issue-label">${issue.label}</div>
            <div class="issue-count">${issue.count} คน</div>
          </div>
        `;
      });
    } else {
      issuesHtml = '<div class="empty-list-txt">ไม่มีข้อมูลประเด็นปัญหา</div>';
    }

    // Render action plans
    let actionsHtml = '';
    if (data.actionPlans && data.actionPlans.length > 0) {
      data.actionPlans.forEach(plan => {
        actionsHtml += `
          <li class="action-item">
            <span class="bullet-icon">▪</span>
            <div>${plan}</div>
          </li>
        `;
      });
    } else {
      actionsHtml = '<div class="empty-list-txt">ไม่มีข้อมูลแนวทางการช่วยเหลือ</div>';
    }

    // Render Income bars
    let incomeBarsHtml = '';
    data.incomeRanges.forEach(income => {
      const fillPercent = (income.count / maxIncomeCount) * 100;
      incomeBarsHtml += `
        <div class="bar-row">
          <span class="bar-label" title="${income.label}">${income.label}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${fillPercent}%;"></div>
          </div>
          <span class="bar-value">${income.count} ครอบครัว (${income.percent.toFixed(1)}%)</span>
        </div>
      `;
    });

    // Render Photos Grid
    let photoGridHtml = '';
    for (let idx = 0; idx < 8; idx++) {
      const photo = data.photos && data.photos[idx];
      if (photo) {
        photoGridHtml += `
          <div class="photo-grid-item">
            <img src="${photo}" alt="ภาพกิจกรรม ${idx+1}" />
          </div>
        `;
      } else {
        photoGridHtml += `
          <div class="photo-grid-item">
            <div class="photo-grid-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="camera-icon"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <span>ไม่มีรูปภาพ</span>
            </div>
          </div>
        `;
      }
    }

    // Control Toolbar state based on isPosted
    const printBtn = document.getElementById('btn-print-toolbar');
    const pdfBtn = document.getElementById('btn-pdf-toolbar');
    const pngBtn = document.getElementById('btn-png-toolbar');
    const postToolbarBtn = document.getElementById('btn-post-toolbar');
    const statusText = document.getElementById('toolbar-status-text');

    if (data.isPosted) {
      if (printBtn) printBtn.disabled = false;
      if (pdfBtn) pdfBtn.disabled = false;
      if (pngBtn) pngBtn.disabled = false;
      if (postToolbarBtn) {
        postToolbarBtn.innerHTML = '✅ โพสต์สำเร็จแล้ว';
        postToolbarBtn.className = 'btn btn-secondary';
        postToolbarBtn.disabled = true;
      }
      if (statusText) {
        statusText.innerHTML = '🔎 ตัวอย่างรายงานขนาด A4 (พร้อมสั่งพิมพ์/ส่งออก)';
        statusText.style.color = 'var(--success-green)';
      }
    } else {
      if (printBtn) printBtn.disabled = true;
      if (pdfBtn) pdfBtn.disabled = true;
      if (pngBtn) pngBtn.disabled = true;
      if (postToolbarBtn) {
        postToolbarBtn.innerHTML = '📢 โพสต์ลงแดชบอร์ด';
        postToolbarBtn.className = 'btn btn-warning';
        postToolbarBtn.disabled = false;
      }
      if (statusText) {
        statusText.innerHTML = '⚠️ กรุณากดโพสต์ลงแดชบอร์ดก่อนพิมพ์หรือส่งออก';
        statusText.style.color = 'var(--danger-red)';
      }
    }

    // Build overall A4 Template HTML
    container.innerHTML = `
      <!-- Corner decorations -->
      <div class="corner-decoration top-left"></div>
      <div class="corner-decoration top-right"></div>
      <div class="corner-decoration bottom-left"></div>
      <div class="corner-decoration bottom-right"></div>

      <!-- REPORT HEADER -->
      <div class="report-header">
        <!-- Displayed via CSS background: header_bg.png -->
      </div>
      
      <!-- Metadata summary bar -->
      <div class="report-meta-bar">
        <div class="report-meta-item">📚 ระดับชั้น: <strong>${data.classLevel}</strong> (นักเรียนทั้งหมด ${data.totalStudents} คน)</div>
        <div class="report-meta-item">📅 ระยะเวลา: <strong>26 พ.ค. 69 – 30 มิ.ย. 69</strong></div>
        <div class="report-meta-item">👨‍🏫 ครูที่ปรึกษา: <strong>${data.advisorTeachers.join(', ')}</strong></div>
      </div>

      <!-- REPORT BODY -->
      <div class="report-body">
        
        <!-- Section 1: Stats -->
        <div class="section-title">
          <span class="section-num">1</span> สถิติผลการออกเยี่ยมบ้านนักเรียน
        </div>
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div class="stat-label">นักเรียนทั้งหมดในห้อง</div>
            <div class="stat-number">${data.totalStudents}</div>
            <div class="stat-sub">คน</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #e8f8f5; color: var(--success-green);">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div class="stat-label">เยี่ยมเรียบร้อยแล้ว</div>
            <div class="stat-number">${data.stat_visitedCount}</div>
            <div class="stat-sub">${visitedPercent}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #ebf5fb; color: var(--light-blue);">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div class="stat-label">เยี่ยมรูปแบบออนไลน์</div>
            <div class="stat-number">${data.stat_onlineCount}</div>
            <div class="stat-sub">${onlinePercent}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #fef9e7; color: var(--gold-accent);">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div class="stat-label">เยี่ยม ณ บ้านนักเรียน</div>
            <div class="stat-number">${data.stat_inPersonCount}</div>
            <div class="stat-sub">${inPersonPercent}%</div>
          </div>
        </div>

        <!-- Row Grid 1: Family (Pie/Donut) & Income (Bars) -->
        <div class="report-grid grid-row-1">
          <div>
            <div class="section-title">
              <span class="section-num">2</span> สถานภาพทางครอบครัว
            </div>
            <div class="donut-chart-container">
              <div class="donut-chart" style="background: ${donutGradient};">
                <div class="donut-hole">
                  <span class="donut-value">${completePercent}%</span>
                  <span class="donut-label">อยู่ร่วมกัน</span>
                </div>
              </div>
              <ul class="chart-legend">
                <li><span class="legend-color" style="background-color:#2B5EA7;"></span> อยู่ร่วมกัน: ${completePercent}% (${data.family_complete.count} คน)</li>
                <li><span class="legend-color" style="background-color:#5B9BD5;"></span> หย่าร้าง/แยกกัน: ${separatedPercent}% (${data.family_separated.count} คน)</li>
                <li><span class="legend-color" style="background-color:#A5C8E1;"></span> อาศัยอยู่กับญาติ: ${relativesPercent}% (${data.family_withRelatives.count} คน)</li>
                <li><span class="legend-color" style="background-color:#E8B54D;"></span> อื่นๆ: ${otherPercent}% (${data.family_other.count} คน)</li>
              </ul>
            </div>
          </div>
          <div>
            <div class="section-title">
              <span class="section-num">3</span> สภาพเศรษฐกิจครัวเรือน (รายได้/เดือน)
            </div>
            <div class="bar-chart">
              ${incomeBarsHtml}
            </div>
          </div>
        </div>

        <!-- Row Grid 2: Issues (Top 5) & Action Plans -->
        <div class="report-grid grid-row-2">
          <div>
            <div class="section-title">
              <span class="section-num">4</span> ปัญหา/อุปสรรคที่พบมากสุด 5 อันดับ
            </div>
            <div class="issues-list">
              ${issuesHtml}
            </div>
          </div>
          <div>
            <div class="section-title">
              <span class="section-num">5</span> แนวทางช่วยเหลือ/พัฒนาร่วมกัน
            </div>
            <ul class="action-list">
              ${actionsHtml}
            </ul>
          </div>
        </div>

        <!-- Full-Width Section 6: Photos Grid (4x2 layout, 8 slots) -->
        <div class="full-width-section">
          <div class="section-title">
            <span class="section-num">6</span> ภาพกิจกรรมการออกเยี่ยมบ้านนักเรียน
          </div>
          <div class="photo-grid-8">
            ${photoGridHtml}
          </div>
        </div>

        <!-- Summary analysis -->
        <div class="summary-box">
          <div class="summary-title">📝 อภิปรายและสรุปผลภาพรวมการเยี่ยมบ้านนักเรียน</div>
          <p>${data.summaryText}</p>
        </div>

        <!-- Report Footer Section -->
        <div class="report-footer">
          <!-- Advisor Teacher(s) -->
          ${(() => {
            const list = (data.advisorTeachers || []).filter(t => t && t.trim() !== "");
            const displayList = list.length > 0 ? list : [""];
            return displayList.map(teacher => `
              <div class="footer-sig-block">
                <div class="footer-sig-details">
                  <div class="footer-sig-line">ลงชื่อ .......................................................</div>
                  <div class="footer-sig-name">( ${teacher || '........................................................'} )</div>
                  <div class="footer-sig-role">ครูที่ปรึกษา</div>
                </div>
              </div>
            `).join('');
          })()}


        </div>
      </div>
    `;
  },

  /**
   * Action: Open Print dialogue
   */
  printReport() {
    window.print();
  },

  /**
   * Action: Export Report to PDF (using html2canvas + jsPDF)
   */
  async exportPDF() {
    const reportId = appState.currentReportId;
    const report = appState.reports.find(r => r.reportId === reportId);
    const fileName = report 
      ? `รายงานสรุปผลเยี่ยมบ้าน_${report.classLevel.replace(/\s+/g, '')}.pdf` 
      : 'รายงานสรุปผลการเยี่ยมบ้านนักเรียน.pdf';

    this.showToast('กำลังเตรียมโครงสร้างรายงาน... กรุณารอสักครู่', 'info');

    try {
      const reportEl = document.getElementById('a4-report-content');

      const canvas = await html2canvas(reportEl, {
        scale: 2, // High resolution scale
        useCORS: true, // Allow cross-origin images
        allowTaint: false, // Prevents security errors under file://
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 size width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(fileName);

      this.showToast('ดาวน์โหลด PDF สำเร็จ!', 'success');
    } catch (err) {
      console.error("Error generating PDF:", err);
      this.showToast('ไม่สามารถส่งออก PDF ได้ กรุณาใช้ระบบสั่งพิมพ์ของเบราว์เซอร์แทน', 'error');
    }
  },

  /**
   * Show Toast Notification
   * @param {string} msg - The notification message
   * @param {string} type - 'success', 'info', 'error'
   */
  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${msg}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 3s (matched with CSS animation)
    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  /**
   * Action: Export A4 report to PNG image
   */
  async exportPNG() {
    const reportId = appState.currentReportId;
    const report = appState.reports.find(r => r.reportId === reportId);
    const classLevel = report ? report.classLevel : 'รายงานสรุป';
    const fileName = `รายงานสรุปการเยี่ยมบ้าน_${classLevel.replace(/\//g, '_')}.png`;

    this.showToast('กำลังเตรียมไฟล์รูปภาพ PNG...', 'info');

    try {
      const container = document.getElementById('a4-report-content');
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: false, // Prevents security errors under file://
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showToast('ดาวน์โหลดรูปภาพ PNG สำเร็จ!', 'success');
    } catch (err) {
      console.error("Error generating PNG image:", err);
      this.showToast('ไม่สามารถดาวน์โหลดรูปภาพได้', 'error');
    }
  },

  /**
   * Switch between Reports List and School Overview Stats
   * @param {string} tabName - 'list' or 'overview'
   */
  switchDashboardTab(tabName) {
    const listBtn = document.getElementById('btn-tab-list');
    const overviewBtn = document.getElementById('btn-tab-overview');
    const listContainer = document.getElementById('reports-grid');
    const overviewContainer = document.getElementById('reports-overview');

    if (!listBtn || !overviewBtn || !listContainer || !overviewContainer) return;

    listBtn.classList.toggle('active', tabName === 'list');
    overviewBtn.classList.toggle('active', tabName === 'overview');

    if (tabName === 'list') {
      listContainer.style.display = 'grid';
      overviewContainer.style.display = 'none';
      this.renderDashboard();
    } else {
      listContainer.style.display = 'none';
      overviewContainer.style.display = 'block';
      this.renderDashboardOverview();
    }
  },

  /**
   * Render school-wide aggregated statistics
   */
  renderDashboardOverview() {
    const container = document.getElementById('reports-overview');
    if (!container) return;

    const activeReports = appState.reports.filter(r => !r.isSample && r.reportId !== 'RPT-SAMPLE55' && !r.isHidden);

    if (activeReports.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>ยังไม่มีข้อมูลสำหรับวิเคราะห์สถิติ</h3>
          <p>กรุณาสร้างรายงานสรุปห้องเรียนและบันทึกข้อมูลเข้าสู่แดชบอร์ดก่อนระบบจะคำนวณข้อมูลระดับโรงเรียนได้ (ไม่นับรวมรายงานตัวอย่าง)</p>
        </div>
      `;
      return;
    }

    // Initialize Accumulators
    let totalClasses = activeReports.length;
    let totalStudents = 0;
    let totalVisited = 0;
    let totalOnline = 0;
    let totalInPerson = 0;

    let familyComplete = 0;
    let familySeparated = 0;
    let familyWithRelatives = 0;
    let familyOther = 0;

    let incomeTier1 = 0;
    let incomeTier2 = 0;
    let incomeTier3 = 0;
    let incomeTier4 = 0;

    const issueTotals = {};
    const actionPlanList = new Set();

    // Loop through reports to aggregate
    activeReports.forEach(report => {
      totalStudents += report.totalStudents || 0;
      totalVisited += report.stat_visitedCount || 0;
      totalOnline += report.stat_onlineCount || 0;
      totalInPerson += report.stat_inPersonCount || 0;

      familyComplete += (report.family_complete && report.family_complete.count) || 0;
      familySeparated += (report.family_separated && report.family_separated.count) || 0;
      familyWithRelatives += (report.family_withRelatives && report.family_withRelatives.count) || 0;
      familyOther += (report.family_other && report.family_other.count) || 0;

      if (report.incomeRanges) {
        incomeTier1 += (report.incomeRanges[0] && report.incomeRanges[0].count) || 0;
        incomeTier2 += (report.incomeRanges[1] && report.incomeRanges[1].count) || 0;
        incomeTier3 += (report.incomeRanges[2] && report.incomeRanges[2].count) || 0;
        incomeTier4 += (report.incomeRanges[3] && report.incomeRanges[3].count) || 0;
      }

      if (report.topIssues) {
        report.topIssues.forEach(issue => {
          if (!issueTotals[issue.label]) {
            issueTotals[issue.label] = 0;
          }
          issueTotals[issue.label] += issue.count || 0;
        });
      }

      if (report.actionPlans) {
        report.actionPlans.forEach(plan => {
          if (plan.trim()) actionPlanList.add(plan.trim());
        });
      }
    });

    // Percentages calculated against total visited students
    const completePercent = totalVisited > 0 ? Math.round((familyComplete / totalVisited) * 100) : 0;
    const separatedPercent = totalVisited > 0 ? Math.round((familySeparated / totalVisited) * 100) : 0;
    const relativesPercent = totalVisited > 0 ? Math.round((familyWithRelatives / totalVisited) * 100) : 0;
    const otherPercent = totalVisited > 0 ? Math.round((familyOther / totalVisited) * 100) : 0;

    const tier1Percent = totalVisited > 0 ? ((incomeTier1 / totalVisited) * 100) : 0;
    const tier2Percent = totalVisited > 0 ? ((incomeTier2 / totalVisited) * 100) : 0;
    const tier3Percent = totalVisited > 0 ? ((incomeTier3 / totalVisited) * 100) : 0;
    const tier4Percent = totalVisited > 0 ? ((incomeTier4 / totalVisited) * 100) : 0;

    // Visit statistics overall percentages
    const overallVisitedPercent = totalStudents > 0 ? ((totalVisited / totalStudents) * 100) : 0;
    const overallOnlinePercent = totalVisited > 0 ? ((totalOnline / totalVisited) * 100) : 0;
    const overallInPersonPercent = totalVisited > 0 ? ((totalInPerson / totalVisited) * 100) : 0;

    // Sort aggregated issues
    const sortedIssues = Object.keys(issueTotals).map(label => ({
      label,
      count: issueTotals[label]
    })).sort((a, b) => b.count - a.count);

    // Limit top 5
    const maxIssueCount = sortedIssues.length > 0 ? sortedIssues[0].count : 1;
    let issuesHtml = '';
    sortedIssues.slice(0, 5).forEach((issue, index) => {
      const barWidth = (issue.count / maxIssueCount) * 100;
      issuesHtml += `
        <div class="overview-issue-item">
          <div class="overview-issue-rank top-${index+1}">${index+1}</div>
          <div class="overview-issue-details">
            <span class="overview-issue-label">${issue.label}</span>
            <div class="overview-issue-bar-wrapper">
              <div class="overview-issue-bar" style="width: ${barWidth}%;"></div>
            </div>
          </div>
          <div class="overview-issue-count">${issue.count} คน</div>
        </div>
      `;
    });

    if (!issuesHtml) {
      issuesHtml = '<p class="empty-list-txt">ไม่มีข้อมูลประเด็นปัญหาที่บันทึกไว้</p>';
    }

    // Limit action plans
    let actionsHtml = '';
    Array.from(actionPlanList).slice(0, 6).forEach(plan => {
      actionsHtml += `
        <div class="overview-action-item">📌 ${plan}</div>
      `;
    });

    if (!actionsHtml) {
      actionsHtml = '<p class="empty-list-txt">ไม่มีข้อมูลแนวทางการช่วยเหลือที่บันทึกไว้</p>';
    }

    // Build family donut pie conic-gradient
    const cumulative2 = completePercent + separatedPercent;
    const cumulative3 = cumulative2 + relativesPercent;
    const donutGradient = `conic-gradient(
      #2B5EA7 0% ${completePercent}%,
      #5B9BD5 ${completePercent}% ${cumulative2}%,
      #A5C8E1 ${cumulative2}% ${cumulative3}%,
      #E8B54D ${cumulative3}% 100%
    )`;

    // Max count for income bar row rendering
    const maxIncomeCount = Math.max(incomeTier1, incomeTier2, incomeTier3, incomeTier4, 1);

    container.innerHTML = `
      <!-- overview header statistics cards -->
      <div class="overview-stats-grid">
        <div class="overview-stat-card">
          <div class="overview-stat-icon">🏫</div>
          <div class="overview-stat-info">
            <span class="overview-stat-label">ห้องเรียนที่บันทึกแล้ว</span>
            <span class="overview-stat-number">${totalClasses} <span style="font-size:14px; font-weight:500;">ห้อง</span></span>
            <span class="overview-stat-sub">จากจำนวนชั้นทั้งหมด</span>
          </div>
        </div>
        <div class="overview-stat-card">
          <div class="overview-stat-icon">👥</div>
          <div class="overview-stat-info">
            <span class="overview-stat-label">นักเรียนสะสมรวม</span>
            <span class="overview-stat-number">${totalStudents} <span style="font-size:14px; font-weight:500;">คน</span></span>
            <span class="overview-stat-sub">จำนวนนักเรียนทั้งหมด</span>
          </div>
        </div>
        <div class="overview-stat-card" style="border-bottom-color: var(--success-green);">
          <div class="overview-stat-icon" style="background-color:#e8f8f5; color:var(--success-green);">🏡</div>
          <div class="overview-stat-info">
            <span class="overview-stat-label">ดำเนินการเยี่ยมแล้ว</span>
            <span class="overview-stat-number">${totalVisited} <span style="font-size:14px; font-weight:500;">คน</span></span>
            <span class="overview-stat-sub" style="color:var(--success-green);">คิดเป็น ${overallVisitedPercent.toFixed(1)}% ของทั้งหมด</span>
          </div>
        </div>
        <div class="overview-stat-card" style="border-bottom-color: var(--gold-accent);">
          <div class="overview-stat-icon" style="background-color:#fffdf0; color:var(--gold-accent);">💻</div>
          <div class="overview-stat-info">
            <span class="overview-stat-label">เยี่ยมบ้านออนไลน์</span>
            <span class="overview-stat-number">${totalOnline} <span style="font-size:14px; font-weight:500;">คน</span></span>
            <span class="overview-stat-sub" style="color:var(--gold-accent);">คิดเป็น ${overallOnlinePercent.toFixed(1)}% ของที่เยี่ยมแล้ว</span>
          </div>
        </div>
      </div>

      <!-- charts row 1 -->
      <div class="overview-charts-grid">
        <div class="overview-chart-section">
          <h3 class="overview-chart-title">📊 สัดส่วนสถานภาพทางครอบครัวสะสมระดับโรงเรียน</h3>
          <div class="donut-chart-container" style="height: auto; padding: 20px; gap: 24px;">
            <div class="donut-chart" style="width:130px; height:130px; background: ${donutGradient};">
              <div class="donut-hole" style="width:80px; height:80px; top:25px; left:25px;">
                <span class="donut-value" style="font-size:22px;">${completePercent}%</span>
                <span class="donut-label" style="font-size:10px;">อยู่ร่วมกัน</span>
              </div>
            </div>
            <ul class="chart-legend" style="gap: 8px;">
              <li><span class="legend-color" style="background-color:#2B5EA7; width:12px; height:12px;"></span> อยู่ร่วมกัน: ${completePercent}% (${familyComplete} คน)</li>
              <li><span class="legend-color" style="background-color:#5B9BD5; width:12px; height:12px;"></span> หย่าร้าง/แยกกัน: ${separatedPercent}% (${familySeparated} คน)</li>
              <li><span class="legend-color" style="background-color:#A5C8E1; width:12px; height:12px;"></span> อาศัยอยู่กับญาติ: ${relativesPercent}% (${familyWithRelatives} คน)</li>
              <li><span class="legend-color" style="background-color:#E8B54D; width:12px; height:12px;"></span> อื่นๆ: ${otherPercent}% (${familyOther} คน)</li>
            </ul>
          </div>
        </div>

        <div class="overview-chart-section">
          <h3 class="overview-chart-title">💵 ระดับช่วงรายได้เฉลี่ยครอบครัวสะสมระดับโรงเรียน</h3>
          <div class="bar-chart" style="height: auto; padding: 20px; gap: 12px;">
            <div class="bar-row">
              <span class="bar-label" style="width:110px; font-size:11px;">ต่ำกว่า 10,000 บาท</span>
              <div class="bar-track" style="height:18px; border-radius:9px;">
                <div class="bar-fill" style="width: ${(incomeTier1 / maxIncomeCount) * 100}%; border-radius:9px;"></div>
              </div>
              <span class="bar-value" style="width:90px; font-size:11px;">${tier1Percent.toFixed(1)}% (${incomeTier1} คน)</span>
            </div>
            <div class="bar-row">
              <span class="bar-label" style="width:110px; font-size:11px;">10,000 – 30,000 บาท</span>
              <div class="bar-track" style="height:18px; border-radius:9px;">
                <div class="bar-fill" style="width: ${(incomeTier2 / maxIncomeCount) * 100}%; border-radius:9px;"></div>
              </div>
              <span class="bar-value" style="width:90px; font-size:11px;">${tier2Percent.toFixed(1)}% (${incomeTier2} คน)</span>
            </div>
            <div class="bar-row">
              <span class="bar-label" style="width:110px; font-size:11px;">30,000 – 50,000 บาท</span>
              <div class="bar-track" style="height:18px; border-radius:9px;">
                <div class="bar-fill" style="width: ${(incomeTier3 / maxIncomeCount) * 100}%; border-radius:9px;"></div>
              </div>
              <span class="bar-value" style="width:90px; font-size:11px;">${tier3Percent.toFixed(1)}% (${incomeTier3} คน)</span>
            </div>
            <div class="bar-row">
              <span class="bar-label" style="width:110px; font-size:11px;">มากกว่า 50,000 บาท</span>
              <div class="bar-track" style="height:18px; border-radius:9px;">
                <div class="bar-fill" style="width: ${(incomeTier4 / maxIncomeCount) * 100}%; border-radius:9px;"></div>
              </div>
              <span class="bar-value" style="width:90px; font-size:11px;">${tier4Percent.toFixed(1)}% (${incomeTier4} คน)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- charts row 2 -->
      <div class="overview-charts-grid" style="margin-top: 4px;">
        <div class="overview-chart-section">
          <h3 class="overview-chart-title">🚨 5 อันดับประเด็นปัญหาที่พบสะสมมากที่สุดในโรงเรียน</h3>
          <div class="overview-issues-list">
            ${issuesHtml}
          </div>
        </div>

        <div class="overview-chart-section">
          <h3 class="overview-chart-title">🩹 ตัวอย่างมาตรการและการช่วยเหลือเบื้องต้นระดับโรงเรียน</h3>
          <div class="overview-actions-list">
            ${actionsHtml}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Action: Export all reports summary to CSV file
   */
  exportCSV() {
    const activeReports = appState.reports.filter(r => !r.isSample && r.reportId !== 'RPT-SAMPLE55' && !r.isHidden);

    if (activeReports.length === 0) {
      this.showToast('ไม่มีข้อมูลรายงานสำหรับส่งออก', 'error');
      return;
    }

    this.showToast('กำลังสรุปไฟล์ข้อมูล CSV สำหรับ Excel...', 'info');

    // CSV Headers
    const headers = [
      'รหัสรายงาน',
      'วันที่สร้าง',
      'ระดับชั้น',
      'ภาคเรียน',
      'ปีการศึกษา',
      'ครูที่ปรึกษา',
      'นักเรียนทั้งหมด (คน)',
      'เยี่ยมบ้านแล้ว (คน)',
      'เยี่ยมบ้านออนไลน์ (คน)',
      'เยี่ยมบ้านที่บ้าน (คน)',
      'ครอบครัวอยู่ร่วมกัน (คน)',
      'ครอบครัวหย่าร้าง (คน)',
      'ครอบครัวอยู่กับญาติ (คน)',
      'ครอบครัวอื่นๆ (คน)',
      'รายได้ต่ำกว่า 10K (คน)',
      'รายได้ 10K-30K (คน)',
      'รายได้ 30K-50K (คน)',
      'รายได้มากกว่า 50K (คน)',
      'สถานะแดชบอร์ด'
    ];

    // Helper to sanitize field values
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      // Escape double quotes
      str = str.replace(/"/g, '""');
      // Wrap in double quotes if it has comma, quotes or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str}"`;
      }
      return str;
    };

    const csvRows = [];
    csvRows.push(headers.map(escapeCsv).join(','));

    activeReports.forEach(report => {
      const advisors = report.advisorTeachers ? report.advisorTeachers.join(' / ') : '';
      const status = report.isPosted ? 'โพสต์แล้ว (แอดมินดึงได้)' : 'บันทึกในเครื่อง';
      
      const row = [
        report.reportId,
        new Date(report.createdAt).toLocaleDateString('th-TH'),
        report.classLevel,
        report.semester,
        report.academicYear,
        advisors,
        report.totalStudents,
        report.stat_visitedCount,
        report.stat_onlineCount,
        report.stat_inPersonCount,
        report.family_complete.count,
        report.family_separated.count,
        report.family_withRelatives.count,
        report.family_other.count,
        report.incomeRanges[0].count,
        report.incomeRanges[1].count,
        report.incomeRanges[2].count,
        report.incomeRanges[3].count,
        status
      ];
      csvRows.push(row.map(escapeCsv).join(','));
    });

    // Prepend UTF-8 BOM so Excel reads Thai characters correctly
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.setAttribute('download', `สรุปรายงานการเยี่ยมบ้านนักเรียน_โรงเรียนพระโขนงพิทยาลัย.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('ส่งออกตาราง CSV สำเร็จ! สามารถเปิดใน Excel ได้เลย', 'success');
  }
};

// Start the Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
