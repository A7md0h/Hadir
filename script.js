// تهيئة Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// الحصول على العناصر
const gradeSelect = document.getElementById('grade-select');
const classSelect = document.getElementById('class-select');
const periodSelect = document.getElementById('period-select');
const studentsTableBody = document.getElementById('students-table').querySelector('tbody');
const saveAttendanceButton = document.getElementById('save-attendance');

// عند تغيير الصف، تحديث الشُعب
gradeSelect.addEventListener('change', function() {
    const selectedGrade = gradeSelect.value;
    classSelect.innerHTML = '<option value="">-- اختر الشعبة --</option>';
    studentsTableBody.innerHTML = ''; // مسح الجدول

    if (selectedGrade) {
        classSelect.disabled = false;
        const classKeys = Object.keys(studentsData).filter(classKey => classKey.startsWith(selectedGrade));
        classKeys.forEach(classKey => {
            const option = document.createElement('option');
            option.value = classKey;
            option.textContent = classKey;
            classSelect.appendChild(option);
        });
    } else {
        classSelect.disabled = true;
    }
});

// عند تغيير الشعبة، عرض أسماء الطلاب
classSelect.addEventListener('change', function() {
    const selectedClass = classSelect.value;
    studentsTableBody.innerHTML = ''; // مسح الجدول

    if (selectedClass && studentsData[selectedClass]) {
        studentsData[selectedClass].forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student}</td>
                <td><input type="radio" name="attendance-${index}" value="حضور"></td>
                <td><input type="radio" name="attendance-${index}" value="غياب"></td>
            `;
            studentsTableBody.appendChild(row);
        });
    }
});

// حفظ بيانات الحضور في Firebase
saveAttendanceButton.addEventListener('click', function() {
    const selectedGrade = gradeSelect.value;
    const selectedClass = classSelect.value;
    const selectedPeriod = periodSelect.value;

    if (!selectedGrade || !selectedClass || !selectedPeriod) {
        alert('يرجى اختيار الصف والشعبة والحصة.');
        return;
    }

    const attendanceData = [];
    const rows = studentsTableBody.querySelectorAll('tr');

    rows.forEach((row, index) => {
        const studentName = row.querySelector('td').textContent;
        const attendance = row.querySelector(`input[name="attendance-${index}"]:checked`);
        if (attendance) {
            attendanceData.push({
                name: studentName,
                attendance: attendance.value
            });
        }
    });

    if (attendanceData.length === 0) {
        alert('يرجى تحديد حضور أو غياب للطلاب.');
        return;
    }

    db.collection("attendance").add({
        grade: selectedGrade,
        class: selectedClass,
        period: selectedPeriod,
        students: attendanceData,
        timestamp: new Date()
    }).then(() => {
        alert('تم حفظ الحضور بنجاح!');
    }).catch((error) => {
        console.error("حدث خطأ أثناء حفظ البيانات:", error);
        alert('تعذر حفظ الحضور، تحقق من الاتصال بـ Firebase.');
    });
});
