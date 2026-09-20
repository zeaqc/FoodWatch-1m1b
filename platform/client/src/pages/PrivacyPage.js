import React from 'react';
export default function PrivacyPage() {
  return (
    <div className="page container" style={{ maxWidth: 760 }}>
      <h1 style={{ color: 'var(--green-dark)', marginBottom: '1.5rem' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '.88rem' }}>
        Last updated: January 2024. Complies with India's <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and UIDAI Aadhaar guidelines.
      </p>

      {[
        { title: '1. Data We Collect', body: 'Name, email, mobile number (for OTP verification), address (city/area level), and optionally the last 4 digits of Aadhaar (with explicit consent). We do NOT store full Aadhaar numbers under any circumstances. Photo uploads are optional.' },
        { title: '2. Why We Collect It', body: 'To operate the food donation platform — creating listings, matching donors with receivers, sending notifications, and detecting fraud or misuse.' },
        { title: '3. Aadhaar Compliance', body: 'In compliance with UIDAI Circular 11020/205/2017-Auth dated 31 Oct 2017 and Section 29 of the Aadhaar Act 2016, we store only the last 4 digits as a masked reference. Full Aadhaar numbers are never persisted. In future we will integrate UIDAI-authorised eKYC for secure one-time verification.' },
        { title: '4. Data Sharing', body: 'We share only necessary data between donor and receiver once a claim is made (pickup address, contact number). We do not sell data to third parties. Aggregated anonymous stats may be shared for research.' },
        { title: '5. Data Retention', body: 'Your data is retained while your account is active. You may request deletion at any time via Settings → Delete Account. On deletion, personal data is anonymised immediately (name → [Deleted], email → random hash, phone → 0000000000).' },
        { title: '6. Your Rights (DPDP Act 2023)', body: 'You have the right to: access your data, correct inaccuracies, delete your account, withdraw consent for Aadhaar masked reference storage, and nominate someone to manage your data. Contact: privacy@foodwatch.in' },
        { title: '7. Security', body: 'Passwords are hashed with bcrypt (cost factor 12). All API communication is over HTTPS. JWT tokens expire after 7 days. Rate limiting prevents brute-force attacks.' },
        { title: '8. Food Safety Liability', body: 'FoodWatch is a platform only. Donors bear full legal and moral responsibility for the safety of food they list, in compliance with the FSSAI Food Safety and Standards Act 2006. FoodWatch is not liable for illness or injury caused by donated food.' },
        { title: '9. Contact', body: 'Privacy questions: privacy@foodwatch.in | FSSAI queries: info@fssai.gov.in | UIDAI: help@uidai.gov.in' }
      ].map(({ title, body }) => (
        <div key={title} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '.5rem' }}>{title}</h3>
          <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>{body}</p>
        </div>
      ))}
    </div>
  );
}
