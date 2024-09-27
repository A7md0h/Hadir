// بيانات الطلاب والشعب مدمجة في الكود
const studentsData = {
    '5/1': ['أحمد بن علي', 'محمد بن سالم', 'سعيد بن خالد'],
    '5/2': ['علي بن أحمد', 'خالد بن حسن', 'ياسر بن حمد'],
    '5/3': ['سالم بن محمد', 'ناصر بن سعيد', 'سيف بن علي'],
    '5/4': ['هاني بن عبدالله', 'ماجد بن سعيد', 'عبدالله بن ناصر'],
    '6/1': ['خالد بن حمد', 'سالم بن حسن', 'محمد بن سيف'],
    '6/2': ['ياسر بن سالم', 'سعيد بن علي', 'ناصر بن خالد'],
    '6/3': ['أحمد بن سعيد', 'علي بن ماجد', 'عبدالله بن سالم'],
    '6/4': ['محمد بن علي', 'عبدالله بن خالد', 'سعيد بن حسن'],
    '6/5': ['حسن بن سالم', 'ماجد بن علي', 'خالد بن ياسر'],
    '7/1': ['محمد بن حمد', 'علي بن سعيد', 'سالم بن ماجد'],
    '7/2': ['عبدالله بن خالد', 'سعيد بن سالم', 'ماجد بن حمد'],
    '7/3': ['خالد بن ياسر', 'حسن بن علي', 'سيف بن عبدالله'],
    '7/4': ['ناصر بن محمد', 'سعيد بن حسن', 'عبدالله بن ماجد'],
    '7/5': ['علي بن سالم', 'سالم بن حسن', 'خالد بن علي'],
    '8/1': ['محمد بن علي', 'سعيد بن حمد', 'ياسر بن خالد'],
    '8/2': ['عبدالله بن سالم', 'حسن بن علي', 'ماجد بن خالد'],
    '8/3': ['علي بن ماجد', 'سيف بن عبدالله', 'خالد بن حسن'],
    '8/4': ['ياسر بن سعيد', 'محمد بن سالم', 'عبدالله بن حمد'],
    '9/1': ['ناصر بن علي', 'سعيد بن خالد', 'محمد بن عبدالله'],
    '9/2': ['عبدالله بن محمد', 'خالد بن سعيد', 'سالم بن ماجد'],
    '9/3': ['علي بن خالد', 'سعيد بن ماجد', 'محمد بن علي'],
    '9/4': ['خالد بن سالم', 'حسن بن عبدالله', 'ماجد بن سعيد']
};

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
    saveAttendanceButton.disabled = true; // تعطيل زر الحفظ حتى يتم اختيار شعبة

    if (selectedGrade) {
        const classKeys = Object.keys(studentsData).filter(classKey => classKey.startsWith(selectedGrade + '/'));
        
        if (classKeys.length > 0) {
            classKeys.forEach(classKey => {
                const option = document.createElement('option');
                option.value = classKey;
                option.textContent = classKey;
                classSelect.appendChild(option);
            });
            classSelect.disabled = false; // تفعيل اختيار الشعبة
        } else {
            alert('لا توجد شعب متاحة لهذا الصف.');
        }
    } else {
        classSelect.disabled = true; // تعطيل اختيار الشعبة إذا لم يتم اختيار الصف
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
                <td><input type="radio" name="attendance-${index}" value="حضور" checked></td>
                <td><input type="radio" name="attendance-${index}" value="غياب"></td>
            `;
            studentsTableBody.appendChild(row);
        });
        saveAttendanceButton.disabled = false; // تفعيل زر الحفظ عند وجود طلاب
    } else {
        studentsTableBody.innerHTML = '<tr><td colspan="3">لا توجد بيانات للطلاب في هذه الشعبة.</td></tr>';
        saveAttendanceButton.disabled = true; // تعطيل زر الحفظ إذا لم توجد بيانات للطلاب
    }
});

// حفظ بيانات الحضور في Firebase
saveAttendanceButton.addEventListener('click', async function() {
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

    // إضافة سجلات لتحديد البيانات قبل الحفظ
    console.log("محاولة حفظ البيانات:", {
        grade: selectedGrade,
        class: selectedClass,
        period: selectedPeriod,
        students: attendanceData
    });

    try {
        await addDoc(collection(db, "attendance"), {
            grade: selectedGrade,
            class: selectedClass,
            period: selectedPeriod,
            students: attendanceData,
            timestamp: new Date()
        });
        alert('تم حفظ الحضور بنجاح!');
    } catch (error) {
        console.error("حدث خطأ أثناء حفظ البيانات:", error);
        alert('تعذر حفظ الحضور، تحقق من الاتصال بـ Firebase.');
    }
});
