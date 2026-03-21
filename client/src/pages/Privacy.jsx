import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A1628] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-[#C9A84C]" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-300 text-sm">
            Last updated: 1 January 2025 &nbsp;·&nbsp; Effective: 1 January 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-[#C9A84C] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8 text-gray-700 text-sm leading-relaxed">

          {/* Intro */}
          <section>
            <p>
              MaidMatch Technologies Private Limited ("MaidMatch", "we", "us", "our") is committed
              to protecting the privacy and personal data of all users of the MaidMatch platform
              ("Platform"). This Privacy Policy describes how we collect, use, store, share, and
              protect your personal information in compliance with:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>The Information Technology Act, 2000 ("IT Act")</li>
              <li>The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("SPDI Rules")</li>
              <li>The Digital Personal Data Protection Act, 2023 ("DPDPA")</li>
              <li>The Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016</li>
            </ul>
            <p className="mt-3">
              By using our Platform, you consent to the practices described in this Policy. If you
              do not agree, please stop using our Services.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">1. Data Controller</h2>
            <p>
              MaidMatch Technologies Private Limited is the Data Fiduciary (as defined under the
              DPDPA, 2023) responsible for your personal data. Our registered office is in Mumbai,
              Maharashtra, India.
            </p>
            <p className="mt-2">
              Contact: <a href="mailto:privacy@maidmatch.in" className="text-[#C9A84C] hover:underline">privacy@maidmatch.in</a>
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">2. Information We Collect</h2>

            <h3 className="font-medium text-gray-800 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><strong>Customers:</strong> Name, email address, phone number, password (hashed), pincode / area.</li>
              <li><strong>Workers:</strong> All of the above, plus profile photograph, services offered, pricing, experience, bio, location (city + pincode + coordinates), and Aadhaar card details (document image + 12-digit number) — classified as Sensitive Personal Data or Information (SPDI) under the SPDI Rules.</li>
              <li><strong>Bookings:</strong> Service type, date and time, address, special instructions.</li>
              <li><strong>Payments:</strong> Transaction ID and amount processed through Razorpay. We do not store card numbers, CVV, or bank account details.</li>
              <li><strong>Communications:</strong> Emails, support tickets, or other messages you send us.</li>
            </ul>

            <h3 className="font-medium text-gray-800 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Device information (browser type, OS, screen resolution).</li>
              <li>IP address and approximate geolocation.</li>
              <li>Pages visited, links clicked, and session duration (via cookies / analytics).</li>
              <li>Log files for security and debugging purposes.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">3. How We Use Your Information</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 text-gray-600 uppercase">
                  <tr>
                    <th className="p-3 text-left">Purpose</th>
                    <th className="p-3 text-left">Legal Basis (DPDPA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Creating and managing your account', 'Consent / Contractual necessity'],
                    ['Connecting customers with workers and facilitating bookings', 'Contractual necessity'],
                    ['Processing payments via Razorpay', 'Contractual necessity / Legal obligation'],
                    ['Identity verification of workers (Aadhaar)', 'Consent + Legitimate interest (platform safety)'],
                    ['Sending booking confirmations, service updates, OTPs', 'Contractual necessity'],
                    ['Responding to support queries and resolving disputes', 'Legitimate interest / Legal obligation'],
                    ['Displaying worker profiles and reviews to customers', 'Consent (workers) / Legitimate interest'],
                    ['Improving the Platform through analytics', 'Legitimate interest'],
                    ['Complying with court orders, law enforcement, or statutory requirements', 'Legal obligation'],
                  ].map(([purpose, basis], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">{purpose}</td>
                      <td className="p-3 text-gray-500">{basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">4. Aadhaar Data — Special Handling</h2>
            <p className="mb-2">
              We collect Aadhaar card images and numbers solely to verify the identity of workers
              before listing them on the Platform. We handle this data with the highest level of
              care:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aadhaar documents are encrypted and stored securely in Cloudinary's private storage, inaccessible to the public.</li>
              <li>Aadhaar numbers are stored in encrypted form and are accessible only to authorised admin personnel.</li>
              <li>We do not use Aadhaar for authentication or share it with third parties other than as required by law.</li>
              <li>We do not create, store, or use an Aadhaar authentication database as prohibited by the Aadhaar Act, 2016.</li>
              <li>Workers may request deletion of their Aadhaar data after verification is complete.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">5. Data Sharing and Disclosure</h2>
            <p className="mb-2">We do not sell your personal data. We share it only in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Between users:</strong> Worker name, photo, rating, services, and approximate area are visible to customers. Customer name and booking details are shared with the assigned Worker.</li>
              <li><strong>Razorpay:</strong> Payment processing. Governed by Razorpay's Privacy Policy.</li>
              <li><strong>Cloudinary:</strong> Secure media storage (profile photos, Aadhaar documents). Governed by Cloudinary's Privacy Policy.</li>
              <li><strong>Law enforcement / courts:</strong> Where required by a court order, government directive, or applicable Indian law.</li>
              <li><strong>Business transfers:</strong> In the event of a merger or acquisition, data may be transferred to the successor entity subject to the same privacy obligations.</li>
            </ul>
            <p className="mt-2">
              All third-party processors are bound by contractual obligations to handle your data
              securely and only for the stated purposes.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">6. Data Retention</h2>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-600 uppercase">
                <tr>
                  <th className="p-3 text-left">Data Type</th>
                  <th className="p-3 text-left">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Account data (name, email, phone)', '5 years after account closure'],
                  ['Booking records', '7 years (for tax / legal purposes)'],
                  ['Payment records', '8 years (Income Tax Act requirement)'],
                  ['Worker Aadhaar documents', 'Deleted within 30 days of worker removal or on request'],
                  ['Communication / support logs', '2 years'],
                  ['Server logs (IP, access)', '90 days'],
                ].map(([type, period], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3">{type}</td>
                    <td className="p-3 text-gray-500">{period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">7. Your Rights (DPDPA, 2023)</h2>
            <p className="mb-2">
              Under the Digital Personal Data Protection Act, 2023, you have the following rights
              as a Data Principal:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Right to Access:</strong> Obtain a summary of personal data we hold about you and how it is processed.</li>
              <li><strong>Right to Correction and Erasure:</strong> Request correction of inaccurate data or erasure of data no longer necessary for the purpose collected.</li>
              <li><strong>Right to Grievance Redressal:</strong> Raise a complaint with our Grievance Officer and escalate to the Data Protection Board of India.</li>
              <li><strong>Right to Nominate:</strong> Nominate another individual to exercise rights on your behalf in the event of death or incapacity.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time (subject to the consequences of withdrawal, including inability to use certain features).</li>
            </ul>
            <p className="mt-2">
              To exercise any of the above rights, write to us at{' '}
              <a href="mailto:privacy@maidmatch.in" className="text-[#C9A84C] hover:underline">
                privacy@maidmatch.in
              </a>. We will respond within 30 days.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">8. Security</h2>
            <p className="mb-2">
              We implement reasonable security practices and procedures as required under the SPDI
              Rules, 2011, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Passwords are stored using bcrypt hashing — we never store plain-text passwords.</li>
              <li>All data in transit is encrypted using TLS/HTTPS.</li>
              <li>Sensitive data (Aadhaar documents) is stored in private, access-controlled cloud storage.</li>
              <li>Access to personal data is restricted to authorised personnel on a need-to-know basis.</li>
              <li>We conduct periodic security reviews.</li>
            </ul>
            <p className="mt-2">
              However, no method of electronic storage or transmission is 100% secure. In the event
              of a data breach affecting your rights, we will notify you and the appropriate
              authority as required by law.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">9. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to operate the Platform, remember
              your preferences, and analyse usage patterns. You can control cookies through your
              browser settings; however, disabling certain cookies may affect Platform
              functionality. We use:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Essential cookies:</strong> Required for login sessions and security.</li>
              <li><strong>Analytics cookies:</strong> To understand how users interact with the Platform (e.g., page visits, clicks).</li>
            </ul>
            <p className="mt-2">We do not use cookies for targeted advertising.</p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">10. Children's Privacy</h2>
            <p>
              Our Services are not directed to individuals under the age of 18. We do not knowingly
              collect personal data from minors. If we become aware that we have collected such
              data without parental consent, we will delete it promptly. If you believe a minor
              has provided us with data, please contact us at{' '}
              <a href="mailto:privacy@maidmatch.in" className="text-[#C9A84C] hover:underline">
                privacy@maidmatch.in
              </a>.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of material
              changes via email or a prominent notice on the Platform at least 7 days before they
              take effect. The "Last updated" date at the top of this page indicates the most
              recent revision. Your continued use of the Platform after the effective date
              constitutes acceptance of the updated Policy.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">12. Grievance Officer</h2>
            <p>
              If you have any concerns about the processing of your personal data, you may contact
              our Grievance Officer:
            </p>
            <div className="mt-3 bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Name:</strong> Ritesh Singh</p>
              <p><strong>Designation:</strong> Grievance Officer — Data Protection</p>
              <p><strong>Email:</strong> <a href="mailto:grievance@maidmatch.in" className="text-[#C9A84C] hover:underline">grievance@maidmatch.in</a></p>
              <p><strong>Address:</strong> MaidMatch Technologies Pvt. Ltd., Mumbai, Maharashtra – 400001</p>
              <p><strong>Working hours:</strong> Monday – Friday, 10:00 AM – 6:00 PM IST</p>
            </div>
            <p className="mt-2">
              Grievances will be acknowledged within 24 hours and resolved within 15 days. If
              unsatisfied with our response, you may escalate to the{' '}
              <strong>Data Protection Board of India</strong> once constituted under the DPDPA, 2023.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t pt-6 text-center text-xs text-gray-400">
            <p>MaidMatch Technologies Private Limited &nbsp;·&nbsp; Mumbai, India</p>
            <p className="mt-1">
              Questions?{' '}
              <a href="mailto:privacy@maidmatch.in" className="text-[#C9A84C] hover:underline">
                privacy@maidmatch.in
              </a>
              {' '}·{' '}
              <Link to="/terms" className="text-[#C9A84C] hover:underline">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
