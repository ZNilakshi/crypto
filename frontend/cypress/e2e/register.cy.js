describe("User Registration Flow", () => {
    beforeEach(() => {
      // baseUrl can be set in cypress.config.js
      cy.visit("/auth/register");
    });
  
    // ✅ SUCCESS FLOW
    it("✅ should register a new user successfully", () => {
      const uniqueId = Date.now(); // ensure uniqueness each run
      cy.get('input[name="fullName"]').type("Test User");
      cy.get('input[name="username"]').type(`user${uniqueId}`);
      cy.get('input[name="email"]').type(`user${uniqueId}@example.com`);
      cy.get('.form-control').type("94712345678");
      cy.get('input[name="password"]').type("StrongPass1!");
      cy.get('input[name="confirmPassword"]').type("StrongPass1!");
      cy.get('input[type="checkbox"]').check();
      cy.contains("SIGN UP").click();
  
      cy.contains("Registration successful", { timeout: 10000 }).should("be.visible");
    });
  
    // ❌ ERROR: Username already exists
    it("❌ should show error if username already exists", () => {
      cy.get('input[name="fullName"]').type("Existing User");
      cy.get('input[name="username"]').type("existinguser"); // must exist in DB beforehand
      cy.get('input[name="email"]').type(`dupe${Date.now()}@example.com`);
      cy.get('.form-control').type("94712345678");
      cy.get('input[name="password"]').type("StrongPass1!");
      cy.get('input[name="confirmPassword"]').type("StrongPass1!");
      cy.get('input[type="checkbox"]').check();
      cy.contains("SIGN UP").click();
  
      cy.contains("Username already exists", { timeout: 5000 }).should("be.visible");
    });
  
    // ❌ ERROR: Email already registered
    it("❌ should show error if email is already registered", () => {
      cy.get('input[name="fullName"]').type("Duplicate Email User");
      cy.get('input[name="username"]').type(`unique${Date.now()}`);
      cy.get('input[name="email"]').type("testuse8r123@example.com"); // existing email
      cy.get('.form-control').type("94712345678");
      cy.get('input[name="password"]').type("StrongPass1!");
      cy.get('input[name="confirmPassword"]').type("StrongPass1!");
      cy.get('input[type="checkbox"]').check();
      cy.contains("SIGN UP").click();
  
      cy.contains("Email already registered", { timeout: 5000 }).should("be.visible");
    });
  
    // ❌ ERROR: Weak password
    it("❌ should reject weak password", () => {
      cy.get('input[name="fullName"]').type("Weak Password User");
      cy.get('input[name="username"]').type(`weak${Date.now()}`);
      cy.get('input[name="email"]').type(`weak${Date.now()}@example.com`);
      cy.get('.form-control').type("94712345678");
      cy.get('input[name="password"]').type("123");
      cy.get('input[name="confirmPassword"]').type("123");
      cy.get('input[type="checkbox"]').check();
      cy.contains("SIGN UP").click();
  
      cy.contains("Password must be at least", { timeout: 5000 }).should("be.visible");
    });
  
    // ❌ ERROR: Invalid email
    it("❌ should reject invalid email format", () => {
      cy.get('input[name="fullName"]').type("Invalid Email User");
      cy.get('input[name="username"]').type(`invalid${Date.now()}`);
      cy.get('input[name="email"]').type("invalidemail"); // bad email
      cy.get('.form-control').type("94712345678");
      cy.get('input[name="password"]').type("StrongPass1!");
      cy.get('input[name="confirmPassword"]').type("StrongPass1!");
      cy.get('input[type="checkbox"]').check();
      cy.contains("SIGN UP").click();
  
      cy.contains("Invalid email", { timeout: 5000 }).should("be.visible");
    });
  
    // ❌ ERROR: Password mismatch
    it("❌ should reject mismatched confirm password", () => {
      cy.get('input[name="fullName"]').type("Mismatch Password User");
      cy.get('input[name="username"]').type(`mismatch${Date.now()}`);
      cy.get('input[name="email"]').type(`mismatch${Date.now()}@example.com`);
      cy.get('.form-control').type("94712345678");
      cy.get('input[name="password"]').type("StrongPass1!");
      cy.get('input[name="confirmPassword"]').type("WrongPass1!");
      cy.get('input[type="checkbox"]').check();
      cy.contains("SIGN UP").click();
  
      cy.contains("Passwords do not match", { timeout: 5000 }).should("be.visible");
    });
  
    // ❌ ERROR: Terms not accepted
    it("❌ should block registration if terms not accepted", () => {
      cy.get('input[name="fullName"]').type("No Terms User");
      cy.get('input[name="username"]').type(`noterms${Date.now()}`);
      cy.get('input[name="email"]').type(`noterms${Date.now()}@example.com`);
      cy.get('.form-control').type("94712345678");
      cy.get('input[name="password"]').type("StrongPass1!");
      cy.get('input[name="confirmPassword"]').type("StrongPass1!");
      // 🚫 do NOT check terms
      cy.contains("SIGN UP").click();
  
      cy.contains("You must agree to the terms", { timeout: 5000 }).should("be.visible");
    });
  
    // 📧 BACKEND: Email verification (mocked)
    it("📧 should verify email via backend API", () => {
      cy.request("POST", "http://localhost:5000/api/auth/verify-email", {
        idToken: "FAKE_FIREBASE_ID_TOKEN"
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.message).to.include("Email verified");
      });
    });
  });
  