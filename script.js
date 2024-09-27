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

// تهيئة Firestore
const db = firebase.firestore();

// بيانات الشعب لكل صف
var classSections = {
    '5': ['5/1', '5/2', '5/3', '5/4'],
    '6': ['6/1', '6/2', '6/3', '6/4', '6/5'],
    '7': ['7/1', '7/2', '7/3', '7/4', '7/5'],
    '8': ['8/1', '8/2', '8/3', '8/4'],
    '9': ['9/1', '9/2', '9/3', '9/4']
};

// بيانات الطلاب لكل شعبة
var studentsData = {
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

// التأكد من تحميل جميع العناصر بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحديد العناصر من الصفحة داخل DOMContentLoaded
    var gradeSelect = document.getElementById('grade-select');
    var classSelect = document.getElementById('class-select');
    var periodSelect = document.getElementById('period-select');
    var studentsTableBody = document.getElementById('students-table').querySelector('tbody');

    // التأكد من وجود العناصر
    if (!gradeSelect || !classSelect || !studentsTableBody) {
        alert('هناك مشكلة في تحميل العناصر، تأكد من أن جميع العناصر موجودة وتستخدم الأسماء الصحيحة.');
        return;
    }
    
    // التأكد من وجود خيارات في القوائم المنسدلة
    gradeSelect.addEventListener('change', function() {
        var selectedGrade = this.value;
        classSelect.innerHTML = '<option value="">-- اختر الشعبة --</option>';
        studentsTableBody.innerHTML = '';

        if (selectedGrade) {
            classSelect.disabled = false;
            var sections = classSections[selectedGrade];
            sections.forEach(function(section) {
                var option = document.createElement('option');
                option.value = section;
                option.textContent = section;
                classSelect.appendChild(option);
            });
        } else {
            classSelect.disabled = true;
        }
    });

    // عند اختيار الشعبة
    classSelect.addEventListener('change', function() {
        var selectedClass = this.value;
        loadStudents(selectedClass);
    });

    // تحميل الطلاب بناءً على الشعبة المختارة
    function loadStudents(classId) {
        studentsTableBody.innerHTML = ''; // مسح الجدول

        var students = studentsData[classId];
        if (!students) {
            alert('لا توجد بيانات لهذه الشعبة.');
            return;
        }

        students.forEach(function(studentName, index) {
            var row = document.createElement('tr');
            var nameCell = document.createElement('td');
            nameCell.textContent = studentName;

            var presentCell = document.createElement('td');
            var presentInput = document.createElement('input');
            presentInput.type = 'radio';
            presentInput.name = 'attendance-' + index;
            presentInput.value = 'present';
            presentInput.checked = true; // بشكل افتراضي حاضر
            presentCell.appendChild(presentInput);

            var absentCell = document.createElement('td');
            var absentInput = document.createElement('input');
            absentInput.type = 'radio';
            absentInput.name = 'attendance-' + index;
            absentInput.value = 'absent';
            absentCell.appendChild(absentInput);

            row.appendChild(nameCell);
            row.appendChild(presentCell);
            row.appendChild(absentCell);
            studentsTableBody.appendChild(row);
        });
    }

    // الدالة لحفظ الحضور
    document.getElementById('save-attendance').addEventListener('click', async function() {
        var selectedGrade = gradeSelect.value;
        var selectedClass = classSelect.value;
        var selectedPeriod = periodSelect.value;

        if (!selectedGrade || !selectedClass || !selectedPeriod) {
            alert('يرجى اختيار الصف والشعبة والحصة.');
            return;
        }

        var rows = studentsTableBody.querySelectorAll('tr');
        var attendanceData = [];

        rows.forEach(function(row, index) {
            var studentName = row.querySelector('td').textContent;
            var attendance = row.querySelector('input[name="attendance-' + index + '"]:checked').value;
            attendanceData.push({
                name: studentName,
                attendance: attendance
            });
        });

        // حفظ البيانات في Firestore
        try {
            await db.collection("attendance").add({
                grade: selectedGrade,
                class: selectedClass,
                period: selectedPeriod,
                students: attendanceData,
                timestamp: new Date()
            });
            alert('تم حفظ الحضور بنجاح في Firestore!');
        } catch (error) {
            console.error("خطأ أثناء حفظ البيانات: ", error);
            alert('تعذر حفظ الحضور، تحقق من الاتصال بـ Firestore.');
        }
    });
});
