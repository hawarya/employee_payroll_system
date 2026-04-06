(async () => {
  try {
    console.log("Testing API workflows...");
    
    // 1. Signup Admin
    let res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST', body: JSON.stringify({ employeeId: 'admin_test1', name: 'Admin Test', password: 'password' }),
        headers: {'Content-Type': 'application/json'}
    });
    if (res.ok) console.log("✅ Admin signed up successfully.");
    else console.log("Admin might already exist: " + (await res.json()).message);
    
    // 2. Login Admin
    res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST', body: JSON.stringify({ employeeId: 'admin_test1', password: 'password' }),
        headers: {'Content-Type': 'application/json'}
    });
    let data = await res.json();
    const adminToken = data.token;
    console.log("✅ Admin logged in. Roles assigned:", data.roles);
    
    // 3. Signup Employee
    res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST', body: JSON.stringify({ employeeId: 'EMP_001', name: 'Emp Test', password: 'password' }),
        headers: {'Content-Type': 'application/json'}
    });
    if (res.ok) console.log("✅ Employee signed up successfully.");
    else console.log("Employee might already exist: " + (await res.json()).message);
    
    // 4. Login Employee
    res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST', body: JSON.stringify({ employeeId: 'EMP_001', password: 'password' }),
        headers: {'Content-Type': 'application/json'}
    });
    data = await res.json();
    const empToken = data.token;
    console.log("✅ Employee logged in. Roles assigned:", data.roles);
    
    // 5. Admin accesses full employees
    res = await fetch('http://localhost:8080/api/employees', { headers: { Authorization: `Bearer ${adminToken}` }});
    if (res.ok) {
        let dir = await res.json();
        console.log("✅ Admin accessed directory. Responds OK.");
    } else {
        console.log("Admin could not access directory", res.status);
    }
    
    // 6. Employee tries to access full directory (should be blocked)
    res = await fetch('http://localhost:8080/api/employees', { headers: { Authorization: `Bearer ${empToken}` }});
    if (res.ok) {
        console.log("❌ ERROR: Employee successfully accessed the full directory!");
    } else {
        console.log("✅ Employee blocked from full directory access (Status " + res.status + ")");
    }

  } catch(e) {
    console.error("Test blocked by unexpected error:", e.message);
  }
})();
