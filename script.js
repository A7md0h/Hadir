// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBDwsgFvH_iffHcEb4RktjQXJi-s3cD830",
    authDomain: "hadir-fe761.firebaseapp.com",
    projectId: "hadir-fe761",
    storageBucket: "hadir-fe761.appspot.com",
    messagingSenderId: "531964326507",
    appId: "1:531964326507:web:eae0e02d06941ad1f0372e"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// الحصول على عناصر HTML
const gradeSelect = document.getElementById('grade-select');
const classSelect = document.getElementById('class-select');
const periodSelect = document.getElementById('period-select');
const studentsTableBody = document.getElementById('students-table').querySelector('tbody');
const saveAttendanceButton = document.getElementById('save-attendance');

// تفعيل اختيار الشعبة بناءً على الصف المحدد
gradeSelect.addEventListener('change', () => {
    const selectedGrade = gradeSelect.value;
    if (!selectedGrade) {
        classSelect.disabled = true;
        classSelect.innerHTML = '<option value="">-- اختر الشعبة --</option>';
        return;
    }

    // إفراغ القائمة وإعادة تهيئتها
    classSelect.disabled = false;
    classSelect.innerHTML = '<option value="">-- اختر الشعبة --</option>';

    // جلب جميع الشعب من Firestore
    db.collection('classes').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const className = doc.id;
            // التحقق من أن الشعبة تتبع الصف المحدد
            if (className.startsWith(selectedGrade)) {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                classSelect.appendChild(option);
            }
        });
    }).catch((error) => {
        console.error("حدث خطأ أثناء جلب الشعب:", error);
    });
});

// عرض أسماء الطلاب عند اختيار الشعبة
classSelect.addEventListener('change', () => {
    const selectedClass = classSelect.value;
    if (!selectedClass) {
        studentsTableBody.innerHTML = '';
        return;
    }

    // جلب أسماء الطلاب من Firestore
    db.collection('classes').doc(selectedClass).get().then((doc) => {
        if (doc.exists) {
            const students = doc.data().students;
            studentsTableBody.innerHTML = '';
            students.forEach((student, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student}</td>
                    <td><input type="radio" name="attendance-${index}" value="حضور" required></td>
                    <td><input type="radio" name="attendance-${index}" value="غياب" required></td>
                `;
                studentsTableBody.appendChild(row);
            });
        } else {
            studentsTableBody.innerHTML = '<tr><td colspan="3">لا توجد بيانات للطلاب في هذه الشعبة.</td></tr>';
        }
    }).catch((error) => {
        console.error("حدث خطأ أثناء جلب البيانات:", error);
    });
});

// حفظ الحضور والغياب
saveAttendanceButton.addEventListener('click', () => {
    const selectedGrade = gradeSelect.value;
    const selectedClass = classSelect.value;
    const selectedPeriod = periodSelect.value;

    if (!selectedGrade || !selectedClass || !selectedPeriod) {
        alert('يرجى اختيار الصف والشعبة والحصة.');
        return;
    }

    const rows = studentsTableBody.querySelectorAll('tr');
    const attendanceData = [];

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

    // رفع البيانات إلى Firestore
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
        alert('تعذر حفظ الحضور، تحقق من الاتصال بـ Firestore.');
    });
});
