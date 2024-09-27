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

// عرض رسالة تحذير في حالة حدوث خطأ
function showAlert(message) {
    alert(message);
    console.error(message);
}

// تفعيل اختيار الشعبة بناءً على الصف المحدد
gradeSelect.addEventListener('change', () => {
    const selectedGrade = gradeSelect.value;
    if (!selectedGrade) {
        classSelect.disabled = true;
        classSelect.innerHTML = '<option value="">-- اختر الشعبة --</option>';
        console.log("لم يتم اختيار صف بعد.");
        return;
    }

    // إفراغ القائمة وإعادة تهيئتها
    classSelect.disabled = false; // تفعيل اختيار الشعبة
    classSelect.innerHTML = '<option value="">-- اختر الشعبة --</option>';
    console.log(`تم اختيار الصف: ${selectedGrade}`);

    // جلب جميع الشعب من Firestore
    db.collection('classes').get().then((querySnapshot) => {
        let classCount = 0; // عداد للتحقق من وجود الشعب
        querySnapshot.forEach((doc) => {
            const className = doc.id;
            // التحقق من أن الشعبة تتبع الصف المحدد
            // إذا كانت الشعب مسماة مثل "خامس/1" تأكد من توافقها
            const gradePart = className.split('/')[0]; // فصل جزء الصف من اسم الشعبة
            if (gradePart === selectedGrade || className.startsWith(selectedGrade)) {
                classCount++;
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                classSelect.appendChild(option);
                console.log(`تمت إضافة الشعبة: ${className}`);
            } else {
                console.log(`الشعبة: ${className} لا تتطابق مع الصف: ${selectedGrade}`);
            }
        });
        // إذا لم يتم العثور على شعب، يجب تعطيل القائمة
        if (classCount === 0) {
            classSelect.disabled = true;
            console.log("لا توجد شعب لهذا الصف.");
            showAlert('لا توجد شعب متاحة لهذا الصف.');
        }
    }).catch((error) => {
        console.error("حدث خطأ أثناء جلب الشعب:", error);
        showAlert('حدث خطأ أثناء جلب الشعب. تحقق من الاتصال.');
        classSelect.disabled = true; // تعطيل القائمة في حالة حدوث خطأ
    });
});

// عرض أسماء الطلاب عند اختيار الشعبة
classSelect.addEventListener('change', () => {
    const selectedClass = classSelect.value;
    if (!selectedClass) {
        studentsTableBody.innerHTML = '';
        console.log("لم يتم اختيار شعبة بعد.");
        return;
    }

    console.log(`تم اختيار الشعبة: ${selectedClass}`);

    // جلب أسماء الطلاب من Firestore
    db.collection('classes').doc(selectedClass).get().then((doc) => {
        if (doc.exists) {
            const students = doc.data().students;
            console.log(`تم جلب بيانات الطلاب: ${students}`);
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
            console.log("لا توجد بيانات للطلاب في هذه الشعبة.");
            studentsTableBody.innerHTML = '<tr><td colspan="3">لا توجد بيانات للطلاب في هذه الشعبة.</td></tr>';
        }
    }).catch((error) => {
        console.error("حدث خطأ أثناء جلب بيانات الطلاب:", error);
        showAlert('حدث خطأ أثناء جلب بيانات الطلاب. تحقق من الاتصال.');
    });
});

// حفظ الحضور والغياب
saveAttendanceButton.addEventListener('click', () => {
    const selectedGrade = gradeSelect.value;
    const selectedClass = classSelect.value;
    const selectedPeriod = periodSelect.value;

    if (!selectedGrade || !selectedClass || !selectedPeriod) {
        showAlert('يرجى اختيار الصف والشعبة والحصة.');
        return;
    }

    console.log(`حفظ الحضور للصف: ${selectedGrade}، الشعبة: ${selectedClass}، الحصة: ${selectedPeriod}`);

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
        showAlert('تم حفظ الحضور بنجاح!');
    }).catch((error) => {
        console.error("حدث خطأ أثناء حفظ البيانات:", error);
        showAlert('تعذر حفظ الحضور، تحقق من الاتصال بـ Firestore.');
    });
});
