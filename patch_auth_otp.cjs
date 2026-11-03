const fs = require('fs');
const path = require('path');

// 1. Patch src/app/auth/page.tsx
const authPagePath = path.join(__dirname, 'src', 'app', 'auth', 'page.tsx');
let authContent = fs.readFileSync(authPagePath, 'utf8');

// Replace handleSignupSubmit
authContent = authContent.replace(
  /const handleSignupSubmit = async \(e: FormEvent\) => \{[\s\S]*?const handlePasswordLoginSubmit = async \(e: FormEvent\) => \{/,
  `const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setOtpCode("");

    try {
      if (roleMode === "customer") {
        if (customerPassword && customerPassword.length < 6) {
          setError("Password must be at least 6 characters long.");
          setSubmitting(false);
          return;
        }
        if (customerPassword && customerPassword !== customerConfirmPassword) {
          setError("Passwords do not match. Please re-enter your password.");
          setSubmitting(false);
          return;
        }

        const cleanEmail = customerEmail.trim().toLowerCase();
        try {
          await customerSignup({
            name: customerName.trim(),
            email: cleanEmail,
            password: customerPassword.trim() || undefined,
          });

          // Mandatory OTP verification step
          setOtpIdentifier(cleanEmail);
          setOtpSourceTab("signup");
          setOtpSent(true);
          setOtpCooldown(60);
          setOtpCode("");
          setTab("otp");
          setOtpStatusMsg({
            type: "success",
            text: \`6-digit verification code sent to \${cleanEmail}. Please enter the code from your email to activate your account.\`,
          });
        } catch (apiErr: any) {
          setError(getErrorMessage(apiErr));
        }
      } else {
        // Vendor Signup
        if (vendorPassword && vendorPassword.length < 6) {
          setError("Password must be at least 6 characters long.");
          setSubmitting(false);
          return;
        }
        if (vendorPassword && vendorPassword !== vendorConfirmPassword) {
          setError("Passwords do not match. Please re-enter your password.");
          setSubmitting(false);
          return;
        }

        const cleanEmail = vendorEmail.trim().toLowerCase();
        try {
          await vendorSignup({
            shop_name: vendorShopName.trim(),
            category: vendorCategory,
            email: cleanEmail,
            phone_number: vendorPhone.trim(),
            upi_id: vendorUpiId.trim() || undefined,
            password: vendorPassword.trim() || undefined,
            photo_url: vendorPhotoUrl || "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800",
            document_url: vendorDocUrl || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800",
            address: vendorAddress.trim() || undefined,
            latitude: vendorLat,
            longitude: vendorLng,
          });

          // Mandatory OTP verification step
          setOtpIdentifier(cleanEmail);
          setOtpSourceTab("signup");
          setOtpSent(true);
          setOtpCooldown(60);
          setOtpCode("");
          setTab("otp");
          setOtpStatusMsg({
            type: "success",
            text: \`Shop registered! 6-digit verification code sent to \${cleanEmail}. Please enter the code to activate your shop.\`,
          });
        } catch (apiErr: any) {
          setError(getErrorMessage(apiErr));
        }
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordLoginSubmit = async (e: FormEvent) => {`
);

// Replace handleVerifyOtpSubmit
authContent = authContent.replace(
  /const handleVerifyOtpSubmit = async \(e: FormEvent\) => \{[\s\S]*?const handleSignupSubmit = async \(e: FormEvent\) => \{/,
  `const handleVerifyOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    setError("");
    setVerifyingOtpLoading(true);
    try {
      const isVendorMode = roleMode === "vendor";
      const nameToSend = isVendorMode ? vendorShopName.trim() : customerName.trim();
      const res = await verifyOtp(
        otpIdentifier.trim(),
        otpCode.trim(),
        nameToSend || undefined,
        isVendorMode
      );
      
      const actualRole = res.user.role === "ADMIN" ? "admin" : (res.user.role === "VENDOR" || res.user.is_shop_owner) ? "vendor" : "customer";
      if (roleMode === "customer" && actualRole === "vendor") {
        setError("This email is registered as a Merchant/Vendor account. Please switch to Vendor to sign in.");
        return;
      }
      if (roleMode === "vendor" && actualRole === "customer") {
        setError("This email is registered as a Shopper/Customer account. Please switch to Customer to sign in.");
        return;
      }

      loginUser(res.user, res.access_token);

      if (res.user.role === "ADMIN") {
        router.replace("/admin");
      } else if (res.user.role === "VENDOR" || res.user.is_shop_owner) {
        router.replace("/shop");
      } else {
        router.replace("/deals");
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setVerifyingOtpLoading(false);
    }
  };

  const handleSignupSubmit = async (e: FormEvent) => {`
);

// Replace handlePasswordLoginSubmit catch block
authContent = authContent.replace(
  /\} else \{\s*\/\/ Any connection error \/ offline backend on Vercel automatically signs in[\s\S]*?loginUser\(fallbackUser, "offline-demo-token-" \+ Date\.now\(\)\);\s*if \(role === "ADMIN"\) router\.replace\("\/admin"\);\s*else if \(role === "VENDOR"\) router\.replace\("\/shop"\);\s*else router\.replace\("\/deals"\);\s*\}/,
  `} else {
        setError(errMsg);
      }`
);

// Replace handleQuickLogin catch block
authContent = authContent.replace(
  /\} catch \(err: unknown\) \{\s*\/\/ Offline fallback[\s\S]*?loginUser\(fallbackUser, "offline-quick-token-" \+ Date\.now\(\)\);\s*if \(role === "ADMIN"\) router\.replace\("\/admin"\);\s*else if \(role === "VENDOR"\) router\.replace\("\/shop"\);\s*else router\.replace\("\/deals"\);\s*\}/,
  `} catch (err: unknown) {
      setError(getErrorMessage(err));
    }`
);

// Replace handleSendOtp
authContent = authContent.replace(
  /const handleSendOtp = async \(targetId\?: string\) => \{[\s\S]*?const handleVerifyOtpSubmit = async \(e: FormEvent\) => \{/,
  `const handleSendOtp = async (targetId?: string) => {
    const idToSend = (targetId || otpIdentifier || loginEmail).trim();
    if (!idToSend) {
      setError("Please enter your email address to receive an OTP code.");
      return;
    }
    setError("");
    setSendingOtp(true);
    setOtpStatusMsg(null);
    setOtpCode("");
    try {
      await sendOtp(idToSend);
      setOtpIdentifier(idToSend);
      setOtpSent(true);
      setOtpCooldown(60);
      setTab("otp");
      setOtpCode("");
      setOtpStatusMsg({
        type: "success",
        text: \`6-digit verification code sent to \${idToSend}.\`,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: FormEvent) => {`
);

fs.writeFileSync(authPagePath, authContent, 'utf8');
console.log('1. Updated src/app/auth/page.tsx with genuine OTP generation and verification flow');

// 2. Patch backend/routers/auth.py
const backendAuthPath = path.join(__dirname, 'backend', 'routers', 'auth.py');
let backendContent = fs.readFileSync(backendAuthPath, 'utf8');

// Line 311: Set email_verified=False initially
backendContent = backendContent.replace(
  /email_verified=True,\s*\n\s*\)\s*\n\s*db\.add\(user\)/,
  `email_verified=False,\n        )\n        db.add(user)`
);

// In login: require email verification for ALL roles
backendContent = backendContent.replace(
  /# Verification enforcement: ONLY for Vendor accounts[\s\S]*?detail="Vendor account requires email verification\. We have dispatched a 6-digit verification code to your email\."\s*\)/,
  `# Verification enforcement: Require email verification for all accounts
    if not getattr(user, "email_verified", False):
        try:
            send_otp_to_identifier(user.email, name=user.name)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account requires email verification. We have dispatched a 6-digit verification code to your email."
        )`
);

fs.writeFileSync(backendAuthPath, backendContent, 'utf8');
console.log('2. Updated backend/routers/auth.py so email_verified=False until OTP is verified');

