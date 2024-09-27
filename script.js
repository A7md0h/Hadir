// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBDwsgFvH_iffHcEb4RktjQXJi-s3cD830",
    authDomain: "hadir-fe761.firebaseapp.com",
    projectId: "hadir-fe761",
    storageBucket: "hadir-fe761.appspot.com",
    messagingSenderId: "531964326507",
    appId: "1:531964326507:web:eae0e02d06941ad1f0372e"
};

// اختبار كتابة بيانات إلى Firestore
db.collection('test').add({
    testField: 'Hello, Firestore!',
    timestamp: new Date()
})
.then((docRef) => {
    console.log('تم كتابة البيانات بنجاح إلى Firestore! معرف الوثيقة:', docRef.id);
})
.catch((error) => {
    console.error('حدث خطأ أثناء كتابة البيانات إلى Firestore:', error);
});


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

// تحويل الصف إلى الصيغة المطابقة في قاعدة البيانات
function getGradeName(selectedGrade) {
    switch(selectedGrade) {
        case '5': return 'خامس';
        case '6': return 'سادس';
        case '7': return 'سابع';
        case '8': return 'ثامن';
        case '9': return 'تاسع';
        default: return '';
    }
}

// تفعيل اختيار الشعبة بناءً على الصف المحدد
gradeSelect.addEventListener('change', () => {
    const selectedGrade = gradeSelect.value;
    classSelect.disabled = true; // تعطيل اختيار الشعبة حتى يتم تحديد الصف
    classSelect.innerHTML = '<option value="">-- اختر الشعبة --</option>';
    studentsTableBody.innerHTML = ''; // تفريغ جدول الطلاب

    if (!selectedGrade) {
        console.log("لم يتم اختيار صف بعد.");
        return;
    }

    console.log(`تم اختيار الصف: ${selectedGrade}`);

    // تحويل الصف إلى الصيغة المطابقة في قاعدة البيانات
    const gradeName = getGradeName(selectedGrade);
    if (!gradeName) {
        console.log("لم يتم التعرف على الصف المختار.");
        return;
    }

    // جلب جميع الشعب من Firestore بناءً على الصف المختار
    db.collection('classes').where(firebase.firestore.FieldPath.documentId(), '>=', gradeName).where(firebase.firestore.FieldPath.documentId(), '<=', gradeName + '\uf8ff').get()
        .then((querySnapshot) => {
            let classCount = 0; // عداد للتحقق من وجود الشعب
            querySnapshot.forEach((doc) => {
                const className = doc.id;
                // التحقق من أن الشعبة تتطابق مع الصف المختار
                if (className.startsWith(gradeName)) {
                    classCount++;
                    const option = document.createElement('option');
                    option.value = className;
                    option.textContent = className;
                    classSelect.appendChild(option);
                    console.log(`تمت إضافة الشعبة: ${className}`);
                }
            });
            // إذا لم يتم العثور على شعب، يجب تعطيل القائمة
            if (classCount === 0) {
                classSelect.disabled = true;
                console.log("لا توجد شعب لهذا الصف.");
                showAlert('لا توجد شعب متاحة لهذا الصف.');
            } else {
                classSelect.disabled = false; // تفعيل اختيار الشعبة إذا كانت الشعب موجودة
            }
        })
        .catch((error) => {
            console.error("حدث خطأ أثناء جلب الشعب:", error);
            showAlert('حدث خطأ أثناء جلب الشعب. تحقق من الاتصال.');
            classSelect.disabled = true; // تعطيل القائمة في حالة حدوث خطأ
        });
});

// عرض أسماء الطلاب عند اختيار الشعبة
classSelect.addEventListener('change', () => {
    const selectedClass = classSelect.value;
    studentsTableBody.innerHTML = ''; // تفريغ جدول الطلاب

    if (!selectedClass) {
        console.log("لم يتم اختيار شعبة بعد.");
        return;
    }

    console.log(`تم اختيار الشعبة: ${selectedClass}`);

    // جلب أسماء الطلاب من Firestore
    db.collection('classes').doc(selectedClass).get().then((doc) => {
        if (doc.exists) {
            const students = doc.data().students;
            console.log(`تم جلب بيانات الطلاب: ${students}`);
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

    if (attendanceData.length === 0) {
        showAlert('يرجى تحديد حضور أو غياب للطلاب.');
        return;
    }

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
