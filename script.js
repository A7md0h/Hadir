// تهيئة Firebase - تأكد من استخدام التهيئة الصحيحة هنا
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

    // تحديد الشعب بناءً على الصف المختار
    let classes = [];
    switch (selectedGrade) {
        case '5':
            classes = ['خامس 1', 'خامس 2', 'خامس 3', 'خامس 4'];
            break;
        case '6':
            classes = ['سادس 1', 'سادس 2', 'سادس 3', 'سادس 4', 'سادس 5'];
            break;
        case '7':
            classes = ['سابع 1', 'سابع 2', 'سابع 3', 'سابع 4', 'سابع 5'];
            break;
        case '8':
            classes = ['ثامن 1', 'ثامن 2', 'ثامن 3', 'ثامن 4'];
            break;
        case '9':
            classes = ['تاسع 1', 'تاسع 2', 'تاسع 3', 'تاسع 4'];
            break;
        default:
            classes = []; // إذا لم يتم اختيار صف صحيح
            break;
    }

    // إضافة الخيارات للشعب في القائمة
    classes.forEach((classItem) => {
        const option = document.createElement('option');
        option.value = classItem;
        option.textContent = classItem;
        classSelect.appendChild(option);
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
